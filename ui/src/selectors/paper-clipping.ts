import { BoundingBox } from "../types/api";

/**
 * Get bounds of a clip of a page centered on 'box'.
 */
export function clipBounds(box: BoundingBox): BoundingBox {
  const CLIP_WIDTH = 500;
  const CLIP_HEIGHT = 200;
  const centerX = box.left + box.width / 2;
  const centerY = box.top + box.height / 2;
  return {
    page: box.page,
    left: centerX - CLIP_WIDTH / 2,
    top: centerY - CLIP_HEIGHT / 2,
    width: CLIP_WIDTH,
    height: CLIP_HEIGHT
  };
}
