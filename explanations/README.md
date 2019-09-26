# explanations

All the code for getting symbol explanations as bounding boxes


### setup

```
conda create -n reader python=3.6
cd explanations/
pip install -r requirements.txt
pip install opencv-python==3.3.0.10       # dont know why, but this doesnt work in requirements.txt
```

NOTE: Andrew's transitioning to storing dependencies in an
`environment.yml` file. You may want to install from that
file instead. More instructions to come soon.

#### additional dependencies

AutoTeX is the automatic TeX-building engine used at arXiv.
It's a Perl module, and can be installed using CPAN. Install
Perl for your command line if you haven't already.

Then, install the `cpanm` command for installing Perl
modules. Accept the defaults.

```bash
cpan App::cpanminus
```

If your system is anything like mine, you may need to add
`cpanm` to your path, by adding this to your path:
`/path/to/bin/` where this is the path to the `bin`
directory that contains your installation of `perl`.

Then, install AutoTeX using `cpanm`:

```bash
cpanm TeX::AutoTeX
```

##### weird stuff about AutoTeX

If it fails, it appears to truncate the `.tex` files to be empty.

### input

LaTeX source from arXiv.  For example:
- Manually `https://arxiv.org/format/1909.08079` > `Download source`.
- Or find some way of getting `wget https://arxiv.org/e-print/1909.08079` to work.   

Afterwards, 
```
mkdir 1909.08079_input_original/
tar xvzf 1909.08079 --directory 1909.08079_input_original/
```

Double check that your LaTeX source compiles properly:

```
mkdir 1909.08079_output_original/
cd 1909.08079_input_original/ 
pdflatex -interaction=nonstopmode -shell-escape -output-directory=../1909.08079_output_original/ mainRecSys.tex
pdflatex -interaction=nonstopmode -shell-escape -output-directory=../1909.08079_output_original/ mainRecSys.tex
```

You need to do this twice because... reasons?  LaTeX is weird.  If you don't do this, the references don't show up.

Check `1909.08079_output_original/mainRecSys.pdf` to see if the PDF rendered correctly.

### injecting color tags into LaTeX source

Manual effort:

- Copy `1909.08079_input_original/mainRecSys.tex` to `1909.08079_input_colorized/mainRecSys.tex` 
- Open up `1909.08079_input_colorized/mainRecSys.tex`, Ctrl-F `$` symbol to find some math, and wrap the `$\math$` with tags to produce `{\color{red} $\math$}`.

Render to PDF to check that the math symbols turned red.

### turn PDFs into images

```
gs -dGraphicsAlphaBits=4 -dTextAlphaBits=4 -dNOPAUSE -dBATCH -dSAFER -dQUIET -sDEVICE=png16m -r96 -sOutputFile=1909.08079_output_original/%04d.png -dBufferSpace=1000000000 -dBandBufferSpace=500000000 -sBandListStorage=memory -c 1000000000 setvmthreshold -dNOGC -dLastPage=50 -dNumRenderingThreads=4 -f 1909.08079_output_original/mainRecSys.pdf
```

Check `1909.08079_output_original/` for `*.png` files, one for each page.

Repeat this for `1909.08079_output_colorized/mainRecSys.pdf`.


### image diffs

Let's say you ran the previous GhostScript command on `1909.08079_output_original/` and `1909.08079_output_colorized/`.

Then you should have `0001.png, 0002.png, ...` within each of these directories.

Pick a page for which the Original and Colorized page image are different.  Let's say this is `0003.png`.  

Create a target directory: `mkdir 1909.08079_output_diff`

Open up Python and:

```python
from explanations.scripts.example import diff_image

diff_image(input_png_path1='1909.08079_output_original/0003.png',
           input_png_path2='1909.08079_output_colorized/0003.png',
           output_png_path='1909.08079_output_diff/0003.png')
```

Paths may vary depending on where you saved your examples.

### bounding boxes

Given the PNG from previous step, we want bounding boxes around components.

Open up Python and:

```python
from explanations.scripts.example import compute_bounding_boxes

compute_bounding_boxes(diff_png_path='1909.08079_output_diff/0003.png',
                       input_png_for_bbox_overlay_path='1909.08079_output_original/0003.png',
                       output_dir='.')
```

This will dump an output file called `0.png` into `'.'` path.  If you open it up, it should look like a reasonable bounding box!
