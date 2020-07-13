import React from "react";
import { KnownEntityType, KNOWN_ENTITY_TYPES } from "./state";

interface Props {
  entityType: KnownEntityType | null;
  handleSelectType: (type: KnownEntityType | null) => void;
}

class EntityCreationTypeSelect extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(event: React.ChangeEvent<{ value: unknown }>) {
    const entityType =
      KNOWN_ENTITY_TYPES.indexOf(event.target.value as KnownEntityType) !== -1
        ? (event.target.value as KnownEntityType)
        : null;
    this.props.handleSelectType(entityType);
  }

  render() {
    return (
      <select value={this.props.entityType || ""} onChange={this.onChange}>
        {/* A 'select' is used instead of a Material UI component given the
            implementation simplicity, and that this is solely a
            developer-centric feature, rather than something that users must
            see. Material UI components with a popover menu, like 'Select',
            don't fit nicely into the pdf.js toolbar because the Material-UI
            container for popovers is at a lower z-index than the toolbar,
            such that popovers getting partially blocked by the toolbar. */}
        <option value="">Entity type</option>
        <option value=" ">------------</option>
        <option value="term">Term</option>
        <option value="symbol">Symbol</option>
        <option value="citation">Citation</option>
      </select>
    );
  }
}

export default EntityCreationTypeSelect;
