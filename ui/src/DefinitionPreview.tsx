import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { PDFDocumentProxy } from "pdfjs-dist";
import React from "react";
import SymbolPreview from "./SymbolPreview";
import { Sentence, Symbol } from "./types/api";

interface Props {
  pdfDocument: PDFDocumentProxy;
  symbol: Symbol;
  sentence: Sentence | null;
}

interface State {
  previewLoaded: boolean;
}

class DefinitionPreview extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      previewLoaded: false,
    };
    this.onPaperClippingLoaded = this.onPaperClippingLoaded.bind(this);
  }

  onPaperClippingLoaded() {
    this.setState({
      previewLoaded: true,
    });
  }

  render() {
    /**
     * Initially hide the definition preview, fading it in once the paper preview has loaded.
     * In a typical implementation for fading in this component, the component's opacity would be
     * set to '0' in componentDidMount, and a timeout would be set to start the animation. This
     * timeout is usually critical (see https://stackoverflow.com/a/24195559/2096369). It
     * shouldn't be necessary in our case, as a brief timeout is naturally introduced by the
     * paper preview rendering in the 'SymbolPreview' component.
     */
    let style: React.CSSProperties = {
      opacity: this.state.previewLoaded ? 1 : 0,
      transition: "opacity 0.5s ease",
    };

    console.log("Preview loaded", this.state.previewLoaded);

    return (
      <Card
        ref={(ref: HTMLElement) => (this.element = ref)}
        style={style}
        className="definition-preview"
      >
        <CardContent>
          <SymbolPreview
            pdfDocument={this.props.pdfDocument}
            symbol={this.props.symbol}
            sentence={this.props.sentence}
            onLoaded={this.onPaperClippingLoaded}
          />
        </CardContent>
      </Card>
    );
  }

  element: HTMLElement | null = null;
}

export default DefinitionPreview;
