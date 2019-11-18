# Scholar Reader

The user interface, API, and data processing scripts for an 
augmented PDF reader application.

This repository hosts code for three subprojects: the user 
interface, API, and data processing scripts.  To learn about 
each of these projects and how to run the code for each of 
them, see the `README.md` file in the relevant directory.

Key directories include:

* `api/`: the web API that provides data about entities in 
papers and bounding boxes for those entities.
* `data-processing/`: a set of data processing scripts that 
extract entities and their bounding boxes from papers.
* `ui/`: the user interface for the augmented PDF reader.

The code in this directory roughly follows the following 
style guidelines:

* Python: `mypy` for typing, `black` for formatting, 
`pylint` for linting, and `pytest` for testing.  
Configurations for each can be found in the VSCode 
`.vscode/settings.json` file for Python subprojects.

* Node: Typescript, with Jest for tests, and Prettier for 
formatting. For linting Typescript, see the `tslint.json` 
specs in the Typescript subprojects.

Styling also roughly follows the guides for
[React](https://github.com/allenai/wiki/wiki/React-Style-Guide) 
and 
[CSS](https://github.com/allenai/wiki/wiki/CSS-Style-Guide) 
for Allen AI engineering (see the 
[wiki](https://github.com/allenai/wiki/wiki/Getting-Started)), 
where it makes sense to use these guides.
