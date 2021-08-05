import * as selectors from "../../selectors";
import Snippet from "./Snippet";
import { Entities } from "../../state";
import { isPaperQuestion, isSymbol, isTerm, Symbol, Term, PaperQuestion } from "../../api/types";
import * as uiUtils from "../../utils/ui";

import React from "react";

interface Props {
  selectedEntityIds: string[];
  entities: Entities;
  handleJumpToEntity: (id: string) => void;
}

export class Usages extends React.PureComponent<Props> {
  render() {
    const { selectedEntityIds, entities } = this.props;
    const selectedEntityIdsWithUsages = selectedEntityIds
      .map((id) => entities.byId[id])
      .filter((e) => e !== undefined)
      .filter((e) => isTerm(e) || isSymbol(e) || isPaperQuestion(e))
      .map((e) => e as Term | Symbol | PaperQuestion);

    const entityIds = selectedEntityIdsWithUsages.map((e) => e.id);
    const usages = selectors.usages(entityIds, entities);

    const entityTypes = uiUtils.joinStrings(
      selectedEntityIdsWithUsages.map((e) => `${e.type}s`)
    );

    return (
      <div className="document-snippets usages">
        <p className="drawer__content__header">Usages</p>
        {selectedEntityIds.length === 0 && (
          <p>To see usages, select a symbol or term.</p>
        )}
        {selectedEntityIds.length > 0 && (
          <p>
            {usages.length === 0
              ? `No usages were found for the selected ${entityTypes}.`
              : `Showing ${usages.length} usage${
                  usages.length === 1 ? "" : "s"
                } of the selected ${entityTypes}.`}
          </p>
        )}
        {usages.map((u, i) => (
          <Snippet
            key={u.contextEntity.id}
            id={`usage-${i}-${u.contextEntity.id}`}
            context={u.contextEntity}
            handleJumpToContext={this.props.handleJumpToEntity}
          >
            {u.excerpt}
          </Snippet>
        ))}
      </div>
    );
  }
}

export default Usages;
