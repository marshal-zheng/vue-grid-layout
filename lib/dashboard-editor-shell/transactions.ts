import type {
  DashboardEditorShellActionResult,
  DashboardEditorShellActionSource,
  DashboardEditorShellActionStatus,
  DashboardEditorShellActionType,
  DashboardEditorShellAdapterResult,
  DashboardEditorShellAdapterStageResult,
  DashboardEditorShellDiagnostic,
  DashboardEditorShellEvent,
  DashboardEditorShellPreparedMutation,
  DashboardEditorShellProfileContext,
  DashboardEditorShellTransactionInput,
  DashboardEditorShellTransactionStage
} from "./types";
import type { DashboardResponsiveRuntime } from "../dashboard-responsive";

let actionCounter = 0;

export const createDashboardEditorShellActionId = (
  actionType: DashboardEditorShellActionType
): string => {
  actionCounter += 1;
  return `dashboard-shell-${actionType}-${Date.now().toString(36)}-${actionCounter.toString(36)}`;
};

export const profileContextFromRuntime = (
  runtime: DashboardResponsiveRuntime | null | undefined
): DashboardEditorShellProfileContext => ({
  layoutId: runtime?.layoutId || null,
  requestedBreakpoint: runtime?.requestedBreakpoint || null,
  resolvedProfileId: runtime?.resolvedProfileId || null,
  targetView: runtime?.targetView || null,
  viewFormat: runtime?.viewFormat || null
});

export const createDashboardEditorShellDiagnostic = (
  code: string,
  level: DashboardEditorShellDiagnostic["level"],
  message: string,
  extra: Partial<DashboardEditorShellDiagnostic> = {}
): DashboardEditorShellDiagnostic => {
  const diagnostic: DashboardEditorShellDiagnostic = {
    code,
    level,
    message
  };
  const keys = Object.keys(extra).sort();
  keys.forEach(key => {
    const value = (extra as Record<string, unknown>)[key];
    if (typeof value !== "undefined") {
      (diagnostic as Record<string, unknown>)[key] = value;
    }
  });
  return diagnostic;
};

export const diagnosticFromUnknownError = (
  error: unknown,
  extra: Partial<DashboardEditorShellDiagnostic> = {}
): DashboardEditorShellDiagnostic => {
  const message = error instanceof Error ? error.message : String(error || "Unknown error");
  return createDashboardEditorShellDiagnostic(
    "shell-error",
    "error",
    message,
    {
      reason: "validation",
      recoverable: true,
      ...extra
    }
  );
};

export const createDashboardEditorShellResult = <T = unknown>(
  input: {
    ok: boolean;
    status: DashboardEditorShellActionStatus;
    actionId: string;
    actionType: DashboardEditorShellActionType;
    source: DashboardEditorShellActionSource;
    itemIds?: string[];
    affectedIds?: string[];
  } & Partial<DashboardEditorShellActionResult<T>>
): DashboardEditorShellActionResult<T> => ({
  ok: input.ok,
  status: input.status,
  actionId: input.actionId,
  actionType: input.actionType,
  source: input.source,
  itemIds: input.itemIds || [],
  affectedIds: input.affectedIds || input.commandResult?.affectedIds || input.itemIds || [],
  position: input.position,
  commandResult: input.commandResult,
  writeResult: input.writeResult,
  adapter: input.adapter,
  placement: input.placement,
  proposedDocument: input.proposedDocument,
  idMap: input.idMap || input.adapter?.idMap,
  patches: input.patches || input.commandResult?.layoutPatches,
  diagnostics: stableDiagnostics(input.diagnostics || []),
  data: input.data
});

export const emitShellResult = (
  emit: ((event: DashboardEditorShellEvent) => void) | undefined,
  result: DashboardEditorShellActionResult,
  profile: DashboardEditorShellProfileContext
) => {
  emit?.({
    type: "action-result",
    actionId: result.actionId,
    actionType: result.actionType,
    source: result.source,
    status: result.status,
    ok: result.ok,
    itemIds: result.itemIds,
    affectedIds: result.affectedIds,
    profile,
    position: result.position,
    commandResult: result.commandResult,
    writeResult: result.writeResult,
    adapter: result.adapter,
    placement: result.placement,
    proposedDocument: result.proposedDocument,
    patches: result.patches,
    data: result.data,
    diagnostics: result.diagnostics
  });
};

