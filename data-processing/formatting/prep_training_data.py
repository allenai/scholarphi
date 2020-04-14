import re
import os
import sys
import math
import json
import random
from shutil import copy

import cv2
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt


def filter_display_eqs(df):
    '''Returns only the display style equations from a dataframe.'''
    dfResult = df.loc[df["tex"].str.contains('(\$\$\s.*\$\$|\\\[\s.*\\\]|begin{displaymath|begin{equation|begin{split|begin{array|begin{eqnarray|begin{multiline|begin{gather|begin{align|begin{flalign)',regex=True, na=False)]
    return dfResult

def train_val_split(datList, fracTrain=.90):
    '''For a list of arxivIds, split into a training and validation set.
       By default, split as 90% train, 10% validation.'''
    split = int(len(datList) * fracTrain)
    random.shuffle(datList)
    return datList[:split], datList[split:] 


def group_near_eqns(df, all_Tex=False, v_distance_threshold=0.003, width_threshold=0.05, height_threshold=0.002):
    '''Function that joins display style equation bounding boxes so that small floating 
       boxes will be removed or joined with their larger counterpart (ie. the indices of sums would be joined with the total sum expression).
       The boolean flag all_Tex if true will join the entire tex expression into a single box even if it spans multiple lines, where 
       if it is false, the function will group individual lines of equations using the threshold parameters.'''
    df['right'] = df['left'] + df['width']
    df['bottom'] = df['top'] + df['height']
    
    if not all_Tex:
        df = df.sort_values(by=['page','tex','top']).reset_index()
        
        diff = []
        for i, row in df.iterrows():
            diff.append(df.iloc[i].right - df.iloc[i].left)
            if i==0:
                df.at[i,'left_new'] = df.at[i,'left']
                df.at[i,'top_new'] = df.at[i,'top']
                df.at[i,'right_new'] = df.at[i,'right']
                df.at[i,'bottom_new'] = df.at[i,'bottom']
                df.at[i,'reason'] = 0
            elif (df.iloc[i].page == df.iloc[i-1].page) and (df.iloc[i].tex == df.iloc[i-1].tex) and \
                 ((df.iloc[i].top - df.iloc[i-1].bottom)<v_distance_threshold):
                df.at[i,'left_new'] = min(df.at[i,'left'],df.at[i-1,'left'])
                df.at[i-1,'left_new'] = min(df.at[i,'left'],df.at[i-1,'left'])
                df.at[i,'top_new'] = min(df.at[i,'top'],df.at[i-1,'top'])
                df.at[i-1,'top_new'] = min(df.at[i,'top'],df.at[i-1,'top'])
                df.at[i,'right_new'] = max(df.at[i,'right'],df.at[i-1,'right'])
                df.at[i-1,'right_new'] = max(df.at[i,'right'],df.at[i-1,'right'])
                df.at[i,'bottom_new'] = max(df.at[i,'bottom'],df.at[i-1,'bottom'])
                df.at[i-1,'bottom_new'] = max(df.at[i,'bottom'],df.at[i-1,'bottom'])
                df.at[i,'reason'] = 1
            elif (df.iloc[i].page == df.iloc[i-1].page) and (df.iloc[i].tex == df.iloc[i-1].tex) and \
                 ((df.iloc[i].right - df.iloc[i].left)<width_threshold) and ((df.iloc[i].bottom - df.iloc[i].top)>height_threshold):
                df.at[i,'left_new'] = min(df.at[i,'left'],df.at[i-1,'left'])
                df.at[i-1,'left_new'] = min(df.at[i,'left'],df.at[i-1,'left'])
                df.at[i,'top_new'] = min(df.at[i,'top'],df.at[i-1,'top'])
                df.at[i-1,'top_new'] = min(df.at[i,'top'],df.at[i-1,'top'])
                df.at[i,'right_new'] = max(df.at[i,'right'],df.at[i-1,'right'])
                df.at[i-1,'right_new'] = max(df.at[i,'right'],df.at[i-1,'right'])
                df.at[i,'bottom_new'] = max(df.at[i,'bottom'],df.at[i-1,'bottom'])
                df.at[i-1,'bottom_new'] = max(df.at[i,'bottom'],df.at[i-1,'bottom'])
                df.at[i,'reason'] = 2
            else:
                df.at[i,'left_new'] = df.at[i,'left']
                df.at[i,'top_new'] = df.at[i,'top']
                df.at[i,'right_new'] = df.at[i,'right']
                df.at[i,'bottom_new'] = df.at[i,'bottom']
                df.at[i,'reason'] = 3

        # handle duplicates:
        df = df.filter(['tex_path', 'page', 'relative_file_path', 'tex', 'tag',
       'left_new', 'top_new', 'right_new', 'bottom_new', 'reason']).drop_duplicates()

    # Case where we want to join full tex expressions even if they span multiple lines:
    else:
        df = df.groupby('tex').agg({'left':'min','top':'min','right':'max','bottom':'max'}).reset_index()
        df.columns = ['tex','left_new','top_new','right_new','bottom_new']
        
        df= df.merge(grouped, how='left', on='tex')

    return df 
    
