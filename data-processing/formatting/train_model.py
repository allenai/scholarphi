import os
import sys

import json

import torch
import numpy as np
import pandas as pd
import random
import cv2

# Some basic setup:
# Setup detectron2 logger
import detectron2
from detectron2.utils.logger import setup_logger
setup_logger()

# import some common detectron2 utilities
from detectron2 import model_zoo
from detectron2.engine import DefaultPredictor
from detectron2.config import get_cfg
from detectron2.utils.visualizer import Visualizer
from detectron2.data import MetadataCatalog

from detectron2.structures import BoxMode
from detectron2.data import DatasetCatalog, MetadataCatalog

from detectron2.engine import DefaultTrainer
from detectron2.config import get_cfg

from detectron2.evaluation import COCOEvaluator, inference_on_dataset
from detectron2.data import build_detection_test_loader

from detectron2.modeling import build_model
from detectron2.checkpoint import DetectionCheckpointer

from detectron2.utils.visualizer import ColorMode


def get_box_dicts(img_dir):
    '''
    Function that will convert the custom formatted bounding box data 
    into the standard COCO format for loading into the RCNN model. 
    '''
    json_file = os.path.join(img_dir, "bounding_box_data.json")
    with open(json_file) as f:
        imgs_anns = json.load(f)

    dataset_dicts = []
    for idx, v in enumerate(imgs_anns.values()):
        record = {}
        
        filename = os.path.join(img_dir, v["filename"])
        height, width = cv2.imread(filename).shape[:2]
        
        record["file_name"] = filename
        record["image_id"] = idx
        record["height"] = height
        record["width"] = width
      
        annos = v["regions"]
        objs = []
        for _, anno in annos.items():
            assert not anno["region_attributes"]
            anno = anno["shape_attributes"]
            px = anno["all_points_x"]
            py = anno["all_points_y"]
            category_id = anno['category_id']
            poly = [(x + 0.5, y + 0.5) for x, y in zip(px, py)]
            poly = [p for x in poly for p in x]

            obj = {
                "bbox": [np.min(px), np.min(py), np.max(px), np.max(py)],
                "bbox_mode": BoxMode.XYXY_ABS,
                "segmentation": [poly],
                "category_id": category_id,
                "iscrowd": 0
            }
            objs.append(obj)
        record["annotations"] = objs
        dataset_dicts.append(record)
    return dataset_dicts


def visualize_model_predictions(Eqbox_metadata, img_dir, out_dir):
    '''
    Function to write out the model's predicted bounding boxes 
    along with class (if more then one) and model score (as a confidence
    percentage). img_dir is the directory where the model inputs 
    are stored and out_dir is where the function will write the visualizations.
    '''
    results = {}
    dataset_dicts = get_box_dicts(img_dir)
    for d in dataset_dicts:
        
        im = cv2.imread(d["file_name"])
        outputs = predictor(im)
        results[d["file_name"]] = {"pred_boxes" : outputs['instances'].pred_boxes.to("cpu").tensor.numpy().tolist(), "scores" : outputs['instances'].scores.cpu().numpy().tolist()}
        v = Visualizer(im[:, :, ::-1],
                       metadata=Eqbox_metadata, 
                       scale=0.8, 
        )
        v = v.draw_instance_predictions(outputs["instances"].to("cpu"))
        if not os.path.exists(out_dir):
            os.mkdir(out_dir)
        cv2.imwrite(os.path.join(out_dir, os.path.basename(d["file_name"])), v.get_image()[:, :, ::-1])
        
    with open(os.path.join(out_dir, 'pred_results.json'), 'w') as json_file:
        json.dump(results, json_file)


def parse_params(modelParamsFilename):
    '''Parse an input file that determines how the model should be run.'''
    with open(modelParamsFilename, 'r') as modelParamsFile:
        paramsDict = json.load(modelParamsFile)
        return paramsDict

def get_classes_info(modelParams):
    '''Determine the number of classes (currently supports just 
    display-style equations and both display and in-line).'''
    if modelParams['classtype'] =='only_display':
        num_classes = 1
        classes_arr = ["Eqbox"]
    elif modelParams['classtype'] =='both':
        num_classes = 2
        classes_arr = ["DisplayEqbox","InlineEqbox"]
    else:
        print('Need classtype defined in modelParams')
        print("should be either 'only_display' or 'both'.")
    return num_classes, classes_arr
        
