import { ref } from 'vue'
import type {
  GridEditorCommandResult,
  GridEditorEvent,
  GridEditorEventListener,
  GridEditorHistoryCheckpoint,
  GridEditorRollbackCheckpoint
} from '@marsio/vue-grid-layout/editor'
import {
  createGridEditorController,
  createGridEditorHistory
} from '@marsio/vue-grid-layout/editor'

const history = createGridEditorHistory()
const historyCheckpoint: GridEditorHistoryCheckpoint = history.checkpoint()
history.restore(historyCheckpoint)

const editor = createGridEditorController({
  layout: ref([{ i: 'a', x: 0, y: 0, w: 1, h: 1 }]),
  history
})

const listener: GridEditorEventListener = (event: GridEditorEvent) => {
  const type: GridEditorEvent['type'] = event.type
  void type
}

const unsubscribe: () => void = editor.subscribe(listener)
const rollbackCheckpoint: GridEditorRollbackCheckpoint = editor.createRollbackCheckpoint('type-smoke')
editor.restoreRollbackCheckpoint(rollbackCheckpoint, 'type-smoke-restore')

const result: Promise<GridEditorCommandResult> = editor.execute({
  type: 'select',
  targetIds: ['a'],
  source: 'api'
})

unsubscribe()

void result
