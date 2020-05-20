import classNames from "classnames";
import React from "react";
import Annotation from "./Annotation";
import TermTooltipBody from "./TermTooltipBody";
import { ScholarReaderContext } from "./state";
import { BoundingBox, Term } from "./types/api";

interface TermAnnotationProps {
  boundingBoxes: BoundingBox[];
  term: Term;
  showHint?: boolean;
}

export class TermAnnotation extends React.PureComponent<
  TermAnnotationProps,
  {}
> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  render() {
    return (
      <Annotation
        id={`term-${this.props.term.id}-annotation`}
        className={classNames({ "annotation-hint": this.props.showHint })}
        source={this.props.term.source}
        boundingBoxes={this.props.boundingBoxes}
        tooltipContent={
          <TermTooltipBody
            term={this.props.term}
          />
        }
        onSelected={this.selectEntityWhenAnnotationSelected.bind(this)}
        onDeselected={this.deselectEntityWhenAnnotationDeselected.bind(this)}
      />
    );
  }

  selectEntityWhenAnnotationSelected() {
    this.context.setSelectedEntity(this.props.term.id, "term");
  }

  deselectEntityWhenAnnotationDeselected() {
    const {
      setSelectedEntity,
      selectedEntityId,
      selectedEntityType,
    } = this.context;
    if (
      selectedEntityType === "term" &&
      selectedEntityId === this.props.term.id
    ) {
      setSelectedEntity(null, null);
    }
  }
}

export default TermAnnotation;
