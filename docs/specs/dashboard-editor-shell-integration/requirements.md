# Dashboard Editor Shell Integration 需求规格

## 简介

当前组件库已经具备 dashboard 文档模型、responsive profile 解析与回写、高度/渲染精度 runtime、layout settings migration/collision repair、以及 headless professional editor controller。`VueGridLayout` 和 `DashboardResponsiveVueGridLayout` 仍然保持通用和薄组件边界：它们不内置业务 widget、菜单、弹窗、palette、reference、确认对话框或 ThingsBoard 业务对象。

本规格定义 `dashboard-editor-shell-integration` 的完整交付范围：新增 headless-first 的 dashboard editor shell 层，提供 `useDashboardEditorShell()`、pointer/event 到 grid position 的 helper、paste-at-pointer、select/highlight/scroll-to-item、dashboard/widget context menu descriptor、普通 widget copy/paste、reference copy/paste/replace adapter、remove confirm hook、empty dashboard add affordance、widget palette/drop integration、move-all-widgets、shell events、diagnostics、cleanup、public exports、示例、文档与测试。

本规格完整覆盖 shell integration，但不把组件库升级成完整 BI 产品壳。业务 widget 配置器、entity alias、timewindow、告警、数据源模型、真实菜单/弹窗组件、Material-style UI 和权限后端仍属于应用层或调用方 adapter。shell 层只提供可组合的状态、动作、descriptor 和 adapter contract，并复用现有 editor、dashboard responsive、dashboard migration 和 layout engine 能力。


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/DASH-dashboard-platform/README.md
SPEC_BRIEF: docs/initiatives/DASH-dashboard-platform/briefs/DASH-dashboard-editor-shell-integration.md

COVERAGE: dashboard-shell

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| dashboard-shell | R1-R14 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |

## 需求列表

### R1: Headless Dashboard Editor Shell 边界
**用户故事:** 作为组件库维护者，我希望 dashboard editor shell 是独立的 headless 产品层，以便在提供完整 dashboard 编辑壳能力时不污染基础 grid、dashboard document 或 responsive profile API。
**验收标准 (EARS):**
- R1.AC1: WHEN 实现 dashboard editor shell 能力时，系统 SHALL 提供 `useDashboardEditorShell()` 或等价 headless composable 作为主入口，并 SHALL NOT 将 context menu、palette、confirm dialog、reference 或业务 widget UI 内置到 `VueGridLayout`。
- R1.AC2: WHEN shell 层读取 dashboard 状态时，系统 SHALL 以 `DashboardLayoutDocument`、`DashboardResponsiveRuntime`、`GridEditorController` 和现有 dashboard responsive model 为输入边界，不创建第二套 dashboard schema。
- R1.AC3: WHEN shell 层执行几何编辑、selection、copy、paste、delete、duplicate、save、undo 或 redo 行为时，系统 SHALL 优先复用现有 editor command pipeline，不复制 editor controller 或 clipboard 状态机。
- R1.AC4: WHEN shell 层执行 profile-scoped document write-back、height runtime 查询或 layout settings migration 时，系统 SHALL 复用现有 dashboard responsive、dashboard migration 和 layout engine API，不实现 dashboard-only 几何算法。
- R1.AC5: WHEN 不启用 shell 层时，现有 `VueGridLayout`、`ResponsiveVueGridLayout`、`DashboardResponsiveVueGridLayout`、dashboard document adapter、dashboard responsive profile、editor、persistence 和 layout engine 行为 SHALL 保持兼容。
- R1.AC6: WHEN shell 需要表达业务 widget、reference、confirm 或 palette 行为时，系统 SHALL 通过 adapter/hook/descriptor 暴露扩展点，而不是在核心中内置业务数据源、实体别名、timewindow、告警或 Material-style 菜单。
- R1.AC7: WHEN shell 能力完成时，系统 SHALL 覆盖本规格列出的 context menu、pointer paste、selection/highlight/scroll、widget/reference、empty add、palette/drop、move-all、diagnostics、exports、docs 和 tests 范围，不以分阶段收缩名义遗漏 shell integration 能力。

