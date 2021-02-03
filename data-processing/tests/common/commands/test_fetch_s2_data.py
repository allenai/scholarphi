from typing import List
from dataclasses import dataclass

import pytest

from common.commands.fetch_s2_data import FetchS2Metadata, S2PaperNotFoundException
from scripts.commands import run_command

@dataclass
class Args:
    arxiv_ids: List[str]
    arxiv_ids_file = None

def test_no_s2_paper_raises_exception():
  command = FetchS2Metadata(Args(arxiv_ids=['fakeid']))
  with pytest.raises(S2PaperNotFoundException):
    run_command(command)

