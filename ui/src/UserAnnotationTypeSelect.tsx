import React from "react";
import { UserAnnotationType } from "./types/api";

interface UserAnnotationTypeSelectProps {
  annotationType: UserAnnotationType;
  handleSelectType: (type: UserAnnotationType) => void;
}

export class UserAnnotationTypeSelect extends React.PureComponent<
  UserAnnotationTypeSelectProps
> {
  onChange(event: React.ChangeEvent<{ value: unknown }>) {
    this.props.handleSelectType(event.target.value as UserAnnotationType);
  }

  render() {
    return (
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
          value={this.props.annotationType}
          onChange={this.onChange.bind(this)}
        >
          <option value="citation">Citations</option>
          <option value="equation">Equations</option>
          <option value="symbol">Symbols</option>
        </select>
      </>
    );
  }
}