export const stableDiagnostics = (
  diagnostics: DashboardEditorShellDiagnostic[]
): DashboardEditorShellDiagnostic[] =>
  diagnostics
    .filter(Boolean)
    .map(diagnostic => {
      const out: DashboardEditorShellDiagnostic = {
        code: diagnostic.code,
        level: diagnostic.level,
        message: diagnostic.message
      };
      Object.keys(diagnostic)
        .filter(key => key !== "code" && key !== "level" && key !== "message")
        .sort()
        .forEach(key => {
          const value = (diagnostic as Record<string, unknown>)[key];
          if (typeof value !== "undefined") {
            (out as Record<string, unknown>)[key] = sanitizeDiagnosticValue(value);
          }
        });
      return out;
    })
    .sort((a, b) =>
      `${a.actionId || ""}:${a.code}:${a.path || ""}:${a.itemId || ""}`
        .localeCompare(`${b.actionId || ""}:${b.code}:${b.path || ""}:${b.itemId || ""}`)
    );

const sanitizeDiagnosticValue = (value: unknown): unknown => {
  if (value == null) return value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map(sanitizeDiagnosticValue);
  if (value instanceof Error) return { name: value.name, message: value.message };
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    Object.keys(value as Record<string, unknown>).sort().forEach(key => {
      if (key === "opaque" || key === "payload" || key === "businessPayload") return;
      out[key] = sanitizeDiagnosticValue((value as Record<string, unknown>)[key]);
    });
    return out;
  }
  return String(value);
};

const stageResultFromAdapter = (
  stage: DashboardEditorShellTransactionStage,
  result: DashboardEditorShellAdapterResult | void | null | undefined,
  prepared?: DashboardEditorShellPreparedMutation
): DashboardEditorShellAdapterStageResult => ({
  stage,
  ok: result?.ok !== false,
  status: result?.status,
  reason: result?.reason,
  preparedId: prepared?.id,
  sourceIds: result?.sourceIds || prepared?.sourceIds,
  newIds: result?.newIds || prepared?.newIds,
  idMap: result?.idMap || prepared?.idMap,
  metadata: result?.metadata || prepared?.metadata,
  diagnostics: stableDiagnostics(result?.diagnostics || prepared?.diagnostics || []),
  error: result?.error
    ? { code: result.error.code, message: result.error.message }
    : undefined
});

const isAdapterResult = (
  value: DashboardEditorShellPreparedMutation | DashboardEditorShellAdapterResult | null | undefined
): value is DashboardEditorShellAdapterResult =>
  Boolean(value && typeof value === "object" && "ok" in value && !("kind" in value));

const isPreparedMutation = (
  value: DashboardEditorShellPreparedMutation | DashboardEditorShellAdapterResult | null | undefined
): value is DashboardEditorShellPreparedMutation =>
  Boolean(value && typeof value === "object" && "kind" in value);

const rollbackPrepared = async (
  input: DashboardEditorShellTransactionInput,
  prepared: DashboardEditorShellPreparedMutation,
  stage: DashboardEditorShellTransactionStage,
  error: unknown,
  diagnostics: DashboardEditorShellDiagnostic[]
): Promise<DashboardEditorShellAdapterStageResult | undefined> => {
  if (!input.rollback) return undefined;
  try {
    const rollbackResult = await input.rollback(prepared, {
      ...input.context,
      stage,
      error
    });
    diagnostics.push(...(rollbackResult?.diagnostics || []));
    return stageResultFromAdapter("rollback", rollbackResult, prepared);
  } catch (rollbackError) {
    diagnostics.push(diagnosticFromUnknownError(rollbackError, {
      actionId: input.actionId,
      actionType: input.actionType,
      source: input.source,
      reason: "adapter-rejected"
    }));
    return {
      stage: "rollback",
      ok: false,
      status: "error",
      reason: "adapter-rejected",
      preparedId: prepared.id,
      error: {
        message: rollbackError instanceof Error ? rollbackError.message : String(rollbackError)
      }
    };
  }
};

