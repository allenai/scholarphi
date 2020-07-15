import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import React from "react";
import { KnownEntityType, KNOWN_ENTITY_TYPES } from "./state";

interface Props {
  entityType: KnownEntityType | null;
  handleSelectEntityType: (entityCreationType: KnownEntityType | null) => void;
}

class EntityCreationToolbar extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(event: React.ChangeEvent<{ value: unknown }>) {
    const entityType =
      KNOWN_ENTITY_TYPES.indexOf(event.target.value as KnownEntityType) !== -1
        ? (event.target.value as KnownEntityType)
        : null;
    this.props.handleSelectEntityType(entityType);
  }

  render() {
    return (
      <FormControl>
        <InputLabel className="entity-creation-toolbar__type-select-label">
          Entity type
        </InputLabel>
        <Select
          labelId="entity-creation-toolbar__type-select-label"
          value={this.props.entityType || undefined}
          onChange={this.onChange}
        >
          <MenuItem value={undefined}>None</MenuItem>
          <MenuItem value="term">Term</MenuItem>
          <MenuItem value="symbol">Symbol</MenuItem>
          <MenuItem value="citation">Citation</MenuItem>
        </Select>
      </FormControl>
    );
  }
}

export default EntityCreationToolbar;
