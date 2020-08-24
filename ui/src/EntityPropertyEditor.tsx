import Button from "@material-ui/core/Button";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import katex from "katex";
import React from "react";
import EntityPropertyField from "./EntityPropertyField";
import {
  Entity,
  EntityUpdateData,
  GenericAttributes,
  GenericRelationships,
} from "./types/api";

interface Props {
  entity: Entity | null;
  propagateEntityEdits: boolean;
  handleSetPropagateEntityEdits: (propagate: boolean) => void;
  /**
   * Callback returns a Promise that resolves to 'true' when saving was successful, and 'false'
   * when saving failed.
   */
  handleSaveChanges: (
    entity: Entity,
    updates: EntityUpdateData
  ) => Promise<boolean>;
  handleDeleteEntity: (id: string) => Promise<boolean>;
}

interface State {
  state: "edits-enabled" | "saving" | "deleting";
  syncError: null | "save" | "delete";
  updates: UpdatedProperties;
  errors: { [propertyKey: string]: string | undefined };
}

interface UpdatedProperties {
  attributes: GenericAttributes;
  relationships: GenericRelationships;
}

/**
 * Together, 'key' and 'parentKey' tell the property editor where to find and update data on an
 * entity object. The path to a property on an entity is entity[parentKey][key].
 *
 * Together, the 'field_type', 'is_list', and 'relation_type', provide important information
 * needed to cast data from the input fields into updated values for the entity. 'relation_type'
 * only needs to be defined if the type is 'relation_id'.
 *
 * The field 'label' is used for formatting the field in the property editor. 'is_list' and
 * 'type' are also used to format input fields and set constraints on them.
 */
export interface Property {
  key: string;
  parentKey: "attributes" | "relationships";
  type:
    | "integer"
    | "float"
    | "text"
    | "multiline-text"
    | "latex"
    | "multiline-latex"
    | "relation-id";
  is_list: boolean;
  relation_type: string | null;
  label: string;
  choices?: any[];
}

const EDITABLE_PROPERTIES: { [type: string]: Property[] } = {
  term: [
    {
      key: "name",
      parentKey: "attributes",
      type: "text",
      is_list: false,
      relation_type: null,
      label: "Name",
    },
    {
      key: "term_type",
      parentKey: "attributes",
      type: "text",
      is_list: false,
      relation_type: null,
      label: "Type of term",
      choices: ["Nonce", "Protologism", "Abbreviation"],
    },
    {
      key: "definitions",
      parentKey: "attributes",
      type: "multiline-latex",
      is_list: true,
      relation_type: null,
      label: "Definitions",
    },
    {
      key: "definition_texs",
      parentKey: "attributes",
      type: "multiline-latex",
      is_list: true,
      relation_type: null,
      label: "TeX for definitions",
    },
    {
      key: "passages",
      parentKey: "attributes",
      type: "multiline-latex",
      is_list: true,
      relation_type: null,
      label: "Related passages",
    },
  ],
  sentence: [
    {
      key: "text",
      parentKey: "attributes",
      type: "text",
      is_list: false,
      relation_type: null,
      label: "Text",
    },
    {
      key: "tex",
      parentKey: "attributes",
      type: "multiline-latex",
      is_list: false,
      relation_type: null,
      label: "LaTeX",
    },
  ],
  citation: [
    {
      key: "paper_id",
      parentKey: "attributes",
      type: "text",
      is_list: false,
      relation_type: null,
      label: "Cited paper ID",
    },
  ],
  symbol: [
    {
      key: "tex",
      parentKey: "attributes",
      type: "latex",
      is_list: false,
      relation_type: null,
      label: "LaTeX",
    },
    {
      key: "mathml",
      parentKey: "attributes",
      type: "text",
      is_list: false,
      relation_type: null,
      label: "MathML",
    },
    {
      key: "nicknames",
      parentKey: "attributes",
      type: "text",
      is_list: true,
      relation_type: null,
      label: "Nicknames",
    },
    {
      key: "nickname_sentences",
      parentKey: "relationships",
      type: "relation-id",
      is_list: true,
      relation_type: "sentence",
      label: "Nickname sentence IDs",
    },
    {
      key: "definitions",
      parentKey: "attributes",
      type: "multiline-latex",
      is_list: true,
      relation_type: null,
      label: "Definitions",
    },
    {
      key: "definition_sentences",
      parentKey: "relationships",
      type: "relation-id",
      is_list: true,
      relation_type: "sentence",
      label: "Definition sentence IDs",
    },
    {
      key: "defining_formulas",
      parentKey: "attributes",
      type: "latex",
      is_list: true,
      relation_type: null,
      label: "Defining formulas",
    },
    {
      key: "defining_formula_equations",
      parentKey: "relationships",
      type: "relation-id",
      is_list: true,
      relation_type: "equation",
      label: "Defining formula sentence IDs",
    },
    {
      key: "snippets",
      parentKey: "attributes",
      type: "multiline-latex",
      is_list: true,
      relation_type: null,
      label: "Related passages",
    },
    {
      key: "snippet_sentences",
      parentKey: "relationships",
      type: "relation-id",
      is_list: true,
      relation_type: "sentence",
      label: "Related passage sentence IDs",
    },
    {
      key: "parent",
      parentKey: "relationships",
      type: "relation-id",
      is_list: false,
      relation_type: "symbol",
      label: "Parent symbol",
    },
    {
      key: "children",
      parentKey: "relationships",
      type: "relation-id",
      is_list: true,
      relation_type: "symbol",
      label: "Child symbols",
    },
    {
      key: "sentence",
      parentKey: "relationships",
      type: "relation-id",
      is_list: false,
      relation_type: "sentence",
      label: "Sentence",
    },
  ],
};

