# explanations

All the code for getting symbol explanations as bounding boxes


### setup

```
conda create -n reader python=3.6
cd explanations/
pip install -r requirements.txt
pip install opencv-python==3.3.0.10       # dont know why, but this doesnt work in requirements.txt
```

### input

LaTeX source from arXiv.  For example:
- Manually `https://arxiv.org/format/1909.08079` > `Download source`.
- Or find some way of getting `wget https://arxiv.org/e-print/1909.08079` to work.   

Afterwards, 
```
mkdir 1909.08079/
tar xvzf 1909.08079.tar.gz --directory 1909.08079/
```

Double check that your LaTeX source compiles properly:

```
mkdir 1909.08079_original/
cd 1909.08079/ 
pdflatex -interaction=nonstopmode -shell-escape -output-directory=../1909.08079_original/ main*.tex
pdflatex -interaction=nonstopmode -shell-escape -output-directory=../1909.08079_original/ main*.tex
```

You need to do this twice because... reasons?  LaTeX is weird.

Check `1909.08079_original/` for a `PDF` file.

### run



### output