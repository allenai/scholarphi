/**
 * This file lists all papers that the reader is aware of, as a temporary
 * mechanism to browse available papers and/or evaluate the reader.
 *
 * This is likely to be discared, or remain an administrative tool,
 * as long-term we hope to use Semantic Scholar as an engine for discovery.
 * Accordingly the code and visual appearance differs from that used within
 * the general reader interface slightly.
 */
import { listPapers } from "../api/api";
import { Paginated, PaperWithEntityCounts } from "../api/types";

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
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

enum ViewState {
  Loading, Success, Failure
}

class ListRequest {
  public constructor(
      readonly offset: number = 0,
      readonly size: number = 25
  ) {}

  public withOffset(offset: number): ListRequest {
      return new ListRequest(offset, this.size);
  }

  public withSize(size: number): ListRequest {
      return new ListRequest(0, size);
  }
}

/**
 * TODO: These methods allow us to update the URL as the size / offset is changed,
 * and read them from the URL when the page is first loaded. Longer term these should be
 * replaced with the APIs afforded by a routing solution, like `react-router`.
 */
function updateURL(query: ListRequest) {
  if (window.history && URL) {
    const u = new URL(document.location.toString());
    u.searchParams.set("offset", `${query.offset}`);
    u.searchParams.set("size", `${query.size}`);
    window.history.pushState(null, '', u.toString());
  }
}

function getOffsetFromURL(defaultOffset: number): number {
  if (!URL) {
    return defaultOffset;
  }
  const u = new URL(document.location.toString());
  const o = parseInt(u.searchParams.get("offset") || "");
  if (isNaN(o)) {
    return defaultOffset;
  }
  return o;
}

function getSizeFromURL(defaultSize: number): number {
  if (!URL) {
    return defaultSize;
  }
  const u = new URL(document.location.toString());
  const s = parseInt(u.searchParams.get("size") || "");
  if (isNaN(s)) {
    return defaultSize;
  }
  return s;
}

const PaperList = () => {
  const [ query, setListRequest ] = useState<ListRequest>(new ListRequest(
    getOffsetFromURL(0),
    getSizeFromURL(25)
  ));
  const [ results, setResults ] = useState<Paginated<PaperWithEntityCounts>>();
  const [ state, setState ] = useState<ViewState>(ViewState.Loading);

  useEffect(() => {
    setState(ViewState.Loading);
    listPapers(query.offset, query.size)
      .then((response) => {
        setResults(response.data);
        setState(ViewState.Success);
      })
      .catch((err) => {
        console.error(`Error attempting to search: ${err}`);
        setState(ViewState.Failure);
      });
  }, [ query ]);

  // If the user manually changes the size parameter we do a little work to make sure the UI
  // reflects that.
  const rowsPerPageOptions = [ 25, 50, 75, 100 ];
  if (rowsPerPageOptions.indexOf(query.size) === -1) {
    rowsPerPageOptions.push(query.size);
    rowsPerPageOptions.sort();
  }

  return (
    <>
      <CssBaseline />
      <AppBar position="sticky">
        <Toolbar>
          <h1>Supported Papers</h1>
        </Toolbar>
      </AppBar>
      <div>
        {state === ViewState.Loading && (
          <Box p={4} textAlign="center">
            <CircularProgress />
          </Box>
        )}
        {state === ViewState.Success && results && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Paper</TableCell>
                <TableCell>Reader Link</TableCell>
                <TableCell>ArXiv ID</TableCell>
                <TableCell>Symbols</TableCell>
                <TableCell>Citations</TableCell>
                <TableCell>Equations</TableCell>
                <TableCell>Terms</TableCell>
                <TableCell>Sentences</TableCell>
                <TableCell>Total Entities</TableCell>
                <TableCell>Entity Version</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.rows.map((paper, idx) => {
                const lastAuthorIdx = (paper.authors || []).length;
                return (
                  <TableRow key={`${idx}/${paper.s2_id || paper.arxiv_id || paper.title}`}>
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
                      {(paper.authors || []).map((author, idx) => (
                        <React.Fragment key={author.url}>
                          <a href={author.url}>{author.name}</a>
                          {idx !== lastAuthorIdx ? ", " : null}
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
                    <TableCell>{paper.term_count}</TableCell>
                    <TableCell>{paper.sentence_count}</TableCell>
                    <TableCell>{paper.entity_count}</TableCell>
                    <TableCell>{paper.version}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TablePagination
                  count={results.total}
                  page={query.offset/query.size}
                  rowsPerPage={query.size}
                  rowsPerPageOptions={rowsPerPageOptions}
                  onChangePage={(_, p) => {
                    const o = p * query.size;
                    const q = query.withOffset(o)
                    updateURL(q);
                    setListRequest(q);
                  }}
                  onChangeRowsPerPage={(e) => {
                    const s = parseInt(e.target.value);
                    const q = query.withSize(s);
                    updateURL(q);
                    setListRequest(q);
                  }} />
              </TableRow>
            </TableBody>
          </Table>
        )}
        {state === ViewState.Failure && (
          <Box p={2}>
            <Grid container alignItems="center" spacing={1}>
              <Grid item>
                <ErrorIcon />
              </Grid>
              <Grid item>Sorry, something went wrong.</Grid>
            </Grid>
          </Box>
        )}
      </div>
    </>
  );
};

ReactDOM.render(<PaperList />, document.getElementById("root"));
