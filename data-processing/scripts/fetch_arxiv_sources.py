import argparse
import os

from common import directories
from common.fetch_arxiv import fetch_from_arxiv
from common.unpack import unpack, unpack_archive

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        "Fetch and unpack sources for a single arXiv paper."
    )
    parser.add_argument(
        "arxiv_id",
        help="The arXiv ID for a paper. May include version number (i.e., 'v1', 'v2', etc.)",
    )
    parser.add_argument(
        "--output-dir",
        help="Directory into which the arXiv sources will be fetched.",
        default="tmp",
    )

    args = parser.parse_args()
    arxiv_id = args.arxiv_id

    output_dir = args.output_dir
    archives_dir = os.path.join(output_dir, "archives")
    archive_path = os.path.join(archives_dir, directories.escape_slashes(arxiv_id))
    sources_dir = os.path.join(output_dir, directories.escape_slashes(arxiv_id))

    if not os.path.exists(archives_dir):
        print(f"Creating directory to hold source archives at {archives_dir}.")
        os.makedirs(archives_dir)

    print(
        f"Downloading archive of source files from arXiv for paper {arxiv_id}...",
        end="",
    )
    fetch_from_arxiv(arxiv_id, dest=archive_path)
    print("done.")

    if not os.path.exists(sources_dir):
        print(f"Creating directory to hold unpacked sources at {sources_dir}.")
        os.makedirs(sources_dir)

    print(f"Unpacking sources for paper {arxiv_id} into {sources_dir}.")
    unpack_archive(archive_path, sources_dir)
