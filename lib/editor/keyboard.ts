import type {
  GridEditorCommand,
  GridEditorController,
  GridEditorKeyboardOptions,
  GridEditorMessage
} from "./types";

type GridEditorKeyboardPlatform = NonNullable<GridEditorKeyboardOptions["platform"]>;

type GridEditorKeyboardShortcut = {
  key: string;
  command: GridEditorCommand | ((event: KeyboardEvent, options: GridEditorKeyboardOptions) => GridEditorCommand);
  primary?: boolean;
  shift?: boolean;
  alt?: boolean;
  platform?: Exclude<GridEditorKeyboardPlatform, "auto">;
};

const resolveKeyboardPlatform = (
  platform: GridEditorKeyboardPlatform = "auto"
): Exclude<GridEditorKeyboardPlatform, "auto"> => {
  if (platform === "mac" || platform === "standard") return platform;
  return typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
    ? "mac"
    : "standard";
};

const isElementLike = (target: unknown): target is {
  tagName?: string;
  isContentEditable?: boolean;
  matches?: (selector: string) => boolean;
} => Boolean(target && typeof target === "object");

export const shouldIgnoreEditorKeyboardEvent = (
  event: KeyboardEvent,
  options: GridEditorKeyboardOptions = {}
): boolean => {
  const target = event.target;
  if (!isElementLike(target)) return false;

  const tagName = target.tagName?.toUpperCase();
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") return true;
  if (target.isContentEditable) return true;

  const ignoredTargets = options.ignoredTargets || [];
  return ignoredTargets.some(ignored => {
    if (typeof ignored === "string") {
      return typeof target.matches === "function" && target.matches(ignored);
    }
    return ignored(target);
  });
};

const editorKeyboardShortcuts: GridEditorKeyboardShortcut[] = [
  { key: "Escape", command: { type: "clearSelection", source: "keyboard" } },
  { key: "Delete", command: { type: "delete", source: "keyboard" } },
  { key: "Backspace", command: { type: "delete", source: "keyboard" } },
  { key: "z", primary: true, command: { type: "undo", source: "keyboard" } },
  { key: "z", primary: true, shift: true, command: { type: "redo", source: "keyboard" } },
  { key: "y", primary: true, platform: "standard", command: { type: "redo", source: "keyboard" } },
  { key: "c", primary: true, command: { type: "copy", source: "keyboard" } },
  { key: "v", primary: true, command: { type: "paste", source: "keyboard" } },
  { key: "d", primary: true, command: { type: "duplicate", source: "keyboard" } },
  { key: "s", primary: true, command: { type: "save", source: "keyboard" } }
];

const keyMatches = (eventKey: string, shortcutKey: string): boolean =>
  eventKey.toLowerCase() === shortcutKey.toLowerCase();

const modifiersMatch = (
  event: KeyboardEvent,
  shortcut: GridEditorKeyboardShortcut,
  platform: Exclude<GridEditorKeyboardPlatform, "auto">
): boolean => {
  const primaryKey = platform === "mac" ? event.metaKey : event.ctrlKey;
  const secondaryKey = platform === "mac" ? event.ctrlKey : event.metaKey;
  const wantsPrimary = shortcut.primary === true;

  if (wantsPrimary !== primaryKey) return false;
  if (wantsPrimary && secondaryKey) return false;
  if (!wantsPrimary && (event.ctrlKey || event.metaKey)) return false;
  if ((shortcut.shift || false) !== event.shiftKey) return false;
  if ((shortcut.alt || false) !== event.altKey) return false;
  return true;
};

const matchKeyboardShortcut = (
  event: KeyboardEvent,
  options: GridEditorKeyboardOptions
): GridEditorCommand | null => {
  const platform = resolveKeyboardPlatform(options.platform);
  const shortcut = editorKeyboardShortcuts.find(candidate =>
    (!candidate.platform || candidate.platform === platform) &&
    keyMatches(event.key, candidate.key) &&
    modifiersMatch(event, candidate, platform)
  );
  if (!shortcut) return null;
  return typeof shortcut.command === "function"
    ? shortcut.command(event, options)
    : { ...shortcut.command };
};

export const getGridEditorKeyboardCommand = (
  event: KeyboardEvent,
  options: GridEditorKeyboardOptions = {}
): GridEditorCommand | null => {
  if (shouldIgnoreEditorKeyboardEvent(event, options)) return null;
  const key = event.key;
  const moveStep = event.shiftKey
    ? options.fastMoveStep || 4
    : options.moveStep || 1;
  const resizeStep = event.shiftKey
    ? options.fastResizeStep || 2
    : options.resizeStep || 1;

  const shortcutCommand = matchKeyboardShortcut(event, options);
  if (shortcutCommand) return shortcutCommand;

  const direction =
    key === "ArrowLeft" ? { dx: -moveStep, dy: 0, dw: -resizeStep, dh: 0 } :
    key === "ArrowRight" ? { dx: moveStep, dy: 0, dw: resizeStep, dh: 0 } :
    key === "ArrowUp" ? { dx: 0, dy: -moveStep, dw: 0, dh: -resizeStep } :
    key === "ArrowDown" ? { dx: 0, dy: moveStep, dw: 0, dh: resizeStep } :
    null;

  if (!direction) return null;
  if (event.ctrlKey || event.metaKey) return null;
  if (event.altKey) {
    return {
      type: "resize",
      source: "keyboard",
      payload: {
        dw: direction.dw,
        dh: direction.dh
      },
      history: {
        mergeKey: "keyboard-resize",
        mergeWindowMs: 650
      }
    };
  }

  return {
    type: "move",
    source: "keyboard",
    payload: {
      dx: direction.dx,
      dy: direction.dy
    },
    history: {
      mergeKey: "keyboard-move",
      mergeWindowMs: 650
    }
  };
};

