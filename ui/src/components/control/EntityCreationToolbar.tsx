import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";
import classNames from "classnames";
import React from "react";
import {
  BoundingBox,
  CitationAttributes,
  EntityCreateData,
  isSymbol,
  SentenceAttributes,
  Symbol,
  SymbolAttributes,
  SymbolRelationships,
  TermAttributes,
  TermRelationships,
} from "../../api/types";
import { Entities, KnownEntityType, Pages } from "../../state";
import * as uiUtils from "../../utils/ui";

interface Props {
  className?: string;
  pages: Pages;
  entities: Entities | null;
  selectedEntityIds: string[];
  entityType: KnownEntityType;
  selectionMethod: AreaSelectionMethod;
  rapidAnnotationEnabled: boolean;
  powerDeleteEnabled: boolean;
  handleShowSnackbarMessage: (message: string) => void;
  handleSelectEntityType: (entityCreationType: KnownEntityType) => void;
  handleSelectSelectionMethod: (selectionMethod: AreaSelectionMethod) => void;
  handleCreateEntity: (entity: EntityCreateData) => Promise<string | null>;
  handleCreateParentSymbol: (symbols: Symbol[]) => Promise<boolean>;
  handleSetRapidAnnotationEnabled: (enabled: boolean) => void;
  handleSetPowerDeleteEnabled: (enabled: boolean) => void;
  handleGroupSelectedEntities: () => void;
}

interface State {
  textSelection: Selection | null;
  /**
   * Time in milliseconds that the selection changed last. Stored in state because
   * textSelection may be the same object whenever a 'selectionchange' event is
   * triggered. By storing the milliseconds of the last change, a re-render is
   * triggered on each selection change event.
   */
  textSelectionChangeMs: number | null;
  state: "interactive" | "creating-entity" | "creating-parent-symbol";
}

export type AreaSelectionMethod = "text-selection" | "rectangular-selection";

export function createCreateEntityDataWithBoxes(
  boxes: BoundingBox[],
  type: KnownEntityType,
  text?: string
): EntityCreateData {
  let data: EntityCreateData = {
    type: type as string,
    attributes: {
      source: "human-annotation",
      version: undefined,
      bounding_boxes: boxes,
    },
    relationships: {},
  };

  /*
   * Set default values for known entity types. If this step is skipped, the API server might
   * reject the creation of the entity due to missing properties.
   */
  if (type === "term") {
    data.attributes = {
      ...data.attributes,
      name: text || null,
      term_type: null,
      tags: [],
      definitions: [],
      definition_texs: [],
      sources: [],
      snippets: [],
    } as Omit<TermAttributes, "version">;
    data.relationships = {
      sentence: { type: "sentence", id: null },
      definition_sentences: [],
      snippet_sentences: [],
    } as Omit<TermRelationships, "version">;
  } else if (type === "citation") {
    data.attributes = {
      ...data.attributes,
      paper_id: null,
    } as Omit<CitationAttributes, "version">;
  } else if (type === "symbol") {
    data.attributes = {
      ...data.attributes,
      mathml: null,
      tex: text ? `$${text}$` : null,
      nicknames: [],
      diagram_label: null,
      is_definition: null,
      definitions: [],
      defining_formulas: [],
      passages: [],
      mathml_near_matches: [],
      snippets: [],
    } as Omit<SymbolAttributes, "version">;
    data.relationships = {
      sentence: { type: "sentence", id: null },
      equation: { type: "equation", id: null },
      parent: { type: "symbol", id: null },
      children: [],
      nickname_sentences: [],
      definition_sentences: [],
      defining_formula_equations: [],
      snippet_sentences: [],
    } as Omit<SymbolRelationships, "version">;
  } else if (type === "sentence") {
    data.attributes = {
      ...data.attributes,
      text: text || null,
      tex: null,
      tex_start: null,
      tex_end: null,
    } as Omit<SentenceAttributes, "version">;
  }

  return data;
}

/**
 * Toolbar that supports the creation of new entities by annotating the paper. Allows
 * users to create annotations of papers from text selections.
 */
