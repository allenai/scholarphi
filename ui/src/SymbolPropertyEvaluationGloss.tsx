import Tab from "@material-ui/core/Tab";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Tabs from "@material-ui/core/Tabs";
import React from "react";
import LatexPreview from "./LatexPreview";
import { getRemoteLogger } from "./logging";
import RichText from "./RichText";
import { Symbol } from "./types/api";
import VoteButton from "./VoteButton";

const logger = getRemoteLogger();

interface SectionProps {
  header: string;
  data: string[];
  context: any;
}

interface SectionState {
  visibleRows: number;
}

class Section extends React.PureComponent<SectionProps, SectionState> {
  constructor(props: SectionProps) {
    super(props);
    this.state = {
      visibleRows: 2,
    };
    this.onClickShowMore = this.onClickShowMore.bind(this);
  }

  onClickShowMore() {
    logger.log("debug", "Clicked on show more", {
      ...this.props.context,
      currentVisibleRows: this.state.visibleRows,
    });
    this.setState((prevState) => ({
      visibleRows: prevState.visibleRows + 2,
    }));
  }

  render() {
    return (
      <>
        <TableRow className="property-evaluation-gloss__header">
          <TableCell>{this.props.header}</TableCell>
          <TableCell></TableCell>
        </TableRow>
        {this.props.data.length === 0 ? (
          <TableRow>
            <TableCell className="property-evaluation-gloss__not-defined">
              Not explicitly defined in this paper.
            </TableCell>
            <TableCell className="vote-button">
              <VoteButton
                context={{ ...this.props.context, tag: "not-defined-message" }}
              />
            </TableCell>
          </TableRow>
        ) : (
          <>
            {this.props.data.slice(0, this.state.visibleRows).map((d, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div
                    ref={(ref) => {
                      logger.log("debug", "render-property", {
                        ...this.props.context,
                        row: i,
                        data: d,
                      });
                    }}
                    className="property-evaluation-gloss__property"
                  >
                    <RichText>{d}</RichText>
                  </div>
                </TableCell>
                <TableCell className="vote-button">
                  <VoteButton
                    context={{ ...this.props.context, row: i, data: d }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {this.state.visibleRows < this.props.data.length ? (
              <TableRow>
                <TableCell>
                  <span
                    className="property-evaluation-gloss__clickable-link"
                    onClick={this.onClickShowMore}
                  >
                    Show more
                  </span>
                </TableCell>
                <TableCell />
              </TableRow>
            ) : null}
          </>
        )}
      </>
    );
  }
}

class TabPanel extends React.PureComponent<{
  hidden: boolean;
  symbol: Symbol;
  context: any;
}> {
  render() {
    const { symbol } = this.props;
    const {
      nicknames,
      definitions,
      defining_formulas,
      passages,
    } = symbol.attributes;

    return (
      <Table hidden={this.props.hidden} size="small">
        <TableBody>
          <Section
            header="Nicknames"
            data={nicknames}
            context={{ ...this.props.context, dataType: "nickname" }}
          />
          <Section
            header="Definitions"
            data={definitions}
            context={{ ...this.props.context, dataType: "definition" }}
          />
          <Section
            header="Defining formulas"
            data={defining_formulas}
            context={{ ...this.props.context, dataType: "defining-formulas" }}
          />
          <Section
            header="Example usages"
            data={passages}
            context={{ ...this.props.context, dataType: "usages" }}
          />
        </TableBody>
      </Table>
    );
  }
}

interface Props {
  id: string;
  symbol: Symbol;
  descendants: Symbol[];
}

interface State {
  tabIndex: number;
}

/**
 * A gloss showing a table of all properties extracted for a symbol.
 */
class SymbolPropertyEvaluationGloss extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { tabIndex: 0 };
    this.onChangeTab = this.onChangeTab.bind(this);
  }

  componentDidMount() {
    logger.log("debug", "open-symbol-property-evaluation-gloss", {
      symbolId: this.props.symbol.id,
      symbolTex: this.props.symbol.attributes.tex,
    });
  }

  componentWillUnmount() {
    logger.log("debug", "close-symbol-property-evaluation-gloss", {
      symbolId: this.props.symbol.id,
      symbolTex: this.props.symbol.attributes.tex,
    });
  }

  onChangeTab(_: React.ChangeEvent<{}>, tabIndex: number) {
    this.setState({ tabIndex });
    const symbols = [this.props.symbol, ...this.props.descendants];
    logger.log("debug", "open-tab-for-symbol", {
      tabIndex,
      symbolId: symbols[0].id,
      symbolTex: symbols[0].attributes.tex,
      selectedSymbolId: symbols[this.state.tabIndex],
      selectedSymbolTex: symbols[this.state.tabIndex].attributes.tex,
    });
  }

  render() {
    const symbols = [this.props.symbol, ...this.props.descendants];
    return (
      <div className="gloss property-evaluation-gloss symbol-property-evaluation-gloss">
        <div className="gloss__section">
          <Tabs
            value={this.state.tabIndex}
            onChange={this.onChangeTab}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
          >
            {symbols.map((s) => (
              <Tab
                className="symbol-property-evaluation-gloss__tab"
                key={s.id}
                label={<LatexPreview>{s.attributes.tex || "??"}</LatexPreview>}
              />
            ))}
          </Tabs>
          {symbols.map((s, i) => (
            <TabPanel
              key={s.id}
              hidden={i !== this.state.tabIndex}
              symbol={s}
              context={{
                isDescendant: i === 0,
                glossId: this.props.id,
              }}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default SymbolPropertyEvaluationGloss;
