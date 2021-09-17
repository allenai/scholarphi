import os
import json

input_dirs = ["src/data/captions", "src/data/facets", "src/data/sentences"]

for input_dir in input_dirs:
    merged = {}
    for data_e in os.scandir(input_dir):
        id, ext = os.path.splitext(data_e.name)
        if id == "skimmingData":
            continue

        if ext != ".json":
            continue

        with open(data_e.path, "r") as f:
            merged[id] = json.load(f)

    with open(f"{input_dir}/skimmingData.json", "w") as out:
        json.dump(merged, out, indent=2)
