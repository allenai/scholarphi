import re
import os
import sys
import math
import json
import random
import datetime
from shutil import copy

import cv2
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
sys.path.append("./")
sys.path.insert(0, "../")
from common.parse_tex import EquationExtractor


def generate_tag(row):
    '''Generates an equation tag for each row in the dataframe'''
    string = row.tex
    if isinstance(string, float):
        return 'null'
    else:
        extractor = EquationExtractor()
        for eqn in extractor.parse(tex=string, tex_path=''):
            if eqn.type_eqn in ['dollar_delimiter','parens_start','parens_end','math_start','math_end']:
                return 'inline'
            else:
                return 'display'


def filter_display_eqs(df, include_inline=False):
    '''Returns only the display style equations from a dataframe.'''
    # This is the explicit way
    #dfResult = df.loc[df["tex"].str.contains('(\$\$\s.*\$\$|\\\[\s.*\\\]|begin{displaymath|begin{equation|begin{split|begin{array|begin{eqnarray|begin{multiline|begin{gather|begin{align|begin{flalign)',regex=True, na=False)]

    #This uses the equation extractor - so that any update will be reflected here as well
    df['tag'] = df.apply(lambda x : generate_tag(x), axis=1)
    if include_inline:
        dfResult = df
    else:
        dfResult = df[df['tag']=='display']
    return dfResult

def train_val_split(datList, fracTrain=.90):
    '''For a list of arxivIds, split into a training and validation set.
       By default, split as 90% train, 10% validation.'''
    split = int(len(datList) * fracTrain)
    random.shuffle(datList)
    return datList[:split], datList[split:] 


