import classNames from "classnames";
import React from "react";
import EntityLink from "./EntityLink";
import { getRemoteLogger } from "./logging";
import RichText from "./RichText";
import * as selectors from "./selectors";
import { Entities } from "./state";
import { Entity, isSymbol, isTerm, Symbol, Term } from "./types/api";

const logger = getRemoteLogger();

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
      .filter((e) => isTerm(e) || isSymbol(e))
      .map((e) => e as Term | Symbol)
      .map((s) => s.id);
    const usages = selectors.usages(selectedEntityIdsWithUsages, entities);

    return (
      <div className="document-snippets usages">
        <p className="drawer__content__header">Usages</p>
        {usages.map((u) => (
          <Snippet
            key={u.contextEntity.id}
            id={`usage-${u.contextEntity.id}`}
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

interface SnippetProps {
  id: string;
  context?: Entity;
  handleJumpToContext?: (contextEntityId: string) => void;
  children: string;
}

class Snippet extends React.PureComponent<SnippetProps> {
  constructor(props: SnippetProps) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    logger.log("debug", "clicked-jump-to-snippet-context", {
      contextEntity: this.props.context,
    });
    if (this.props.handleJumpToContext && this.props.context) {
      this.props.handleJumpToContext(this.props.context.id);
    }
  }

  render() {
    const { context } = this.props;
    return (
      <>
        <div
          className={classNames("snippet", {
            clickable: this.props.context && this.props.handleJumpToContext,
          })}
          onClick={this.onClick}
        >
          <RichText>{selectors.cleanTex(this.props.children)}</RichText>
        </div>
        {this.props.handleJumpToContext && context ? (
          <p className="entity-link-message">
            {"See in context on page "}
            <EntityLink
              id={`${this.props.id}-text-link`}
              entityId={context.id}
              handleJumpToEntity={this.props.handleJumpToContext}
            >
              {selectors.readableFirstPageNumber(context)}
            </EntityLink>
            {"."}
          </p>
        ) : null}
      </>
    );
  }
}

export default Usages;
