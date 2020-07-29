import os
import glob
import re
import argparse
import random
import scipy
import pickle as pkl
import pandas as pd
import numpy as np
from tqdm import tqdm
from pprint import pprint
from collections import defaultdict
import latex2mathml.converter
from MulticoreTSNE import MulticoreTSNE as TSNE


from load_dataset import read_arxiv_ids_from_acl_2020
from paper import Paper
from utils import remove_tags, plot_tsne, calculate_cross_sentence_similarity

import torch
from sklearn.cluster import KMeans,AgglomerativeClustering
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler


# generate summaries
from transformers import BartTokenizer, BartForConditionalGeneration, BartConfig

# see ``examples/summarization/bart/run_eval.py`` for a longer example
summarizer_model = BartForConditionalGeneration.from_pretrained('facebook/bart-large-xsum')
summarizer_tokenizer = BartTokenizer.from_pretrained('facebook/bart-large-xsum')


def merge_papers(papers, sort=False):
    if sort:
        papers.sort(key=lambda x: x.arxiv_id, reverse=True)

    # merged tab
    columns_interest = ['arxiv_id', 'id_', 'text','term_text','definition_text'] #'intent',
    merged_papers = []
    for pid, paper in enumerate(papers):
        definitions = paper.definitions
        definitions['arxiv_id'] = paper.arxiv_id

        merged_papers.append( definitions[columns_interest] )
        #from pdb import set_trace; set_trace()
    merged_papers = pd.concat(merged_papers)

    print('Total number of merged papers',len(merged_papers))

    return merged_papers


def truncate_or_pad(sequence, block_size, pad_token_id):
    """ Adapt the source and target sequences' lengths to the block size.
    If the sequence is shorter we append padding token to the right of the sequence.
    """
    if len(sequence) > block_size:
        return sequence[:block_size]
    else:
        sequence.extend([pad_token_id] * (block_size - len(sequence)))
        return sequence


def change_term_text(term_text):
    term_text = str(term_text)
    term_text = term_text.replace('CITATION', '')
    term_text = term_text.replace('URL', '')
    return term_text.strip()


