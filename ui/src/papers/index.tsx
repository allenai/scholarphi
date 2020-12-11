/**
 * This file lists all papers that the reader is aware of, as a temporary
 * mechanism to browse available papers and/or evaluate the reader.
 *
 * This is likely to be discared, or remain an administrative tool,
 * as long-term we hope to use Semantic Scholar as an engine for discovery.
 * Accordingly the code and visual appearance differs from that used within
 * the general reader interface slightly.
 */

import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Table from "@material-ui/core/Table";
import TablePagination from "@material-ui/core/TablePagination";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import ErrorIcon from "@material-ui/icons/Error";
import axios from "axios";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { listPapers } from "../api";
import { PaperIdWithEntityCounts } from "../types/api";

enum ViewState {
  LOADING,
  READY,
  ERROR,
}

interface PaperListState {
  state: ViewState;
  papers: PaperWithMeta[];
  offset: number;
  size: number;
  total: number;
}

export interface S2ApiPaper {
  abstract: string;
  arxiv_id?: string;
  authors: S2ApiAuthor[];
  doi: string;
  title: string;
  url: string;
  venue?: string;
  year: string;
}

interface S2ApiAuthor {
  authorId: string;
  name: string;
  url: string;
}

// We only retain the fields from S2ApiPaper that we need, as otherwise
// we can very easily overflow localStorage.
interface PaperWithMeta extends PaperIdWithEntityCounts {
  title: string;
  authors: S2ApiAuthor[];
  venue?: string;
  year: string;
}

interface CachedPaperWithMeta {
  expires: number;
  paper: PaperWithMeta;
}

function cacheKey(paperId: string) {
    // We append a version prefix so that we can bust the cache in clients when we release
    // updates.
    return `v0/${paperId}`; 
}

/**
 * This wrapper returns paper metadata from a local cache for up to 24 hours.
 *
 * This is to prevent clients from overloading Semantic Scholar's API. It's a
 * very basic mechanism and should likely be replaced with something in the
 * reader API in the future.
 */
async function getPaperInfoFromS2(
  paper: PaperIdWithEntityCounts
): Promise<PaperWithMeta> {
  const disableCache = new URLSearchParams(window.location.search).has('nocache');
  if (localStorage && !disableCache) {
    const maybeItem = localStorage.getItem(cacheKey(paper.s2_id));
    if (maybeItem) {
      const parsedItem: CachedPaperWithMeta = JSON.parse(maybeItem);
      if (parsedItem.expires > Date.now()) {
        console.debug(`Using cached paper:${paper.s2_id}`);
        return Promise.resolve(parsedItem.paper);
      } else {
        console.debug(`Paper ${paper.s2_id} is cached but has expired.`);
      }
    }
  }
  const s2ApiUrl = `https://api.semanticscholar.org/v1/paper/${paper.s2_id}`;
  const { data: s2Paper } = await axios.get<S2ApiPaper>(s2ApiUrl);
  const paperWithMeta = Object.assign(paper, {
    title: s2Paper.title,
    authors: s2Paper.authors,
    venue: s2Paper.venue,
    year: s2Paper.year,
  });
  if (localStorage) {
    localStorage.setItem(
      cacheKey(paper.s2_id),
      JSON.stringify({
        // cache for 24 hours, JavaScript timestamps are expressed in ms
        expires: Date.now() + 24 * 60 * 60 * 1000,
        paper: paperWithMeta,
      })
    );
  }
  return paperWithMeta;
}

/**
 * TODO: These methods allow us to update the URL as the size / offset is changed,
 * and read them from the URL when the page is first loaded. Longer term these should be
 * replaced with the APIs afforded by a routing solution, like `react-router`.
 */
function updateBrowserURL(offset: number, size: number) {
  if (window.history && URL) {
    const u = new URL(document.location.toString());
    u.searchParams.set("offset", `${offset}`);
    u.searchParams.set("size", `${size}`);
    window.history.pushState(null, '', u.toString());
  }
}

function getOffsetFromURL(defaultOffset: number): number {
  if (URL) {
    const u = new URL(document.location.toString());
    const o = parseInt(u.searchParams.get("offset") || "");
    if (isNaN(o)) {
      return defaultOffset;
    }
    return o;
  }
  return defaultOffset;
}

function getSizeFromURL(defaultSize: number): number {
  if (URL) {
    const u = new URL(document.location.toString());
    const s = parseInt(u.searchParams.get("size") || "");
    if (isNaN(s)) {
      return defaultSize;
    }
    return s;
  }
  return defaultSize;
}

