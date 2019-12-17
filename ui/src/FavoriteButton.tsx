import IconButton from "@material-ui/core/IconButton";
import StarIcon from "@material-ui/icons/Star";
import classNames from "classnames";
import React from "react";
import { ScholarReaderContext } from "./state";

interface FavoriteButtonProps {
  favoritableId: FavoritableId;
  opaque?: boolean;
}

export class FavoriteButton extends React.PureComponent<FavoriteButtonProps> {
  render() {
    return (
      <ScholarReaderContext.Consumer>
        {({ favorites, toggleFavorite }) => {
          const isFavorite = favorites[favoritesKey(this.props.favoritableId)];
          const color = isFavorite === true ? "secondary" : "inherit";
          return (
            <div
              className={classNames("favorite-button", {
                "favorite-button--opaque": this.props.opaque
              })}
            >
              <IconButton
                onClick={() => toggleFavorite(this.props.favoritableId)}
              >
                <StarIcon color={color} />
              </IconButton>
            </div>
          );
        }}
      </ScholarReaderContext.Consumer>
    );
  }
}

type FavoritableType = "paper-summary" | "symbol-view";
type EntityId = string | number;

export interface FavoritableId {
  type: FavoritableType;
  entityId: EntityId;
}

export function favoritesKey(id: FavoritableId) {
  return `${id.type}-${id.entityId}`;
}

export function keyToFavoritesId(key: string) {
  let entityId: string | number;
  let type: string;
  [type, entityId] = key.split(/-(?=[^-]+$)/);
  if (type === "symbol-view") {
    entityId = Number(entityId);
  }
  return {
    type,
    entityId
  } as FavoritableId;
}

export default FavoriteButton;
