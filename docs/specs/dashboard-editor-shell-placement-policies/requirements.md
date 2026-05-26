# Dashboard Editor Shell Widget Placement Policies 需求规格

## 简介

当前 `dashboard-editor-shell` 已经提供 widget palette、add widget、paste widget、paste reference、drop、move all、profile-scoped write-back 和 adapter transaction 等编辑壳能力。现有示例中 `Add widget` 依赖底部插入位置，导致新增 widget 总是落在 dashboard 下方；这不符合企业级 dashboard 编辑器对“从左上开始填充”“在顶部插入并整体下移”的常见预期，也让示例噪音盖过了组件库能力本身。

本规格定义 `dashboard-editor-shell-placement-policies`：在 shell/editor 组件能力层提供可配置、可测试、可诊断的 widget 放置策略，并让示例只负责选择策略、展示结果和解释行为。核心交付包含两类策略：`first-fit` 从左上角开始按行扫描空位；`insert-top-shift` 始终在左上角插入并将现有布局整体下移。两者应服务于 `openWidgetPalette`、`addWidgetFromTemplate`、`pasteWidgetReference`、drop 和相关菜单/快捷键入口，而不是只在某个 demo 内写特殊逻辑。

本规格不要求实现完整企业 dashboard 产品 UI，不内置业务 widget 配置器、真实 palette、权限后端或特定设计系统组件。示例需要达到企业级展示效果，但公共能力边界仍保持 headless-first：策略、事务、diagnostics 和 write-back 在组件库中，视觉呈现和文案解释在示例与调用方中。


## Initiative Alignment

INITIATIVE_SOURCE: docs/initiatives/DASH-dashboard-platform/README.md
SPEC_BRIEF: docs/initiatives/DASH-dashboard-platform/briefs/DASH-dashboard-editor-shell-placement-policies.md

COVERAGE: placement-policies

### Coverage Mapping

| Coverage | Requirements | 说明 |
|---|---|---|
| placement-policies | R1-R8 | Legacy migration anchor: existing requirements are mapped to this initiative coverage slice. |

### Question Handling

| Question | Handling | 说明 |
|---|---|---|
| none | non-blocking | 本历史 spec 迁移时没有从 initiative brief 引入新的 blocking question。 |

## 需求列表

### R1: Shell 层 Placement Policy 公共边界
**用户故事:** 作为组件库消费者，我希望新增 widget、粘贴 reference 和 palette/drop 都能显式选择放置策略，以便产品可以在不同编辑场景中复用同一套企业级布局行为。
**验收标准 (EARS):**
- R1.AC1: WHEN 调用 `addWidgetFromTemplate`、`openWidgetPalette`、`pasteWidgetReference`、drop add 或等价 shell add action 时，系统 SHALL 支持传入明确的 placement policy，并 SHALL 不要求示例自行计算最终 `x/y`。
- R1.AC2: WHEN placement policy 未传入时，系统 SHALL 保持现有默认行为兼容，不得破坏既有 cursor、nearest-fit、first-fit、paste 和 drop 测试。
- R1.AC3: WHEN public API 暴露 placement policy 时，系统 SHALL 提供类型安全的枚举或等价 union，至少覆盖 `first-fit` 和 `insert-top-shift`，并保留现有 `cursor`、`nearest-fit` 或兼容 alias。
- R1.AC4: WHEN 不同入口触发同一类新增行为时，系统 SHALL 使用同一个 shell/editor placement pipeline，不得在 toolbar、context menu、keyboard、palette 和 drop 中复制不同算法。
- R1.AC5: WHEN placement policy 执行完成时，action result SHALL 暴露实际策略、实际落点、affected ids、position source、是否发生 reflow/shift、diagnostics 和 blocked reason。
- R1.AC6: WHEN placement policy 无法执行时，系统 SHALL 返回 structured blocked/error result，并 SHALL 保持 layout、dashboard document、editor metadata 和业务 adapter payload 不变。
- R1.AC7: WHEN 示例需要展示策略时，示例 SHALL 通过公共 shell 配置或 action option 选择策略，不得依赖 demo-only helper 绕过组件能力。

