#!/usr/bin/env bash

#
# This shell script builds PDF.js's viewer and overwrites the appropriate
# files in `public/` with the output.
#

set -e
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

pdfjs_dir="$dir/../pdf.js"

cd "$pdfjs_dir"
npm install

ls
npm run build

rsync -rv --progress \
    --exclude=locale/ \
    --exclude=cmaps/ \
    --exclude=compressed.tracemonkey-pldi-09.pdf \
    "$pdfjs_dir/build/minified/web/" "$dir/../public/"

echo "complete"
