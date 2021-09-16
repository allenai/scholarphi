import argparse
import os

from common import directories
from common.fetch_arxiv import fetch_pdf_from_arxiv


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        "Fetch a single arXiv pdf."
    )
    parser.add_argument(
        "arxiv_id",
        help="The arXiv ID for a paper. May include version number (i.e., 'v1', 'v2', etc.)",
    )
    parser.add_argument(
        "--output-dir",
        help=(
            "Directory into which the pdf will be fetched. The fetched pdf"
            + "will be saved in the output folder as <arxiv_id>.pdf"
        ),
        default="tmp",
    )

    args = parser.parse_args()
    arxiv_id = args.arxiv_id

    output_dir = args.output_dir
    pdf_path = os.path.join(output_dir, f"{directories.escape_slashes(arxiv_id)}.pdf")

    if not os.path.exists(output_dir):
        print(f"Creating directory to hold pdf at {output_dir}.")
        os.makedirs(output_dir)

    print(f"Downloading pdf from arXiv for paper {arxiv_id}...")

    fetch_pdf_from_arxiv(arxiv_id, dest=pdf_path)
    print("done.")