### R2: `first-fit` 左上优先填充策略
**用户故事:** 作为 dashboard 编辑用户，我希望点击 Add widget 时新 widget 从左上角开始寻找第一个可用空位，以便空白 dashboard 和半空首行都能得到直觉且紧凑的布局。
**验收标准 (EARS):**
- R2.AC1: WHEN active layout 第一行没有任何 widget 且新增 item 尺寸合法时，`first-fit` SHALL 将新 item 放置在 `{ x: 0, y: 0 }`。
- R2.AC2: WHEN 第一行已有 widget 但仍存在可容纳新增 item 的连续空位时，`first-fit` SHALL 按 `x` 从左到右扫描并放入该行第一个合法空位。
- R2.AC3: WHEN 第一行无法容纳新增 item 时，`first-fit` SHALL 继续按 `y` 从小到大、同一行 `x` 从小到大扫描后续行，直到找到第一个合法空位。
- R2.AC4: WHEN widget 尺寸、列数、min/max 约束或 hidden/render 状态影响可放置性时，系统 SHALL 以当前 active runtime layout 和 resolved grid settings 为准计算合法空位。
- R2.AC5: WHEN 多次对同一 layout、item size、cols、maxRows 和 policy 执行 `first-fit` 时，系统 SHALL 产生稳定一致的落点和 diagnostics。
- R2.AC6: IF 新增 item 的 `w/h` 非法、超过 `cols/maxRows` 或无法满足约束，系统 SHALL block 或按既有 normalize policy 处理，并 SHALL 在 diagnostics 中解释原因。
- R2.AC7: IF `maxRows` 内不存在合法空位，系统 SHALL 阻止新增 action，不得把 widget 追加到 maxRows 之外，也不得创建孤立业务 payload。
- R2.AC8: WHEN active layout 中存在 hidden、static、locked 或当前视图未渲染但仍属于该 layout 的 widgets 时，`first-fit` SHALL 默认将它们视为占位项，不得把新 item 放入其几何区域。

### R3: `insert-top-shift` 顶部插入并整体下移策略
**用户故事:** 作为 dashboard 编辑用户，我希望新增 widget 可以始终插入左上角，并让已有 widget 整体下移，以便在 dashboard 顶部补充关键指标时不需要手工重排。
**验收标准 (EARS):**
- R3.AC1: WHEN 使用 `insert-top-shift` 新增 item 时，系统 SHALL 以 `{ x: 0, y: 0 }` 作为新 item 的目标落点。
- R3.AC2: WHEN `{ x: 0, y: 0 }` 或新增 item 占用区域与现有 widget 冲突时，系统 SHALL 将 active layout 中全部现有 widgets 按新增 item 高度向下平移，形成可提交布局。
- R3.AC3: WHEN 现有 widget 标记为 static、locked 或等价不可直接拖拽状态时，系统 SHALL 允许它们随本次 layout-level reflow 一起下移，并 SHALL 不因此开启用户直接拖拽、resize 或 remove 权限。
- R3.AC4: WHEN 整体下移后会导致任一 item 超出 `maxRows`、违反 bounds、产生不可修复碰撞或无法写回 profile 时，系统 SHALL 阻止整个 action，并 SHALL 保持原 layout 与业务 payload 不变。
- R3.AC5: WHEN `insert-top-shift` 成功时，系统 SHALL 返回被插入 item id、所有被移动 item ids、applied delta、before/after geometry summary 和 diagnostics。
- R3.AC6: WHEN `insert-top-shift` 面对空 layout 时，系统 SHALL 等价于将 item 放置在 `{ x: 0, y: 0 }`，且不产生无意义 shift diagnostics。
- R3.AC7: WHEN active layout 包含多列、多行、不同高度或局部空洞时，系统 SHALL 使用确定性 reflow 规则，避免同一输入在不同入口产生不同下移结果。
- R3.AC8: WHEN `insert-top-shift` 执行时，系统 SHALL 将其作为明确 add/insert commit 的一次性线性 layout 变更处理，并 SHALL NOT 在 drag/resize preview 的高频路径中反复执行全量下移。

### R4: 事务、Adapter 与失败原子性
**用户故事:** 作为企业产品集成者，我希望 placement policy 与业务 widget/reference adapter 协同时具备原子性，以便不会出现 layout 失败但业务 payload 已创建的脏状态。
**验收标准 (EARS):**
- R4.AC1: WHEN add/paste/drop action 需要业务 widget 或 reference adapter 时，系统 SHALL 先执行 adapter prepare 或 validate，再执行 editor/layout placement，再执行 dashboard write-back，最后执行 adapter commit。
- R4.AC2: IF placement policy 因 collision、bounds、maxRows、invalid template、missing profile、guard 或 write-back 失败而 blocked，系统 SHALL 不调用 adapter commit，并 SHALL 调用 rollback/compensation hook 或返回可恢复结果。
- R4.AC3: IF adapter prepare 失败、返回重复 id、非法 payload 或 rejected promise，系统 SHALL 不执行 layout mutation，并 SHALL 返回 adapter diagnostics。
- R4.AC4: WHEN editor command 成功但 document write-back 或 adapter commit 失败时，系统 SHALL 不向调用方报告成功，并 SHALL 避免提交部分 document mutation。
- R4.AC5: WHEN action result 输出 diagnostics 时，系统 SHALL 默认只暴露 adapter 状态、ids、error code 和阶段信息，不记录敏感业务 payload 内容。
- R4.AC6: WHEN 新 item id 由 adapter 或 id generator 生成时，系统 SHALL 在 result 中返回 old/new id mapping，供调用方 toast、audit 或 persistence 使用。

