import os
import glob
import pandas as pd
from aggregate_processed_output import read_arxiv_ids_from_acl_2020

# from ast import literal_eval

def convert_symbol_str_to_list(input_str):
    converted_list =  input_str.strip("[]").replace("'","").split(", ")
    converted_list = [item for item in converted_list if item]
    return converted_list



class Paper():
    def __init__(self, arxiv_id, target_dirs):
        self.arxiv_id = arxiv_id
        self.target_dirs = target_dirs
        self.sentences = None

        self.num_symbols = 0
        self.num_citations = 0

    def load(self):
        self.load_detected_sentences()

    def load_detected_sentences(self, filename='entities.csv', verbose=False):
        target_dir=None
        for tdir in self.target_dirs:
            if '23-detected-sentences' in tdir:
                target_dir = tdir
        if target_dir is None:
            return None


        data = pd.read_csv(os.path.join(target_dir, filename))
        #,converters=
        #                    {"label": lambda x: x.strip("[]").replace("'","").split(", "),
                            # "ref": lambda x: x.strip("[]").replace("'","").split(", "),
                            # "cite": lambda x: x.strip("[]").replace("'","").split(", "),
                            # "symobl": lambda x: x.strip("[]").replace("'","").split(", "),
        #                     "others": lambda x: x.strip("[]").replace("'","").split(", ")})

#         from pdb import set_trace; set_trace()
        # num_is_sentence = sum([1 if f else 0 for f in data['is_sentence']])
        # print('Total number of correct sentences selected {} out of {}'.format(num_is_sentence, len(data)))
        # if verbose:
            # for index, sentence in data.iterrows():
                # print(index, sentence['start'], sentence['end'], sentence['tex'], sentence['text'])

        self.sentences = data

        if data is None:
            return none

        # get some statistics
        symbols = [convert_symbol_str_to_list(d['symbol']) for _,d in data.iterrows() if 'is_sentence' in d and  d['is_sentence']]
        # cites = [convert_str_to_list(d['cite']) for d in data if d['is_sentence']]
        self.num_symbols = sum([len(s) for s in symbols])
        # self.num_citations = sum([len(s) for s in cites])

        # print(self.num_symbols)
        # print(symbols)




def main(limit=10):
    # load arxiv ids to process
    arxiv_ids = read_arxiv_ids_from_acl_2020('papers_with_arxiv_link.md')
    # arxiv_ids = ['1802.05365'] #'2004.14500'] #'1601.00978',
    print('Total number of arxiv_ids', len(arxiv_ids))

    papers = []
    for arxiv_id in arxiv_ids:
        sub_dirs_with_arxiv_id = []
        for out_dir in sorted(glob.glob('./data/*')):
            sub_dirs = glob.glob(out_dir+'/*')
            sub_dir_with_arxiv_id = [d for d in sub_dirs if arxiv_id in d]
            if len(sub_dirs) ==0 or len(sub_dir_with_arxiv_id) == 0:
                continue
            sub_dirs_with_arxiv_id.append(sub_dir_with_arxiv_id[0])

        paper = Paper(arxiv_id, sub_dirs_with_arxiv_id)
        paper.load()


        if paper.sentences is not None:
            papers.append(paper)


        print('Loading output from ',arxiv_id, paper.num_symbols, paper.num_citations)

    print('Total number of papers',len(papers))

    papers.sort(key=lambda x: x.num_symbols, reverse=True)

    if limit:
        papers = papers[:limit]

    for p in papers:
        print(p.arxiv_id, p.num_symbols)

    # merge into a single spreadsheet with multiple tabs
    filename = 'merged_detected_sentences_on_acl_2020{}.xlsx'.format('_limit={}'.format(limit) if limit else '')
    writer = pd.ExcelWriter(filename, engine='xlsxwriter')
    for paper in papers:
        d = paper.sentences
        d.to_excel(writer, sheet_name = paper.arxiv_id, index=True)
    writer.save()
    print('Saved', filename)

if __name__ == '__main__':
    main()