def join_hue_locs_and_entites(arxivIds):
    '''Joins the information about where the equations are located in 
       the paper and what the equations are into a single csv file.'''
    for arxivId in arxivIds:
        hueCsv = os.path.join("data", "22-hue-locations-for-equations", arxivId, "hue_locations.csv")
        entCsv = os.path.join("data", "17-detected-equations", arxivId, "entities.csv")
        # Read csvs:
        dfHue = pd.read_csv(hueCsv)
        dfEnt = pd.read_csv(entCsv)
        # Sort by equation ids:
        dfHueSorted = dfHue.sort_values(by=['entity_id'])
        dfEntSorted = dfEnt.sort_values(by=['id_'])

        # Create list of TeX commands sorted by equation idx
        EqList = dfEntSorted["tex"].to_list()
        # remove first entry, figure out what to do with this later:
        #EqList.remove(EqList[0])

        # Create dict mapping equation indices to TeX commands:
        Idx_to_Tex = {}
        for i in range(len(EqList)):
            Idx_to_Tex[i] = EqList[i]
            
        # match equations and their locations by idx: (note that one of them is 0-indexed and the other is 1-indexed, hence the -1
        dfHue["tex"] = dfHue['entity_id'].apply(lambda x: Idx_to_Tex.get(x))
        # Set and create the output directroy:
        outDir = os.path.join("data", "99-formatting-data", arxivId)
        if not os.path.exists(outDir):
            os.makedirs(outDir)
        # Filter out to get only display equations. Comment out this line and
        # write dfHue to csv instead of dfDisplay to get all equations.
        dfDisplay = filter_display_eqs(dfHue)
        #dfHue.to_csv(os.path.join(outDir, "eqs_and_locs.csv"), index=False)
        #dfDisplay.to_csv(os.path.join(outDir, "eqs_and_locs.csv"), index=False)

        dfGrouped = group_near_eqns(dfDisplay)
        dfGrouped.to_csv(os.path.join(outDir, "eqs_and_locs.csv"), index=False)


def draw_boxes(arxivIds):
    '''Reads in the paper image files and bounbding box csv file and draws the boxes onto the corresponding paper page.'''
    for arxivId in arxivIds:
        outDir = os.path.join("data", "99-formatting-data", arxivId)
        eqLocsCsv = os.path.join(outDir, "eqs_and_locs.csv")
    
        dfEqs = pd.read_csv(eqLocsCsv)
        imgDirPrefix = os.path.join("data", "06-paper-images", arxivId)
        imgDirSuffix = os.listdir(imgDirPrefix)
        imgDir = os.path.join(imgDirPrefix, imgDirSuffix[0])
        paperImgFiles = os.listdir(imgDir)
        for i in range(len(paperImgFiles)):
            paperImgFile = 'page-' + str(i+1) + ".png"
            paperImg = cv2.imread(os.path.join(imgDir, paperImgFile))
            boxes = dfEqs.loc[lambda df: df['page'] == i]
            pgHeight = paperImg.shape[0]
            pgWidth = paperImg.shape[1]
            if not boxes.empty:
                lefts = boxes['left_new'].values.tolist()
                tops = boxes['top_new'].values.tolist()
                bottoms = boxes['bottom_new'].values.tolist()
                rights = boxes['right_new'].values.tolist()
                for j in range(len(lefts)):
                    left = int(lefts[j]*pgWidth)
                    top = int(tops[j]*pgHeight)
                    bottom = int(bottoms[j]*pgHeight)
                    right = int(rights[j]*pgWidth)
                    paperImg = cv2.rectangle(paperImg, (left, top), (right, bottom), color=(0,0,255), thickness=1)

            cv2.imwrite(os.path.join(outDir, paperImgFile), paperImg)
            

