"""

Copied over from data-processing/common/unpack.py

"""

from typing import List

import os
import tarfile
import gzip
import shutil

import logging


def _is_file_type_forbidden(tarinfo: tarfile.TarInfo) -> bool:
    return (
        tarinfo.islnk()
        or tarinfo.isblk()
        or tarinfo.ischr()
        or tarinfo.isdev()
        or tarinfo.isfifo()
        or tarinfo.issym()
        or tarinfo.islnk()
    )


def _is_path_forbidden(path: str, dest_dir: str) -> bool:
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


def get_safe_files(archive: tarfile.TarFile, dest_dir: str) -> List[tarfile.TarInfo]:
    safe_files = [
        member
        for member in archive
        if not (
            _is_file_type_forbidden(member) or _is_path_forbidden(member.name, dest_dir)
        )
    ]
    return safe_files


def unpack_archive(archive_path: str, dest_dir: str) -> None:
    """
    For permissible arXiv source formats, see the 'Other formats' page for an arXiv paper.
    At the time of writing, the sources could be any of the following:
    * If multiple files, a gzipped tar
    * A PDF
    * A gzipped TeX, DVI, PostScript, or DVI file
    """
    if os.path.exists(dest_dir):
        raise FileExistsError(f'{dest_dir} already exists. Cant unpack {archive_path}')

    os.makedirs(dest_dir)

    # TODO(andrewhead): Check with Kyle and Sam about how to best handle sandboxing, in case our
    # archive-checking code misses some corner cases. The AutoTeX documentation implies that arXiv
    # quarantines TeX and the compilation process using chroot.
    try:
        with tarfile.open(archive_path, mode="r:gz") as archive:
            archive.extractall(dest_dir, members=get_safe_files(archive, dest_dir))
        return
    except tarfile.ReadError:
        logging.warning("Could not unpack %s as tar archive.", archive_path)

    try:
        uncompressed_path = os.path.join(dest_dir, "uncompressed")
        with gzip.open(archive_path, "rb") as gzip_file:
            uncompressed_contents = gzip_file.read()
            with open(uncompressed_path, "wb") as uncompressed_file:
                uncompressed_file.write(uncompressed_contents)
                logging.debug("Unpacked %s as a gzip file", archive_path)
        return
    except Exception:  # pylint: disable=broad-except
        logging.warning("Could not unpack %s as gzip file.", archive_path)

    pdf_path = os.path.join(dest_dir, "file.pdf")
    logging.debug("%s is assumed to be a PDF", archive_path)
    shutil.copyfile(archive_path, pdf_path)
