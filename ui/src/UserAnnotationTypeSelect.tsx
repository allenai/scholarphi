import React from "react";
import { ScholarReaderContext } from "./state";
import { UserAnnotationType } from "./types/api";

export class UserAnnotationTypeSelect extends React.PureComponent {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  onChange(event: React.ChangeEvent<{ value: unknown }>) {
    const { setUserAnnotationType } = this.context;
    setUserAnnotationType(event.target.value as UserAnnotationType);
  }

  render() {
    return (
      <ScholarReaderContext.Consumer>
        {({ userAnnotationType }) => (
          <>
            <span className="toolbarLabel">Annotation Layer:</span>
            {/* A 'select' is used instead of a Material UI component given the
            implementation simplicity, and that this is solely a
            developer-centric feature, rather than something that users must
            see. Material UI components with a popover menu, like 'Select',
            don't fit nicely into the pdf.js toolbar because the Material-UI
            container for popovers is at a lower z-index than the toolbar,
            such that popovers getting partially blocked by the toolbar. */}
            <select
              value={userAnnotationType}
              onChange={this.onChange.bind(this)}
            >
              <option value="citation">Citations</option>
              <option value="equation">Equations</option>
              <option value="symbol">Symbols</option>
            </select>
          </>
        )}
      </ScholarReaderContext.Consumer>
    );
  }
}