### R5: Responsive Profile 与 List/Mobile Write-back
**用户故事:** 作为 dashboard profile 用户，我希望新增策略只影响当前编辑的 runtime/profile，以便 desktop、mobile、list 或 breakpoint profile 不会被意外污染。
**验收标准 (EARS):**
- R5.AC1: WHEN placement policy 在 dashboard responsive runtime 上执行时，系统 SHALL 只写回当前 action 指定的 layout/profile context。
- R5.AC2: WHEN 当前 runtime 使用 fallback default 且目标 profile 缺失时，系统 SHALL 按既有 profile write-back policy 创建缺失 profile 或阻止 action，并在 diagnostics 中标记选择。
- R5.AC3: WHEN action 作用于 default layout 时，系统 SHALL 不覆盖已有 profile overrides；WHEN action 作用于指定 profile 时，系统 SHALL 不污染 default layout 或其他 profiles。
- R5.AC4: WHEN runtime 为 list/mobile viewFormat 时，系统 SHALL 按现有 list/mobile write-back 语义映射顺序和高度，不得把 desktop-only 几何字段误写到 mobile-only 字段。
- R5.AC5: WHEN `insert-top-shift` 在 profile 上移动 inherited item 时，系统 SHALL 只为发生几何变化且需要覆盖的 item 写入 profile override，不得全量 materialize effective layout。
- R5.AC6: WHEN write-back 失败或返回 unresolved diagnostics 时，系统 SHALL block 整个 action，并 SHALL 返回 unchanged document 或等价不变结果。

### R6: 菜单、工具栏、快捷键与示例消费
**用户故事:** 作为示例和产品 UI 开发者，我希望 Add widget、Paste reference、Drop、Move all up/down 等入口共享可解释的 shell action，以便企业级示例清晰展示组件能力而不是制造 UI 噪音。
**验收标准 (EARS):**
- R6.AC1: WHEN toolbar、context menu、keyboard shortcut 或 empty dashboard affordance 触发 add widget 时，系统 SHALL 允许它们选择相同 placement policy 并返回同形状 result。
- R6.AC2: WHEN context menu descriptor 暴露 add/paste/drop 相关 action 时，descriptor SHALL 包含 policy metadata、enabled/disabled state 和 reason，供调用方渲染企业级菜单。
- R6.AC3: WHEN 示例展示 `first-fit` 时，用户 SHALL 能看出它从左上开始补空、首行未满则继续向右、首行满后进入下一行。
- R6.AC4: WHEN 示例展示 `insert-top-shift` 时，用户 SHALL 能看出它在左上插入、已有 widgets 整体下移，并能看到 maxRows blocked 或成功 diagnostics。
- R6.AC5: WHEN 示例提供 Move all 能力时，系统 SHALL 同时暴露向上和向下入口，且 SHALL 复用 `moveAllWidgets(0, dy)` 或等价 shell action。
- R6.AC6: WHEN 示例文案、布局或辅助信息与本例核心策略无关时，示例 SHALL 清理该噪音，优先展示策略选择、结果、adapter/write-back 阶段和当前布局变化。
- R6.AC7: WHEN 示例 UI 达到企业级效果时，它 SHALL 保持视觉层属于 example，不把具体样式、文案或 Fluent-like 组件实现变成公共 API。

