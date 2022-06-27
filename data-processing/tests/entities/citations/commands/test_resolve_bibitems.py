from unittest.mock import patch

from entities.citations.commands.resolve_bibitems import ResolveBibitems
from entities.citations.commands.resolve_bibitems import MatchTask
from entities.citations.types import Bibitem, BibitemMatch
from common.types import SerializableReference


def test_split_key():
    assert ResolveBibitems.split_key(None) == None
    assert ResolveBibitems.split_key('abc23de') == 'abc 23 de'
    assert ResolveBibitems.split_key('Abc23de') == 'Abc 23 de'
    assert ResolveBibitems.split_key('Abc23') == 'Abc 23'
    assert ResolveBibitems.split_key('Abc') == 'Abc'
    assert ResolveBibitems.split_key('23Abc') == '23 Abc'

def test_count_vectorizer():
    assert ResolveBibitems.similarity_count_vectorizer('one two three', 'five six') == 0
    assert ResolveBibitems.similarity_count_vectorizer('dog cat monkey', 'dog crocodile bird') == 1 / 6.0
    assert ResolveBibitems.similarity_count_vectorizer('dog cat monkey', 'dog crocodile') == 1 / 6.0
    assert ResolveBibitems.similarity_count_vectorizer('dog cat monkey', 'dog,,,(crocodile)....') == 1 / 6.0

def test_process():
    with patch('common.commands.base.load_arxiv_ids_using_args') as mock_upload_entities:
        resolve_bibitems = ResolveBibitems('2020.2123')
        item = MatchTask(
            '001',
            bibitems=[Bibitem(id_='one1999two', text='dog cat monkey', context_tex='N/A',
                              start=-1, end=-1, tex_path='N/A',
                              tex='N/A', bibitem_code='\journal{dog and cats} dog cat monkey'),
                      Bibitem(id_='two2020two', text='one two three', context_tex='N/A', start=-1, end=-1,
                              tex_path='N/A', tex='N/A', bibitem_code='\journal{numerology} one two three'),
                      Bibitem(id_='three2020', text='Dog on a walk', context_tex='N/A', start=-1, end=-1,
                              tex_path='N/A', tex='N/A',
                              bibitem_code=('arxiv_id=2022.04708 venue \journal{journal}{arXiv} Charles Dickens '
                                            'Ernest Hemingway 2022 dog on a walk')),
                      ],

            references=[SerializableReference(s2_id='111', arxivId='2022.04708', doi=None, title='Dog on a walk',
                                   authors="[{'id': 1, 'name': 'Charles Dickens'}, {'id':2, 'name': 'Ernest Hemingway'}]",
                                   venue='arXiv', year='2022')]
        )
        result = next(resolve_bibitems.process(item))
        assert result == BibitemMatch(key='three2020', bibitem_text='Dog on a walk', s2_id='111',
                                      s2_title='Dog on a walk',
                                      bibitem_code=('arxiv_id=2022.04708 venue \journal{journal}{arXiv} '
                                                    'Charles Dickens Ernest Hemingway 2022 dog on a walk'),
                                      similarity_score=0.4358974358974359)
        assert isinstance(result, BibitemMatch)
