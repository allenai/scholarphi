# demacro

This module is a wrapper around the CTAN de-macro library for unraveling custom-defined macros in TeX files.

The steps are:

1. Find all occurrences of a macro defined in a `.tex` file & move them into a separate `.sty` file
2. Run `de-macro` on the specific `.tex` file, which will generate a `*-clean.tex` variant of that `.tex` file (as well as any `.tex` dependencies imported)
3. Running `python scripts/process.py compile-tex --arxiv-ids=1906.08632`  step which generates `data/05-compiled-sources/1906.08632`
4. Perform a diff between the PDFs resulting from `-clean.tex` and `.tex`

### questions

- Do we need to point to the "main" `.tex` file?
- Do we need  


### setup experiments

We ssh into a local docker instance w/ all reader pipeline functionality.  This will handle the (1) downloading, (2) unpacking, and (3) compiling operations as needed.

If the docker is already built:
```python
# this ssh into it
sudo docker exec -it blissful_noether /bin/bash

# cd into the right place
cd /data-processing/

# verify the arxiv IDs already there
# if not, manually paste a bunch of them there
ls arxiv_ids.txt

# verify the arxiv IDs have already been downloaded
# if not, run the download & unzip operations
ls /data-processing/data/02-sources-archives/
ls /data-processing/data/04-sources/

# python scripts/process.py fetch-arxiv-sources --arxiv-ids-file=arxiv_ids.txt --source=arxiv
# python scripts/process.py unpack-sources

# test compilation
python scripts/process.py compile-tex
ls /data-processing/data/05-compiled-sources/
``` 

Also, make sure to place the demacro tool into the Docker
```python
# verify the tool is there
# if not, copy it
ls /latexpand/

# sudo docker cp latexpand blissful_noether:latexpand
```

### setup using andrew's already-normalized files

```python
# assume Zip already exists at /home/kylel/scholar-reader/data-processing/06-normalized-sources.zip

sudo docker cp /home/kylel/scholar-reader/data-processing/06-normalized-sources.zip blissful_noether:/data-processing/data/
```

Then in docker cmd line:
```python
cd /data-processing/data/
unzip 06-normalized-sources.zip
ls 06-normalized-sources
```

### post experiemnt analysis

Download anything from within Docker to local machine by running this on the local machine
```python
sudo docker cp blissful_noether:/data-processing/... .

```