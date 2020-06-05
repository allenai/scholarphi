import React from "react";
import { ScholarReaderContext } from "./state";

export class SymbolFindQueryWidget extends React.PureComponent {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  render() {
    return (
      <ScholarReaderContext.Consumer>
        {({}) => {
          return <div>Symbol filters</div>;
        }}
      </ScholarReaderContext.Consumer>
    );
  }

  // TODO(andrewhead): delete the following
  // componentWillUnmount() {
  //   this.deselectSymbol();
  // }

  // selectSymbol(id: string, boxId: string) {
  //   this.context.setSelectedEntity(id, "symbol");
  //   this.context.setSelectedAnnotationId(convertToAnnotationId(id));
  //   this.context.setSelectedAnnotationSpanId(boxId);
  // }

  // deselectSymbol() {
  //   this.context.setSelectedEntity(null, null);
  //   this.context.setSelectedAnnotationId(null);
  //   this.context.setSelectedAnnotationSpanId(null);
  // }
}

export default SymbolFindQueryWidget;