class EntityCreationToolbar extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      state: "interactive",
      textSelection: document.getSelection(),
      textSelectionChangeMs: Date.now(),
    };
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.onChangeEntityType = this.onChangeEntityType.bind(this);
    this.onChangeSelectionMethod = this.onChangeSelectionMethod.bind(this);
    this.onClickCreateEntity = this.onClickCreateEntity.bind(this);
    this.onClickCreateParentSymbol = this.onClickCreateParentSymbol.bind(this);
  }

  componentWillMount() {
    /*
     * To capture changes in the selection within the document, there is no option other than
     * to listen to changes within the entire document. The W3C standards offer no way of listening
     * for selection changes within specific elements. See
     * https://w3c.github.io/selection-api/#user-interactions).
     */
    document.addEventListener("selectionchange", this.onSelectionChange);
  }

  componentWillUnmount() {
    document.removeEventListener("selectionchange", this.onSelectionChange);
  }

  onSelectionChange() {
    this.setState({
      textSelection: document.getSelection(),
      textSelectionChangeMs: Date.now(),
    });
  }

  onChangeEntityType(event: React.ChangeEvent<{ value: unknown }>) {
    this.props.handleSelectEntityType(event.target.value as KnownEntityType);
  }

  onChangeSelectionMethod(event: React.ChangeEvent<{ value: unknown }>) {
    this.props.handleSelectSelectionMethod(
      event.target.value as AreaSelectionMethod
    );
  }

  async onClickCreateEntity() {
    const { pages } = this.props;
    const { textSelection: selection } = this.state;
    if (selection === null || selection.isCollapsed) {
      return;
    }

    /*
     * Get bounding boxes of all selected ranges.
     */
    const boxes = uiUtils.getBoundingBoxesForSelection(selection, pages);

    /*
     * Create entity with bounding boxes.
     */
    const selectedText = selection.toString();
    const createEntityData = createCreateEntityDataWithBoxes(
      boxes,
      this.props.entityType,
      selectedText
    );
    this.setState({
      state: "creating-entity",
    });
    const entityId = await this.props.handleCreateEntity(createEntityData);
    if (entityId === null) {
      this.props.handleShowSnackbarMessage(
        "Entity could not be created. Check that you are connected to the internet."
      );
    }
    this.setState({
      state: "interactive",
    });
  }

  _getSelectedSymbols() {
    const { entities, selectedEntityIds } = this.props;
    if (entities === null) {
      return [];
    }
    return selectedEntityIds
      .map((id) => entities.byId[id])
      .filter((e) => e !== undefined && isSymbol(e))
      .map((e) => e as Symbol);
  }

  /**
   * Entities can be combined if there is more than one and if they are all the same type.
   */
  canCreateParentSymbol() {
    const { selectedEntityIds } = this.props;
    const selectedSymbols = this._getSelectedSymbols();
    return (
      selectedSymbols.length === selectedEntityIds.length &&
      selectedSymbols.length > 1
    );
  }

  async onClickCreateParentSymbol() {
    this.setState({
      state: "creating-parent-symbol",
    });
    const success = await this.props.handleCreateParentSymbol(
      this._getSelectedSymbols()
    );
    if (!success) {
      this.props.handleShowSnackbarMessage(
        "Failed to create parent symbol, or update child symbols to reference parent. " +
          "Data may now be inconsistent. Check your internet connection."
      );
    }
    this.setState({
      state: "interactive",
    });
  }

  onChangeRapidAnnotationEnabled = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    this.props.handleSetRapidAnnotationEnabled(event.target.checked);
  };

  onChangePowerDeleteEnabled = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.handleSetPowerDeleteEnabled(event.target.checked);
  };

  render() {
    const { selectionMethod } = this.props;
    const { textSelection } = this.state;

    return (
      <Card
        className={classNames("entity-creation-toolbar", this.props.className)}
        raised={true}
      >
        <FormControl style={{ minWidth: "6em" }}>
          <InputLabel className="entity-creation-toolbar__type-select-label">
            Entity type
          </InputLabel>
          <Select
            labelId="entity-creation-toolbar__type-select-label"
            value={this.props.entityType}
            onChange={this.onChangeEntityType}
            disabled={this.state.state !== "interactive"}
          >
            <MenuItem value="term">Term</MenuItem>
            <MenuItem value="symbol">Symbol</MenuItem>
            <MenuItem value="citation">Citation</MenuItem>
            <MenuItem value="equation">Equation</MenuItem>
            <MenuItem value="sentence">Sentence</MenuItem>
          </Select>
        </FormControl>
        <FormControl style={{ minWidth: "8em" }}>
          <InputLabel className="entity-creation-toolbar__selection-method-select-label">
            Selection method
          </InputLabel>
          <Select
            labelId="entity-creation-toolbar__selection-method-select-label"
            value={selectionMethod}
            onChange={this.onChangeSelectionMethod}
            disabled={this.state.state !== "interactive"}
          >
            <MenuItem value="text-selection">Text</MenuItem>
            <MenuItem value="rectangular-selection">Rectangular</MenuItem>
          </Select>
        </FormControl>
        {this.props.selectionMethod === "text-selection" ? (
          <Button
            className="entity-creation-toolbar__action-button"
            onClick={this.onClickCreateEntity}
            disabled={
              textSelection === null ||
              textSelection.isCollapsed === true ||
              this.state.state !== "interactive"
            }
            color="primary"
            variant="contained"
          >
            {this.state.state === "interactive"
              ? "Create entity from text selection"
              : null}
            {this.state.state === "creating-entity"
              ? "Creating entity..."
              : null}
          </Button>
        ) : null}
        {this.props.entityType === "symbol" ? (
          <Button
            className="entity-creation-toolbar__action-button"
            onClick={this.onClickCreateParentSymbol}
            disabled={!this.canCreateParentSymbol()}
            color="primary"
            variant="contained"
          >
            Create Parent Symbol
          </Button>
        ) : null}

        <Button
          className="entity-creation-toolbar__action-button"
          onClick={this.props.handleGroupSelectedEntities}
          disabled={this.props.selectedEntityIds.length < 2}
          color="primary"
          variant="contained"
        >
          Group Entities
        </Button>
        <FormControlLabel
          control={
            <Switch
              checked={this.props.rapidAnnotationEnabled}
              color="primary"
              onChange={this.onChangeRapidAnnotationEnabled}
            />
          }
          label={"Power add"}
        />
        <FormControlLabel
          control={
            <Switch
              checked={this.props.powerDeleteEnabled}
              color="primary"
              onChange={this.onChangePowerDeleteEnabled}
            />
          }
          label={"Power delete?"}
        />
        <span className="entity-creation-toolbar__selection-message">
          {selectionMethod === "text-selection" && textSelection !== null
            ? `Selected text: "${uiUtils.truncateText(
                textSelection.toString(),
                40
              )}"`
            : null}
          {selectionMethod === "rectangular-selection"
            ? "Select area on page"
            : null}
        </span>
      </Card>
    );
  }
}

export default EntityCreationToolbar;
