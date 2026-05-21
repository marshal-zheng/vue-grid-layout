import { useGridDragResizeInteractions } from "./useGridDragResizeInteractions";
import { useGridDropInteractions } from "./useGridDropInteractions";
import { useGridInteractionMachine } from "./useGridInteractionMachine";
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
  const interactionMachine = useGridInteractionMachine({
    getDragActivationDistance: () => options.props.dragActivationDistance
  });
  const sharedOptions = {
    ...options,
    interactionMachine
  };
  const dragResize = useGridDragResizeInteractions(sharedOptions);
  const drop = useGridDropInteractions(sharedOptions);
  const clearActiveInteraction = () => {
    dragResize.clearActiveInteraction();
    drop.clearDropInteraction();
  };

  return {
    ...dragResize,
    ...drop,
    clearActiveInteraction
  };
}