def group_near_eqns(df, all_Tex=False, group=True):
    '''Function that joins display style equation bounding boxes so that small floating 
       boxes will be removed or joined with their larger counterpart (ie. the indices of sums would be joined with the total sum expression).
       The boolean flag all_Tex if true will join the entire tex expression into a single box even if it spans multiple lines, where 
       if it is false, the function will group individual lines of equations using the threshold parameters.'''
    
    # v_distance_threshold=0.003
    # width_threshold=0.05
    # height_threshold=0.002
    # height_filter=0.05


    height_threshold=7
    large_pos = 10000

    df['right'] = df['left'] + df['width']
    df['bottom'] = df['top'] + df['height']

    df['top_px'] = df['top'] * df['img_height']
    df['bottom_px'] = df['bottom'] * df['img_height']
    df['left_px'] = df['left'] * df['img_width']
    df['right_px'] = df['right'] * df['img_width']
    df['width_px'] = df['right_px'] - df['left_px']
    df['height_px'] = df['bottom_px'] - df['top_px']
    
    df = df.sort_values(by=['page','entity_id','top_px']).reset_index()
    


    
    if not group:

        df['right_new'] = df['right']
        df['bottom_new'] = df['bottom']
        df['left_new'] = df['left']
        df['top_new'] = df['top']

    else:

        # New method (operating on actual pixels)
        if not all_Tex:
            df_inline = df[df['tag']=='inline']
            df = df[df['tag']=='display'] 
            
            df = df.reset_index()
            df['row_no'] = df.index
            df['v_min'] = 0
            df['v_min_idx'] = 0

            
            eqns = df.shape[0]-1
            if eqns>=1:
                for i, row in df.iterrows():
                    
                    if i==0:
                        vdist = [large_pos,abs(df.loc[i+1,'top_px'] - df.loc[i,'bottom_px'])]
                    elif i==eqns:
                        vdist = [abs(df.loc[i,'top_px'] - df.loc[i-1,'bottom_px']),large_pos]
                    else:
                        vdist = [abs(df.loc[i,'top_px'] - df.loc[i-1,'bottom_px']),abs(df.loc[i+1,'top_px'] - df.loc[i,'bottom_px'])]

                    v_min_idx = i -1 + (2*vdist.index(min(vdist)))
                    v_min = min(vdist)

                    df.at[i,'v_min'] = v_min
                    df.at[i,'v_min_idx'] = v_min_idx
                    
                    # Tiny artifacts below a certain height
                    if df.loc[i,'tag']=='display' and df.loc[i,'height_px']<height_threshold and df.loc[i,'entity_id'] == df.loc[v_min_idx,'entity_id']:
                        df.at[df.row_no==df.loc[i,"row_no"],'row_no'] = df.loc[v_min_idx,'row_no']
                    
                    # Fractions - N/D
                    elif df.loc[i,'tag']=='display' and v_min<=4 and df.loc[i,'entity_id'] == df.loc[v_min_idx,'entity_id'] and 'frac' in df.loc[i,'tex']:
                        df.at[df.row_no==df.loc[i,"row_no"],'row_no'] = df.loc[v_min_idx,'row_no']
                    



                    

                row_grps = df.filter(['row_no','left','right','bottom','top'])
                
                row_grps = row_grps.groupby(['row_no']).agg({'left':'min','top':'min','right':'max','bottom':'max'}).reset_index()

                row_grps.columns = ['row_no','left_new','top_new','right_new','bottom_new']
                df = df.merge(row_grps, how='left', on='row_no')

                

            else:
                df['right_new'] = df['right']
                df['bottom_new'] = df['bottom']
                df['left_new'] = df['left']
                df['top_new'] = df['top']

                        


                            

        # Old Method (operating on ratios)
        # if not all_Tex:
        #     df = df.sort_values(by=['page','tex','top']).reset_index()
            

        #     for i, row in df.iterrows():        
        #         if i==0:
        #             df.at[i,'left_new'] = df.at[i,'left']
        #             df.at[i,'top_new'] = df.at[i,'top']
        #             df.at[i,'right_new'] = df.at[i,'right']
        #             df.at[i,'bottom_new'] = df.at[i,'bottom']
        #             df.at[i,'reason'] = 0
        #         elif (df.iloc[i].page == df.iloc[i-1].page) and (df.iloc[i].tex == df.iloc[i-1].tex) and \
        #             ((df.iloc[i].top - df.iloc[i-1].bottom)<v_distance_threshold):
        #             df.at[i,'left_new'] = min(df.at[i,'left'],df.at[i-1,'left'])
        #             df.at[i-1,'left_new'] = min(df.at[i,'left'],df.at[i-1,'left'])
        #             df.at[i,'top_new'] = min(df.at[i,'top'],df.at[i-1,'top'])
        #             df.at[i-1,'top_new'] = min(df.at[i,'top'],df.at[i-1,'top'])
        #             df.at[i,'right_new'] = max(df.at[i,'right'],df.at[i-1,'right'])
        #             df.at[i-1,'right_new'] = max(df.at[i,'right'],df.at[i-1,'right'])
        #             df.at[i,'bottom_new'] = max(df.at[i,'bottom'],df.at[i-1,'bottom'])
        #             df.at[i-1,'bottom_new'] = max(df.at[i,'bottom'],df.at[i-1,'bottom'])
        #             df.at[i,'reason'] = 1
        #         elif (df.iloc[i].page == df.iloc[i-1].page) and (df.iloc[i].tex == df.iloc[i-1].tex) and \
        #             ((df.iloc[i].right - df.iloc[i].left)<width_threshold) and ((df.iloc[i].bottom - df.iloc[i].top)>height_threshold):
        #             df.at[i,'left_new'] = min(df.at[i,'left'],df.at[i-1,'left'])
        #             df.at[i-1,'left_new'] = min(df.at[i,'left'],df.at[i-1,'left'])
        #             df.at[i,'top_new'] = min(df.at[i,'top'],df.at[i-1,'top'])
        #             df.at[i-1,'top_new'] = min(df.at[i,'top'],df.at[i-1,'top'])
        #             df.at[i,'right_new'] = max(df.at[i,'right'],df.at[i-1,'right'])
        #             df.at[i-1,'right_new'] = max(df.at[i,'right'],df.at[i-1,'right'])
        #             df.at[i,'bottom_new'] = max(df.at[i,'bottom'],df.at[i-1,'bottom'])
        #             df.at[i-1,'bottom_new'] = max(df.at[i,'bottom'],df.at[i-1,'bottom'])
        #             df.at[i,'reason'] = 2
        #         else:
        #             df.at[i,'left_new'] = df.at[i,'left']
        #             df.at[i,'top_new'] = df.at[i,'top']
        #             df.at[i,'right_new'] = df.at[i,'right']
        #             df.at[i,'bottom_new'] = df.at[i,'bottom']
        #             df.at[i,'reason'] = 3
                



            # handle duplicates:
            df = df.filter(['tex_path', 'entity_id','page', 'relative_file_path', 'tex', 'tag',
        'left_new', 'top_new', 'right_new', 'bottom_new', 'img_height','img_width']).drop_duplicates()

            df_inline = df_inline[(df_inline['height_px']>2)&(df_inline['width_px']>2)]
            df_inline = df_inline.filter(['tex_path', 'entity_id','page', 'relative_file_path', 'tex', 'tag',
        'left', 'top', 'right', 'bottom', 'img_height','img_width']).drop_duplicates()
            df_inline.columns = ['tex_path', 'entity_id','page', 'relative_file_path', 'tex', 'tag',
        'left_new', 'top_new', 'right_new', 'bottom_new', 'img_height','img_width']

            df = pd.concat([df,df_inline])

            

        # Case where we want to join full tex expressions even if they span multiple lines:
        else:
            grouped = df.groupby('tex').agg({'left':'min','top':'min','right':'max','bottom':'max'}).reset_index()
            df.columns = ['tex','left_new','top_new','right_new','bottom_new']
            
            df= df.merge(grouped, how='left', on='tex')

    return df 
    
