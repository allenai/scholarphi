# Explanation-Processing Pipeline

Processing pipeline for extracting explanations from papers.

## Setup

### Python dependencies

```
conda create -n reader python=3.6
cd explanations/
pip install -r requirements.txt
pip install opencv-python==3.3.0.10       # dont know why, but this doesnt work in requirements.txt
```

NOTE: Andrew's transitioning to storing dependencies in an
`environment.yml` file. You may want to install from that
file instead. More instructions to come soon.

### Perl dependencies

Perl is used to run third-party code for compiling TeX and
parsing TeX equations. If you haven't already, install Perl.
First, install the `cpanm` command for installing Perl
modules. Accept the defaults.

```bash
cpan App::cpanminus
```
If your system is anything like mine,
you may need to add `cpanm` to your path, by adding this to
your path: `/path/to/bin/` where this is the path to the
`bin` directory that contains your installation of `perl`.

**AutoTeX**: AutoTeX is the automatic TeX-building
engine used at arXiv. Install AutoTeX using `cpanm`:

```bash
cpanm TeX::AutoTeX
```

At the time this README was written, we were using AutoTeX
version v0.906.0.

**LaTeXML**: LaTeXML converts TeX documents to an XML
representation. We use it for parsing TeX equations.

```bash
cpanm LaTeXML
```

At the time this README was written, we were using LaTeXML
v0.8.4.

### Running the scripts

See the `.vscode/launch.json` file for commands used to run
the script from within VSCode.

```bash
PYTHONPATH="." python scripts/run.py arxiv_ids.txt -v --annotate-pdf --save-images
```

Run the above command with the `-h` command to learn about
the other command options.

### Testing the code

Activate the virtual environment, then run `pytest` from
this directory.

### Troubleshooting and gotchas

#### AutoTeX

If it fails, it appears to truncate the `.tex` files to be empty.
