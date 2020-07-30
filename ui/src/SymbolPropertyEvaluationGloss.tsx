import Tab from "@material-ui/core/Tab";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import Tabs from "@material-ui/core/Tabs";
import React from "react";
import LatexPreview from "./LatexPreview";
import { getRemoteLogger } from "./logging";
import TableSection from "./PropertyTableSection";
import { Symbol } from "./types/api";

const logger = getRemoteLogger();

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
          <TableSection
            header="Nicknames"
            data={nicknames}
            context={{ ...this.props.context, dataType: "nickname" }}
          />
          <TableSection
            header="Definitions"
            data={definitions}
            context={{ ...this.props.context, dataType: "definition" }}
          />
          <TableSection
            header="Defining formulas"
            data={defining_formulas}
            context={{ ...this.props.context, dataType: "defining-formulas" }}
          />
          <TableSection
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
