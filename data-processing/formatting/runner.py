import os
import sys
# TODO use argparse to add ability to run either range or a list:
import argparse
import subprocess

if __name__ == "__main__":
    '''Given a starting arxiv ID and a number of papers, run the pipeline on the number of 
       papers starting a the arxiv ID. Between each run, delete all files and directories 
       that aere not needed for creating training data.'''
    arxivId0 = sys.argv[1]
    numPapers = sys.argv[2]
    month = arxivId0.split(".")[0]
    paperIdx = arxivId0.split(".")[1]
    dirToRemove = ['./data/01-arxiv-ids', './data/02-sources-archives', './data/03-s2-metadata',\
                   './data/04-sources', './data/05-compiled-sources','./data/07-bounding-box-accuracies',\
                   './data/08-bibitems', './data/09-bibitem-resolutions', './data/10-sources-with-colorized-citations',\
                   './data/11-compiled-sources-with-colorized-citations', './data/12-paper-with-colorized-citations-images',\
                   './data/13-diff-images-with-colorized-citations', './data/14-hue-locations-for-citations', \
                   './data/15-citation-locations', './data/16-sources-with-annotated-symbols',\
                   './data/18-sources-with-colorized-equations', './data/19-compiled-sources-with-colorized-equations',\
                   './data/20-paper-with-colorized-equations-images', './data/21-diff-images-with-colorized-equations', \
                   './data/23-detected-sentences', './data/24-sources-with-colorized-sentences', \
                   './data/25-compiled-sources-with-colorized-sentences', './data/26-paper-with-colorized-sentences-images',\
                   './data/27-diff-images-with-colorized-sentences', './data/28-hue-locations-for-sentences', \
                   './data/29-sentences-model-ids', './data/30-detected-equation-tokens', './data/31-symbol-matches', \
                   './data/32-sentences-for-equation-tokens', './data/33-sentences-for-symbols', \
                   './data/34-sources-with-colorized-equation-tokens', './data/35-compiled-sources-with-colorized-equation-tokens', \
                   './data/36-paper-with-colorized-equation-tokens-images', './data/37-diff-images-with-colorized-equation-tokens',\
                   './data/38-hue-locations-for-equation-tokens', './data/39-symbol-locations']
    for i in range(int(paperIdx), int(paperIdx) + int(numPapers)):
        runCmd = "python3 scripts/run_pipeline.py -v --arxiv-ids " + month + "." + str(i).zfill(5) + " --entities equations --one-entity-at-a-time --dry-run"
        process = subprocess.Popen(runCmd, shell=True)
        process.wait()
        for dir_rm in dirToRemove:
            rmCmd = "rm -rf " + dir_rm
            subprocess.Popen(rmCmd, shell=True)
        