### R2: Shell 输入、状态与生命周期
**用户故事:** 作为 Vue 集成开发者，我希望 shell composable 能绑定 dashboard responsive runtime、editor controller 和 DOM anchor，以便在自定义产品 UI 中获得稳定的 dashboard 编辑状态和动作。
**验收标准 (EARS):**
- R2.AC1: WHEN 调用 `useDashboardEditorShell()` 时，系统 SHALL 接收 dashboard document 或 document ref、`DashboardResponsiveRuntime` 或 dashboard responsive model、`GridEditorController`、grid/root DOM element ref、mode、layout/profile context、adapter 配置和事件回调。
- R2.AC2: WHEN dashboard responsive runtime 发生 projection、profile、breakpoint、height runtime 或 diagnostics 变化时，shell state SHALL 同步暴露最新 `layoutId`、`requestedBreakpoint`、`resolvedProfileId`、`targetView`、`viewFormat`、`gridSettings`、`heightRuntime`、active/render/hidden item ids 和 diagnostics。
- R2.AC3: WHEN editor selection、mode、dirty、conflict、last command result 或 toolbar availability 变化时，shell state SHALL 反映这些变化，并 SHALL 不复制一套独立 selection 或 dirty state。
- R2.AC4: WHEN shell 被停止或所在组件卸载时，系统 SHALL 清理 watcher、DOM listener、pending scroll/highlight timer、keyboard binding、adapter subscription 和 menu transient state，避免内存泄漏。
- R2.AC5: WHEN 在 SSR 或非浏览器环境中创建 shell 时，系统 SHALL 不访问 `window`、`document`、DOM measurement、clipboard、selection API 或 `scrollIntoView`，除非调用方显式进入客户端安全路径。
- R2.AC6: IF 必需的 editor controller、runtime 或 grid element 缺失，系统 SHALL 返回 degraded shell state 和 diagnostics，并 SHALL 让不可执行 action 返回 structured blocked/error result，而不是抛出未捕获异常。
- R2.AC7: WHEN shell 接收外部受控 document、runtime、selection 或 mode 时，系统 SHALL 以外部输入为准，并通过 `documentChange`、`update` request 或等价事件表达 proposed document/runtime 变化，不直接覆盖受控值；WHEN shell 使用非受控内部 document ref 时，系统 MAY 在 action 成功后更新内部状态。

### R3: Pointer/Event 到 Grid Position Helper
**用户故事:** 作为 dashboard 编辑用户，我希望右键菜单、键盘粘贴和 palette drop 都能落在用户指向的位置，以便 widget 添加和粘贴符合专业编辑器直觉。
**验收标准 (EARS):**
- R3.AC1: WHEN 调用 `getEventGridPosition(event)` 或等价 helper 时，系统 SHALL 根据 grid/root element、event client/page coordinates、scroll offset、width、cols、margin、containerPadding、rowHeight 和 height runtime 计算 `{ x, y }` grid position。
- R3.AC2: WHEN event 来自 pointer/mouse/contextmenu/touch/pointer-like 输入并包含坐标时，系统 SHALL 使用事件坐标作为首选位置来源。
- R3.AC3: WHEN event 来自 keyboard paste 或不包含坐标时，系统 SHALL 使用 active item、selection bounds、last pointer position、viewport center 或 configured fallback policy 计算确定性位置，并在 diagnostics 中标记来源。
- R3.AC4: WHEN position 计算产生负坐标、超出 columns 或非法数字时，系统 SHALL clamp 到合法 grid bounds 或返回可诊断 blocked result，不得向 editor command 传入 `NaN`、负数或无限坐标。
- R3.AC5: WHEN resolved runtime 为 list viewFormat 时，系统 SHALL 将 event position 映射到 list insertion index 或等价 list row position，并 SHALL 不把 mobile/list-only 排序字段直接写入 `LayoutItem`。
- R3.AC6: WHEN grid 使用 subpixel render precision、fit/fixed/scroll height mode、container scroll 或 transform positioning 时，helper SHALL 仍产生稳定的整数 grid position，并 SHALL 与当前 rendered item/placeholder 对齐。
- R3.AC7: WHEN 多次对同一 DOM geometry、runtime 和 event 调用 helper 时，系统 SHALL 输出稳定结果，除非 scroll、container measurement 或 runtime 输入发生变化。

