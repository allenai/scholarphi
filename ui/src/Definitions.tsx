import React from "react";
import * as selectors from "./selectors";
import Snippet from "./Snippet";
import { Entities } from "./state";
import { isSymbol } from "./types/api";

interface Props {
  selectedEntityIds: string[];
  entities: Entities;
  handleJumpToEntity: (id: string) => void;
}

export class Definitions extends React.PureComponent<Props> {
  render() {
    const { selectedEntityIds, entities } = this.props;
    const symbols = selectedEntityIds
      .map((id) => entities.byId[id])
      .filter((e) => e !== undefined)
      .filter(isSymbol)
      .map((s) => s.id);
    const definitions = selectors.definitionsAndNicknames(symbols, entities);

    return (
      <div className="document-snippets definitions">
        <p className="drawer__content__header">Definitions</p>
        {selectedEntityIds.length === 0 && (
          <p>To see definitions, select a symbol.</p>
        )}
        {selectedEntityIds.length > 0 && (
          <p>
            {definitions.length === 0
              ? `No definitions were found for the selected symbols.`
              : `Showing ${definitions.length} definition${
                  definitions.length === 1 ? "" : "s"
                } of the selected symbols.`}
          </p>
        )}
        {definitions.map((d, i) => (
          <Snippet
            key={d.contextEntity.id}
            id={`definition-${i}-${d.contextEntity.id}`}
            context={d.contextEntity}
            handleJumpToContext={this.props.handleJumpToEntity}
          >
            {d.excerpt}
          </Snippet>
        ))}
      </div>
    );
  }
}

export default Definitions;