def join_hue_locs_and_entites(arxivIds, include_inline=False):
    '''Joins the information about where the equations are located in 
       the paper and what the equations are into a single csv file.'''
    for arxivId in arxivIds:
        if arxivId=='.DS_Store':
            continue

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
        dfDisplay = filter_display_eqs(dfHue, include_inline=include_inline)
        
        #dfHue.to_csv(os.path.join(outDir, "eqs_and_locs.csv"), index=False)
        #dfDisplay.to_csv(os.path.join(outDir, "eqs_and_locs.csv"), index=False)

        imgDirPrefix = os.path.join("data", "06-paper-images", arxivId)
        imgDirSuffix = os.listdir(imgDirPrefix)
        imgPath = os.path.join(imgDirPrefix, imgDirSuffix[0],'page-1.png')
        img = cv2.imread(imgPath)
        h,w,_ = img.shape

        dfDisplay['img_height'] = h
        dfDisplay['img_width'] = w

        

        dfGrouped = group_near_eqns(dfDisplay, group=True)
        dfGrouped.to_csv(os.path.join(outDir, "eqs_and_locs.csv"), index=False)


def draw_boxes(arxivIds):
    '''Reads in the paper image files and bounbding box csv file and draws the boxes onto the corresponding paper page.'''
    for arxivId in arxivIds:
        if arxivId=='.DS_Store':
            continue

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
                tags = boxes['tag'].values.tolist()
                for j in range(len(lefts)):
                    left = int(lefts[j]*pgWidth)
                    top = int(tops[j]*pgHeight)
                    bottom = int(bottoms[j]*pgHeight)
                    right = int(rights[j]*pgWidth)
                    tag = tags[j]
                    if tag=='display':
                        paperImg = cv2.rectangle(paperImg, (left, top), (right, bottom), color=(255,0,0), thickness=1)
                    elif tag=='inline':
                        paperImg = cv2.rectangle(paperImg, (left, top), (right, bottom), color=(0,255,0), thickness=1)

            cv2.imwrite(os.path.join(outDir, paperImgFile), paperImg)
            

