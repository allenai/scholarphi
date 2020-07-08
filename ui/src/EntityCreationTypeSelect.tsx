import React from "react";
import { KnownEntityType } from "./state";

interface Props {
  entityType: KnownEntityType;
  handleSelectType: (type: KnownEntityType) => void;
}

class EntityCreationTypeSelect extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(event: React.ChangeEvent<{ value: unknown }>) {
    this.props.handleSelectType(event.target.value as KnownEntityType);
  }

  render() {
    return (
      <>
        <span className="toolbarLabel">Entity type:</span>
        {/* A 'select' is used instead of a Material UI component given the
            implementation simplicity, and that this is solely a
            developer-centric feature, rather than something that users must
            see. Material UI components with a popover menu, like 'Select',
            don't fit nicely into the pdf.js toolbar because the Material-UI
            container for popovers is at a lower z-index than the toolbar,
            such that popovers getting partially blocked by the toolbar. */}
        <select value={this.props.entityType} onChange={this.onChange}>
          <option value="citation">Citations</option>
          <option value="equation">Equations</option>
          <option value="symbol">Symbols</option>
        </select>
      </>
    );
  }
}

export default EntityCreationTypeSelect;
