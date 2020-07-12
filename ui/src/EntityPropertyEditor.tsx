import Button from "@material-ui/core/Button";
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
  handleSaveChanges: (entity: EntityUpdateData) => void;
}

interface State {
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
      key: "definitions",
      parentKey: "attributes",
      type: "float",
      is_list: true,
      relation_type: null,
      label: "Definitions",
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
      key: "sentence",
      parentKey: "relationships",
      type: "relation-id",
      is_list: false,
      relation_type: "sentence",
      label: "Sentence ID",
    },
    {
      key: "children",
      parentKey: "relationships",
      type: "relation-id",
      is_list: true,
      relation_type: "symbol",
      label: "Child IDs",
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
    this.save = this.save.bind(this);
  }

  createInitialState(): State {
    return {
      updates: {
        attributes: {},
        relationships: {},
      },
      errors: {},
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
          } else if (property.type === "relation-id" && property.is_list) {
            if (/^\s*$/.test(v)) {
              return "ID should not be empty. Delete row if not needed.";
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

  save() {
    const { entity } = this.props;
    if (entity === null) {
      return;
    }

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
    this.props.handleSaveChanges(entityUpdateData);
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

    return (
      <div className="entity-property-editor">
        {properties.map((property: Property) => {
          return (
            <EntityPropertyField
              key={property.key}
              property={property}
              value={this.getPropertyValue(property)}
              error={this.state.errors[property.key]}
              handlePropertyChanged={this.updatePropertyValue}
              handleLatexError={this.handleLatexError}
            />
          );
        })}
        <div className="entity-property-editor__action-buttons">
          <Button
            className="action-button"
            onClick={this.reset}
            variant="outlined"
          >
            Reset
          </Button>
          {/* Save is only enabled when all fields are validated. */}
          <Button
            className="action-button"
            onClick={this.save}
            disabled={!this.haveValuesChanged() || this.areThereErrors()}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </div>
      </div>
    );
  }
}

export default EntityPropertyEditor;