def create_training_json(arxivIds, train=True, micro_eval=False):
    '''For a given list of arxiv Ids, this function creates a JSON file 
       that represents the labelled bounding box data for the pages of the 
       paper in the format expected by detectron2's object detection. 
       If train==True, make training set. If false, make validation set. 
    '''
    # Location to output the json
    # determine if training or validation:

    category_ids = {
        'display':0,
        'inline':1
    }


    if train:
        outDir = os.path.join("data", "CNNTest", "train")
    else:
        if not micro_eval:
            outDir = os.path.join("data", "CNNTest", "val")
        else:
            outDirs = [os.path.join("data", "CNNTest", "val_" + arxivId) for arxivId in arxivIds]

    # Clear directory or directories (in the case of vla and micro_evaluation)
    if not micro_eval:
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
            if arxivId=='.DS_Store':
                continue

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
                    entity_ids = boxes['entity_id'].values.tolist()
                    tags = boxes['tag'].values.tolist()
                    # Loop through the boxes:
                    for j in range(len(lefts)):
                        # create an entry for this labelled region:
                        outDict[arxivId + "-" + paperImgFile]["regions"][str(j)] = {}
                        outDict[arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"] = {}
                        outDict[arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["name"] = "polygon"
                        outDict[arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["entity_id"] = entity_ids[j]
                        outDict[arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["category_id"] = category_ids[tags[j]]
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
            
    # handle micro_eval case now:
    else:
        outDicts = []
        for outDir in outDirs:
            arxivId = os.path.basename(os.path.normpath(outDir)).split("_")[1]
            if not os.path.exists(outDir):
                os.makedirs(outDir)
            else:
                # Clear between runs:
                os.system('rm -rf ' + outDir)
                os.makedirs(outDir)
    
            # Dictionary that will become the json
            outDicts.append({})
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
                outDicts[-1][arxivId + "-" + paperImgFile] = {}
                
                # Read in the paper page image:
                paperImg = cv2.imread(os.path.join(imgDir, paperImgFile))
                # Create a list of all the bunding boxes on this page:
                boxes = dfEqs.loc[lambda df: df['page'] == i]
                pgHeight = paperImg.shape[0]
                pgWidth = paperImg.shape[1]
                # Fill in entries for the page image:
                outDicts[-1][arxivId + "-" + paperImgFile]["fileref"] = ""
                outDicts[-1][arxivId + "-" + paperImgFile]["size"] = pgHeight*pgWidth
                outDicts[-1][arxivId + "-" + paperImgFile]["filename"] = arxivId + "-" + paperImgFile
                outDicts[-1][arxivId + "-" + paperImgFile]["base64_img_data"] = ""
                outDicts[-1][arxivId + "-" + paperImgFile]["file_attributes"] = {}
                outDicts[-1][arxivId + "-" + paperImgFile]["regions"] = {}
                # Check if there are bounding boxes for this page:
                if not boxes.empty:
                    lefts = boxes['left_new'].values.tolist()
                    tops = boxes['top_new'].values.tolist()
                    bottoms = boxes['bottom_new'].values.tolist()
                    rights = boxes['right_new'].values.tolist()
                    tags = boxes['tag'].values.tolist()
                    # Loop through the boxes:
                    for j in range(len(lefts)):
                        # create an entry for this labelled region:
                        outDicts[-1][arxivId + "-" + paperImgFile]["regions"][str(j)] = {}
                        outDicts[-1][arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"] = {}
                        outDicts[-1][arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["name"] = "polygon"
                        outDicts[-1][arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["category_id"] = category_ids[tags[j]]
                        outDicts[-1][arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_x"] = []
                        outDicts[-1][arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_y"] = []
                        outDicts[-1][arxivId + "-" + paperImgFile]["regions"][str(j)]["region_attributes"] = {}
                        # Compute the coordinates of the box's corners
                        left = int(lefts[j]*pgWidth)
                        top = int(tops[j]*pgHeight)
                        bottom = int(bottoms[j]*pgHeight)
                        right = int(rights[j]*pgWidth)
                        # Add the box corner points to the representation of the box:
                        outDicts[-1][arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_x"].append(left)
                        outDicts[-1][arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_x"].append(left)
                        outDicts[-1][arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_x"].append(right)
                        outDicts[-1][arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_x"].append(right)
                        outDicts[-1][arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_y"].append(top)
                        outDicts[-1][arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_y"].append(bottom)
                        outDicts[-1][arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_y"].append(top)
                        outDicts[-1][arxivId + "-" + paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_y"].append(bottom)

                # Write a copy of the Page image to the output directory with the arxivId added to it's name:
                cv2.imwrite(os.path.join(outDir, arxivId + "-" + paperImgFile), paperImg)
                    
            # After all the pages of all the papers have been taken care of, output a json: 
            with open(os.path.join(outDir, 'bounding_box_data.json'), 'w') as json_file:
                json.dump(outDicts[-1], json_file)


def finerFiltering(arxivIds):
    final_df = pd.DataFrame()
    for arxivId in arxivIds:
            if arxivId=='.DS_Store':
                continue

            # Get the joined csv file for equation locatyions:
            inDir = os.path.join("data", "99-formatting-data", arxivId)
            eqLocsCsv = os.path.join(inDir, "eqs_and_locs.csv")
            dfEqs = pd.read_csv(eqLocsCsv)
            dfEqs['paper'] = arxivId
            final_df = pd.concat([final_df,dfEqs])
            

    final_df = final_df.drop_duplicates()
    final_df['width'] = (final_df['right_new']-final_df['left_new'])*final_df['img_width']
    final_df['height'] = (final_df['bottom_new']-final_df['top_new'])*final_df['img_height']


    def remove_papers(row):
        if row in papers_to_remove:
            return 1
        else:
            return 0

    papers_to_remove = []
    papers_to_remove = papers_to_remove + ["1501.00009","1503.00066","0705.00116"] #page orientation
    papers_to_remove = papers_to_remove + ["0705.00017"] #Random figures and artifacts as eqns
    papers_to_remove = papers_to_remove +  list(set(list(final_df[(final_df.tag=='display') & (final_df.width<=10)].paper)))
    papers_to_remove = papers_to_remove +  list(set(list(final_df[(final_df.tag=='display') & (final_df.height<7)].paper)))
    # papers_to_remove = papers_to_remove +  list(set(list(final_df[(final_df.tag=='inline') & (final_df.width<3)].paper)))
    # papers_to_remove = papers_to_remove +  list(set(list(final_df[(final_df.tag=='inline') & (final_df.height<3)].paper)))
    
    
    total_d_eqns = final_df[final_df.tag=='display'].groupby(['paper','page']).size().reset_index()
    total_d_eqns.columns = ['paper','page','eqns']
    new_final_df = final_df.merge(total_d_eqns, on=['paper','page'], how="left")

    
    new_final_df['remove'] = new_final_df.paper.apply(lambda x: remove_papers(x))


    new_final_df = new_final_df[(new_final_df['eqns']<=20) & (new_final_df['remove']==0)].drop_duplicates()

    final_arxivIds = list(set(list(new_final_df.paper)))
    return final_arxivIds
            

        


if __name__ == "__main__":
    # Run with arxiv Ids as commandline args:
    locs_dir = sys.argv[1]
    arxivIds = os.listdir(locs_dir)
    
    start = datetime.datetime.now()
    # Prep the data by joining the equation data with corresponding bounding box data:
    print('Step 1/6 : Join Eqn and Bounding Box data, group them')
    join_hue_locs_and_entites(arxivIds, include_inline = True)
    
    # # Todo: eventually only draw boxes if some kind of debug flag is set:
    print('Step 2/6 : Draw Bounding Boxes')
    #draw_boxes(arxivIds)

    print('Step 3/6 : More filtering based on aggregate distributions, and exceptions')
    final_arxivIds = finerFiltering(arxivIds)


    # Split into training and validation sets:
    print('Step 4/6 : Split Train and Valid sets')
    train_arxivs, val_arxivs = train_val_split(final_arxivIds)
    # Prepare the json files foe the RCNN model:
    print('Step 5/6 : Create Train set')
    create_training_json(train_arxivs, train=True)
    print('Step 6/6 : Create Valid set')
    create_training_json(val_arxivs, train=False)#, micro_eval=True)
    end = datetime.datetime.now()

    print(f"Total processing time : {(end-start).total_seconds()/60} mins")
