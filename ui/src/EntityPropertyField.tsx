import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import Add from "@material-ui/icons/Add";
import DeleteForever from "@material-ui/icons/DeleteForever";
import katex from "katex";
import React from "react";
import { Property } from "./EntityPropertyEditor";
import LatexPreview from "./LatexPreview";

interface Props {
  property: Property;
  value: any;
  error: string | undefined;
  handlePropertyChanged: (property: Property, value: any) => void;
  /**
   * While the EntityPropertyEditor is responsible for most validation, the LatexPreview performs
   * additional validation on the LaTeX to determine if it can render with the built-in
   * LaTeX rendering package. This callback can be used to detect LaTeX formatting issues.
   */
  handleLatexError?: (
    property: Property,
    message: string,
    error: katex.ParseError
  ) => void;
}

class EntityPropertyField extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onFieldChanged = this.onFieldChanged.bind(this);
    this.onClickAddItem = this.onClickAddItem.bind(this);
    this.onClickDeleteItem = this.onClickDeleteItem.bind(this);
    this.handleLatexError = this.handleLatexError.bind(this);
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

  handleLatexError(message: string, error: katex.ParseError) {
    if (this.props.handleLatexError !== undefined) {
      this.props.handleLatexError(this.props.property, message, error);
    }
  }

  render() {
    const { property, value, error } = this.props;
    const { label, is_list, key } = property;

    const is_latex = property.type === "latex";
    const multiline =
      property.type === "multiline-text" || property.type === "multiline-latex";

    return (
      <div className="entity-property-field-container">
        {!is_list ? (
          <>
            <TextField
              className="entity-property-field"
              InputProps={{ id: `property-${key}-field` }}
              label={label}
              error={error !== undefined}
              value={value}
              fullWidth={true}
              multiline={multiline}
              rows={multiline ? 2 : 1}
              rowsMax={multiline ? 3 : 1}
              onChange={this.onFieldChanged}
            />
            {is_latex ? (
              <LatexPreview
                latex={value}
                handleParseError={this.handleLatexError}
              />
            ) : null}
          </>
        ) : null}
        {is_list ? (
          <>
            {(value as Array<any>).map((v, i) => (
              <div className="entity-property-field-row" key={`field-row-${i}`}>
                <TextField
                  className="entity-property-field"
                  InputProps={{ id: `property-${key}-field-${i}` }}
                  /*
                   * Show label above only the first item.
                   */
                  label={i === 0 ? label : undefined}
                  error={error !== undefined}
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
                {is_latex ? (
                  <LatexPreview
                    latex={v}
                    handleParseError={this.handleLatexError}
                  />
                ) : null}
              </div>
            ))}
          </>
        ) : null}
        {this.props.error !== undefined ? (
          <p className="entity-property-input-error">{this.props.error}</p>
        ) : null}
      </div>
    );
  }
}

export default EntityPropertyField;
