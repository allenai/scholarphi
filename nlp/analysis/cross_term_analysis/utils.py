import re
import os
import sys
import scipy
import numpy as np
from sklearn import preprocessing
from matplotlib import cm
from matplotlib.colors import LogNorm
from mpl_toolkits.axes_grid1 import make_axes_locatable
import matplotlib.pyplot as plt
import seaborn as sns
#; sns.set()  # for plot styling
from sklearn.datasets import fetch_mldata
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from sklearn.cluster import KMeans
from MulticoreTSNE import MulticoreTSNE as TSNE
import matplotlib as mpl
import matplotlib.pyplot as plt


PATTERN_TAG = re.compile(r'<[^>]+>')

def remove_tags(text):
    return PATTERN_TAG.sub('', text)

def get_indexes_symbol(text, start, end, symbols):
    current_index = 0
    symbol_indexes = []
    for char_index in range(len(text) - len("SYMBOL")):
        if text[char_index:char_index+len("SYMBOL")] == "SYMBOL":
            if char_index >= start and char_index < end:
                symbol_indexes.append(current_index)
            current_index += 1
    return [symbols[sid] for sid in symbol_indexes]

def calculate_cross_sentence_similarity(embeddings):
    if len(embeddings) <= 1:
        return 0.0
    distances = []
    for eid, emb_one in enumerate(embeddings):
        embeddings_without_eid = [emb for eid2, emb in enumerate(embeddings) if eid != eid2]
        distance = scipy.spatial.distance.cdist([emb_one], embeddings, "cosine")[0]
        distances.append(distance)
    return np.average(np.concatenate(distances)) * 0.5



def convert_math_to_raw_symbol(math):
    """
    take [[math:id-X:\\math...]] to \\math..
    """
    raw_symbol =  ':'.join(math[2:-2].split(':')[2:])
    # # remove whitespace
    # raw_symbol_without_whitespace = raw_symbol.replace(' ','')
    return raw_symbol

def convert_str_to_list(input_str):
    converted_list =  input_str.strip("[]")[1:-1].split("', '")
    converted_list = [item for item in converted_list if item]
    return converted_list


def plot_cluster(data, assignments, term, text, arxiv_ids):
    # fig = plt.figure(figsize=(4, 3))
    # ax = Axes2D(fig, rect=[0, 0, .95, 1], elev=48, azim=134)
    # labels = est.labels_

    # Create plot
    fig = plt.figure(figsize=(15,15))
    mpl.rcParams.update({'font.size': 8})


    ax = fig.add_subplot(1, 1, 1)
    ax.scatter(data[0], data[1],alpha=0.8,
               edgecolor='k', c=assignments.astype(np.float))

    for i, (txt, aid) in enumerate(zip(text,arxiv_ids)):
        ax.annotate('{}\n{}'.format(aid,txt)[:50], (data[0][i], data[1][i]))

    num_cluster = len(set(assignments))
    num_arxiv = len(set(arxiv_ids))

    filename = os.path.join('output', 'definition_clusters', '{}_{}_points={}_cluster={}_arxiv={}.png'.format('term_cluster',term, len(text), num_cluster,num_arxiv))
    plt.savefig(filename, bbox_inches='tight', dpi=500) #, bbox_extra_artists=[lgd,])
    print('Saved:',filename)
    plt.close()





def plot_tsne(data,OUT_DIR='./', condition='', encoder='sentBERT', chosen_indexes=False, limit=-1, is_3d=False):
    # y_unique = len(set(sents_dict['labels']))
    pal = ['red', 'blue','green',  'black', 'yellow']
    # markers = ["s", "^"] #, "v"]
    # markers_dict = {}
    # for idx,l in enumerate(list(set(sents_dict['labels']))):
    #     markers_dict[l] = markers[idx]

    # sns.set(style="whitegrid", color_codes=True, font_scale=4)


    # choose only given indexes of points
    if chosen_indexes:
        new_data = {}
        for k, v in data.items():
            new_data[k] = v[chosen_indexes]
        data = new_data


    # limit data points
    if limit > 0:
        new_data = {}
        chosen_terms = list(data.keys())[:limit]
        for k in chosen_terms:
            new_data[k] = data[k]
        data = new_data

    fig = plt.figure(figsize=(20,20))
    if is_3d:
        ax = fig.add_subplot(111, projection='3d') #Axes3D(fig)
    else:
        ax = fig.add_subplot(111) #Axes3D(fig)

    #ax.grid(False)
    ax.grid(linewidth=20)
    type_set = list(set(data['type']))
    type_dict = {'term':0, 'symbol':1}

    if is_3d:
        g = ax.scatter(
            data['one'], data['two'], data['cross_distance'],
            label=data['type'],
            color = [pal[type_dict[t]] for t in data['type']],
            s=data["def_count"]*0.5,
            cmap=pal[:2],
            alpha=0.4,
            marker='o'
        )

        for line in range(0,data['text'].shape[0]):
             ax.text(
                 data['one'][line]+0.01,data['two'][line],data['cross_distance'][line],
                 data['text'][line],
                 color='black', fontsize=8) #, weight='semibold' #size='tiny',
             #horizontalalignment='left',
    else:
        g = ax.scatter(
            data['one'], data['two'],
            label=data['type'],
            color = [pal[type_dict[t]] for t in data['type']],
            s=data["def_count"]*0.5,
            cmap=pal[:2],
            alpha=0.4,
            marker='o'
        )

        for line in range(0,data['text'].shape[0]):
             ax.text(
                 data['one'][line]+0.01,data['two'][line],
                 data['text'][line],
                 color='black', fontsize=8) #, weight='semibold' #size='tiny',
             #horizontalalignment='left',


    ax.set_xlim((min(data['one']),max(data['one'])))
    ax.set_ylim((min(data['two']),max(data['two'])))
    if is_3d:
        ax.set_zlim((min(data['cross_distance']),max(data['cross_distance'])))

    # produce a legend with the unique colors from the scatter
    legend1 = ax.legend(*g.legend_elements(),
                        loc="right", title="Types")
    ax.add_artist(legend1)

    # produce a legend with a cross section of sizes from the scatter
    handles, labels = g.legend_elements(prop="sizes", alpha=0.6)
    legend2 = ax.legend(handles, labels, loc="right", title="Sizes")


    filename = os.path.join(OUT_DIR, '{}_encoder={}_cond={}.png'.format(
        'scatterplot_3d={}'.format(is_3d),encoder,condition))
    plt.savefig(filename, bbox_inches='tight', dpi=600) #, bbox_extra_artists=[lgd,])
    print('Saved:',filename)
    plt.close()

