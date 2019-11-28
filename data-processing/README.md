# Data Processing Scripts

Scripts for processing PDFs. The key goal of these scripts 
is to identify entities of interest in papers—for example, 
citations and symbols—extract those entities, and determine 
their positions within the papers.

## Installation

I'm going to level with you: if you want to run all stages 
of the data processing pipeline, installation is going to be 
pretty involved. Among other things, these scripts need to 
compile LaTeX, analyze images, invoke Node.js libraries, and 
upload data to a database. It's recommended you use a stable 
Ubuntu distribution or OSX to follow these commands; it's 
likely some of these dependencies (particularly image 
processing) may be difficult to configure on Windows.

So, let's install the dependencies. Before you install 
Python dependencies, make sure you have installed PostgreSQL 
and OpenSSL, which will be required for installing the 
Python PostgreSQL connector. If you're on OSX, you should be 
able to install both of these through Homebrew; on a Linux 
machine, you should be able to install these through your 
package manager of choice. If you have any trouble 
configuring on OSX, see the troubleshooting instructions at 
the bottom of this README for more ideas.

Once you have installed these dependencies, install the 
necessary Python dependencies. First, if you haven't 
already, install Python 3.7 or higher on your system.  Then, 
set up a Python virtual environment and install dependencies 
to that environment like so:

```bash
pip install virtualenv           # install virtualenv for virtual environtment management
virtualenv venv -p python3       # create a virtual environment in 'venv' that uses Python 3
source venv/bin/activate         # activate the virtual environment
pip install -r requirements.txt  # install dependencies into the virtual environment
```

You also need to install a few Perl dependencies. These are 
used for compiling LaTeX using arXiv's LaTeX compilation 
utilities, namely AutoTeX. If you haven't already installed 
Perl on your computer, do so. Then, run the following to 
install the Perl dependencies:

```bash
cpan TeX::AutoTeX
```

These Perl libraries will in turn invoke the LaTeX compilers 
on your computer. If you don't have a LaTeX distribution on 
your computer, download one. Make sure to download a full 
distribution, and not a mini-one, as these scripts are going 
to want access to many, many of the available configurations 
and packages available in a full LaTeX distribution.

Then, tell the scripts how to connect to LaTeX, and the 
database, by creating a `config.ini` file in this directory.  
The contents of that directory should be like so:

```
[tex]
texlive_path = <texlive-path>
texlive_bin_path = <texlive-bin-path>

[postgres]
db_name = scholar-reader
user = data-pipeline
password = <password>
host = scholar-reader.c5tvjmptvzlz.us-west-2.rds.amazonaws.com
port = 5432
```

The `texlive_path` and `texlive_bin_path` variables are 
required by the AutoTeX package; they're read from the 
configuration by the Python scripts and passed in as 
parameters to AutoTeX. 

Finding these directories may be a bit tricky. You have 
probably chosen the right folders if your `texlive_path` 
directory contains both a `bin` and a `texmf-dist` 
subdirectory, and if your `texlive_bin_path` contains both 
`latex` and `pdflatex`. On my machine, my `texlive_path` was 
`/usr/local/texlive/2017`, and my `texlive_bin_path` was 
`/usr/local/texlive/2017/bin/x86_64-darwin`.

Ask a database administrator (likely one of the maintainers 
of this repository) for the database password. Otherwise, 
you should be able to use the same configuration as above 
for all other database-related configuration variables.

Finally, you need to install dependencies needed by some 
Node.js scripts. These scripts are stored in the `node/` 
directory, and their dependencies will be too. Install the 
dependencies for the Node.js code like so:

```bash
cd node/     # change directory to the 'node' directory
npm install  # install Node.js dependencies
```

If the `npm install` command gives you an error, try
upgrading your Node.js version (we used v10.16.0), and then
run the command again.

## Getting started

Whew! You made it through that dizzying set of setup 
instructions. Now let's start processing TeX.

Your only interface to all of these scripts is a single 
Python command, `python process/script.py`. This one command 
provides you access to dozens of subcommands, each of which 
executes a different stage of the processing pipeline.

To see the set of available subcommands, run:

```bash
export PYTHONPATH=".:$PYTHONPATH"  # set up module search path
python scripts/process.py -h       # show the list of subcommands
```

In general, subcommands should be executed in the order 
they're listed by the help output. Most commands require 
results that are output from prior commands.

Almost _none_ of these commands require any arguments, aside 
from the very first command `python scripts/process.py 
fetch-arxiv-sources`. You can discover the arguments 
required for this command by running `python 
scripts/proces.py fetch-arxiv-sources -h`.

If you're just testing out the pipeline, consider making an 
`arxiv_ids.txt` file with the following contents:

```
0801.4750
```

Then run the following command to start off the pipeline:

```bash
python scripts/process.py fetch-arxiv-sources arxiv_ids.txt
```

Once you have done this, you can run the rest of the steps 
in the pipeline for extracting the positions of citations 
and uploading those positions:

```bash
python scripts/process.py fetch-s2-metadata
python scripts/process.py unpack-sources
python scripts/process.py extract-bibitems
python scripts/process.py resolve-bibitems
python scripts/process.py colorize-citations
python scripts/process.py compile-tex
python scripts/process.py raster-pages
python scripts/process.py compile-tex-with-colorized-citations
python scripts/process.py raster-pages-with-colorized-citations
python scripts/process.py diff-images-with-colorized-citations
python scripts/process.py locate-citation-hues
python scripts/process.py annotate-pdfs-with-citation-boxes  # optional: for debugging citation location extraction
python scripts/process.py upload-citations
```

Almost all scripts output results as CSV files, images, 
PDFs, or TeX files within a `data` directory. There's a 
separate data subdirectory for the output of each 
command—for example, `data/01-sources-archives`, 
`data/02-s2-metadata`, `data/04-bibitems`, etc. Each of 
these subdirectories has a directory that contains the 
results of processing each arXiv paper, named with the arXiv 
ID for that paper (with slashes escaped).

Most commands take as input results from running a previous 
command that have been output to the `data` directory.

Instructions for extracting symbols from papers are a bit 
more involved, and not yet documented; however the commands 
are there, and you should be able to do it if your run 
commands in the order they're listed in the command help.

## Running tests

If you're contributing to the code, run tests after making 
your changes to make sure everything's still working. We use 
Pytest for the tests. Run the test suite with this command:

```bash
pytest
```

## Troubleshooting the installation

### Installing psycopg2

`psycopg2` is a Python package used by our code to upload 
results from the data processing pipeline to a database. We 
had a few issues installing `psycopg2` on an OSX machine, as 
the code needs to be compiled, and therefore assumes it will 
have access to (at the least) libraries for OpenSSL and 
PostgreSQL. We found adequate guidance for installing the 
necessary dependencies for OSX in these two Stack Overflow 
posts:

* https://stackoverflow.com/questions/21079820/how-to-find-pg-config-path
* https://stackoverflow.com/questions/26288042/error-installing-psycopg2-library-not-found-for-lssl
