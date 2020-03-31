import os
import sys

import json

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


def get_box_dicts(img_dir):
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
            poly = [(x + 0.5, y + 0.5) for x, y in zip(px, py)]
            poly = [p for x in poly for p in x]

            obj = {
                "bbox": [np.min(px), np.min(py), np.max(px), np.max(py)],
                "bbox_mode": BoxMode.XYXY_ABS,
                "segmentation": [poly],
                "category_id": 0,
                "iscrowd": 0
            }
            objs.append(obj)
        record["annotations"] = objs
        dataset_dicts.append(record)
    return dataset_dicts  
                   
        
if __name__ == "__main__":
    CNN_data_dir = sys.argv[1]

    for d in ["train", "val"]:
        DatasetCatalog.register("Eqbox_" + d, lambda d=d: get_box_dicts(CNN_data_dir + d))
        MetadataCatalog.get("Eqbox_" + d).set(thing_classes=["Eqbox"])
    Eqbox_metadata = MetadataCatalog.get("Eqbox_train")

    cfg = get_cfg()
    cfg.merge_from_file(model_zoo.get_config_file("COCO-Detection/faster_rcnn_R_101_FPN_3x.yaml"))

    # If a second commandline argument is provided, interpret it as a model path and do not train, only evaluate:
    if len(sys.argv) > 2:
        model_path = sys.argv[2]
        model = build_model(cfg)
        DetectionCheckpointer(model).load(model_path)

        cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.7   # set the testing threshold for this model
        
        cfg.DATASETS.TEST = ("Eqbox_val", )
        predictor = DefaultPredictor(cfg)
        evaluator = COCOEvaluator("Eqbox_val", cfg, False, output_dir="./output/")
        val_loader = build_detection_test_loader(cfg, "Eqbox_val")
        inference_on_dataset(model, val_loader, evaluator)
        # another equivalent way is to use trainer.test

    else:
        # train a model
        cfg.DATASETS.TRAIN = ("Eqbox_train",)
        cfg.DATALOADER.NUM_WORKERS = 1
        #cfg.MODEL.WEIGHTS = model_zoo.get_checkpoint_url("COCO-Detection/faster_rcnn_R_101_FPN_3x.yaml")  # Let training initialize from model zoo
        cfg.SOLVER.IMS_PER_BATCH = 2
        cfg.SOLVER.BASE_LR = 0.0025  # pick a good LR
        cfg.SOLVER.MAX_ITER = 5000 
        cfg.MODEL.ROI_HEADS.BATCH_SIZE_PER_IMAGE = 512  # faster, and good enough for this toy dataset (default: 512)
        cfg.MODEL.ROI_HEADS.NUM_CLASSES = 1  # only has one class (Eqbox)
    
        os.makedirs(cfg.OUTPUT_DIR, exist_ok=True)
        trainer = DefaultTrainer(cfg) 
        trainer.resume_or_load(resume=False)
        trainer.train()

        cfg.MODEL.WEIGHTS = os.path.join(cfg.OUTPUT_DIR, "model_final.pth")
        cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.7   # set the testing threshold for this model
        
        cfg.DATASETS.TEST = ("Eqbox_val", )
        predictor = DefaultPredictor(cfg)
        evaluator = COCOEvaluator("Eqbox_val", cfg, False, output_dir="./output/")
        val_loader = build_detection_test_loader(cfg, "Eqbox_val")
        inference_on_dataset(trainer.model, val_loader, evaluator)
        # another equivalent way is to use trainer.test

    