def aggregate_papers_for_cross_paper_analysis(args, papers, def_emb_dict, limit_term=False, plot_cluster=False):
    # term_def_dict
    term_def_list_dict = defaultdict(list)
    for pid, paper in enumerate(papers):
        definitions = paper.definitions
        definitions['arxiv_id'] = paper.arxiv_id
        for did, definition in definitions.iterrows():
            if change_term_text(definition.term_text) == "":
                continue
            term_def_list_dict[change_term_text(definition.term_text)].append(definition)

    # sort terms by number of definitions
    sorted_key = sorted(term_def_list_dict, key = lambda key: len(term_def_list_dict[key]), reverse=True)
    term_def_dict = {}
    for term in sorted_key:
        definitions = term_def_list_dict[term]

        # calculate within-paper and cross-paper numbers
        definition_text_list = [str(d.definition_text) for d in definitions]
        definition_arxiv_list = [d.arxiv_id for d in definitions]
        definition_emb_list = [def_emb_dict[d] for d in definition_text_list]

        if plot_cluster:
            if len(definitions) > 3:
                data = np.array(definition_emb_list)
                # Create a PCA instance: pca
                pca = PCA(n_components=2)
                data_pca = pd.DataFrame(pca.fit_transform(data))

                cluster_model = AgglomerativeClustering(distance_threshold=20,n_clusters=None)
                # num_cluster = min(len(set(definition_arxiv_list)), 50)
                #model = KMeans(n_clusters=num_cluster)
                cluster_assignment = cluster_model.fit_predict(data)
                print(cluster_assignment)

                plot_cluster(data_pca, cluster_assignment, term, definition_text_list, definition_arxiv_list)

        # get averaged definition represetnations
        d = {}
        d['term'] = term
        d['type'] = definitions[0].term_text_type
        #TODO add term_symbol type
        d['num_definitions'] = len(definitions)
        d['num_unique_arxiv_ids'] = len(set(definition_arxiv_list))
        d['cross_sentence_distance'] = calculate_cross_sentence_similarity(definition_emb_list)
        d['arxiv_ids'] = definition_arxiv_list
        d['definition_text_list'] = definition_text_list

        if len(definitions) > 10:
            print('{}\t{:.2f}\t{}\t{}'.format(term, len(definitions), d['num_unique_arxiv_ids'], d['cross_sentence_distance']))



        term_def_dict[term] = d

        if limit_term and len(term_def_dict) >= limit_term:
            break


    # definition summarization
    definition_text_list_all = []
    for term  in term_def_dict.keys():
        def_dict = term_def_dict[term]
        def_text_list = def_dict['definition_text_list'].copy()
        random.shuffle(def_text_list)
        definition_text_list_all.append(' '.join(def_text_list))

    batch_size = 4
    max_batch_num = 1
    batch = []
    for bid in range(int(len(definition_text_list_all) / batch_size)+1):
        batch.append(definition_text_list_all[bid*batch_size:bid*batch_size+batch_size])
        if bid >= max_batch_num:
            break

    device = "cuda" if torch.cuda.is_available() and not args.no_cuda else "cpu"
    summarizer_model.to(device)
    summarizer_model.eval()
    block_size = 1000
    summary_ids = []
    for b in tqdm(batch):
        inputs = summarizer_tokenizer(b, max_length=block_size, return_tensors='pt', truncation=True, padding=True)
        summary_id = summarizer_model.generate(inputs['input_ids'].to(device),
                                   num_beams=4, max_length=50, repetition_penalty=5, early_stopping=True)
        for sid in summary_id:
            summary_ids.append(sid)


    max_num_summaries = 3
    for summary_id, term in zip(summary_ids, list(term_def_dict.keys())):
        summaries = summarizer_tokenizer.decode(summary_id, skip_special_tokens=True, clean_up_tokenization_spaces=False)
        summaries = [s.strip() for s in summaries.split('.')][:max_num_summaries]
        term_def_dict[term]['generated_definition_list'] = ". ".join(summaries)

        print(". ".join(summaries))

    print('Total aggregated terms', len(term_def_dict))

    return term_def_dict




def load_papers(arxiv_ids, data_dir, limit=-1, sort=False, use_raw_math=False):
    papers = []
    total_num_definitions = 0
    total_num_sentences = 0
    total_num_papers = 0
    paper_iterator = tqdm(arxiv_ids)
    for arxiv_id in paper_iterator:
        sub_dirs_with_arxiv_id = []
        for out_dir in sorted(glob.glob(data_dir + '/*')):
            sub_dirs = glob.glob(out_dir+'/*')
            sub_dir_with_arxiv_id = [d for d in sub_dirs if arxiv_id in d]
            if len(sub_dirs) ==0 or len(sub_dir_with_arxiv_id) == 0:
                continue
            sub_dirs_with_arxiv_id.append(sub_dir_with_arxiv_id[0])

        paper = Paper(arxiv_id, sub_dirs_with_arxiv_id)
        paper.load(use_raw_math=use_raw_math)

        if paper.sentences is not None and paper.definitions is not None:
            papers.append(paper)

            total_num_definitions += len(paper.definitions)
            total_num_sentences += len(paper.sentences)
            total_num_papers += 1
            paper_iterator.set_description("{} definitions out of {} sentences in {} papers".format(
                total_num_definitions, total_num_sentences, total_num_papers))

        if limit > 0:
            if len(papers) >= limit:
                break

    paper_iterator.close()
    print('Total number of papers',len(papers))

    if sort:
        papers.sort(key=lambda x: x.arxiv_id, reverse=True)
        for p in papers:
            print(p.arxiv_id, p.num_symbols)

    return papers


