import type { GridLayoutRuntimeExtension, GridLayoutRuntimeExtensionContext } from "./runtimeExtension";
import {
  createNoopGridInteractionsEditor,
  getDefaultGridItemRenderState
} from "./runtimeExtension";

export const createNoopGridLayoutRuntimeExtension = (
  _context: GridLayoutRuntimeExtensionContext
): GridLayoutRuntimeExtension => ({
  interactions: createNoopGridInteractionsEditor(),
  getItemRenderState: getDefaultGridItemRenderState,
  getRootClassNames: () => undefined,
  isExternalDropEnabled: isDroppable => isDroppable,
  renderOverlay: () => null
});
