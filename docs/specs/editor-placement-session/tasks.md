# Editor Placement Session 实现任务

- [x] 1. 建立 placement session 纯核心与类型模型
  - 新增 `lib/editor/placementSession.ts`，定义 session source、phase、cursor、ghost、affected outline、blocked result、diagnostics 和 commit command builder。
  - 实现 `createGridEditorPlacementSession()`、`updateGridEditorPlacementSession()`、`buildGridEditorPlacementCommitCommand()`、`cancelGridEditorPlacementSession()`。
  - 复用 `placeGridEditorNewItems()` 生成 candidate layout，并从 placement summary 派生 ghostItems、affectedOutlines、blocked diagnostics。
  - 保证同一 layout/items/strategy/cursor/cols/maxRows 输入产生确定性 candidate 和 diagnostics。
  _需求追溯: R1.AC1, R1.AC2, R1.AC7, R3.AC2, R3.AC3, R3.AC9, R4.AC1, R4.AC8, R8.AC4_

- [x] 2. 在 `GridEditorController` 暴露 placement session API
  - 在 `lib/editor/types.ts` 增加 `placementSession`、`beginPlacement`、`updatePlacement`、`commitPlacement`、`cancelPlacement` public API 类型。
  - 在 `lib/editor/controller.ts` 创建 `placementSession` ref，并实现 begin/update/cancel 的状态写入、互斥检查、readonly/mode 检查和 structured blocked result。
  - 在 `beginPlacement({ source: "paste" })` 中读取 configured clipboard，沿用 system-to-internal fallback；失败时不创建半激活 ghost。
  - 复用当前 id mapping 和 metadata mapping，确保 paste/add session 的预览 id 与 commit id 一致。
  - 在 controller stop、外部 layout/layouts 替换、mode 变化和 guard cancel/error 路径清理 session、guides、pending clipboard payload 和 transient state。
  _需求追溯: R1.AC4, R1.AC5, R1.AC6, R1.AC9, R2.AC5, R2.AC7, R2.AC8_

- [x] 3. 打通 placement commit 与现有 command kernel
  - 扩展 paste command payload，支持 `resolvedClipboardPayload` 或等价字段，placement commit 使用 begin 阶段已解析 payload，不二次读取 clipboard。
  - 让 `commitPlacement()` 把 session 转为现有 `add` 或 `paste` command，并保留 strategy、cursor、placementIntent、placementAnchor、candidate summary 和 source 信息。
  - 在 command preview/guard context 中加入 placement summary、affected ids、clipboard/source ids 和 risk 信息。
  - commit 成功后只创建一个 command transaction/history entry，并更新 layout、metadata、selection、focus、dirty state 和 persistence。
  - commit blocked/cancelled/timeout/error/stale 时 rollback 到 session 开始前 committed snapshot，并按 recoverable 策略决定保留或清理 active session。
  _需求追溯: R1.AC3, R4.AC5, R4.AC6, R4.AC7, R7.AC1, R7.AC2, R7.AC3, R7.AC4, R7.AC5, R7.AC6, R7.AC7, R7.AC8_

- [x] 4. 新增 grid runtime placement interaction adapter
  - 新增 `lib/grid-layout/useGridPlacementInteractions.ts`，把 pointer event 按 width、cols、rowHeight、margin、containerPadding、transformScale、maxRows 转换为 grid cursor。
  - 在 `VueGridLayout.tsx` 或 `useGridEditorRuntime.ts` 中接入 active placement 的 pointermove、click、blur/unmount cleanup。
  - active placement 时，mousemove 调 `updatePlacement()`，click 调 `commitPlacement({ source: "pointer" })`，并阻止 root clear selection、drag start 和 resize start 竞争。
  - layout-engine preview 异步路径使用 request id 或 session previewSeq 忽略 stale result；legacy path 不支持的能力返回 `unsupported` diagnostics。
  - 第一版限定 desktop/grid pointer placement，mobile 长按和跨断点同步预览保持后置。
  _需求追溯: R4.AC2, R4.AC3, R4.AC4, R6.AC1, R6.AC2, R6.AC6, R6.AC8, R8.AC7_

