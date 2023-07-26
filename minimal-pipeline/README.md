# minimal-pipeline

An effort to refactor components of the ScholarPhi pipeline into separate services and keep the glue stitching them together fairly minimal.

### setup

```python
conda create -n minimal-pipeline python=3.8
source activate minimal-pipeline
pip install -r requirements.txt
```

### get dependent services running

1. Get `texcompile` service running on your machine.  See https://github.com/andrewhead/texcompile

2. Get `tesymdetect` service running on your machine. See https://github.com/andrewhead/texsymdetect

3. Get `spp` service running on your machine. See https://github.com/allenai/scienceparseplus

4. Get `pdftexalign` service running on your machine. See https://github.com/allenai/pdftexalign

5. Get `heddex` service running on your machine. See https://github.com/dykang/scholarphi_nlp_internal/tree/master/code/HEDDEx#run-with-docker-file


### setup DB



### run

### check output in scholarphi reader