### R4: Paste at Pointer 与 Placement 集成
**用户故事:** 作为 dashboard 编辑用户，我希望复制或从 palette 选择的 widget 能粘贴到光标或菜单打开的位置，以便不需要先落到默认角落再手动移动。
**验收标准 (EARS):**
- R4.AC1: WHEN 调用 `pasteAtEvent(event)` 或 `pasteAtGridPosition(position)` 时，shell SHALL 通过现有 editor `paste` command 执行普通 layout item 粘贴，并传入 `strategy: "cursor"` 或等价 cursor placement payload。
- R4.AC2: WHEN cursor 位置发生 collision、bounds 或 maxRows 冲突时，系统 SHALL 复用现有 editor placement、layout engine fit 或 dashboard migration placement 能力执行 nearest-fit/first-fit fallback，并返回 command result diagnostics。
- R4.AC3: WHEN 粘贴发生在 dashboard responsive profile 上时，系统 SHALL 通过 existing profile-scoped write-back 将 committed geometry 写回目标 document/profile，不得意外覆盖 default layout 或其他 profiles。
- R4.AC4: WHEN paste action 由 context menu、keyboard shortcut、toolbar、API 或 palette/drop 触发时，系统 SHALL 使用同一 shell action 和同形状 result/event payload。
- R4.AC5: IF clipboard 为空、不可用、权限失败、payload 非法或 adapter 拒绝，系统 SHALL 返回 structured blocked/error result，并 SHALL 保持 dashboard document、layout 和 editor metadata 不变。
- R4.AC6: WHEN paste payload 包含多个 items 时，系统 SHALL 保持 item 相对几何或按 placement policy 确定性放置，并 SHALL 在结果中暴露实际 affected ids。
- R4.AC7: WHEN paste action 发生在 list/mobile runtime 中，系统 SHALL 按 runtime write-back 规则映射排序和高度，不得默认覆盖 desktop-only geometry 或 mobile-only fields。

### R5: Selection、Highlight 与 Scroll-to-Item
**用户故事:** 作为 dashboard 编辑用户，我希望可以通过菜单、外部列表、搜索结果或业务事件选择、高亮并滚动到指定 widget，以便在复杂 dashboard 中快速定位目标。
**验收标准 (EARS):**
- R5.AC1: WHEN 调用 `selectItem(id)` 时，shell SHALL 通过现有 editor selection command 或 controller API 更新 selection，并返回 selection command result。
- R5.AC2: WHEN 调用 `highlightItem(id, options)` 时，shell SHALL 设置 transient highlight state、发出 shell event，并 SHALL NOT 将 highlight 写入 `DashboardLayoutDocument`、`LayoutItem`、`editorMetaById`、history 或 persistence。
- R5.AC3: WHEN 调用 `resetHighlight()` 时，shell SHALL 清理当前 transient highlight state，并取消相关 timer 或 pending scroll side effect。
- R5.AC4: WHEN 调用 `scrollToItem(id, options)` 时，shell SHALL 在客户端安全路径中查找 item DOM node，并根据 container、targetView、height runtime 和 caller options 滚动到可见位置。
- R5.AC5: WHEN item 当前在 view runtime 中因 `mobileHide`、`desktopHide` 或 profile/list filtering 不渲染时，shell SHALL 返回 structured blocked result 或触发可选 reveal/request event，而不得删除隐藏状态或强行 materialize item。
- R5.AC6: WHEN item id 不存在、DOM node 尚未挂载或 grid element 不可用时，shell SHALL 返回 diagnostics，并 SHALL 支持延迟重试或 caller-provided fallback。
- R5.AC7: WHEN selection/highlight/scroll action 成功、失败或被阻止时，系统 SHALL 发出结构化 shell event，包含 action id、item id、reason、profile context 和 diagnostics。

