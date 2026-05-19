import { useGridDragResizeInteractions } from "./useGridDragResizeInteractions";
import { useGridDropInteractions } from "./useGridDropInteractions";
import type {
  GridInteractionCommonOptions,
  GridInteractionModelCommitters
} from "./gridInteractionTypes";

type UseGridInteractionsOptions =
  GridInteractionCommonOptions &
  GridInteractionModelCommitters & {
    isFirefox: boolean;
    layoutClassName: string;
  };

export function useGridInteractions(options: UseGridInteractionsOptions) {
  const dragResize = useGridDragResizeInteractions(options);
  const drop = useGridDropInteractions(options);

  return {
    ...dragResize,
    ...drop
  };
}
