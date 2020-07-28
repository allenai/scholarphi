import Card from "@material-ui/core/Card";
import IconButton from "@material-ui/core/IconButton";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Add from "@material-ui/icons/Add";
import DeleteForever from "@material-ui/icons/DeleteForever";
import katex from "katex";
import React from "react";
import { Property } from "./EntityPropertyEditor";
import RichText from "./RichText";

interface RichTextPreviewProps {
  children: string;
  handleLatexError: (message: string, error: katex.ParseError) => void;
}

class RichTextPreview extends React.PureComponent<RichTextPreviewProps> {
  render() {
    return (
      <Card className="rich-text-preview">
        <div className="rich-text-preview__container">
          <RichText handleLatexParseError={this.props.handleLatexError}>
            {this.props.children}
          </RichText>
        </div>
        <div className="rich-text-preview__preview-label">Preview</div>
      </Card>
    );
  }
}

interface Props {
  property: Property;
  value: any;
  disabled?: boolean;

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
    this.onClickAddFirstItem = this.onClickAddFirstItem.bind(this);
    this.onClickAddItem = this.onClickAddItem.bind(this);
    this.onClickDeleteItem = this.onClickDeleteItem.bind(this);
    this.handleLatexError = this.handleLatexError.bind(this);
  }

  onFieldChanged(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const currentValue = this.props.value;
    const property = this.props.property;
    const newValue = event.target.value;

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

  onClickAddFirstItem() {
    const { property } = this.props;
    const newValues = [null];
    this.props.handlePropertyChanged(property, newValues);
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
    const { property, value, disabled, error } = this.props;
    const { label, is_list, key, choices } = property;

    const is_latex =
      property.type === "latex" || property.type === "multiline-latex";
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
              select={choices !== undefined}
              disabled={disabled === true}
              error={error !== undefined}
              value={value || ""}
              placeholder="NULL"
              fullWidth={true}
              multiline={multiline}
              rows={multiline ? 1 : 1}
              rowsMax={multiline ? 4 : 1}
              onChange={this.onFieldChanged}
            >
              {choices !== undefined ? (
                <MenuItem value="">None</MenuItem>
              ) : null}
              {choices !== undefined
                ? choices.map((choice: any) => {
                    const choiceString = String(choice);
                    return (
                      <MenuItem key={choiceString} value={choiceString}>
                        {choiceString}
                      </MenuItem>
                    );
                  })
                : null}
            </TextField>
            {is_latex ? (
              <RichTextPreview handleLatexError={this.handleLatexError}>
                {value as string}
              </RichTextPreview>
            ) : null}
          </>
        ) : null}
        {is_list && Array.isArray(value) ? (
          <>
            {/*
             * Show a single label before all entries.
             * See default implementation of how label is rendered in a TextField at
             * https://github.com/mui-org/material-ui/blob/1691d498b3c7fc8c7f4337948e7ad7c2947f66a2/packages/material-ui/src/TextField/TextField.js#L169-L171
             */}
            <InputLabel shrink={true}>{label}</InputLabel>
            {value.length === 0 ? (
              <>
                {/*
                 * Give this input the same class as standard Material-UI components so that it is
                 * spaced the same way from the label.
                 */}
                <p className="MuiInput-formControl">
                  No entries yet.{" "}
                  <span
                    className="action-span"
                    onClick={this.onClickAddFirstItem}
                  >
                    Add the first one
                  </span>
                  .
                </p>
              </>
            ) : (
              <>
                {(value as Array<any>).map((v, i) => (
                  <div
                    className="entity-property-field-row"
                    key={`field-row-${i}`}
                  >
                    <TextField
                      className="entity-property-field"
                      InputProps={{ id: `property-${key}-field-${i}` }}
                      disabled={disabled === true}
                      select={choices !== undefined}
                      error={error !== undefined}
                      value={v || ""}
                      placeholder={"NULL"}
                      multiline={multiline}
                      rows={multiline ? 1 : 1}
                      rowsMax={multiline ? 4 : 1}
                      onChange={this.onFieldChanged}
                    >
                      {choices !== undefined ? (
                        <MenuItem value="">None</MenuItem>
                      ) : null}
                      {choices !== undefined
                        ? choices.map((choice: any) => {
                            const choiceString = String(choice);
                            return (
                              <MenuItem key={choiceString} value={choiceString}>
                                {choiceString}
                              </MenuItem>
                            );
                          })
                        : null}
                    </TextField>
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
                      <RichTextPreview handleLatexError={this.handleLatexError}>
                        {v}
                      </RichTextPreview>
                    ) : null}
                  </div>
                ))}
              </>
            )}
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