### R6: Context Menu Descriptor Contract
**用户故事:** 作为产品集成开发者，我希望 shell 能生成 dashboard 和 widget context menu 描述，以便我可以使用自己的菜单组件、图标、权限和国际化系统。
**验收标准 (EARS):**
- R6.AC1: WHEN 调用 `prepareDashboardContextMenu(event)` 时，shell SHALL 返回 dashboard-level menu descriptors，至少覆盖 paste、paste reference、add widget、open palette、move all widgets、dashboard settings hook 和 caller-defined custom items。
- R6.AC2: WHEN 调用 `prepareWidgetContextMenu(event, itemId)` 时，shell SHALL 返回 widget-level menu descriptors，至少覆盖 select、edit hook、copy widget、copy reference、duplicate、delete/remove、replace reference with widget copy、scroll/highlight 和 caller-defined custom items。
- R6.AC3: WHEN 返回 menu descriptor 时，系统 SHALL 只输出 plain data 和 action callbacks，例如 `id`、`label`、`icon`、`shortcut`、`enabled`、`checked`、`danger`、`hidden`、`reason`、`action`、`metadata`，并 SHALL NOT 渲染菜单 DOM 或绑定特定 UI library。
- R6.AC4: WHEN mode 为 view、editor readonly、item locked、item hidden、clipboard 不可用、reference adapter 不可用或 policy guard 阻止时，descriptor SHALL 标记对应 item disabled/hidden/reason，而不是静默移除关键能力。
- R6.AC5: WHEN menu action 被执行时，系统 SHALL 调用同一个 shell action pipeline，并返回同形状 result/event payload，不因 action 来自 menu 而绕过 editor `beforeCommand` 或 dashboard adapter。
- R6.AC6: WHEN caller 需要国际化或自定义文案时，系统 SHALL 支持 descriptor 使用 message key/label factory/custom metadata，而不把英文或中文 UI 文案硬编码为公共 API。
- R6.AC7: WHEN context menu 由 event 打开时，shell SHALL 存储 last menu position 作为 paste-at-pointer fallback，并 SHALL 在菜单关闭、action 完成或 shell stop 时清理 transient menu state。

### R7: Widget Copy、Paste、Duplicate 与 Remove Shell Actions
**用户故事:** 作为 dashboard 产品开发者，我希望 shell 能协调 layout item 与业务 widget payload 的复制、粘贴、重复和删除，以便 dashboard 编辑行为既更新几何布局，也能让业务层同步 widget 数据。
**验收标准 (EARS):**
- R7.AC1: WHEN 调用 `copyWidget(itemId)` 或 multi-selection copy 时，shell SHALL 复用现有 editor copy command 复制 layout/editor metadata，并 SHALL 通过 optional widget adapter 复制业务 widget payload。
- R7.AC2: WHEN 调用 `pasteWidget(eventOrPosition)` 时，shell SHALL 复用 paste-at-pointer placement，并 SHALL 在 widget adapter 存在时请求业务方创建或克隆对应 widget payload。
- R7.AC3: WHEN 调用 `duplicateWidget(itemId)` 时，shell SHALL 复用现有 editor duplicate command，并 SHALL 通过 widget adapter 生成新的业务 widget id/payload 或返回 adapter-required diagnostic。
- R7.AC4: WHEN 调用 `removeWidget(itemId)` 时，shell SHALL 先执行 optional confirm hook；confirm allow 后再执行 editor delete/remove pipeline 和 widget adapter removal hook。
- R7.AC5: IF confirm hook 返回 cancel、block、timeout 或 error，系统 SHALL 不修改 layout、document、editor metadata 或 widget payload，并 SHALL 返回 structured result。
- R7.AC6: WHEN shell action 同时涉及 widget/reference adapter 与 layout/document mutation 时，系统 SHALL 使用 prepare/commit/rollback 事务顺序：先由 adapter prepare 生成或校验业务 payload 与 id，再执行 editor command 和 dashboard write-back，最后调用 adapter commit；IF 任一阶段失败，系统 SHALL 不提交部分 document mutation，并 SHALL 调用 caller-controlled rollback/compensation hook 或返回可恢复 result。
- R7.AC7: WHEN widget adapter 生成的新 widget id 与 layout id 不一致或冲突时，系统 SHALL 使用可配置 id mapping/id generator 生成稳定唯一 id，并 SHALL 在 result 中返回 old/new id mapping。
- R7.AC8: WHEN 业务方不提供 widget adapter 时，普通 editor copy/paste/duplicate/delete SHALL 仍可处理 layout/editor metadata，但 shell SHALL 在 diagnostics 中标记 business payload 未处理。