def get_embeddings(papers):
    from sentence_transformers import SentenceTransformer
    sentbert_model = SentenceTransformer('roberta-large-nli-mean-tokens')

    term_list = []
    def_list = []
    for pid, paper in enumerate(papers):
        definitions = paper.definitions
        definitions['arxiv_id'] = paper.arxiv_id
        for did, definition in definitions.iterrows():
            if change_term_text(definition.term_text) == "":
                continue
            term_list.append(change_term_text(definition.term_text))
            if str(definition.definition_text) == "":
                continue
            def_list.append(str(definition.definition_text))

    term_uniq_list = list(set(term_list))
    def_uniq_list = list(set(def_list))
    print('Total unique nubmer of terms {} and definitions {}'.format(len(term_uniq_list), len(def_uniq_list)))

    term_emb_dict = {}
    def_emb_dict = {}
    term_emb_list = sentbert_model.encode(term_uniq_list)
    for term, emb in zip(term_uniq_list, term_emb_list):
        term_emb_dict[term] = emb
    def_emb_list = sentbert_model.encode(def_uniq_list)
    for defi, emb in zip(def_uniq_list, def_emb_list):
        def_emb_dict[defi] = emb

    return term_emb_dict, def_emb_dict



#TODO extract all mentions -> usages
#TODO Neoligsm detection
#TODO Term type classification (Symbol, Term, neologism)
#TODO show section/symbol information
#TODO term/symbol clustering

