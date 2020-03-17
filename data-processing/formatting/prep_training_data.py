import os
import sys

import json

import numpy as np
import pandas as pd
import cv2

def join_hue_locs_and_entites(arxivId):
    '''Joins the information about where the equations are located in 
       the paper and what the equations are into a single csv file.'''
    
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
    EqList.remove(EqList[0])

    # Create dict mapping equation indices to TeX commands:
    Idx_to_Tex = {}
    for i in range(len(EqList)):
        Idx_to_Tex[i] = EqList[i]

    dfHue["tex"] = dfHue['entity_id'].apply(lambda x: Idx_to_Tex.get(x))
    outDir = os.path.join("data", "99-formatting-data", arxivId)
    if not os.path.exists(outDir):
        os.makedirs(outDir)
    dfHue.to_csv(os.path.join(outDir, "eqs_and_locs.csv"), index=False)


def draw_boxes(arxivId):
    '''Reads in the paper image files and bounbding box csv file and draws the boxes onto the corresponding paper page.'''
    outDir = os.path.join("data", "99-formatting-data", arxivId)
    eqLocsCsv = os.path.join(outDir, "eqs_and_locs.csv")
    
    dfEqs = pd.read_csv(eqLocsCsv)
    imgDir = os.path.join("data", "06-paper-images", arxivId, "main.pdf")
    paperImgFiles = os.listdir(imgDir)
    for i in range(len(paperImgFiles)):
        paperImgFile = 'page-' + str(i+1) + ".png"
        paperImg = cv2.imread(os.path.join(imgDir, paperImgFile))
        boxes = dfEqs.loc[lambda df: df['page'] == i]
        pgHeight = paperImg.shape[0]
        pgWidth = paperImg.shape[1]
        if not boxes.empty:
            lefts = boxes['left'].values.tolist()
            tops = boxes['top'].values.tolist()
            widths = boxes['width'].values.tolist()
            heights = boxes['height'].values.tolist()
            for j in range(len(lefts)):
                left = int(lefts[j]*pgWidth)
                top = int(tops[j]*pgHeight)
                width = int(widths[j]*pgWidth)
                height = int(heights[j]*pgHeight)
                paperImg = cv2.rectangle(paperImg, (left, top), (left+width, top+height), color=(0,0,255), thickness=1)

        cv2.imwrite(os.path.join(outDir, paperImgFile), paperImg)
            


def create_training_json(arxivIds):
    '''For a given list of arxiv Ids, this function creates a JSON file 
       that represents the labelled bounding box data for the pages of the 
       paper in the format expected by detectron2's object detection.'''
    # Location to output the json
    outDir = os.path.join("data", "99-formatting-data", "TrainingAggregate")
    if not os.path.exists(outDir):
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
        imgDir = os.path.join("data", "06-paper-images", arxivId, "main.pdf")
        paperImgFiles = os.listdir(imgDir)
        # Loop trhoguh paper's pages:
        for i in range(len(paperImgFiles)):
            paperImgFile = 'page-' + str(i+1) + ".png"
            # Create entry in dict for this page:
            outDict[paperImgFile] = {}

            # Read in the paper page image:
            paperImg = cv2.imread(os.path.join(imgDir, paperImgFile))
            # Create a list of all the bunding boxes on this page:
            boxes = dfEqs.loc[lambda df: df['page'] == i]
            pgHeight = paperImg.shape[0]
            pgWidth = paperImg.shape[1]
            # Fill in entries for the page image:
            outDict[paperImgFile]["fileref"] = ""
            outDict[paperImgFile]["size"] = pgHeight*pgWidth
            outDict[paperImgFile]["filename"] = paperImgFile
            outDict[paperImgFile]["base64_img_data"] = ""
            outDict[paperImgFile]["file_attributes"] = {}
            outDict[paperImgFile]["regions"] = {}
            # Check if there are bounding boxes for this page:
            if not boxes.empty:
                lefts = boxes['left'].values.tolist()
                tops = boxes['top'].values.tolist()
                widths = boxes['width'].values.tolist()
                heights = boxes['height'].values.tolist()
                # Loop through the boxes:
                for j in range(len(lefts)):
                    # create an entry for this labelled region:
                    outDict[paperImgFile]["regions"][str(j)] = {}
                    outDict[paperImgFile]["regions"][str(j)]["shape_attributes"] = {}
                    outDict[paperImgFile]["regions"][str(j)]["shape_attributes"]["name"] = "polygon"
                    outDict[paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_x"] = []
                    outDict[paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_y"] = []
                    outDict[paperImgFile]["regions"][str(j)]["region_attributes"] = {}
                    # Compute the coordinates of the box's corners
                    left = int(lefts[j]*pgWidth)
                    top = int(tops[j]*pgHeight)
                    width = int(widths[j]*pgWidth)
                    height = int(heights[j]*pgHeight)
                    # Add the box corner points to the representation of the box:
                    outDict[paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_x"].append(left)
                    outDict[paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_x"].append(left)
                    outDict[paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_x"].append(left+width)
                    outDict[paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_x"].append(left+width)
                    outDict[paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_y"].append(top)
                    outDict[paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_y"].append(top+height)
                    outDict[paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_y"].append(top)
                    outDict[paperImgFile]["regions"][str(j)]["shape_attributes"]["all_points_y"].append(top+height)
                    
    # After all the pages of all the papers have been taken care of, output a json: 
    with open(os.path.join(outDir, 'bounding_box_data.json'), 'w') as json_file:
        json.dump(outDict, json_file)
                    
        
if __name__ == "__main__":
    # Run with arxiv Id as commandline arg:
    #join_hue_locs_and_entites(sys.argv[1])
    #draw_boxes(sys.argv[1])
    create_training_json(sys.argv[1:])
