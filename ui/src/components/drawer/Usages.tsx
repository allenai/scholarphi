import * as selectors from "../../selectors";
import Snippet from "./Snippet";
import { Entities } from "../../state";
import { isSymbol, isTerm, Symbol, Term } from "../../api/types";
import * as uiUtils from "../../utils/ui";
import { BaseEntityAttributes, SymbolAttributes, TermAttributes } from "../../api/types";

import React from "react";

interface Props {
  selectedEntityIds: string[];
  entities: Entities;
  handleJumpToEntity: (id: string) => void;
}

function nameSelector(ent: SymbolAttributes | TermAttributes | null){
  if (ent != null && 'name' in ent) {
    // SymbolAttributes
    return ent.name;
  }
  if (ent != null &&'tex' in ent) {
    // TermAttributes
    return ent.tex;
  }
  return null
}

export class Usages extends React.PureComponent<Props> {
  render() {
    const { selectedEntityIds, entities } = this.props;
    const selectedEntityIdsWithUsages = selectedEntityIds
      .map((id) => entities.byId[id])
      .filter((e) => e !== undefined)
      .filter((e) => isTerm(e) || isSymbol(e))
      .map((e) => e as Term | Symbol);

    const entityIds = selectedEntityIdsWithUsages.map((e) => e.id);
    const usages = selectors.usages(entityIds, entities);
    const entityTypes = uiUtils.joinStrings(
      selectedEntityIdsWithUsages.map((e) => `${e.type}s`)
    );
    const eAttrs = selectedEntityIdsWithUsages.length > 0 ?
      selectedEntityIdsWithUsages[0].attributes : null
    const eName = nameSelector(eAttrs);

    return (
      <div className="document-snippets usages">
        <p className="drawer__content__header">Paper Details on Demand</p>
        {
          eName ?
          <div className="query-link">
              <i>{"Query: "}</i>
              <b>{ eName }</b>
          </div> : null
        }
        {selectedEntityIds.length === 0 && (
          <p>To see details, select a term in the abstract.</p>
        )}
        {selectedEntityIds.length > 0 && (
          <p>
            {usages.length === 0
              ? `No instances were found for the selected ${entityTypes}.`
              : `Showing ${usages.length} instance${
                  usages.length === 1 ? "" : "s"
                } of the selected ${entityTypes}.`}
          </p>
        )}
        {
        usages.map((u, i) => (
          <Snippet
            key={u.contextEntity.id}
            id={`usage-${i}-${u.contextEntity.id}`}
            context={u.contextEntity}
            score={u.score}
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
