import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import DeleteIcon from "@material-ui/icons/Delete";
import React from "react";
import { KnownEntityType } from "./state";
import { Entity, EntityUpdateData } from "./types/api";

interface Props {
  entity: Entity;
  handleUpdateEntity: (data: EntityUpdateData) => void;
  handleDeleteEntity: (id: string) => void;
}

export class UserAnnotationTooltipBody extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.delete = this.delete.bind(this);
    this.updateType = this.updateType.bind(this);
  }

  updateType(e: React.ChangeEvent<HTMLInputElement>) {
    this.props.handleUpdateEntity({
      id: this.props.entity.id,
      type: e.target.value as KnownEntityType,
      attributes: {
        source: "human-annotation",
      },
    });
  }

  delete() {
    this.props.handleDeleteEntity(this.props.entity.id);
  }

  render() {
    return (
      <div className="tooltip-body user-annotation-tooltip-body">
        <div className="tooltip-body__section">
          <Button
            className="user-annotation-tooltip-body__delete-annotation-button"
            variant="contained"
            onClick={this.delete}
          >
            Delete <DeleteIcon />
          </Button>
        </div>
        <div className="tooltip-body__section">
          <FormControl className="user-annotation-tooltip-body__form-control">
            <FormLabel component="legend">Entity type</FormLabel>
            <RadioGroup
              arial-label="entity-type"
              name="entity-type"
              value={this.props.entity.type}
              onChange={this.updateType}
            >
              <FormControlLabel
                value="citation"
                control={<Radio />}
                label="Citation"
              />
              <FormControlLabel
                value="equation"
                control={<Radio />}
                label="Equation"
              />
              <FormControlLabel
                value="symbol"
                control={<Radio />}
                label="Symbol"
              />
            </RadioGroup>
          </FormControl>
        </div>
      </div>
    );
  }
}

export default UserAnnotationTooltipBody;