- [x] 5. 扩展 overlay-only ghost、HUD 和 affected outline 渲染
  - 扩展 `renderGridEditorOverlay()` options，接收 `placementSession` 并渲染 `.vue-grid-editor-placement-ghost` 与 `.vue-grid-editor-placement-affected*` 节点。
  - ghost 使用 overlay geometry 计算像素位置，不进入 slot children、`state.layout`、`droppingDOMNode` 或业务 widget 组件树。
  - blocked 状态通过 ghost class、HUD、diagnostics 和稳定 data attribute 表达。
  - guides 开启时复用 smart guides、spacing chip 和 measurement HUD；guides 关闭时仍显示最小 ghost/blocked 状态。
  - commit/cancel/blocked cleanup 后清空所有 placement ghost、guide、HUD 和 transient DOM。
  - 新增 CSS class 保持主题可覆盖，不把示例视觉样式变成唯一公共 API。
  _需求追溯: R3.AC1, R3.AC3, R3.AC4, R3.AC5, R3.AC6, R3.AC7, R3.AC8, R3.AC9, R8.AC8_

- [x] 6. 接入 keyboard 与 accessibility 行为
  - 扩展 `GridEditorKeyboardOptions`，增加 `pasteMode?: "immediate" | "interactive"`、placement nudge step 相关可选配置。
  - 保持默认 `Ctrl/Cmd+V` 即时 `paste`；只有 `pasteMode: "interactive"` 才进入 placement session。
  - active placement 时，Esc 调 `cancelPlacement()`，Enter 调 `commitPlacement({ source: "keyboard" })`；没有 candidate 时返回 recoverable blocked result。
  - 继续尊重 input、textarea、select、contenteditable 和 ignored target，不拦截原生文本粘贴。
  - 方向键与 Shift+方向键微调作为可追踪增强项保留；若第一版不实现，必须在后续任务中明确记录。
  - 通过 `ariaMessage`、event 或 session 状态暴露进入放置、blocked、提交成功和取消信息。
  _需求追溯: R2.AC1, R2.AC3, R2.AC4, R6.AC3, R6.AC4, R6.AC5, R6.AC7, R6.AC9, R8.AC2_

- [x] 7. 接入 dashboard shell、palette 和 template 显式入口
  - 在 dashboard shell actions/types 中新增 `placeClipboard` 或等价显式高级放置入口，用公共 controller API 进入 placement session。
  - 保持现有 `Paste here`、`pasteWidget()`、`pasteAtGridPosition()` 即时 commit 行为兼容。
  - 为 `addWidgetFromTemplate()`、`openWidgetPalette()` 或等价 palette/template 入口增加 interactive placement 选项。
  - 菜单 position 转换为 placement cursor 时保留 strategy、placementIntent、placementAnchor 和 source metadata。
  - preview 阶段不调用 widget/reference adapter prepare/commit；adapter transaction 只在 `commitPlacement()` 后进入 command pipeline。
  - targetless palette/add 继续允许 first-fit、insert-top-shift 等非 pointer 直接提交路径。
  _需求追溯: R2.AC2, R2.AC6, R5.AC3, R5.AC4, R5.AC5, R5.AC6, R5.AC7, R5.AC8, R8.AC1, R8.AC3, R8.AC6_

- [x] 8. 外部拖拽第一版复用 shared placement core
  - 从 placement session 核心导出或内部复用 diagnostics normalizer、affected outline builder 和 rollback cleanup helper。
  - 在 `useGridDropInteractions()` 中保留现有 dragenter/dragover/drop 主流程，同时复用 shared preview/blocked/rollback 规则。
  - 保持现有 drop event、editor command result、layout-engine `dropFit` 和 legacy drop path 兼容。
  - drop preview 阶段不得绕过 placement transaction 的 rollback 和 diagnostics 规则；adapter commit 只发生在 drop commit 后。
  _需求追溯: R5.AC1, R5.AC2, R5.AC7, R7.AC1, R7.AC3_

- [x] 9. 记录并保留 `useGridDropInteractions` 完整迁移任务
  - 在本任务文件中保留独立 unchecked 项，明确主线 paste/add/palette/shell 稳定并通过回归后，完整迁移 external drop 到 placement session 或共享 placement interaction kernel。
  - 完整迁移目标包括 drag enter -> `beginPlacement`、dragover -> `updatePlacement`、drop -> `commitPlacement`、dragleave/cancel -> `cancelPlacement`。
  - 完整迁移后删除 drop 特有 preview layout mutation，只保留 DOM event/data transfer adapter 和公共放置事务。
  - 同步保留方向键/Shift+方向键微调增强项，主线稳定后补齐或升级为 must-have。
  _需求追溯: R5.AC9, R6.AC5, R6.AC9, R9.AC3, R9.AC8_

## 后续迁移计划（非本期阻塞项）

