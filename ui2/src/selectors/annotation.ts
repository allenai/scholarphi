/**
 * Filter a list of annotations to those that appear within a specific page. Conservatively
 * include IDs that are missing page number information.
 */
export function annotationsInPage(annotationIds: string[], page: number) {
  return idsForPage(annotationIds, page, true);
}

/**
 * Filter a list of annotation spans to those that appear within a specific page. Conservatively
 * include IDs that are missing page number information.
 */
export function annotationSpansInPage(spanIds: string[], page: number) {
  return idsForPage(spanIds, page, true);
}

function idsForPage(ids: string[], page: number, includeUnmarked: boolean) {
  return ids.filter((id) => {
    const match = id.match(/page-(\d+)/);
    if (match === null) {
      return includeUnmarked;
    }
    return Number(match[1]) === page;
  });
}
