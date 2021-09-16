#! /bin/bash
# Run this script to extract symbols using the paper processing pipeline.
# Then run the script 'python scripts/collect_symbols.py'

export PYTHONPATH=.
export READER_DB_PASSWORD=''

python \
    scripts/run_pipeline.py \
    --arxiv-ids-file arxiv_ids.txt \
    --entities symbols \
    --end collect-symbol-locations \
    --one-paper-at-a-time \
    --keep-paper-data \
    --dry-run \
    -v