### R8: Reference Adapter、Paste Reference 与 Replace Reference
**用户故事:** 作为 dashboard 产品开发者，我希望 shell 完整支持 widget reference 的复制、粘贴和替换，但 reference 的真实业务语义由应用层 adapter 提供，以便组件库不绑定特定 BI 产品模型。
**验收标准 (EARS):**
- R8.AC1: WHEN shell 配置 `referenceAdapter` 时，系统 SHALL 支持 `canCopyReference`、`copyReference`、`canPasteReference`、`pasteReference`、`canReplaceReference` 和 `replaceReferenceWithWidgetCopy` 或等价完整 contract。
- R8.AC2: WHEN 调用 `copyWidgetReference(itemId)` 时，shell SHALL 通过 reference adapter 创建 reference payload，并 SHALL 不要求 `LayoutItem` 或 dashboard item schema 内置业务 reference 字段。
- R8.AC3: WHEN 调用 `pasteWidgetReference(eventOrPosition)` 时，shell SHALL 使用 pointer/list insertion helper 计算目标位置，并 SHALL 通过 reference adapter 创建 reference widget/document mutation，再通过 dashboard/profile write-back 提交对应 layout。
- R8.AC4: WHEN 调用 `replaceReferenceWithWidgetCopy(itemId)` 时，shell SHALL 通过 reference adapter 将 reference 变成独立 widget copy，并 SHALL 保持几何位置、selection、highlight 和 profile context 可预测。
- R8.AC5: IF reference adapter 不存在或某个 reference action 不可用，context menu descriptor SHALL 显示 disabled/hidden/reason，并 action SHALL 返回 structured unsupported result。
- R8.AC6: IF reference adapter 返回非法 payload、重复 id、unknown item、validation error 或 rejected promise，系统 SHALL 不提交部分 document mutation，并 SHALL 返回包含 adapter error 的 diagnostics。
- R8.AC7: WHEN reference action 成功时，result SHALL 包含 source item id、new item id、layout/profile context、adapter payload metadata 和 affected ids，供应用层 toast、audit 或 persistence 使用。
- R8.AC8: WHEN reference payload 包含业务敏感字段时，组件库 SHALL 不持久化、解析或记录该 payload 内容，除非调用方显式通过 dashboard extensions 或 adapter result 要求保存。

### R9: Empty Dashboard Add、Widget Palette 与 Drop Integration
**用户故事:** 作为 dashboard 编辑用户，我希望空 dashboard 或需要新增 widget 时有清晰入口，并能从 palette/drop 把 widget 加到目标位置，以便新建 dashboard 不需要手写布局数据。
**验收标准 (EARS):**
- R9.AC1: WHEN active/render item ids 为空且 mode 为 edit 时，shell SHALL 暴露 empty dashboard add affordance state，包含 enabled、reason、target layout/profile context 和 recommended action descriptors。
- R9.AC2: WHEN 调用 `openWidgetPalette(eventOrContext)` 时，shell SHALL 触发 caller-provided palette hook/event，并 SHALL 不内置 palette UI、widget catalog、搜索、分类或业务 widget 配置器。
- R9.AC3: WHEN palette 返回 widget template 或 business widget payload 时，shell SHALL 通过 widget adapter 和 layout engine placement 将新 item 添加到 event/grid/list position。
- R9.AC4: WHEN 外部 drop 进入 grid 时，shell SHALL 能接收 drop payload、计算 candidate position、请求 placement preview 或 final add action，并 SHALL 与现有 `drop` / `dropDragOver` / editor placeholder 边界兼容。
- R9.AC5: WHEN add/drop 发生 collision、bounds、maxRows 或 missing profile write-back 问题时，系统 SHALL 返回 structured blocked/error result，并 SHALL 不创建孤立业务 widget payload。
- R9.AC6: WHEN add/drop 成功时，shell SHALL 选中新 item、可选高亮/滚动到新 item，并发出包含 new item id、profile context、placement source 和 diagnostics 的 event。
- R9.AC7: WHEN view mode、readonly、permission guard、invalid template 或 adapter 不可用时，empty add、palette add 和 drop action SHALL disabled/blocked，并提供可解释 reason。