export const messageFromCommandResult = (
  result: Awaited<ReturnType<GridEditorController["execute"]>>
): GridEditorMessage | null => {
  if (result.status !== "blocked" && result.status !== "error" && result.status !== "timeout") {
    return null;
  }
  const code = result.blocked?.reason || result.error?.message || "editor-command";
  return {
    code,
    level: result.status === "error" ? "error" : "warning",
    message: result.blocked?.message || result.error?.message || `Command ${result.type} was not applied.`,
    itemIds: result.blocked?.itemIds,
    recoverable: result.status !== "error"
  };
};

export const bindGridEditorKeyboard = (
  controller: GridEditorController,
  options: GridEditorKeyboardOptions = {}
): (() => void) => {
  if (options.enabled === false) return () => {};
  const target = options.target || (typeof window !== "undefined" ? window : null);
  if (!target) return () => {};
  const resolvedTarget =
    typeof target === "string" && typeof document !== "undefined"
      ? document.querySelector(target) || window
      : target;

  if (!resolvedTarget || typeof (resolvedTarget as Window).addEventListener !== "function") {
    return () => {};
  }

  const handleKeydown = (event: Event) => {
    const keyboardEvent = event as KeyboardEvent;
    if (!shouldIgnoreEditorKeyboardEvent(keyboardEvent, options) && controller.placementSession.value) {
      if (keyboardEvent.key === "Escape") {
        keyboardEvent.preventDefault();
        controller.cancelPlacement("keyboard-escape");
        options.ariaMessage?.({
          code: "grid-editor.placement.cancelled",
          level: "info",
          message: "Placement cancelled.",
          recoverable: true
        });
        return;
      }
      if (keyboardEvent.key === "Enter") {
        keyboardEvent.preventDefault();
        void controller.commitPlacement({ source: "keyboard" }).then(result => {
          const message = messageFromCommandResult(result);
          options.ariaMessage?.(message || {
            code: "grid-editor.placement.commit",
            level: "info",
            message: "Placement committed.",
            itemIds: result.affectedIds,
            recoverable: true
          });
        });
        return;
      }
      const step = keyboardEvent.shiftKey
        ? options.placementFastNudgeStep || 4
        : options.placementNudgeStep || 1;
      const direction =
        keyboardEvent.key === "ArrowLeft" ? { dx: -step, dy: 0 } :
        keyboardEvent.key === "ArrowRight" ? { dx: step, dy: 0 } :
        keyboardEvent.key === "ArrowUp" ? { dx: 0, dy: -step } :
        keyboardEvent.key === "ArrowDown" ? { dx: 0, dy: step } :
        null;
      if (direction && !keyboardEvent.ctrlKey && !keyboardEvent.metaKey && !keyboardEvent.altKey) {
        keyboardEvent.preventDefault();
        const session = controller.placementSession.value;
        const cursor = session.cursor || session.ghostItems[0]?.item || session.items[0];
        controller.updatePlacement({
          cursor: {
            x: Math.max(0, (cursor?.x || 0) + direction.dx),
            y: Math.max(0, (cursor?.y || 0) + direction.dy),
            source: "keyboard"
          }
        });
        return;
      }
    }
    const command = getGridEditorKeyboardCommand(keyboardEvent, options);
    if (!command) return;
    keyboardEvent.preventDefault();
    if (command.type === "paste" && options.pasteMode === "interactive") {
      void controller.beginPlacement({
        source: "paste",
        commandType: "paste",
        strategy: "cursor",
        placementIntent: "here",
        placementAnchor: "top-left"
      }).then(result => {
        if (result.status === "blocked") {
          options.ariaMessage?.({
            code: result.blocked?.reason || "grid-editor.placement.blocked",
            level: "warning",
            message: result.blocked?.message || "Placement could not start.",
            itemIds: result.blocked?.itemIds,
            recoverable: true
          });
        } else {
          options.ariaMessage?.({
            code: "grid-editor.placement.start",
            level: "info",
            message: "Placement started.",
            itemIds: result.session?.items.map(item => item.i),
            recoverable: true
          });
        }
      });
      return;
    }
    void controller.execute(command).then(result => {
      const message = messageFromCommandResult(result);
      if (message) options.ariaMessage?.(message);
    });
  };

  (resolvedTarget as Window).addEventListener("keydown", handleKeydown);
  return () => {
    (resolvedTarget as Window).removeEventListener("keydown", handleKeydown);
  };
};