const PaperList = () => {
  const [{ state, papers, offset, size, total }, setViewState] = useState<PaperListState>({
    papers: [],
    state: ViewState.LOADING,
    offset: getOffsetFromURL(0),
    size: getSizeFromURL(10),
    total: 0
  });
  const rowsPerPageOptions = [ 10, 20, 30 ];
  if (rowsPerPageOptions.indexOf(size) === -1) {
    rowsPerPageOptions.push(size);
    rowsPerPageOptions.sort();
  }
  useEffect(() => {
    (async () => {
      setViewState({ papers: [], state: ViewState.LOADING, offset, size, total });
      const allPapers = await listPapers(offset, size);
      if (allPapers === null) {
        setViewState({ papers: [], state: ViewState.ERROR, offset: 0, size: 0, total: 0 });
        return;
      }
      const allPapersWithTitle = await Promise.all(
        allPapers.rows.map(getPaperInfoFromS2)
      );
      setViewState({
        papers: allPapersWithTitle,
        state: ViewState.READY,
        offset: allPapers.offset,
        size: allPapers.size,
        total: allPapers.total
      });
    })();
  }, [ offset, size ]); // The empty array makes the inner callback only execute once
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
                <TableCell>Paper</TableCell>
                <TableCell>Reader Link</TableCell>
                <TableCell>ArXiv ID</TableCell>
                <TableCell>Symbols</TableCell>
                <TableCell>Citations</TableCell>
                <TableCell>Equations</TableCell>
                <TableCell>Definitions</TableCell>
                <TableCell>Terms</TableCell>
                <TableCell>Sentences</TableCell>
                <TableCell>Total Entities</TableCell>
                <TableCell>Entity Version</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {papers.map((paper) => (
                <TableRow key={paper.s2_id}>
                  <TableCell>
                    <Typography variant="subtitle1">
                      <strong>
                        <a
                          href={`https://semanticscholar.org/paper/${paper.s2_id}`}
                        >
                          {paper.title || paper.s2_id}
                        </a>
                      </strong>
                    </Typography>
                    {paper.authors.map((author, idx) => (
                      <React.Fragment key={author.url}>
                        <a href={author.url}>{author.name}</a>
                        {idx !== paper.authors.length - 1 ? ", " : null}
                      </React.Fragment>
                    ))}
                    {paper.venue && ` • ${paper.venue}`}
                    {" •"} {paper.year}
                  </TableCell>
                  <TableCell>
                    {paper.arxiv_id ? (
                      <Button
                        variant="outlined"
                        href={`/?file=https://arxiv.org/pdf/${paper.arxiv_id}.pdf`}
                      >
                        Read
                      </Button>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {paper.arxiv_id ? (
                      <a href={`https://arxiv.org/abs/${paper.arxiv_id}`}>
                        {paper.arxiv_id}
                      </a>
                    ) : null}
                  </TableCell>
                  <TableCell>{paper.symbol_count}</TableCell>
                  <TableCell>{paper.citation_count}</TableCell>
                  <TableCell>{paper.equation_count}</TableCell>
                  <TableCell>{paper.definition_count}</TableCell>
                  <TableCell>{paper.term_count}</TableCell>
                  <TableCell>{paper.sentence_count}</TableCell>
                  <TableCell>{paper.entity_count}</TableCell>
                  <TableCell>{paper.version}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TablePagination
                  count={total}
                  page={offset/size}
                  rowsPerPage={size}
                  rowsPerPageOptions={rowsPerPageOptions}
                  onChangePage={(_, p) => {
                    const newOffset = p * size;
                    updateBrowserURL(newOffset, size);
                    setViewState({
                     total,
                     papers,
                     size,
                     state: ViewState.LOADING,
                     offset: newOffset
                    })
                  }}
                  onChangeRowsPerPage={(e) => {
                    const newSize = parseInt(e.target.value);
                    updateBrowserURL(0, newSize);
                    setViewState({
                     total,
                     papers,
                     offset: 0,
                     state: ViewState.LOADING,
                     size: newSize
                    })
                  }} />
              </TableRow>
            </TableBody>
          </Table>
        )}
        {state === ViewState.ERROR && (
          <Box p={2}>
            <Grid container alignItems="center" spacing={1}>
              <Grid item>
                <ErrorIcon />
              </Grid>
              <Grid item>Shucks, something went wrong.</Grid>
            </Grid>
          </Box>
        )}
      </div>
    </>
  );
};

ReactDOM.render(<PaperList />, document.getElementById("root"));