- [ ] 主线 paste/add/palette/shell 稳定并通过回归后，完整迁移 external drop 到 placement session 或共享 placement interaction kernel：drag enter -> `beginPlacement`、dragover -> `updatePlacement`、drop -> `commitPlacement`、dragleave/cancel -> `cancelPlacement`，并删除 drop 特有 preview layout mutation。
- [ ] 主线稳定后继续追踪方向键/Shift+方向键微调增强项；本期已实现基础 nudge，后续可按产品手感继续细化或升级为 must-have。

- [x] 10. 同步 public exports、types、README 和示例
  - 更新 `lib/editor/index.ts`、`lib/cjs.ts`、`typings/index.d.ts` 或类型生成链路，确保 placement session API、类型和 helper 无导出缺口。
  - README 说明默认 paste、显式高级放置、keyboard opt-in、失败语义、clipboard 权限、accessibility、known limits 和渐进采用建议。
  - 示例只通过 public controller/shell API 展示高级放置，不依赖 demo-only helper 直接改 layout。
  - 文档解释 placement session 与 `pasteStrategy`、`placementIntent`、external drop、shell placement policies 的关系。
  _需求追溯: R1.AC8, R8.AC1, R8.AC2, R8.AC5, R9.AC6_

- [x] 11. 编写 editor core 与 placement engine 测试
  - 覆盖 begin/update/commit/cancel、clipboard fallback、id mapping、multi-item group、guard allow/block/cancel/timeout/error、history single entry 和 stale session。
  - 覆盖 resolved paste payload commit 不二次读取 clipboard。
  - 覆盖 cursor top-left anchor、nearest/first-fit fallback、bounds、collision、maxRows、section row blocked 和 deterministic diagnostics。
  - 覆盖 commit 成功 selection/focus 与 controlled selectedIds 请求语义。
  _需求追溯: R9.AC1, R9.AC2, R4.AC8, R7.AC2, R7.AC5, R7.AC6_

- [x] 12. 编写 grid interaction、overlay 和浏览器测试
  - 覆盖 mousemove preview、click commit、Esc cancel、Enter commit 和 active interaction mutual exclusion。
  - 验证 ghost 不进入 slot children、不进入 `state.layout`、不真实重排现有业务 widgets。
  - 验证 affected outlines/shift indicators、blocked state、ghost z-index、guide/HUD 显示和 cleanup 后 DOM 清空。
  - 验证默认 `Ctrl/Cmd+V` 即时粘贴不被破坏；若实现 arrow nudge，覆盖 Arrow 与 Shift+Arrow，否则确认后续追踪项存在。
  _需求追溯: R9.AC3, R9.AC4, R2.AC1, R3.AC1, R3.AC7, R6.AC1, R6.AC2, R6.AC3, R6.AC4_

- [x] 13. 编写 dashboard shell、palette/template 和 external drop 测试
  - 覆盖 `Paste here` 兼容、`Place from clipboard` 或等价入口进入 session、`Add widget here`、palette placement 和 template placement。
  - 覆盖 adapter prepare/commit/rollback 只在 commit 阶段触发，preview 不创建孤立业务 payload。
  - 覆盖 profile/list/mobile runtime 不被 preview 污染，不 materialize inherited layout。
  - 覆盖 external drop 第一版复用 shared diagnostics/rollback helper，并保持现有 drop dragover、drop event、dropFit commit、legacy path 回归。
  _需求追溯: R9.AC5, R5.AC1, R5.AC2, R5.AC3, R5.AC4, R5.AC5, R8.AC6_

- [x] 14. 发布前验证和复杂度复查
  - 运行相关 editor、grid interaction、dashboard shell、layout-engine、types、browser smoke 和 build/test 命令；无法运行的命令记录原因。
  - 复查 `controller.ts`、`useGridDropInteractions.ts`、`GridEditorOverlay.tsx` 和新增 adapter 复杂度，确认新交互没有全部堆进超大文件。
  - 检查 diagnostics/result shape JSON-safe、稳定顺序、向后兼容，未删除既有字段。
  - 确认 CJS/ESM/types/README 与实现一致。
  _需求追溯: R9.AC7, R9.AC8, R1.AC8, R8.AC4_

