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
        {definitions.map((u) => (
          <Snippet
            key={u.contextEntity.id}
            id={`definition-${u.contextEntity.id}`}
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

export default Definitions;