def create_training_json(arxivIds, train=True):
    '''For a given list of arxiv Ids, this function creates a JSON file 
       that represents the labelled bounding box data for the pages of the 
       paper in the format expected by detectron2's object detection. 
       If train==True, make training set. If false, make validation set. 
    '''
    # Location to output the json
    if train:
        outDir = os.path.join("data", "CNNTest_notfulljoin", "train")
    else:
        outDir = os.path.join("data", "CNNTest_notfulljoin", "val")
    if not os.path.exists(outDir):
        os.makedirs(outDir)
    else:
        # Clear between runs:
        os.system('rm -rf ' + outDir)
        os.makedirs(outDir)
    # Dictionary that will become the json
    outDict = {}
    # Loop trhough provided arxiv Ids:
    for arxivId in arxivIds:
        # Get the joined csv file for equation locatyions:
        inDir = os.path.join("data", "99-formatting-data", arxivId)
        eqLocsCsv = os.path.join(inDir, "eqs_and_locs.csv")
        dfEqs = pd.read_csv(eqLocsCsv)
        # Get the paper image locations
        imgDirPrefix = os.path.join("data", "06-paper-images", arxivId)
        imgDirSuffix = os.listdir(imgDirPrefix)
        imgDir = os.path.join(imgDirPrefix, imgDirSuffix[0])
        
        #imgDir = os.path.join("data", "06-paper-images", arxivId, "main.pdf")
        paperImgFiles = os.listdir(imgDir)
        # Loop trhoguh paper's pages:
        for i in range(len(paperImgFiles)):
            paperImgFile = 'page-' + str(i+1) + ".png"
            # Create entry in dict for this page:
            outDict[arxivId + "-" + paperImgFile] = {}

            # Read in the paper page image:
            paperImg = cv2.imread(os.path.join(imgDir, paperImgFile))
            # Create a list of all the bunding boxes on this page:
            boxes = dfEqs.loc[lambda df: df['page'] == i]
            pgHeight = paperImg.shape[0]
            pgWidth = paperImg.shape[1]
            # Fill in entries for the page image:
            outDict[arxivId + "-" + paperImgFile]["fileref"] = ""
            outDict[arxivId + "-" + paperImgFile]["size"] = pgHeight*pgWidth
            outDict[arxivId + "-" + paperImgFile]["filename"] = arxivId + "-" + paperImgFile
            outDict[arxivId + "-" + paperImgFile]["base64_img_data"] = ""
            outDict[arxivId + "-" + paperImgFile]["file_attributes"] = {}
            outDict[arxivId + "-" + paperImgFile]["regions"] = {}
            # Check if there are bounding boxes for this page:
            if not boxes.empty:
                lefts = boxes['left_new'].values.tolist()
                tops = boxes['top_new'].values.tolist()
                bottoms = boxes['bottom_new'].values.tolist()
                rights = boxes['right_new'].values.tolist()
                # Loop through the boxes:
                for j in range(len(lefts)):
                    # create an entry for this labelled region:
                    outDict[arxivId + "-" + paperImgFile]["regions"][str(j)] = {}
                    outDict[arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"] = {}
                    outDict[arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["name"] = "polygon"
                    outDict[arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_x"] = []
                    outDict[arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_y"] = []
                    outDict[arxivId + "-" + paperImgFile]["regions"][str(j)]["region_attributes"] = {}
                    # Compute the coordinates of the box's corners
                    left = int(lefts[j]*pgWidth)
                    top = int(tops[j]*pgHeight)
                    bottom = int(bottoms[j]*pgHeight)
                    right = int(rights[j]*pgWidth)
                    # Add the box corner points to the representation of the box:
                    outDict[arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_x"].append(left)
                    outDict[arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_x"].append(left)
                    outDict[arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_x"].append(right)
                    outDict[arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_x"].append(right)
                    outDict[arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_y"].append(top)
                    outDict[arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_y"].append(bottom)
                    outDict[arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_y"].append(top)
                    outDict[arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_y"].append(bottom)

            # Write a copy of the Page image to the output directory with the arxivId added to it's name:
            cv2.imwrite(os.path.join(outDir, arxivId + "-" + paperImgFile), paperImg)
                    
    # After all the pages of all the papers have been taken care of, output a json: 
    with open(os.path.join(outDir, 'bounding_box_data.json'), 'w') as json_file:
        json.dump(outDict, json_file)


if __name__ == "__main__":
    # Run with arxiv Ids as commandline args:
    locs_dir = sys.argv[1]
    arxivIds = os.listdir(locs_dir)
    
    # Prep the data by joining the equation data with corresponding bounding box data:
    join_hue_locs_and_entites(arxivIds)
    
    # Todo: eventually only draw boxes if some kind of debug flag is set:
    draw_boxes(arxivIds)

    # Split into training and validation sets:
    train_arxivs, val_arxivs = train_val_split(arxivIds)
    # Prepare the json files foe the RCNN model:
    create_training_json(train_arxivs, train=True)
    create_training_json(val_arxivs, train=False)
