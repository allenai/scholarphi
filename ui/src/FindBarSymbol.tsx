import React from "react";
import { convertToAnnotationId } from './selectors/annotation'
import { ScholarReaderContext } from "./state";
import { BoundingBox } from "./types/api";

interface FindBarProps {
  mappingToBounds: Map<String, BoundingBox>;
  matches: string[];
}

export class FindBarSymbol extends React.PureComponent<FindBarProps, {}> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  componentWillUnmount() {
    this.deselectSymbol();
  }

  wrapIndex(index: number, len: number) {
    return (index % len + len) % len;
  }

  selectSymbol(id: string, boxId: string) {
    this.context.setSelectedEntity(id, "symbol");
    this.context.setSelectedAnnotationId(convertToAnnotationId(id));
    this.context.setSelectedAnnotationSpanId(boxId);
  }

  deselectSymbol() {
    this.context.setSelectedEntity(null, null);
    this.context.setSelectedAnnotationId(null);
    this.context.setSelectedAnnotationSpanId(null);
  }

  moveToNextSymbol(currId: string, movement: number, e: React.SyntheticEvent) {
    const { matches, mappingToBounds } = this.props;
		const currentMatch = matches.indexOf(currId);

    const newEntityId = matches[
      this.wrapIndex((currentMatch || 0) + movement, matches.length)
    ];
   
    const newBoxId = mappingToBounds.has(newEntityId) ? mappingToBounds.get(newEntityId).id : '';
    this.selectSymbol(newEntityId, newBoxId);
		e.preventDefault();
  }

  closeFinder = (e: React.SyntheticEvent) => {
    this.deselectSymbol();
    e.preventDefault();
  }

  /*
   * Based on 'PDFFindBar.updateResultsCount' in pdf.js:
   * https://github.com/mozilla/pdf.js/blob/49f59eb627646ae9a6e166ee2e0ef2cac9390b4f/web/pdf_find_bar.js#L152
   */
  matchCountMessage(selectedSymbol: string) {
    const MATCH_COUNT_LIMIT = 1000;

    const { matches } = this.props;
    if (selectedSymbol === null || matches === null) {
      return null;
    }

    if ((matches.length || 0) > MATCH_COUNT_LIMIT) {
      return `More than ${MATCH_COUNT_LIMIT} matches`;
    }

		const currentMatch = matches.indexOf(selectedSymbol) + 1;
    return `${currentMatch} of ${matches.length} matches`;
  }

  render() {
  return (
    <ScholarReaderContext.Consumer>
      {({ selectedEntityId }) => {
        return (
          <div className="find-bar">
            <div className="find-bar__navigation">
              <button
                className="find-bar__navigation__previous"
                onClick={(e) => this.moveToNextSymbol(selectedEntityId || '', -1, e)}
              >
                <span>Previous</span>
              </button>
              <button
                className="find-bar__navigation__next"
                onClick={(e) => this.moveToNextSymbol(selectedEntityId || '', 1, e)}
              >
                <span>Next</span>
              </button>
            </div>
            <div className="find-bar__message">
              <span className="find-bar__message__span">
                {selectedEntityId && this.matchCountMessage(selectedEntityId)}
              </span>
            </div>
            <div className="find-bar__close" onClick={this.closeFinder}>X</div>
          </div>
        )}}
      </ScholarReaderContext.Consumer>
    )
  }

  queryElement: HTMLInputElement | null = null;
}

export default FindBarSymbol;