export const runDashboardEditorShellTransaction = async <T = unknown>(
  input: DashboardEditorShellTransactionInput<T>
): Promise<DashboardEditorShellActionResult<T>> => {
  const itemIds = input.itemIds || input.context.itemIds || [];
  const diagnostics: DashboardEditorShellDiagnostic[] = input.context.diagnostics.slice();
  input.emit?.({
    type: "action-start",
    actionId: input.actionId,
    actionType: input.actionType,
    source: input.source,
    itemIds,
    profile: input.profile,
    position: input.position,
    diagnostics
  });

  let prepared: DashboardEditorShellPreparedMutation | null = null;
  let adapterStage: DashboardEditorShellAdapterStageResult | undefined;

  try {
    if (input.prepare) {
      const preparedOrResult = await input.prepare(input.context);
      if (isAdapterResult(preparedOrResult)) {
        diagnostics.push(...(preparedOrResult.diagnostics || []));
        adapterStage = stageResultFromAdapter("prepare", preparedOrResult);
        if (!preparedOrResult.ok) {
          const result = createDashboardEditorShellResult<T>({
            ok: false,
            status: preparedOrResult.status || "blocked",
            actionId: input.actionId,
            actionType: input.actionType,
            source: input.source,
            itemIds,
            affectedIds: [],
            position: input.position,
            adapter: adapterStage,
            idMap: preparedOrResult.idMap,
            diagnostics
          });
          emitShellResult(input.emit, result, input.profile);
          return result;
        }
      } else if (isPreparedMutation(preparedOrResult)) {
        prepared = preparedOrResult;
        diagnostics.push(...(prepared.diagnostics || []));
        adapterStage = stageResultFromAdapter("prepare", { ok: true, diagnostics: prepared.diagnostics }, prepared);
      }
    }

    const mutation = await input.mutate(prepared, input.context);
    diagnostics.push(...(mutation.diagnostics || []));
    const mutationFailed = mutation.commandResult?.status === "blocked" ||
      mutation.commandResult?.status === "cancelled" ||
      mutation.commandResult?.status === "timeout" ||
      mutation.commandResult?.status === "error" ||
      mutation.writeResult?.ok === false ||
      mutation.status === "blocked" ||
      mutation.status === "cancelled" ||
      mutation.status === "timeout" ||
      mutation.status === "unsupported" ||
      mutation.status === "error";

    if (mutationFailed) {
      const rollbackStage = prepared
        ? await rollbackPrepared(input, prepared, "mutate", mutation, diagnostics)
        : undefined;
      const status = mutation.writeResult?.ok === false ? "blocked" as const : mutation.status ||
        (mutation.commandResult?.status === "cancelled" ? "cancelled" :
          mutation.commandResult?.status === "timeout" ? "timeout" :
            mutation.commandResult?.status === "error" ? "error" : "blocked");
      const result = createDashboardEditorShellResult<T>({
        ok: false,
        status,
        actionId: input.actionId,
        actionType: input.actionType,
        source: input.source,
        itemIds,
        affectedIds: mutation.affectedIds || mutation.commandResult?.affectedIds || [],
        position: input.position,
        commandResult: mutation.commandResult,
        writeResult: mutation.writeResult,
        proposedDocument: mutation.proposedDocument,
        adapter: rollbackStage || adapterStage,
        placement: mutation.placement,
        idMap: prepared?.idMap,
        patches: mutation.patches,
        diagnostics,
        data: mutation.data
      });
      emitShellResult(input.emit, result, input.profile);
      return result;
    }

    if (prepared && input.commit) {
      let commitResult: DashboardEditorShellAdapterResult | void;
      try {
        commitResult = await input.commit(prepared, {
          ...input.context,
          commandResult: mutation.commandResult,
          writeResult: mutation.writeResult,
          proposedDocument: mutation.proposedDocument
        });
      } catch (commitError) {
        diagnostics.push(diagnosticFromUnknownError(commitError, {
          actionId: input.actionId,
          actionType: input.actionType,
          source: input.source,
          reason: "adapter-rejected"
        }));
        adapterStage = {
          stage: "commit",
          ok: false,
          status: "error",
          reason: "adapter-rejected",
          preparedId: prepared.id,
          sourceIds: prepared.sourceIds,
          newIds: prepared.newIds,
          idMap: prepared.idMap,
          diagnostics: stableDiagnostics(prepared.diagnostics || []),
          error: {
            message: commitError instanceof Error ? commitError.message : String(commitError)
          }
        };
        const rollbackStage = await rollbackPrepared(input, prepared, "commit", commitError, diagnostics);
        const result = createDashboardEditorShellResult<T>({
          ok: false,
          status: "error",
          actionId: input.actionId,
          actionType: input.actionType,
          source: input.source,
          itemIds,
          affectedIds: mutation.affectedIds || mutation.commandResult?.affectedIds || [],
          position: input.position,
          commandResult: mutation.commandResult,
          writeResult: mutation.writeResult,
          proposedDocument: mutation.proposedDocument,
          adapter: rollbackStage || adapterStage,
          placement: mutation.placement,
          idMap: prepared.idMap,
          patches: mutation.patches,
          diagnostics,
          data: mutation.data
        });
        emitShellResult(input.emit, result, input.profile);
        return result;
      }
      diagnostics.push(...(commitResult?.diagnostics || []));
      adapterStage = stageResultFromAdapter("commit", commitResult, prepared);
      if (commitResult?.ok === false) {
        const rollbackStage = await rollbackPrepared(input, prepared, "commit", commitResult, diagnostics);
        const result = createDashboardEditorShellResult<T>({
          ok: false,
          status: commitResult.status || "error",
          actionId: input.actionId,
          actionType: input.actionType,
          source: input.source,
          itemIds,
          affectedIds: mutation.affectedIds || mutation.commandResult?.affectedIds || [],
          position: input.position,
          commandResult: mutation.commandResult,
          writeResult: mutation.writeResult,
          proposedDocument: mutation.proposedDocument,
          adapter: rollbackStage || adapterStage,
          placement: mutation.placement,
          idMap: prepared.idMap,
          patches: mutation.patches,
          diagnostics,
          data: mutation.data
        });
        emitShellResult(input.emit, result, input.profile);
        return result;
      }
    }

    const commandStatus = mutation.commandResult?.status;
    const status: DashboardEditorShellActionStatus =
      mutation.status ||
      (commandStatus === "changed" ? "success" :
        commandStatus === "noop" ? "noop" :
          commandStatus === "cancelled" ? "cancelled" :
            commandStatus === "timeout" ? "timeout" :
              commandStatus === "error" ? "error" :
                commandStatus === "blocked" ? "blocked" : "success");
    const result = createDashboardEditorShellResult<T>({
      ok: status === "success" || status === "noop",
      status,
      actionId: input.actionId,
      actionType: input.actionType,
      source: input.source,
      itemIds,
      affectedIds: mutation.affectedIds || mutation.commandResult?.affectedIds || prepared?.newIds || itemIds,
      position: input.position,
      commandResult: mutation.commandResult,
      writeResult: mutation.writeResult,
      proposedDocument: mutation.proposedDocument,
      adapter: adapterStage,
      placement: mutation.placement,
      idMap: prepared?.idMap,
      patches: mutation.patches,
      diagnostics,
      data: mutation.data
    });
    emitShellResult(input.emit, result, input.profile);
    return result;
  } catch (error) {
    diagnostics.push(diagnosticFromUnknownError(error, {
      actionId: input.actionId,
      actionType: input.actionType,
      source: input.source
    }));
    const rollbackStage = prepared
      ? await rollbackPrepared(input, prepared, "mutate", error, diagnostics)
      : undefined;
    const result = createDashboardEditorShellResult<T>({
      ok: false,
      status: "error",
      actionId: input.actionId,
      actionType: input.actionType,
      source: input.source,
      itemIds,
      affectedIds: [],
      position: input.position,
      adapter: rollbackStage || adapterStage,
      idMap: prepared?.idMap,
      diagnostics
    });
    emitShellResult(input.emit, result, input.profile);
    return result;
  }
};
