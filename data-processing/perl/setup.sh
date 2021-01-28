# Fetch sources for AI2 clone of LaTeXML.
git clone https://github.com/allenai/latexml latexml

# Check out the branch with features for expanding TeX macros.
cd latexml
git checkout expand-macros

# Install Perl dependencies for LaTeXML.
cpanm .
