import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import React from "react";
import EntityPropertyField from "./EntityPropertyField";
import {
  Entity,
  EntityUpdateData,
  GenericAttributes,
  GenericRelationships,
} from "./types/api";

interface Props {
  entity: Entity;
  handleSaveChanges: (entity: EntityUpdateData) => void;
}

interface State {
  entityUpdateData: EntityUpdateData & { relationships: GenericRelationships };
  errors: { [propertyKey: string]: string | string[] };
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
    | "relation-id";
  is_list: boolean;
  relation_type: string;
  label: string;
}

const EDITABLE_PROPERTIES: { [type: string]: Property[] } = {
  symbol: [
    {
      key: "children",
      parentKey: "relationships",
      type: "integer",
      is_list: true,
      relation_type: "symbol",
      label: "Child ID",
    },
  ],
};

class EntityPropertyEditor extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = this.createInitialState(props);
    this.updatePropertyValue = this.updatePropertyValue.bind(this);
    this.reset = this.reset.bind(this);
    this.save = this.save.bind(this);
  }

  createInitialState(props: Props): State {
    return {
      entityUpdateData: {
        id: props.entity.id,
        type: props.entity.type,
        attributes: { source: "human-annotation" },
        relationships: {},
      },
      errors: {},
    };
  }

  getPropertyValue(property: Property): any {
    /*
     * Use property values in state if possible, as they represent edits made to the properties.
     * Otherwise, fall back on the values from the properties.
     */
    let entityObject: EntityUpdateData | Entity = this.props.entity;

    /*
     * Look for an updated property value in state.
     */
    if (this.state.entityUpdateData[property.parentKey] !== undefined) {
      const parentObject = this.state.entityUpdateData[
        property.parentKey
      ] as any;
      if (parentObject[property.key] !== undefined) {
        entityObject = this.state.entityUpdateData;
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

  updatePropertyValue(property: Property, value: any, index?: number) {
    /*
     * Cast the value to the intended type if possible. Otherwise, save the raw value with an
     * error that will be shown to the user.
     */
    let castedValue: any;
    let error: string;
    if (property.type === "float") {
      try {
        castedValue = parseFloat(value);
      } catch (e) {
        error = `This value could not be read as a float. JavaScript error: ${e}`;
        castedValue = value;
      }
    } else if (property.type === "integer") {
      try {
        castedValue = parseInt(value);
      } catch (e) {
        error = `This value could not be read as an integer. JavaScript error: ${e}`;
        castedValue = value;
      }
    } else if (
      property.type === "latex" ||
      property.type === "multiline-text" ||
      property.type === "text"
    ) {
      castedValue = value;
    } else if (property.type === "relation-id") {
    }

    this.setState((state) => ({
      ...state,
      errors: {
        [property.key]: error,
      },
      entityUpdateData: {
        ...state.entityUpdateData,
        [property.parentKey]: {
          ...state.entityUpdateData[property.parentKey],
          [property.key]: castedValue,
        },
      },
    }));
  }

  reset() {
    this.setState(this.createInitialState(this.props));
  }

  save() {}

  render() {
    const { entity } = this.props;
    const properties = EDITABLE_PROPERTIES[entity.type] || [];

    return (
      <div className="property-editor">
        {properties.map((property: Property) => {
          return (
            <EntityPropertyField
              key={property.key}
              property={property}
              error={this.state.errors[property.key]}
              handlePropertyChanged={this.updatePropertyValue}
            />
          );
        })}
        <ButtonGroup>
          <Button onClick={this.reset}>Reset</Button>
          {/* Save is only enabled when all fields are validated. */}
          <Button
            onClick={this.save}
            disabled={Object.keys(this.state.errors).length > 0}
          >
            Save
          </Button>
        </ButtonGroup>
      </div>
    );
  }
}

export default EntityPropertyEditor;
