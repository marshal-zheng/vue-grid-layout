# GOV 规格生命周期治理

INITIATIVE_ID: GOV
STATUS: active

## North Star Contract

### Goal
规格生命周期治理的目标是让长期规划由 initiative 北极星承载，具体实现由 focused spec 承载，避免再依赖一次性的 roadmap review 文档来判断下一步。

### Success Criteria
- 每个长期方向都有稳定的 North Star Contract、Spec Coverage Map、Discovery Inbox、Open Questions 和 Decision Log。
- 后续新 spec 都从单个 focused Spec Brief 生成，而不是直接消费整段 raw 或 roadmap 叙事。
- 旧 spec 的覆盖、替代关系和未完成状态能在 initiative 中被看见；历史 formal specs 必须至少有 legacy brief 与 requirements anchor。
- 回答“还有什么没完成”时优先读取 `docs/initiatives`，只在需要证据时读取 linked spec tasks。

### Boundaries
- In scope: initiative 索引、北极星、coverage map、spec brief 入口、历史 spec 状态对齐、supersession notes。
- Out of scope: 直接实现 feature、重写已完成 spec、把所有历史 raw 迁移成执行规格。

### Principles
- 北极星记录方向，spec 记录执行真相；两者不能互相伪装。
- Discovery Inbox 只收集未分拣想法，不直接进入 spec。
- 状态变化必须有 evidence：spec tasks、用户确认或明确决策。
- 旧 roadmap 文件只能作为迁移来源，不能继续作为规划入口。

## Spec Coverage Map

| ID | 能力/范围 | 状态 | 关联 spec | 依赖 | 说明 |
|---|---|---|---|---|---|
| initiative-migration | 将 `spec-roadmap-review.md` 转成 initiative 生命周期入口 | done | none | none | 2026-05-25 已建立 `docs/initiatives` 并让旧 roadmap 文件指向新入口 |
| legacy-spec-anchors | 为历史 spec 回填 `INITIATIVE_SOURCE` / `SPEC_BRIEF` 或等价迁移说明 | done | none | initiative-migration | 已为 21 个 formal specs 生成 legacy briefs，并在 requirements 中补 `INITIATIVE_SOURCE`、`SPEC_BRIEF`、`COVERAGE:` 与 Coverage Mapping |
| spec-inventory | 建立只读 spec inventory，避免重新制造 roadmap review | done | docs/specs/README.md | legacy-spec-anchors | `docs/specs/README.md` 只用于快速定位，规划真相仍在 `docs/initiatives` |
| supersession-notes | 给被 `lean-core-bundle-boundary` 覆盖的旧 API 说法加短说明 | ready | none | initiative-migration | 涉及 foundation、persistence、professional editor UX、responsive dashboard profiles |
| spec-brief-gate | 在后续新 spec 流程中启用 spec brief 与 alignment gate | open | none | legacy-spec-anchors | 后续新 spec 应先创建 focused brief，再在 requirements 中包含 `INITIATIVE_SOURCE`、`SPEC_BRIEF`、`COVERAGE:` 和 Coverage Mapping |

## Discovery Inbox

| ID | 来源 | 想法/发现 | 状态 | 处理去向 | 说明 |
|---|---|---|---|---|---|
| inbox-raw-context | docs/raw/*.md | 旧 raw context 继续保留为历史材料 | triaged | 各 initiative coverage map | 不再从 flat raw 直接生成 spec；需要时先整理为 initiative coverage 或 brief |
| inbox-roadmap-review | docs/specs/spec-roadmap-review.md | 旧 roadmap review 的规划结论已迁移 | triaged | docs/initiatives/README.md | 旧文件保留迁移指针，避免继续产生双入口 |

## Open Questions

| ID | 问题 | 影响 | 状态 | 说明 |
|---|---|---|---|---|
| historical-anchor-depth | 历史 spec 是否需要逐个补 `INITIATIVE_SOURCE` / `SPEC_BRIEF` 锚点 | 影响自动 alignment gate 和后续检索精度 | resolved | 已为 21 个 formal specs 补 legacy brief 与 requirements anchor；不改变原需求正文 |
| specs-readme-needed | 是否还需要 `docs/specs/README.md` 作为只读 spec 索引 | 影响入口数量 | resolved | 保留 `docs/specs/README.md` 作为 inventory，但不在其中维护 roadmap、优先级或下一步判断 |

## Decision Log

| ID | 决策 | 日期 | 依据 | 影响 |
|---|---|---|---|---|
| d1 | 后续长期规划入口改为 `docs/initiatives` | 2026-05-25 | 用户明确希望使用 initiative-lifecycle 北极星方式，不再使用 `spec-roadmap-review.md` 模式 | roadmap review 降级为迁移指针 |
| d2 | 保留 `docs/raw` 作为历史材料，但不再作为直接规划入口 | 2026-05-25 | initiative-lifecycle 要求 Discovery Inbox/coverage map 承载后续分拣 | 新想法进入对应 initiative 的 Discovery Inbox |
| d3 | 历史 formal specs 使用 legacy migration brief 进入 initiative-lifecycle | 2026-05-25 | 历史 spec 早于 initiative-lifecycle，逐个重写为新 spec brief 会制造无意义 churn | requirements anchors 让完成度查询能挂到 initiative；后续新 spec 仍必须先 brief 后 requirements |
| d4 | 保留 `docs/specs/README.md` 作为只读 inventory | 2026-05-25 | 需要快速定位正式 spec，但用户不希望继续 roadmap review 模式 | inventory 不承载优先级、推荐下一步或长期方向 |
