import argparse
import os.path

from scripts.upload_new_symbols import process

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        "Fetch and unpack sources for a single arXiv paper."
    )
    args = parser.parse_args()

    papers = [
        # First element of tuple: arXiv ID
        # Second element of tuple: S2 ID
        ("1906.08632", "0854a88273328a7c732838b8cefc9af1f9ef0d5d"),
        ("1805.08092", "090294db9fbcfc27e38b11050029bcb6fb794331"),
        ("1711.06454", "1b0ea9b19edaf99aff5e411020387a70c79867c8"),
        ("1712.05055", "306a2e8ca31fdcc148618d37074785c290f96375"),
        ("1705.08947", "5a5bcfda3b753f8266b9ba27d34fc86b6d374a1b"),
        ("1612.00188", "6e99f4859eb420ace7f03f098940135c1c355075"),
        ("1805.08328", "9a8e6feb271bf1cce8b1393cf41e70692a7f6625"),
        ("1704.07489", "9b08d3201af644a638e291755a5e51f6b17a51f3"),
        ("1811.12359", "9c5c794094fbf5da8c48df5c3242615dc0b1d245"),
        ("1704.05838", "b0351087a2b85f70e60fc79dfa4110b4985cc00a"),
        ("1812.01855", "ca1a2b86d39495be5524a0e39b663f7c423a0397"),
        ("1906.01195", "fddd3dab90c243ab7fc038bc6449ef62c0e06037"),
    ]
    for arxiv_id, s2_id in papers:
        print(f"Launching job for extracting symbols for paper {arxiv_id}.")
        try:
            process(
                arxiv_id,
                s2_id,
                "evaluation",
                False,
                os.path.join("debugging", arxiv_id),
            )
        except Exception as e:  # pylint: disable=broad-except
            print(f"Exception running job for paper {arxiv_id}. Skipping.")
