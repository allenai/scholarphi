import json
import logging
import os
from pathlib import Path
import httpx
from fastapi import FastAPI
from fastapi.responses import Response, JSONResponse
import requests

from mmda_pdf_scorer.parser import MmdaPdfParser



RUN_MMDA = os.environ.get('RUN_MMDA', '') in {'True', 'true', '1'}

API = 'https://s2-reader.apps.allenai.org'

logger = logging.getLogger("uvicorn")

app = FastAPI()

if RUN_MMDA:
    parser = MmdaPdfParser()
else:
    parser = None


@app.on_event("startup")
def start_up():

    if parser:
        import spacy
        # download spacy model
        spacy.cli.download('en_core_web_sm')

        # init layout predictor
        parser.layout_predictor


@app.get("/")
async def root():
    return Response(content="Hello, World!", status_code=200)


@app.post("/api/log")
async def log(content: dict):
    # logger.info(f'POST-LOG')
    return JSONResponse(content=content, status_code=200)


@app.get('/api/v0/papers/{arxiv_id}/entities-deduped')
async def entities_deduped(arxiv_id: str):

    pdf_cache = Path(f'data/{arxiv_id}.pdf')
    json_cache = Path(f'data/{arxiv_id}.jsonl')
    if not pdf_cache.exists() and parser is not None:
        try:
            _, id_ = arxiv_id.split(':', 1)
            url = f'https://export.arxiv.org/pdf/{id_}.pdf'
            req = requests.get(url, allow_redirects=True)
            with requests.Session() as sess, open(pdf_cache, 'wb') as f:
                req = sess.get(url, allow_redirects=True)
                f.write(req.content)
        except Exception as e:
            if pdf_cache.exists():
                os.remove(pdf_cache)
            raise e

    if not json_cache.exists() and parser is not None:
        try:
            parsed = parser.score_all_sentences(pdf_cache)
            with open(json_cache, 'w', encoding='utf-8') as f:
                for sentence in parsed:
                    f.write(sentence.json() + '\n')
        except Exception as e:
            if json_cache.exists():
                os.remove(json_cache)
            raise e

    with open(json_cache, 'r', encoding='utf-8') as f:
        parsed = [json.loads(ln) for ln in f]
    response = {'entities': parsed}

    return JSONResponse(content=response, status_code=200)


@app.get('/api/v0/paper/{sid}')
async def get_paper(sid: str):
    async with httpx.AsyncClient() as client:
        uri = f'{API}/api/v0/paper/{sid}'
        req = await client.get(uri)
        response = req.json()

    logger.info(f'GET-PAPER: {sid}')
    return JSONResponse(content=response, status_code=200)
