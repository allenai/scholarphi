import IconButton from "@material-ui/core/IconButton";
import StarIcon from "@material-ui/icons/Star";
import React from "react";
import { ScholarReaderContext } from "./state";

interface FavoriteButtonProps {
  favoritableId: FavoritableId;
  opaque?: boolean;
}

export class FavoriteButton extends React.Component<FavoriteButtonProps> {
  render() {
    return (
      <ScholarReaderContext.Consumer>
        {({ favorites, toggleFavorite }) => {
          const isFavorite = favorites[favoritesKey(this.props.favoritableId)];
          const color = isFavorite === true ? "secondary" : "inherit";
          return (
            <div
              className={`favorite-button ${
                this.props.opaque ? "favorite-button--opaque" : ""
              }`}
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