### R10: Move All Widgets 与 Bulk Shell Operations
**用户故事:** 作为 dashboard 管理用户，我希望可以整体移动 dashboard widgets 或执行批量 shell 操作，以便修正导入布局偏移或调整 dashboard 空白区域。
**验收标准 (EARS):**
- R10.AC1: WHEN 调用 `moveAllWidgets(dx, dy)` 或等价 shell action 时，系统 SHALL 复用 `translateDashboardLayout`、layout engine `translateLayout` 或 existing dashboard migration capability 执行整体平移。
- R10.AC2: WHEN `dx/dy` 导致负坐标时，系统 SHALL 按已有 translate clamp 策略避免产生负 `x/y`，并在 diagnostics 中标记实际 applied delta。
- R10.AC3: WHEN 平移后发生 collision、bounds 或 maxRows 问题时，系统 SHALL 按 configured repair policy 执行 repair 或返回 blocked/unresolved result。
- R10.AC4: WHEN move-all 作用在 default layout 时，系统 SHALL 只更新 default layout；WHEN 作用在 profile 时，系统 SHALL 只更新目标 profile overrides 和 settings，不得污染其他 profiles。
- R10.AC5: WHEN move-all 成功时，系统 SHALL 更新 selection/highlight/scroll target 的相对语义，并 SHALL 返回 affected ids、patches、repair/migration diagnostics 和 document change event。
- R10.AC6: WHEN selected/bulk delete、copy、hide/show、lock/unlock 等批量 shell action 被触发时，系统 SHALL 复用 existing editor command availability 和 `beforeCommand` guard，并 SHALL 不绕过 locked/static/hidden capability。
- R10.AC7: IF bulk operation 部分失败且 command policy 为 all-or-nothing，系统 SHALL 不提交部分 mutation；IF policy 为 skip-blocked，系统 SHALL 在 result 中列出 skipped ids 和原因。

### R11: Keyboard、Focus 与 Shell Shortcut 集成
**用户故事:** 作为专业 dashboard 编辑用户，我希望 shell context menu 和 widget/reference action 可以通过键盘触发，以便不依赖鼠标也能完成常见编辑动作。
**验收标准 (EARS):**
- R11.AC1: WHEN shell keyboard integration 启用时，系统 SHALL 支持配置 shortcut 到 shell actions，例如 copy widget、copy reference、paste at last pointer/focus position、paste reference、delete/remove、open context menu、open palette 和 move-all trigger。
- R11.AC2: WHEN focus 位于 input、textarea、select、contenteditable 或 caller-configured ignored target 时，shell SHALL 不拦截文本编辑快捷键。
- R11.AC3: WHEN keyboard paste 没有 pointer position 时，shell SHALL 使用 active item、selection bounds、last menu position、last pointer position 或 viewport center fallback，并 SHALL 在 diagnostics 中记录 position source。
- R11.AC4: WHEN shell action 改变 layout/document/editor metadata 时，系统 SHALL 通过 editor command/history/persistence 边界提交，而不是在 keyboard handler 中直接修改 document。
- R11.AC5: WHEN keyboard shell action 被阻止、取消或失败时，系统 SHALL 调用可选 aria/toast/message hook，并 SHALL 返回 structured result。
- R11.AC6: WHEN shell keyboard binding 创建或销毁时，系统 SHALL 支持 cleanup，并 SHALL 避免与现有 editor keyboard binding 重复执行同一 command。
- R11.AC7: WHEN context menu descriptor 暴露 shortcut 时，系统 SHALL 让 descriptor shortcut 与实际 keyboard binding 可由同一配置派生或校验，避免 UI 显示和行为不一致。

