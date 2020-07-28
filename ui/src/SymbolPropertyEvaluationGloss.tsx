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

interface RowProps {
  id: string;
  content: string;
  symbol: Symbol;
  isDescendant: boolean;
  glossId: string;
}

class Row extends React.PureComponent<RowProps> {
  render() {
    const { symbol } = this.props;
    const context = {
      glossId: this.props.glossId,
      symbolId: symbol.id,
      symbolTex: symbol.attributes.tex,
      symbolMathMl: symbol.attributes.mathml,
      isDescendant: this.props.isDescendant,
    };

    return (
      <TableRow>
        <TableCell className="symbol">
          <LatexPreview>{symbol.attributes.tex || "?"}</LatexPreview>
        </TableCell>
        <TableCell>
          <div className="property-evaluation-gloss__property">
            <RichText>{this.props.content}</RichText>
          </div>
        </TableCell>
        <TableCell className="vote-button">
          <VoteButton context={context} />
        </TableCell>
      </TableRow>
    );
  }
}

interface TabProps {
  symbol: Symbol;
  isDescendant: boolean;
  glossId: string;
  hidden: boolean;
}

class SymbolTabPanel extends React.PureComponent<TabProps> {
  render() {
    const { symbol } = this.props;
    const {
      nicknames,
      definitions,
      defining_formulas,
      passages,
    } = symbol.attributes;

    if (
      nicknames.length === 0 &&
      definitions.length === 0 &&
      defining_formulas.length === 0 &&
      passages.length === 0
    ) {
      return (
        <p
          className="property-evaluation-gloss__message"
          hidden={this.props.hidden}
        >
          (Nothing to show)
        </p>
      );
    }

    return (
      <Table hidden={this.props.hidden} size="small">
        <TableBody>
          {nicknames.map((nickname, i) => (
            <Row
              key={`symbol-${symbol.id}-nickname-${i}`}
              id={`symbol-${symbol.id}-nickname-${i}`}
              content={nickname}
              glossId={this.props.glossId}
              isDescendant={this.props.isDescendant}
              symbol={symbol}
            />
          ))}
          {definitions.map((definition, i) => (
            <Row
              key={`symbol-${symbol.id}-definition-${i}`}
              id={`symbol-${symbol.id}-definition-${i}`}
              content={definition}
              glossId={this.props.glossId}
              isDescendant={this.props.isDescendant}
              symbol={symbol}
            />
          ))}
          {defining_formulas.map((formula, i) => (
            <Row
              key={`symbol-${symbol.id}-formula-${i}`}
              id={`symbol-${symbol.id}-formula-${i}`}
              content={formula}
              glossId={this.props.glossId}
              isDescendant={this.props.isDescendant}
              symbol={symbol}
            />
          ))}
          {passages.map((passage, i) => (
            <Row
              key={`symbol-${symbol.id}-passage-${i}`}
              id={`symbol-${symbol.id}-passage-${i}`}
              content={passage}
              glossId={this.props.glossId}
              isDescendant={this.props.isDescendant}
              symbol={symbol}
            />
          ))}
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

function countProperties(symbol: Symbol) {
  return (
    symbol.attributes.nicknames.length +
    symbol.attributes.definitions.length +
    symbol.attributes.defining_formulas.length +
    symbol.attributes.passages.length
  );
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
      propertyCount: countProperties(this.props.symbol),
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
      propertyCount: countProperties(symbols[this.state.tabIndex]),
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
          {symbols.map((s, symbolIndex) => (
            <SymbolTabPanel
              key={s.id}
              symbol={s}
              isDescendant={symbolIndex === 0}
              glossId={this.props.id}
              hidden={symbolIndex !== this.state.tabIndex}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default SymbolPropertyEvaluationGloss;
