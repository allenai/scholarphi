import json
import logging
import os
import httpx
from fastapi import FastAPI
from fastapi.responses import Response, JSONResponse

# from mmda_pdf_scorer.parser import MmdaPdfParser


API = 'https://s2-reader.apps.allenai.org'

logger = logging.getLogger("uvicorn")

app = FastAPI()

# parser = MmdaPdfParser()


# @app.on_event("startup")
# def start_up():
#     import spacy
#     # download spacy model
#     spacy.cli.download('en_core_web_sm')

#     # init layout predictor
#     parser.layout_predictor


@app.get("/")
async def root():
    return Response(content="Hello, World!", status_code=200)


@app.post("/api/log")
async def log(content: dict):
    # logger.info(f'POST-LOG')
    return JSONResponse(content=content, status_code=200)


@app.get('/api/v0/papers/{arxiv_id}/entities-deduped')
async def entities_deduped(arxiv_id: str):

    cache = f'data/{arxiv_id}.jsonl'
    if os.path.exists(cache):
        logger.info(f'CACHE HIT: {cache}')
        with open(cache, 'r', encoding='utf-8') as f:
            parsed = [json.loads(ln) for ln in f]
        # parsed = parser.score_all_sentences('temp.pdf')
        response = {'entities': parsed}
    else:
        logger.info(f'CACHE MISS: {cache}')
        response = {'entities': []}

    return JSONResponse(content=response, status_code=200)


@app.get('/api/v0/paper/{sid}')
async def get_paper(sid: str):
    async with httpx.AsyncClient() as client:
        uri = f'{API}/api/v0/paper/{sid}'
        req = await client.get(uri)
        response = req.json()

    logger.info(f'GET-PAPER: {sid}')
    return JSONResponse(content=response, status_code=200)