- [x] 15. 对齐 placement session 与现有布局碰撞语义
  - 新增 `collisionPolicy: "block" | "layout"`，默认保持 block，不改变现有精确 placement 的保守行为。
  - `collisionPolicy: "layout"` 时复用现有 `preventCollision`、`allowOverlap`、`compactType` 语义：可推挤/压缩、可阻挡或可重叠。
  - 保持 preview 不写真实 layout/history/persistence；layout policy 下已有 item 使用 render-only candidate 坐标显示推挤效果，commit 仍走 `add`/`paste` command pipeline，并在 diagnostics/summary/types/README 中暴露策略。
  - 在 dashboard editor shell demo 增加可切换测试态，便于验证 ghost 移入已有 card 后的 layout push 预览和提交。
  _需求追溯: R3.AC9, R4.AC1, R4.AC7, R5.AC8, R8.AC4, R8.AC5, R9.AC2, R9.AC4_

- [x] 16. 增加 shell 级剪贴板 placement 快捷键
  - 为 dashboard editor shell keyboard 绑定新增 `place-clipboard` 默认快捷键，进入和 toolbar “Place from clipboard” 一致的 interactive placement session。
  - 支持 keyboard 全局或单个 shortcut 配置 placement options，确保业务可复用当前 `collisionPolicy`、`compactType`、`allowOverlap`、`preventCollision` 等布局语义。
  - 示例中使用 `Ctrl/Cmd+Enter` 启动剪贴板 ghost，仍保留 `Ctrl/Cmd+V` 即时 paste，active placement 继续由 Enter 提交、Esc 取消。
  - 补充类型、README 与 browser/type 回归测试。
  _需求追溯: R2.AC2, R2.AC6, R5.AC8, R6.AC3, R6.AC4, R8.AC1, R8.AC2, R9.AC5_

- [x] 17. 实现 clipboard v2 source grid context 与响应式粘贴缩放
  - 扩展 `GridEditorClipboardPayload` 为 v1/v2 兼容模型，新增 source cols/breakpoint/layout/viewFormat 与 original geometry。
  - `createGridEditorClipboardPayload()` 默认写 v2；`parseGridEditorClipboardPayload()` 同时读取 v1/v2，旧 payload 保持现有行为。
  - copy command 从 payload 或 `layoutEngineOptions` 写入 source cols；paste 与 beginPlacement 共享 responsive normalization。
  - source cols 与 target cols 不一致时，按 group origin 缩放 x/w 和横向 offset，并 clamp 到目标 grid bounds。
  - 补 editor core 测试覆盖 v1 兼容、v2 缩放、placeClipboard preview/commit 一致。
  _需求追溯: R10.AC1, R10.AC2, R10.AC3, R10.AC4, R10.AC7, R10.AC8_

- [x] 18. 稳定 `collisionPolicy: "layout"` 的多 item group push 语义
  - 调整 layout policy placement，让多 item 在 cursor/top-left anchor 下作为 group 计算候选布局，保持组内相对 x/y/w/h。
  - 覆盖 group 内部碰撞、`preventCollision=true` 阻挡、`allowOverlap=true` 重叠、`preventCollision=false` 推挤四种路径。
  - 确认 preview `candidateLayout` 与 commit 结果一致，并清理或正确读取 `placementCandidateLayout` 字段，避免维护误导。
  - 补 editor core 和 browser/overlay 相关断言。
  _需求追溯: R3.AC2, R4.AC7, R9.AC2, R9.AC4, R10.AC5, R10.AC8_

- [x] 19. 增加 ThingsBoard-compatible shell keyboard aliases
  - 默认 shortcut 表新增 `Ctrl/Cmd+R` -> `copy-reference`、`Ctrl/Cmd+I` -> `paste-reference`、`Ctrl/Cmd+X` -> `cut-widget`。
  - keyboard handler 支持 `copy-reference` 与 `cut-widget`；cut 后的下一次 `Ctrl/Cmd+V` 进入 interactive placement session，避免即时粘贴回原坑。
  - 菜单 shortcut label 与 README 记录 alias 行为；业务仍可用 `keyboard.shortcuts` 覆盖默认表。
  - 补 dashboard shell browser/type 测试。
  _需求追溯: R10.AC6, R10.AC7, R10.AC8, R10.AC9, R8.AC1, R8.AC2_

- [x] 20. 文档、类型和回归验证收尾
  - 同步 `typings/index.d.ts`、README、示例说明和 spec 完成状态。
  - 运行 `tsc --noEmit`、editor tests、dashboard shell tests、必要 browser smoke 和 `git diff --check`。
  - 复查 public diagnostics/result shape JSON-safe、v1/v2 clipboard 向后兼容、默认 paste/placement 行为未破坏。
  _需求追溯: R1.AC8, R8.AC4, R9.AC6, R9.AC7, R9.AC8, R10.AC7, R10.AC8_
