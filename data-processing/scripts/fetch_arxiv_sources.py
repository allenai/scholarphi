import argparse
import os
from typing import Callable, Dict

from common import directories
from common.fetch_arxiv import fetch_from_arxiv, fetch_pdf_from_arxiv
from common.unpack import unpack, unpack_archive


PDF_TYPE = "pdf"
SOURCE_ARCHIVE_TYPE = 'source-archive'

def source_archive(arxiv_id: str, output_dir: str) -> None:
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


def pdf(arxiv_id: str, output_dir: str) -> None:
    pdf_path = os.path.join(output_dir, f"{directories.escape_slashes(arxiv_id)}.pdf")

    if not os.path.exists(output_dir):
        print(f"Creating directory to hold pdf at {output_dir}.")
        os.makedirs(output_dir)

    print(f"Downloading pdf from arXiv for paper {arxiv_id}...")

    fetch_pdf_from_arxiv(arxiv_id, dest=pdf_path)
    print("done.")


if __name__ == "__main__":

    options: Dict[str, Callable[[str, str], None]] = {
        PDF_TYPE: pdf,
        SOURCE_ARCHIVE_TYPE: source_archive
    }

    parser = argparse.ArgumentParser(
        "Fetch and unpack sources or fetch pdf for a single arXiv paper."
    )
    parser.add_argument(
        "arxiv_id",
        help="The arXiv ID for a paper. May include version number (i.e., 'v1', 'v2', etc.)",
    )
    parser.add_argument(
        "--output-dir",
        help=(
            "Directory into which the arXiv sources or pdf will be fetched. For arXiv sources: "
            + "the fetched sources will be saved in a subfolder of the output folder with its "
            + "name as the arXiv ID (i.e., 'output_dir/<arxiv_id>/'). For pdf: the fetched pdf"
            + "will be saved in the output folder as <arxiv_id>.pdf."
        ),
        default="tmp",
    )

    parser.add_argument(
        "--file-type",
        required=True,
        choices=options.keys()
    )

    args = parser.parse_args()

    options[args.file_type](args.arxiv_id, args.output_dir)
