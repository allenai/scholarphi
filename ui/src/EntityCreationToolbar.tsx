import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import classNames from "classnames";
import React from "react";
import { KnownEntityType, PageModel, Pages } from "./state";
import {
  BoundingBox,
  CitationAttributes,
  EntityCreateData,
  SentenceAttributes,
  SymbolAttributes,
  SymbolRelationships,
  TermAttributes,
} from "./types/api";

interface Props {
  className?: string;
  pages: Pages;
  entityType: KnownEntityType;
  selectionMethod: AreaSelectionMethod;
  handleShowSnackbarMessage: (message: string) => void;
  handleSelectEntityType: (entityCreationType: KnownEntityType) => void;
  handleSelectSelectionMethod: (selectionMethod: AreaSelectionMethod) => void;
  handleCreateEntity: (entity: EntityCreateData) => Promise<boolean>;
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
  state: "interaction-enabled" | "creating-entity";
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
      definitions: [],
      sources: [],
    } as Omit<TermAttributes, "version">;
  } else if (type === "citation") {
    data.attributes = {
      ...data.attributes,
      paper_id: null,
    } as Omit<CitationAttributes, "version">;
  } else if (type === "symbol") {
    data.attributes = {
      ...data.attributes,
      mathml: null,
      tex: text || null,
      name: null,
      definition: null,
      equation: null,
      passages: [],
      mathml_near_matches: [],
    } as Omit<SymbolAttributes, "version">;
    data.relationships = {
      sentence: { type: "sentence", id: null },
      children: [],
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
      state: "interaction-enabled",
      textSelection: null,
      textSelectionChangeMs: null,
    };
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.onChangeEntityType = this.onChangeEntityType.bind(this);
    this.onChangeSelectionMethod = this.onChangeSelectionMethod.bind(this);
    this.onClickCreateEntity = this.onClickCreateEntity.bind(this);
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
    const boxes: BoundingBox[] = [];
    const selectedText = selection.toString();
    for (let i = 0; i < selection.rangeCount; i++) {
      const range = selection.getRangeAt(i);

      /*
       * Find the page that contains this range.
       */
      let parent: Node | HTMLElement | null = range.commonAncestorContainer;
      let page: PageModel | undefined = undefined;
      while (parent !== null) {
        parent = parent.parentElement;
        if (
          parent instanceof HTMLDivElement &&
          parent.classList.contains("page")
        ) {
          for (const p of Object.values(pages)) {
            if (p.view.div === parent) {
              page = p;
              break;
            }
          }
          if (page !== undefined) {
            break;
          }
        }
      }

      /*
       * If a page was found, save a bounding box for the selection, in ratio coordinates
       * relative to the page view 'div'.
       */
      if (page !== undefined) {
        const { pageNumber } = page.view.pdfPage;
        const rangeRect = range.getBoundingClientRect();
        const pageRect = page.view.div.getBoundingClientRect();
        const box: BoundingBox = {
          left: (rangeRect.left - pageRect.left) / pageRect.width,
          top: (rangeRect.top - pageRect.top) / pageRect.height,
          width: rangeRect.width / pageRect.width,
          height: rangeRect.height / pageRect.height,
          page: pageNumber - 1,
          source: "human-annotation",
        };
        boxes.push(box);
      }
    }

    /*
     * Create entity with bounding boxes.
     */
    const createEntityData = createCreateEntityDataWithBoxes(
      boxes,
      this.props.entityType,
      selectedText
    );
    this.setState({
      state: "creating-entity",
    });
    const success = await this.props.handleCreateEntity(createEntityData);
    if (!success) {
      this.props.handleShowSnackbarMessage(
        "Entity could not be created. Check that you are connected to the internet."
      );
    }
    this.setState({
      state: "interaction-enabled",
    });
  }

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
            disabled={this.state.state !== "interaction-enabled"}
          >
            <MenuItem value="term">Term</MenuItem>
            <MenuItem value="symbol">Symbol</MenuItem>
            <MenuItem value="citation">Citation</MenuItem>
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
            disabled={this.state.state !== "interaction-enabled"}
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
              this.state.state !== "interaction-enabled"
            }
            color="primary"
            variant="contained"
          >
            {this.state.state === "interaction-enabled"
              ? "Create entity from text selection"
              : null}
            {this.state.state === "creating-entity"
              ? "Creating entity..."
              : null}
          </Button>
        ) : null}
        {selectionMethod === "rectangular-selection" ? (
          <span className="entity-creation-toolbar__selection-message">
            Select area on page
          </span>
        ) : null}
      </Card>
    );
  }
}

export default EntityCreationToolbar;