### R12: Events、Diagnostics、Transaction 与 Error Semantics
**用户故事:** 作为大型产品集成者，我希望 shell actions 的事件、错误和诊断有统一结构，以便接入 toast、审计、状态管理、冲突处理和自动化测试。
**验收标准 (EARS):**
- R12.AC1: WHEN shell action 开始、成功、被阻止、取消、失败或完成 cleanup 时，系统 SHALL 发出结构化 shell event，包含 action type、source、item ids、profile context、position source、command result、adapter result 和 diagnostics。
- R12.AC2: WHEN shell action 调用 editor command 时，shell event SHALL 关联 editor command id/result，并 SHALL 保持现有 editor event 顺序可追踪。
- R12.AC3: WHEN shell action 调用 dashboard write-back、widget adapter 或 reference adapter 时，result SHALL 表达每个阶段的状态，避免 layout 成功但业务 payload 失败时被误报为成功。
- R12.AC4: IF 任一 action 因 mode-readonly、capability、locked、hidden、missing item、clipboard、adapter、validation、profile write-back、collision、bounds、confirm cancel 或 permission guard 被阻止，系统 SHALL 返回明确 reason 和 recoverable hint。
- R12.AC5: WHEN diagnostics 输出时，系统 SHALL 保持 JSON-safe、稳定顺序，并包含 layoutId、resolvedProfileId、requestedBreakpoint、targetView、viewFormat、itemId、actionId 和 path/source metadata。
- R12.AC6: WHEN action 包含业务 adapter payload 时，diagnostics SHALL 默认只记录 adapter status、ids 和 error code，不记录敏感业务 payload 内容。
- R12.AC7: WHEN caller 需要事务控制时，shell SHALL 支持 prepare/commit/rollback 或 equivalent transaction coordinator，以便应用层在 adapter payload、editor command、dashboard write-back 和 persistence 之间决定提交、回滚、补偿或延迟持久化。
- R12.AC8: WHEN shell action 成功产生 proposed 或 new dashboard document 时，系统 SHALL NOT 自动持久化该 document；系统 SHALL 只发出 action result、`documentChange`/`update` request 或等价 proposed document event，保存仍由现有 editor save、dashboard persistence 或应用层显式触发。

### R13: Public API、导出与类型契约
**用户故事:** 作为库消费者，我希望 shell 能力有稳定可导入的 API 和类型，以便在 TypeScript、CommonJS、ESM 和文档示例中一致使用。
**验收标准 (EARS):**
- R13.AC1: WHEN shell API 完成时，系统 SHALL 从 public surface 导出 `useDashboardEditorShell()`、position helper、menu descriptor 类型、shell options/state/action/result/event/diagnostic 类型、widget adapter 类型和 reference adapter 类型。
- R13.AC2: WHEN 更新 CommonJS 导出时，系统 SHALL 在 `lib/cjs.ts` 中暴露 shell namespace 和常用顶层 helper，并 SHALL 不破坏现有 exports。
- R13.AC3: WHEN 更新 typings 时，系统 SHALL 确保 shell options、state、actions、descriptors、adapter contracts、events 和 diagnostics 可被库消费者导入并通过类型测试。
- R13.AC4: WHEN shell API 使用 DOM element、event 或 adapter callback 类型时，系统 SHALL 为 SSR-safe usage 提供可选/nullable 类型和 degraded result，而不是要求所有环境都有 DOM。
- R13.AC5: WHEN API 命名与 ThingsBoard 行为相似时，系统 SHALL 使用本库长期一致的命名，并通过 adapter/helper 映射 ThingsBoard-style 概念，不强制核心 API 采用 Angular/Gridster 命名。
- R13.AC6: WHEN 公共 API 暴露 action result 时，系统 SHALL 与 existing editor command result、dashboard write result 和 layout operation result 可组合，而不是定义互不兼容的 result shape。