if __name__ == "__main__":
    # Path to CNN data directory. Should have subdirectories 'train' and 'val' created by prep_training_data
    # In the case that you want to do micro-eval on individual papers, there can be multiple 'val' folders
    CNN_data_dir = sys.argv[1]
    # Path to model params json file:
    modelParams = parse_params(sys.argv[2])
    
    # parse class info from model params file:
    num_classes, classes_arr = get_classes_info(modelParams)
    
    # determine if evaluation set is broken into multiple subdirectories and create list of all eval directories:
    dirs = os.listdir(CNN_data_dir)
    vals = [val_dir for val_dir in dirs if val_dir.startswith("val")]
    
    # register the bounding box data dicts for each data set
    for d in ["train"] + vals:
        DatasetCatalog.register("Eqbox_" + d, lambda d=d: get_box_dicts(CNN_data_dir + d))
        MetadataCatalog.get("Eqbox_" + d).set(thing_classes= classes_arr)
    Eqbox_metadata = MetadataCatalog.get("Eqbox_train")

    cfg = get_cfg()
    cfg.merge_from_file(model_zoo.get_config_file(modelParams['model']))
    
    # define the model using the provided parameters:
    cfg.DATASETS.TRAIN = ("Eqbox_train",)
    cfg.DATASETS.TEST = ()
    cfg.DATALOADER.NUM_WORKERS = modelParams['num_workers']
    if modelParams['initWeightsfromModel']:
        # Let training initialize weights from pretrained model from model zoo
        cfg.MODEL.WEIGHTS = model_zoo.get_checkpoint_url(modelParams['model'])
        
    cfg.SOLVER.IMS_PER_BATCH = modelParams['imsPerBatch'] # images per batch
    cfg.SOLVER.BASE_LR = modelParams['learnRate']  # Learning Rate
    cfg.SOLVER.MAX_ITER = modelParams['maxIter'] # Max iterations
    cfg.MODEL.ROI_HEADS.BATCH_SIZE_PER_IMAGE = modelParams['batchSizePerImg'] # batch size per image (512 works well)
    cfg.MODEL.ROI_HEADS.NUM_CLASSES = num_classes  # set num classes
    
    # make output directory:
    os.makedirs(cfg.OUTPUT_DIR, exist_ok=True)
    trainer = DefaultTrainer(cfg)
    # Determines whether or not to try to load already trained model and resume:
    trainer.resume_or_load(resume=modelParams['resumeTraining'])
    if modelParams['doTrain']:
        trainer.train()
    
    # training performance evaluation:
    if modelParams['evalTrain']:
        cfg.MODEL.WEIGHTS = os.path.join(cfg.OUTPUT_DIR, "model_final.pth")
        # set the score threshold for this model to determine what level of confidence is needed for
        # determining what constitutes a class instance prediction (adjusting gives a precision/recall tradeoff)
        cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = modelParams["scoreThresh"]   
        cfg.DATASETS.TEST = ("Eqbox_train", )
        predictor = DefaultPredictor(cfg)
        evaluator = COCOEvaluator("Eqbox_train", cfg, False, output_dir="./output_train/")
        val_loader = build_detection_test_loader(cfg, "Eqbox_train")
        inference_on_dataset(trainer.model, val_loader, evaluator)

    
    # validation performance evaluation:
    for val in vals:
        cfg.MODEL.WEIGHTS = os.path.join(cfg.OUTPUT_DIR, "model_final.pth")
        # set the score threshold for this model to determine what level of confidence is needed for
        # determining what constitutes a class instance prediction (adjusting gives a precision/recall tradeoff)
        cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = modelParams["scoreThresh"] 
        cfg.DATASETS.TEST = ("Eqbox_" + val, )
        predictor = DefaultPredictor(cfg)
        evaluator = COCOEvaluator("Eqbox_" + val, cfg, False, output_dir="./output_" + val + "/")
        val_loader = build_detection_test_loader(cfg, "Eqbox_" + val)
        model = build_model(cfg)
        torch.save(model.state_dict(), os.path.join(cfg.OUTPUT_DIR, "model_final_save.pth"))
        inference_on_dataset(trainer.model, val_loader, evaluator)

        # Create visualizations for each of the predicted class instances.
        # This helps with debgging and understanding false postive predictions and missed predictions.
        # It can be a bit slow, though, so it's best to just use when visualizations are needed.
        if modelParams['visualizePredictions']:
            visualize_model_predictions(Eqbox_metadata, CNN_data_dir + val, CNN_data_dir + 'vis_' + val)

    