class EntityPropertyEditor extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = this.createInitialState();
    this.updatePropertyValue = this.updatePropertyValue.bind(this);
    this.handleLatexError = this.handleLatexError.bind(this);
    this.reset = this.reset.bind(this);
    this.onChangePropagateEdits = this.onChangePropagateEdits.bind(this);
    this.save = this.save.bind(this);
    this.deleteEntity = this.deleteEntity.bind(this);
  }

  createInitialState(): State {
    return {
      updates: {
        attributes: {},
        relationships: {},
      },
      errors: {},
      state: "edits-enabled",
      syncError: null,
    };
  }

  getPropertyValue(property: Property): any {
    if (this.props.entity === null) {
      return null;
    }

    /*
     * Use property values in state if possible, as they represent edits made to the properties.
     * Otherwise, fall back on the values from the properties.
     */
    let entityObject: UpdatedProperties | Entity = this.props.entity;

    /*
     * Look for an updated property value in state.
     */
    if (this.state.updates[property.parentKey] !== undefined) {
      const parentObject = this.state.updates[property.parentKey] as any;
      if (parentObject[property.key] !== undefined) {
        entityObject = this.state.updates;
      }
    }

    if (property.parentKey === "relationships") {
      /*
       * Return IDs for the relationships.
       */
      const relationships = entityObject.relationships as GenericRelationships;
      const relationshipValue = relationships[property.key];
      if (Array.isArray(relationshipValue)) {
        return relationshipValue.map((i) => i.id);
      } else {
        return relationshipValue.id;
      }
    } else if (property.parentKey === "attributes") {
      const attributes = entityObject.attributes as GenericAttributes;
      return attributes[property.key];
    }

    return null;
  }

  areThereErrors() {
    return Object.keys(this.state.errors).some(
      (key) => this.state.errors[key] !== undefined
    );
  }

  haveValuesChanged() {
    return (
      Object.keys(this.state.updates.attributes).length > 0 ||
      Object.keys(this.state.updates.relationships).length > 0
    );
  }

  updatePropertyValue(property: Property, value: any) {
    /*
     * Before saving the value (as a string), do validation to check that it can be converted
     * to the intended type when saved.
     */
    let values: Array<any> = property.is_list ? value : [value];

    const error =
      values
        .map((v) => {
          if (property.type === "float") {
            if (/^\s*$/.test(v) || isNaN(Number(v))) {
              return `Value "${v}" must be a floating point number.`;
            }
          } else if (property.type === "integer") {
            const num = Number(value);
            /**
             * This check for whether a number is an integer is based on the polyfill from MDN:
             * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger#Polyfill
             */
            if (
              /^\s*$/.test(v) ||
              isNaN(num) ||
              !isFinite(num) ||
              Math.floor(num) !== num
            ) {
              return `Value "${v}" must be an integer.`;
            }
          } else if (property.is_list) {
            if (/^\s*$/.test(v)) {
              return "NULL values not allowed in list. Delete row if not needed.";
            }
          }
          return null;
        })
        .filter((errorString) => errorString !== null)
        .join(" ") || undefined;

    /*
     * If relation data is being set, wrap each value as an ID of a relationship object.
     */
    if (property.type === "relation-id") {
      if (Array.isArray(value)) {
        value = value.map((v) => ({ type: property.relation_type, id: v }));
      } else {
        value = { type: property.relation_type, id: value };
      }
    }

    /*
     * Update data. Set errors for this field if validation errors were found.
     */
    this.setState((state) => ({
      ...state,
      errors: {
        ...state.errors,
        [property.key]: error,
      },
      updates: {
        ...state.updates,
        [property.parentKey]: {
          ...state.updates[property.parentKey],
          [property.key]: value,
        },
      },
    }));
  }

  handleLatexError(
    property: Property,
    message: string,
    error: katex.ParseError
  ) {
    this.setState((state) => ({
      ...state,
      errors: {
        ...state.errors,
        [property.key]: `${message} ${error}`,
      },
    }));
  }

  reset() {
    this.setState(this.createInitialState());
  }

  onChangePropagateEdits(event: React.ChangeEvent<HTMLInputElement>) {
    this.props.handleSetPropagateEntityEdits(event.target.checked);
  }

  async save() {
    const { entity } = this.props;
    if (entity === null) {
      return;
    }

    this.setState({
      state: "saving",
      syncError: null,
    });

    const entityUpdateData: EntityUpdateData = {
      id: entity.id,
      type: entity.type,
      attributes: {
        ...this.state.updates.attributes,
        source: "human-annotation",
      },
      relationships: {
        ...this.state.updates.relationships,
      },
    };

    const saveResult = await this.props.handleSaveChanges(
      entity,
      entityUpdateData
    );
    if (saveResult === true) {
      /*
       * Revert to initial state (i.e., clear all internal records of updates and validation
       * errors) once the updates are saved successfully.
       */
      this.setState(this.createInitialState());
    } else {
      this.setState({
        state: "edits-enabled",
        syncError: null,
      });
    }
  }

  async deleteEntity() {
    if (this.props.entity === null) {
      return;
    }

    const deleteResult = await this.props.handleDeleteEntity(
      this.props.entity.id
    );
    if (deleteResult === false) {
      this.setState({
        state: "edits-enabled",
        syncError: "delete",
      });
    }
  }

  render() {
    const { entity } = this.props;

    if (entity === null) {
      return (
        <div className="entity-property-editor">
          <p>
            You can edit entity properties in this drawer. To get started,
            select an entity from a page. For example, click an underlined term,
            symbol, or citation.
          </p>
        </div>
      );
    }

    const properties = EDITABLE_PROPERTIES[entity.type] || [];

    /*
     * Saving is only supported when changes have been made and all fields have passed validation.
     */
    const saveAllowed =
      this.haveValuesChanged() &&
      !this.areThereErrors() &&
      this.state.state === "edits-enabled";

    return (
      <div className="entity-property-editor">
        <div className="entity-property-editor__entity-id">
          <b>Entity ID</b>: {entity.id}
        </div>
        {this.state.syncError && (
          <p className="entity-property-editor__save-error-label">
            Error{" "}
            {this.state.syncError === "save"
              ? "saving edits"
              : this.state.syncError === "delete"
              ? "deleting entity"
              : ""}
            . Check that you're connected to the internet and try again.
          </p>
        )}
        {properties.map((property: Property) => {
          return (
            <EntityPropertyField
              key={property.key}
              property={property}
              value={this.getPropertyValue(property)}
              disabled={this.state.state !== "edits-enabled"}
              error={this.state.errors[property.key]}
              handlePropertyChanged={this.updatePropertyValue}
              handleLatexError={this.handleLatexError}
            />
          );
        })}
        <div className="entity-property-editor__action-form">
          <Button
            className="action-button"
            disabled={
              !this.haveValuesChanged() || this.state.state !== "edits-enabled"
            }
            onClick={this.reset}
            variant="outlined"
          >
            Revert changes
          </Button>
          <FormControlLabel
            control={
              <Switch
                checked={this.props.propagateEntityEdits}
                color="primary"
                onChange={this.onChangePropagateEdits}
                disabled={!saveAllowed}
                name="propagate-edits"
              />
            }
            label={`Apply changes to other appearances of this ${entity.type} when saving changes.`}
          />
          <Button
            className="action-button"
            onClick={this.save}
            disabled={!saveAllowed}
            variant="contained"
            color="primary"
          >
            {this.state.state === "saving" ? "Saving..." : "Save changes"}
          </Button>
          <Button
            className="action-button"
            onClick={this.deleteEntity}
            disabled={this.state.state !== "edits-enabled"}
            variant="outlined"
            color="secondary"
          >
            {this.state.state === "deleting"
              ? "Deleting..."
              : "Delete (can't be undone)"}
          </Button>
        </div>
      </div>
    );
  }
}

export default EntityPropertyEditor;
