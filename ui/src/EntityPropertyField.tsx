import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import Add from "@material-ui/icons/Add";
import DeleteForever from "@material-ui/icons/DeleteForever";
import React from "react";
import { Property } from "./EntityPropertyEditor";

interface Props {
  property: Property;
  value: any;
  error: string | undefined;
  handlePropertyChanged: (property: Property, value: any) => void;
}

class EntityPropertyField extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onFieldChanged = this.onFieldChanged.bind(this);
    this.onClickAddItem = this.onClickAddItem.bind(this);
    this.onClickDeleteItem = this.onClickDeleteItem.bind(this);
  }

  onFieldChanged(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const currentValue = this.props.value;
    const property = this.props.property;
    const newValue = event.currentTarget.value;

    /*
     * If the property is a list, change the one item and keep the rest the same.
     * Otherwise, the full value has changed.
     */
    if (property.is_list) {
      const changeIndex = parseInt(
        event.currentTarget.id.replace(`property-${property.key}-field-`, "")
      );
      const newValues = [...currentValue];
      newValues[changeIndex] = newValue;
      this.props.handlePropertyChanged(property, newValues);
    } else {
      this.props.handlePropertyChanged(property, newValue);
    }
  }

  onClickAddItem(event: React.MouseEvent<HTMLButtonElement>) {
    const { property, value } = this.props;
    const addIndex = parseInt(
      event.currentTarget.id
        .replace(`property-${property.key}-field-`, "")
        .replace("-add-button", "")
    );
    const currentValues = value as Array<string>;
    const newValues = [...currentValues];
    newValues.splice(addIndex + 1, 0, "");
    this.props.handlePropertyChanged(property, newValues);
  }

  onClickDeleteItem(event: React.MouseEvent<HTMLButtonElement>) {
    const { property, value } = this.props;
    const deleteIndex = parseInt(
      event.currentTarget.id
        .replace(`property-${property.key}-field-`, "")
        .replace("-delete-button", "")
    );
    const currentValues = value as Array<string>;
    const newValues = [...currentValues];
    newValues.splice(deleteIndex, 1);
    this.props.handlePropertyChanged(property, newValues);
  }

  render() {
    const { property, value, error } = this.props;
    const { label, is_list, key } = property;

    const multiline =
      property.type === "multiline-text" || property.type === "latex";

    return (
      <div className="entity-property-field-container">
        {!is_list ? (
          <TextField
            className="entity-property-field"
            InputProps={{ id: `property-${key}-field` }}
            label={label}
            error={error !== undefined}
            helperText={error}
            value={value}
            fullWidth={true}
            multiline={multiline}
            rows={multiline ? 2 : 1}
            rowsMax={multiline ? 3 : 1}
            onChange={this.onFieldChanged}
          />
        ) : null}
        {is_list ? (
          <>
            {(value as Array<any>).map((v, i) => (
              <div className="entity-property-field-row" key={`field-row-${i}`}>
                <TextField
                  className="entity-property-field"
                  InputProps={{ id: `property-${key}-field-${i}` }}
                  /*
                   * Show label above the first item, error message below the last iterm.
                   */
                  label={i === 0 ? label : undefined}
                  error={error !== undefined}
                  helperText={i === value.length - 1 ? error : undefined}
                  value={v}
                  multiline={multiline}
                  rows={multiline ? 2 : 1}
                  rowsMax={multiline ? 3 : 1}
                  onChange={this.onFieldChanged}
                />
                <IconButton
                  id={`property-${key}-field-${i}-add-button`}
                  className="action-button"
                  size="small"
                  onClick={this.onClickAddItem}
                >
                  <Add />
                </IconButton>
                <IconButton
                  id={`property-${key}-field-${i}-add-button`}
                  className="action-button"
                  size="small"
                  onClick={this.onClickDeleteItem}
                >
                  <DeleteForever />
                </IconButton>
              </div>
            ))}
          </>
        ) : null}
        {this.props.error !== undefined ? (
          <p className="entity-property-error">{this.props.error}</p>
        ) : null}
      </div>
    );
  }
}

export default EntityPropertyField;
