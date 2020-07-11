import TextField from "@material-ui/core/TextField";
import React from "react";
import { Property } from "./EntityPropertyEditor";
import ;

interface Props {
  property: Property;
  value: any;
  error: string | undefined;
  handlePropertyChanged: (
    property: Property,
    value: any,
    index?: number
  ) => void;
}

class EntityPropertyField extends React.PureComponent<Props> {
  render() {
    return (
      <>
        {!this.props.property.is_list ? (
          <TextField
            fullWidth={true}
            label={this.props.property.label}
            error={this.props.error !== undefined}
          />
        ) : null}
        {this.props.property.is_list ? (
          <>
            {(this.props.value as Array).map(v => ({

            })}
          </>
        ): null}
        {this.props.error !== undefined ? (
          <p className="entity-property-error">{this.props.error}</p>
        ) : null}
      </>
    );
  }
}

export default EntityPropertyField;