def main(arxiv_ids, args):

    output_prefix = '{}{}'.format(
        '_use_raw_math={}'.format(args.use_raw_math), '_limit={}'.format(args.limit) if args.limit >0 else '')

    # load papers
    paper_filename = 'cached/papers{}.pkl'.format(output_prefix)
    if args.use_cache and os.path.isfile(paper_filename):
        papers = pkl.load(open(paper_filename, 'rb'))
        print('Loaded papers from cached',paper_filename)
    else:
        papers = load_papers(arxiv_ids, args.data_dir, limit=args.limit, sort=True, use_raw_math=args.use_raw_math)
        pkl.dump(papers, open(paper_filename, 'wb'))
        print('Saved papers to cached',paper_filename)

    # get embeddings for terms/definitions/symbols using sentence-BERT
    embedding_filename = 'cached/embeddings{}.pkl'.format(output_prefix)
    if args.use_cache and os.path.isfile(embedding_filename):
        term_emb_dict, def_emb_dict = pkl.load(open(embedding_filename, 'rb'))
        print('Loaded papers from cached',embedding_filename)
    else:
        term_emb_dict, def_emb_dict = get_embeddings(papers)
        pkl.dump((term_emb_dict, def_emb_dict), open(embedding_filename, 'wb'))
        print('Saved papers to cached',embedding_filename)


    # merge papers
    merged_papers = merge_papers(papers, sort=True)


    # merge papers by term
    term_def_dict = aggregate_papers_for_cross_paper_analysis(args, papers, def_emb_dict, limit_term=False, plot_cluster=False)

    # per-term definition clustering
    # across-paper term clustering



    # plot t-SNE for terms and definitions
    if args.plot_tsne:
        # limit the length of term for visualization
        truncate_term_length = 50
        # limit the number of terms
        terms_to_visualize = []

        max_num_terms_to_process = 500

        for term_chosen in list(term_def_dict.keys())[:max_num_terms_to_process]:
            terms_to_visualize.append(term_def_dict[term_chosen]['term'])

        emb_plot_dict = {}
        emb_plot_dict['text'] = np.array([k[:truncate_term_length] for k in terms_to_visualize])
        emb_plot_dict['embed'] = np.array([term_emb_dict[k] for k in terms_to_visualize])
        emb_plot_dict['type'] = np.array([term_def_dict[k]['type'] for k in terms_to_visualize])
        emb_plot_dict['def_count'] = np.array([term_def_dict[k]['num_definitions'] for k in terms_to_visualize])
        emb_plot_dict['cross_distance'] = np.array([term_def_dict[k]['cross_sentence_distance'] for k in terms_to_visualize])

        # TODO make this part caching inside aggregate_papers_for...
        def_emb_list = []
        for term in terms_to_visualize:
            term_emb_from_def_list = np.average([def_emb_dict[str(def_term)] for def_term in term_def_dict[term]['definition_text_list']],axis=0)
            def_emb_list.append(term_emb_from_def_list)
        emb_plot_dict['embed_def'] = np.array(def_emb_list) # 400 x 1024



        # Term clustering
        # Fine-tuning sentence BERT and then?


        # show by variance level

        # start t-SNE processing
        tsne = TSNE(n_jobs=10, n_components=2, verbose=0, perplexity=50, n_iter=5000)
        tsne_results = tsne.fit_transform(emb_plot_dict['embed_def'])
        emb_plot_dict['one'] = tsne_results[:,0]
        emb_plot_dict['two'] = tsne_results[:,1]

        # terms and symbols by definition
        max_num_terms_to_plot = 150
        plot_tsne(emb_plot_dict,OUT_DIR='output',
                  condition='by_def{}'.format(output_prefix), limit=max_num_terms_to_plot,is_3d=True)
        plot_tsne(emb_plot_dict,OUT_DIR='output',
                  condition='by_def{}'.format(output_prefix), limit=max_num_terms_to_plot,is_3d=False)



        # only terms
        max_num_terms_to_plot = 50
        chosen_indexes = [idx for idx, t in enumerate(emb_plot_dict['type']) if t == 'term']
        plot_tsne(emb_plot_dict,OUT_DIR='output',
                  condition='by_def_only_term{}'.format(output_prefix), chosen_indexes=chosen_indexes, limit=max_num_terms_to_plot, is_3d=True)
        plot_tsne(emb_plot_dict,OUT_DIR='output',
                  condition='by_def_only_term{}'.format(output_prefix), chosen_indexes=chosen_indexes, limit=max_num_terms_to_plot, is_3d=False)


        # only symbols
        max_num_terms_to_plot = 100
        chosen_indexes = [idx for idx, t in enumerate(emb_plot_dict['type']) if t == 'symbol']
        plot_tsne(emb_plot_dict,OUT_DIR='output',
                  condition='by_def_only_symbol{}'.format(output_prefix), chosen_indexes=chosen_indexes, limit=max_num_terms_to_plot, is_3d=True)
        plot_tsne(emb_plot_dict,OUT_DIR='output',
                  condition='by_def_only_symbol{}'.format(output_prefix), chosen_indexes=chosen_indexes, limit=max_num_terms_to_plot, is_3d=False)


        # only symbols with terms
        # only equations


    # save to excel file
    if args.save_excel_file:
        filename = 'output/cross{}.xlsx'.format(output_prefix)
        writer = pd.ExcelWriter(filename, engine='xlsxwriter')

        # merged tab for cross analysis
        merged_papers.to_excel(writer, sheet_name = "merged", index=False)

        # cluster tab for unique term
        df = pd.DataFrame([def_dict for term,def_dict in term_def_dict.items()])
        df.to_excel(writer, sheet_name = "cluster", index=False)

        #individual tabs for each paper
        max_num_individual_tabs = 10
        for paper in papers[:max_num_individual_tabs]:
            d = paper.definitions
            d.to_excel(writer, sheet_name = paper.arxiv_id, index=False)

        writer.save()
        print('Saved excel file', filename)



if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--data_dir', type=str, default='./')
    parser.add_argument('--use_raw_math', action='store_true')
    parser.add_argument('--save_excel_file', action='store_true')
    parser.add_argument('--plot_tsne', action='store_true')
    parser.add_argument('--use_cache', action='store_true')
    parser.add_argument('--no_cuda', action='store_true')
    parser.add_argument('--limit', type=int, default=-1, help='')
    args = parser.parse_args()

    # load arxiv ids to process
    # arxiv_ids = read_arxiv_ids_from_acl_2020('papers_with_arxiv_link.md')
    # arxiv_ids = ['1802.05365'] #'2004.14500'] #'1601.00978',
    # arxiv_ids = ['1601.00978', '1802.05365']
    arxiv_ids = open('../../../data-processing/acl_arxiv_ids_only_from_s2orc.txt','r').readlines()
    arxiv_ids = [aid.strip() for aid in arxiv_ids]
    print('Total number of arxiv_ids', len(arxiv_ids))

    main(arxiv_ids, args)


