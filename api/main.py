from collections import defaultdict
import json
from turtle import width
from typing import Any, List, Optional, Sequence
import logging

import httpx
from fastapi import FastAPI
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel

API = 'https://s2-reader.apps.allenai.org'

logger = logging.getLogger("uvicorn")

app = FastAPI()


@app.get("/")
async def root():
    return Response(content="Hello, World!", status_code=200)


@app.post("/api/log")
async def log(content: dict):
    # logger.info(f'POST-LOG')
    return JSONResponse(content=content, status_code=200)


bb_abstract = [{
    "page": 0,
    "left": 775 / 2550,
    "width": 190 / 2550,
    "top": 1115 / 3300,
    "height": 40 / 3300}]

bb_sent_1 = [
    # sentence over two lines
    {
        "page": 0,
        "left": 930 / 2550,
        "width": 1170 / 2550,
        "top": 2515 / 3300,
        "height": 50 / 3300,
    },
    {
        "page": 0,
        "left": 445 / 2550,
        "width": 690 / 2550,
        "top": 2565 / 3300,
        "height": 50 / 3300,
    }
]

bb_sent_2 = [
    # sentence over two lines
    {
        "page": 1,
        "left": 910 / 2550,
        "width": 1200 / 2550,
        "top": 2005 / 3300,
        "height": 50 / 3300,
    },
    {
        "page": 1,
        "left": 440 / 2550,
        "width": 240 / 2550,
        "top": 2055 / 3300,
        "height": 50 / 3300,
    }
]

text_abstract = "model size"
text_sent_1 = "Given the importance of model size, we ask: Is having better NLP models as easy as having larger models?"
text_sent_2 = "In this line of work, it is often shown that larger model size improvesperformance."

term_abstract = "14957775"
term_sent_1 = "14957776"
term_sent_2 = "14957777"

sent_abstract = "14957778"
sent_sent_1 = "14957779"
sent_sent_2 = "14957780"


sample_term = [
    {
        "id": term_abstract,
        "type": "term",
        "attributes": {
            "name": text_abstract,
            "term_type": None,
            "bounding_boxes": bb_abstract,
            "definitions": [text_abstract],
            "definition_texs": [text_abstract],
            "sources": ["tex"],
            "snippets": [text_sent_1, text_sent_2],
            "tags": [],
        },
        "relationships": {
            'sentence': {'type': "sentence", "id": sent_abstract},
            'definition_sentences': [],
            'snippet_sentences': [
                {'type': "sentence", "id": sent_sent_1},
                {'type': "sentence", "id": sent_sent_2},
            ]
        }
    },
    {
        "id": term_sent_1,
        "type": "term",
        "attributes": {
            "name": text_abstract,
            "term_type": None,
            "bounding_boxes": bb_sent_1,
            "definitions": [],
            "definition_texs": [],
            "sources": [],
            "snippets": [text_sent_1, text_sent_2],
            "tags": [],
        },
        "relationships": {
            'sentence': {'type': "sentence", "id": sent_sent_1},
            'definition_sentences': [],
            'snippet_sentences': [
                {'type': "sentence", "id": sent_sent_1},
                {'type': "sentence", "id": sent_sent_2},
            ]
        }
    },
    {
        "id": term_sent_2,
        "type": "term",
        "attributes": {
            "name": text_abstract,
            "term_type": None,
            "bounding_boxes": bb_sent_2,
            "definitions": [],
            "definition_texs": [
                {'type': "sentence", "id": sent_abstract}
            ],
            "sources": [],
            "snippets": [text_sent_1, text_sent_2],
            "tags": [],
        },
        "relationships": {
            'sentence': {'type': "sentence", "id": sent_sent_2},
            'definition_sentences': [],
            'snippet_sentences': [
                {'type': "sentence", "id": sent_sent_1},
                {'type': "sentence", "id": sent_sent_2},
            ]
        }
    },
    {
        "id": sent_sent_1,
        "type": "sentence",
        "attributes": {"bounding_boxes": bb_sent_1,
                       "text": text_sent_1},
        "relationships": {}
    },
    {
        "id": sent_sent_2,
        "type": "sentence",
        "attributes": {"bounding_boxes": bb_sent_2,
                       "text": text_sent_2},
        "relationships": {}
    },
    {
        "id": sent_abstract,
        "type": "sentence",
        "attributes": {"bounding_boxes": bb_abstract,
                       "text": text_abstract},
        "relationships": {}
    },
]



@app.get('/api/v0/papers/{arxiv_id}/entities-deduped')
async def entities_deduped(arxiv_id: str):

    response = {'entities': []}
    async with httpx.AsyncClient() as client:
        uri = f'{API}/api/v0/papers/{arxiv_id}/entities-deduped'
        req = await client.get(uri)
        response_proxied = req.json()
        if response_proxied.get('entities', None):
            response.update(response_proxied)

    response['entities'].extend(sample_term)

    logger.info(f'GET-ENTITIES-DEDUPED: {arxiv_id}; '
                f'{len(response["entities"])}')

    return JSONResponse(content=response, status_code=200)


@app.get('/api/v0/paper/{sid}')
async def get_paper(sid: str):
    async with httpx.AsyncClient() as client:
        uri = f'{API}/api/v0/paper/{sid}'
        req = await client.get(uri)
        response = req.json()

    logger.info(f'GET-PAPER: {sid}')
    return JSONResponse(content=response, status_code=200)
