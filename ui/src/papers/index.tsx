/**
 * This file lists all papers that the reader is aware of, as a temporary
 * mechanism to browse available papers and/or evaluate the reader.
 *
 * This is likely to be discared, or remain an administrative tool,
 * as long-term we hope to use Semantic Scholar as an engine for discovery.
 * Accordingly the code and visual appearance differs from that used within
 * the general reader interface slightly.
 */

import ReactDOM from 'react-dom';
import React, { useState, useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import ErrorIcon from '@material-ui/icons/Error';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import axios from 'axios';

import { getAllPapers } from '../api';
import { PaperIdWithCounts } from '../types/api';

enum ViewState {
    LOADING, READY, ERROR
}

interface PaperListState {
    state: ViewState;
    papers: PaperWithMeta[];
}

interface PaperWithMeta extends PaperIdWithCounts {
    title?: string;
}

interface CachedPaperWithMeta {
    expires: number;
    paper: PaperWithMeta;
}

/**
 * This wrapper returns paper metadata from a local cache for up to 24 hours.a
 *
 * This is to prevent clients from overloading Semantic Scholar's API. It's a
 * very basic mechanism and should likely be replaced with something in the
 * reader API in the future.
 */
async function getPaperInfoFromS2(paper: PaperIdWithCounts): Promise<PaperWithMeta> {
    if (localStorage) {
        const maybeItem = localStorage.getItem(paper.s2Id);
        if (maybeItem) {
            const parsedItem: CachedPaperWithMeta = JSON.parse(maybeItem);
            if (parsedItem.expires > Date.now()) {
                console.debug(`Using cached paper:${paper.s2Id}`);
                return Promise.resolve(parsedItem.paper);
            } else {
                console.debug(`Paper ${paper.s2Id} is cached but has expired.`);
            }
        }
    }
    const s2ApiUrl =`https://api.semanticscholar.org/v1/paper/${paper.s2Id}`;
    const { data } = await axios.get<{ title?: string }>(s2ApiUrl);
    const paperWithMeta = Object.assign(paper, { title: data.title });
    if (localStorage) {
        localStorage.setItem(paper.s2Id, JSON.stringify({
            // cache for 24 hours, JavaScript timestamps are expressed in ms
            expires: Date.now() + (24 * 60 * 60 * 1000),
            paper: paperWithMeta
        }))
    }
    return paperWithMeta;
}

const PaperList = () => {
    const [ { state, papers }, setViewState ] = useState<PaperListState>({
        papers: [], state: ViewState.LOADING
    });
    useEffect(() => {
        (async () => {
            const allPapers = await getAllPapers();
            if (allPapers === null) {
                setViewState({ papers: [], state: ViewState.ERROR });
                return;
            }
            const allPapersWithTitle =
                await Promise.all(allPapers.map(getPaperInfoFromS2));
            setViewState({
                papers: allPapersWithTitle,
                state: ViewState.READY
            });
        })();
        return () => setViewState({ papers: [], state: ViewState.LOADING });
    }, []); // The empty array makes the inner callback only execute once
    return (
        <>
            <CssBaseline />
            <AppBar position="sticky">
                <Toolbar>
                    <h1>Supported Papers</h1>
                </Toolbar>
            </AppBar>
            <div>
                {state === ViewState.LOADING && (
                    <Box p={4} textAlign="center">
                        <CircularProgress />
                    </Box>
                )}
                {state === ViewState.READY && (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>ArXiv ID</TableCell>
                                <TableCell>Symbols</TableCell>
                                <TableCell>Citations</TableCell>
                                <TableCell>Reader Link</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {papers.map(paper => (
                                <TableRow key={paper.s2Id}>
                                    <TableCell>
                                        <a href={`https://semanticscholar.org/paper/${paper.s2Id}`}>
                                            {paper.title || paper.s2Id}
                                        </a>
                                    </TableCell>
                                    <TableCell>{paper.arxivId
                                        ? <a href={`https://arxiv.org/abs/${paper.arxivId}`}>
                                            {paper.arxivId}
                                          </a>
                                        : null
                                    }</TableCell>
                                    <TableCell>{paper.extractedSymbolCount}</TableCell>
                                    <TableCell>{paper.extractedCitationCount}</TableCell>
                                    <TableCell>
                                        {paper.arxivId
                                            ? <a href={`/?file=https://arxiv.org/pdf/${paper.arxivId}.pdf`}>
                                                Read
                                              </a>
                                            : null}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                {state === ViewState.ERROR && (
                    <Box p={2}>
                        <Grid container alignItems="center" spacing={1}>
                            <Grid item><ErrorIcon /></Grid>
                            <Grid item>Shucks, something went wrong.</Grid>
                        </Grid>
                    </Box>
                )}
            </div>
        </>
    );
}

ReactDOM.render(<PaperList />, document.getElementById('root'));
