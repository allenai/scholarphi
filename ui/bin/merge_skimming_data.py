import os
import json

input_dirs = [
    "src/data/sections",
    "src/data/captions",
    "src/data/facets",
    "src/data/sentences",
    "src/data/abstract",
]

# Specify the arxiv ids for the papers used in the user study
# so we build a merged data file with only those papers
selected_arxiv_ids = ["2102.09039", "1602.06979", "2104.03820"]

cur_id = 0
for input_dir in input_dirs:
    merged = {}
    for data_e in os.scandir(input_dir):
        id, ext = os.path.splitext(data_e.name)
        if id == "skimmingData":
            continue

        if id not in selected_arxiv_ids:
            continue

        if ext != ".json":
            continue

        with open(data_e.path, "r") as f:
            data = json.load(f)
            # add unique id to each data entry
            for x in data:
                x["id"] = str(cur_id)
                cur_id += 1
            merged[id] = data

    with open(f"{input_dir}/skimmingData.json", "w") as out:
        json.dump(merged, out)