### R7: 兼容性、命名与迁移
**用户故事:** 作为现有库用户，我希望新增 placement policies 不破坏当前编辑器和 shell 行为，以便可以逐步采用新策略。
**验收标准 (EARS):**
- R7.AC1: WHEN 现有代码继续传入 `strategy: "cursor"`、`strategy: "nearest-fit"` 或未传 strategy 时，系统 SHALL 保持当前行为兼容。
- R7.AC2: WHEN 现有 editor paste 使用 `first-fit` 时，系统 SHALL 不改变其公开语义；如需区分 shell add policy，系统 SHALL 通过文档或 alias 明确说明。
- R7.AC3: WHEN public types 更新时，系统 SHALL 同步更新 TypeScript、ESM、CommonJS 和测试用类型入口，不得产生导出缺口。
- R7.AC4: WHEN diagnostics 或 action result shape 扩展时，系统 SHALL 保持 JSON-safe、稳定顺序，并 SHALL 不删除既有字段。
- R7.AC5: WHEN 旧示例或调用方没有显式配置 placement policy 时，系统 SHALL 不因为本规格而突然把 Add widget 改成顶部插入下移。
- R7.AC6: WHEN 后续设计阶段命名 policy 字段时，系统 SHALL 优先复用现有 `strategy`/placement 语义，避免引入与 editor/layout engine 冲突的重复概念。

### R8: 测试、文档与验收覆盖
**用户故事:** 作为维护者，我希望两个 placement policies 有明确测试和文档覆盖，以便后续重构不会让新增 widget 又退化成只能追加到底部。
**验收标准 (EARS):**
- R8.AC1: WHEN 编写 shell/core 单元测试时，系统 SHALL 覆盖 `first-fit` 空首行、首行未满向右、首行满后换行、hidden/static/locked 占位、不同 item 尺寸和 maxRows blocked。
- R8.AC2: WHEN 编写 `insert-top-shift` 测试时，系统 SHALL 覆盖空 layout、顶部占用、多个 widgets 下移、static/locked 随 reflow 下移、maxRows blocked 和 action 原子失败。
- R8.AC3: WHEN 编写 adapter transaction 测试时，系统 SHALL 覆盖 prepare 失败、placement 失败 rollback、write-back 失败、commit 成功和 diagnostics 阶段信息。
- R8.AC4: WHEN 编写 responsive/dashboard 测试时，系统 SHALL 覆盖 default layout、profile override、missing profile、list/mobile write-back 和未知字段保留。
- R8.AC5: WHEN 编写浏览器或示例测试时，系统 SHALL 验证 Add widget policy selector、toolbar/context menu 行为、Move all up/down、result panel 和布局实际落点。
- R8.AC6: WHEN 更新 README 或 docs 时，系统 SHALL 解释两个策略的适用场景、失败语义、static/locked 处理、maxRows 限制和为什么规则在 shell/component 层而不是示例层。
- R8.AC7: WHEN 完成本规格实现时，系统 SHALL 运行相关 editor、dashboard-editor-shell、layout-engine、types、browser smoke 和 build/test 命令，或明确记录无法运行的验证缺口。

## Clarifications

### Session 2026-05-19

- Q: 一个 spec 是否足够覆盖两个方案？ -> A: 足够。两个方案属于同一个 shell/widget placement capability，应放在一个规格中，用不同 policy 表达。
- Q: 还需要继续头脑风暴吗？ -> A: 不需要。进入 requirements 阶段，后续在 design 中细化 API、算法和测试分层。
- Q: 策略应该下沉到组件里还是只写在例子中？ -> A: 下沉到 dashboard editor shell / editor placement 能力层；示例只通过公共 API 选择策略并解释结果。
- Q: 方案一如何定义？ -> A: 命名为 `first-fit`：如果第一行没有 widget 就加到左上角；如果第一行有 widget 但未满，就继续向右找第一个合法空位；如果第一行满了，就按同样规则扫描下一行。
- Q: 方案二如何定义？ -> A: 命名为 `insert-top-shift`：始终尝试添加到左上角，如果顶部已有内容，则将现有 layout 整体下移后插入。
- Q: `insert-top-shift` 遇到 static/locked widget 怎么办？ -> A: static/locked 仍然随本次全局 layout-level reflow 下移；这不改变它们在普通拖拽、resize、remove 中的锁定语义。
- Q: `insert-top-shift` 下移后超过 `maxRows` 怎么办？ -> A: 阻止整个 action，保持 layout/document/adapter payload 不变，并返回明确 diagnostics。
- Q: 示例还要处理 `Move all up` 吗？ -> A: 要。示例和 shell action 应同时展示向上与向下的整体移动入口，并复用同一 `moveAllWidgets` 能力。
- Q: `insert-top-shift` 插入左上角时，到底移动谁，整体下移是否有性能问题？ -> A: 选择 A：全部现有 widgets 下移；该策略只在明确 add/insert commit 时执行一次线性 layout 变更，不放进 drag/resize preview 高频路径。
- Q: `first-fit` 找空位时，hidden widgets 是否占位？ -> A: 选择 A：hidden、static、locked 或当前视图未渲染但仍属于 active layout 的 widgets 默认仍占位，避免取消隐藏后产生碰撞。
