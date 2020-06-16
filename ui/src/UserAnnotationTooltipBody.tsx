import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import DeleteIcon from "@material-ui/icons/Delete";
import React from "react";
import { Annotation, UserAnnotationType } from "./types/api";

interface UserAnnotationTooltipBodyProps {
  annotation: Annotation;
  handleUpdateAnnotation: (id: string, annotation: Annotation) => void;
  handleDeleteAnnotation: (id: string) => void;
}

export class UserAnnotationTooltipBody extends React.PureComponent<
  UserAnnotationTooltipBodyProps
> {
  updateType(e: React.ChangeEvent<HTMLInputElement>) {
    this.props.handleUpdateAnnotation(this.props.annotation.id, {
      ...this.props.annotation,
      type: e.target.value as UserAnnotationType,
    });
  }

  delete() {
    this.props.handleDeleteAnnotation(this.props.annotation.id);
  }

  render() {
    return (
      <div className="tooltip-body user-annotation-tooltip-body">
        <div className="tooltip-body__section">
          <Button
            className="user-annotation-tooltip-body__delete-annotation-button"
            variant="contained"
            onClick={this.delete.bind(this)}
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
              value={this.props.annotation.type}
              onChange={this.updateType.bind(this)}
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