### R14: 示例、文档与测试
**用户故事:** 作为维护者和集成开发者，我希望 shell integration 有完整示例、文档和自动化覆盖，以便这些产品壳能力不会在后续迭代中退化。
**验收标准 (EARS):**
- R14.AC1: WHEN 更新示例时，系统 SHALL 扩展或新增 professional dashboard editor 示例，展示 context menu descriptor、paste at pointer、select/highlight/scroll、empty add、palette hook、copy/paste widget、copy/paste reference mock、replace reference mock、remove confirm hook 和 move all widgets。
- R14.AC2: WHEN 示例实现菜单、弹窗或 palette 时，系统 SHALL 将它们保留为示例 UI，不把其 DOM、样式、文案或组件库作为公共 API。
- R14.AC3: WHEN 更新 README 或 docs 时，系统 SHALL 说明 shell 与 `VueGridLayout`、`DashboardResponsiveVueGridLayout`、editor controller、dashboard document、responsive profile、migration/repair、widget adapter 和 reference adapter 的关系。
- R14.AC4: WHEN 编写单元测试时，系统 SHALL 覆盖 position helper、menu descriptor availability、paste-at-pointer payload、selection/highlight transient state、scroll degraded result、widget adapter transaction、reference adapter unsupported/error 和 diagnostics stability。
- R14.AC5: WHEN 编写浏览器或组件测试时，系统 SHALL 覆盖 contextmenu event 到 menu descriptor、paste at pointer 实际落位、empty dashboard add、scroll/highlight DOM state、keyboard paste fallback、menu cleanup 和 view/edit mode gating。
- R14.AC6: WHEN 编写 dashboard integration tests 时，系统 SHALL 覆盖 profile-scoped paste/add/remove/move-all write-back、missing profile blocking、list/mobile position mapping、unknown field preservation 和失败不覆盖原 document。
- R14.AC7: WHEN 编写导出/类型测试时，系统 SHALL 确认 shell namespace、types、CJS/ESM exports 与 existing dashboard/editor exports 兼容。
- R14.AC8: WHEN 完成本规格时，系统 SHALL 通过相关 editor、dashboard、dashboard responsive、layout migration、browser smoke、typing/export 和 build/test command，或明确记录无法运行的验证缺口。

## Clarifications

### Session 2026-05-19

- Q: `dashboard-editor-shell-integration` 选择哪条方案？ -> A: 选择 A：`useDashboardEditorShell()` headless-first composable，完整覆盖 shell integration，不做内置产品 UI。
- Q: 是否以阶段化范围收缩交付？ -> A: 不收缩；本规格一次性完整定义 shell integration 范围。
- Q: “全做完”是否表示实现完整 BI dashboard 产品壳？ -> A: 不是。全做完的是 shell integration；业务 widget 配置器、entity alias、timewindow、告警、数据源模型、真实菜单/弹窗组件仍由应用层或 adapter 提供。
- Q: reference copy/paste 是否纳入范围？ -> A: 纳入完整 adapter 契约，包括 copy/paste/replace/reference availability/error/result，但真实业务 reference payload 不由组件库定义。
- Q: highlight 是否持久化？ -> A: 不持久化；highlight 是 transient shell state，不写入 `LayoutItem`、`DashboardLayoutDocument`、`editorMetaById`、history 或 persistence。
- Q: context menu 由谁渲染？ -> A: shell 只返回 menu descriptors 和 action callbacks；菜单 DOM、样式、图标渲染、国际化和弹窗由调用方或示例 UI 负责。
- Q: paste at pointer 如何落位？ -> A: shell 负责 event/grid/list position helper，并复用现有 editor paste cursor strategy、layout engine placement 和 dashboard/profile write-back。
- Q: shell action 涉及业务 `widgetAdapter/referenceAdapter` 和 layout/document mutation 时，事务顺序应该怎么定义？ -> A: 选择 B：adapter 先 prepare 生成或校验业务 payload 与 id，再执行 editor command 和 dashboard write-back，最后 adapter commit；失败时不提交部分 document mutation，并走 rollback/compensation hook 或可恢复 result。
- Q: shell action 产生新的 dashboard document 时，document ownership 应该怎么定义？ -> A: 选择 B：controlled-first。外部受控 document 时 shell 只发 `documentChange`、`update` request 或等价 proposed document 事件；非受控内部 document ref 时，shell action 成功后可以更新内部状态。
- Q: shell action 成功产生 proposed/new document 后，是否应该自动持久化？ -> A: 选择 A：不自动持久化。shell 只负责 action result、proposed document 和 update event；保存仍由现有 editor save、dashboard persistence 或应用层显式触发。
