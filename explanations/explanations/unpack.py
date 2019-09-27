import logging
import os
import tarfile
from typing import List

from explanations.directories import (
    SOURCE_ARCHIVES_DIR,
    SOURCES_DIR,
    source_archives,
    sources,
)


def _is_file_type_forbidden(tarinfo: tarfile.TarInfo):
    return (
        tarinfo.islnk()
        or tarinfo.isblk()
        or tarinfo.ischr()
        or tarinfo.isdev()
        or tarinfo.isfifo()
        or tarinfo.issym()
        or tarinfo.islnk()
    )


def _is_path_forbidden(path: str, dest_dir: str):
    """
    A path is forbidden if it falls outside of the directory into which the files are meant to
    be extracted. tar doesn't prevent users from defining files with absolute paths, or with
    with parent directory sub-paths (e.g., '..'). This method weeds out those files if they'll be
    written outside of the destination directory.
    """
    # This approach is based on the solution from https://stackoverflow.com/a/10077309/2096369
    # The code here assumes that no files will be links. To process links, see the answer above.
    resolved_dest_dir = os.path.realpath(os.path.abspath(dest_dir))
    resolved_dest_path = os.path.realpath(os.path.abspath(os.path.join(dest_dir, path)))
    return not resolved_dest_path.startswith(resolved_dest_dir)


def get_safe_files(tarfile: tarfile.TarFile, dest_dir: str) -> List[tarfile.TarInfo]:
    safe_files = [
        member
        for member in tarfile
        if not (
            _is_file_type_forbidden(member) or _is_path_forbidden(member.name, dest_dir)
        )
    ]
    return safe_files


def unpack(arxiv_id: str):
    archive_path = source_archives(arxiv_id)
    if not os.path.exists(archive_path):
        logging.warn("No source archive directory found for %s", arxiv_id)
        return
    if not os.path.exists(SOURCES_DIR):
        os.makedirs(SOURCES_DIR)
    sources_path = sources(arxiv_id)
    if os.listdir(sources_path):
        logging.warn("Files found in %s. Old files may be overwritten.", sources_path)
    # TODO(andrewhead): Check with Kyle and Sam about how to best handle sandboxing, in case our
    # archive-checking code misses some corner cases. The AutoTeX documentation implies that arXiv
    # quarantines TeX and the compilation process using chroot.
    try:
        with tarfile.open(archive_path, mode="r:gz") as archive:
            archive.extractall(
                sources_path, members=get_safe_files(archive, sources_path)
            )
    except tarfile.ReadError:
        logging.error(
            "Error reading source archive for %s. This may mean that there is no source for "
            + "document, and instead the PDF was downloaded."
        )
