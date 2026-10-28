<template>
  <div class="rich-type-m08">
    <!-- ═══ 第二级：生成结果页（随列表状态切换内容） ═══ -->
    <div v-if="m08DetailOpen" class="m08-detail-shell">
      <div class="m08-topbar">
        <button type="button" class="m08-back" @click="m08DetailOpen = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          返回列表
        </button>
        <span class="m08-sep">|</span>
        <span class="m08-title">{{ m08CurrentRow?.name || '方案详情' }}</span>
        <span
          class="badge"
          :class="m08CurrentRow?.status === '草稿' ? 'hold' : m08CurrentRow?.status === '已归档' ? 'run' : ''"
          :style="m08CurrentRow?.status === '已定稿' ? 'background:#fff8e8;color:#c8902a' : ''"
        >
          <i :style="m08CurrentRow?.status === '已定稿' ? 'background:#d0ab68' : ''"></i>{{ m08CurrentRow?.status }}
        </span>
      </div>

      <!-- 四步向导：弹窗说明/草稿可继续配置，不做页内跳转 -->
      <div class="m08-steps">
        <div
          v-for="(s, i) in m08Steps"
          :key="s.name"
          class="m08-step"
          :class="[
            i < m08Snap.doneSteps ? 'm08-step-done' : (i === m08Snap.doneSteps ? 'm08-step-cur' : 'm08-step-todo'),
            { 'm08-step-focus': m08FocusStep === i, clickable: m08IsDraft || i <= m08Snap.doneSteps },
          ]"
          @click="m08ClickStep(i)"
        >
          <div class="m08-step-dot">{{ i < m08Snap.doneSteps ? '✓' : (i + 1) }}</div>
          <div class="m08-step-label">{{ s.name }}</div>
        </div>
        <div class="m08-step-line"></div>
      </div>

      <el-dialog
        v-model="m08StepDialog"
        :title="`步骤 ${m08StepDialogIdx + 1}：${m08StepDetails[m08StepDialogIdx]?.title}`"
        :width="m08StepDialogIdx <= 2 ? '560px' : '480px'"
        align-center
        append-to-body
      >
        <p class="m08-step-dlg-body">{{ m08StepDetails[m08StepDialogIdx]?.body }}</p>

        <!-- 步骤 1：选定考核指标 -->
        <template v-if="m08StepDialogIdx === 0">
          <el-form label-width="7.5em" class="m08-tpl-form">
            <el-form-item label="关联指标树" required>
              <el-select
                v-model="m08IndForm.treeVer"
                style="width:100%"
                :disabled="!m08IsDraft"
                @change="blurSelect"
                @visible-change="(open) => !open && blurSelect()"
              >
                <el-option
                  v-for="op in m08TreeOptions"
                  :key="op.value"
                  :label="op.label"
                  :value="op.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="考核性能域" required>
              <div class="m08-chip-wrap">
                <button
                  v-for="d in m08DomainOptions"
                  :key="d"
                  type="button"
                  class="m08-chip"
                  :class="{ on: m08IndForm.domains.includes(d) }"
                  :disabled="!m08IsDraft"
                  @click="m08ToggleIndDomain(d)"
                >{{ d }}</button>
              </div>
            </el-form-item>
          </el-form>
          <p class="m08-step-dlg-demo">{{ m08IndSummary }}</p>
          <p v-if="!m08IsDraft" class="m08-step-dlg-draft">定稿/归档后仅可查看，回退草稿后方可改选。</p>
        </template>

        <!-- 步骤 2：配置试验因子 -->
        <template v-else-if="m08StepDialogIdx === 1">
          <el-form label-width="7.5em" class="m08-tpl-form">
            <el-form-item label="配置策略" required>
              <el-radio-group v-model="m08FactorStepForm.strategy" :disabled="!m08IsDraft">
                <el-radio v-for="s in m08FactorStrategies" :key="s.value" :value="s.value">{{ s.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="纳入类别" required>
              <div class="m08-chip-wrap">
                <button
                  v-for="c in m08FactorCatOptions"
                  :key="c"
                  type="button"
                  class="m08-chip"
                  :class="{ on: m08FactorStepForm.cats.includes(c) }"
                  :disabled="!m08IsDraft"
                  @click="m08ToggleFactorCat(c)"
                >{{ c }}</button>
              </div>
            </el-form-item>
          </el-form>
          <p class="m08-step-dlg-demo">{{ m08FactorStepSummary }}</p>
          <p v-if="m08IsDraft" class="m08-step-dlg-draft">保存后将按策略同步页面「试验因子配置」卡片（自定义因子会保留）。</p>
          <p v-else class="m08-step-dlg-draft">定稿/归档后仅可查看，回退草稿后方可改选。</p>
        </template>

        <!-- 步骤 3：模板与案例 -->
        <template v-else-if="m08StepDialogIdx === 2">
          <el-form label-width="7.5em" class="m08-tpl-form">
            <el-form-item label="大纲模板" required>
              <el-select
                v-model="m08TplForm.template"
                style="width:100%"
                :disabled="!m08IsDraft"
                @change="blurSelect"
                @visible-change="(open) => !open && blurSelect()"
              >
                <el-option v-for="t in m08TemplateOptions" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
            <el-form-item label="历史案例" required>
              <el-select
                v-model="m08TplForm.caseName"
                style="width:100%"
                :disabled="!m08IsDraft"
                @change="blurSelect"
                @visible-change="(open) => !open && blurSelect()"
              >
                <el-option v-for="c in m08CaseOptions" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-form>
          <p class="m08-step-dlg-demo">{{ m08TplSummary }}</p>
          <p v-if="!m08IsDraft" class="m08-step-dlg-draft">定稿/归档后仅可查看，回退草稿后方可改选。</p>
        </template>

        <p v-else-if="m08StepDetails[m08StepDialogIdx]?.demo" class="m08-step-dlg-demo">
          {{ m08StepDetails[m08StepDialogIdx]?.demo }}
        </p>

        <template #footer>
          <el-button @click="m08StepDialog = false">关闭</el-button>
          <template v-if="m08StepDialogIdx <= 2">
            <el-button v-if="m08IsDraft" type="primary" @click="m08ConfirmStepConfig">保存配置</el-button>
            <el-button
              v-if="m08IsDraft && m08StepDialogIdx >= m08Snap.doneSteps"
              type="primary"
              @click="m08ContinueStep"
            >完成此步</el-button>
            <el-button v-else-if="!m08IsDraft" type="primary" @click="m08StepDialog = false">知道了</el-button>
          </template>
          <template v-else>
            <el-button
              v-if="m08IsDraft && m08StepDialogIdx >= m08Snap.doneSteps"
              type="primary"
              @click="m08ContinueStep"
            >完成此步</el-button>
            <el-button v-else type="primary" @click="m08StepDialog = false">知道了</el-button>
          </template>
        </template>
      </el-dialog>

      <!-- 新增/编辑因子 -->
      <el-dialog
        v-model="m08FactorDialog"
        :title="m08FactorEditIdx >= 0 ? '编辑试验因子' : '新增试验因子'"
        width="480px"
        align-center
        append-to-body
        :close-on-click-modal="false"
        destroy-on-close
      >
        <el-form label-width="6.5em" class="m08-factor-form">
          <el-form-item label="因子名称" required>
            <el-input v-model="m08FactorForm.name" maxlength="40" placeholder="如 温度、路面" />
          </el-form-item>
          <el-form-item label="取值水平" required>
            <el-input
              v-model="m08FactorForm.levels"
              type="textarea"
              :rows="2"
              maxlength="120"
              placeholder="如 −41℃贮存 / −41℃工作 / 常温 / +55℃"
            />
          </el-form-item>
          <el-form-item label="性能类别" required>
            <el-select
              v-model="m08FactorForm.cat"
              style="width:100%"
              @change="blurSelect"
              @visible-change="(open) => !open && blurSelect()"
            >
              <el-option v-for="c in m08FactorCats" :key="c" :label="c" :value="c" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button
            v-if="m08FactorEditIdx >= 0 && !m08Snap.readonlyFactors"
            type="danger"
            plain
            @click="m08RemoveFactor(m08FactorEditIdx)"
          >删除</el-button>
          <span class="spacer" />
          <el-button @click="m08FactorDialog = false">取消</el-button>
          <el-button type="primary" @click="m08SubmitFactor">确定</el-button>
        </template>
      </el-dialog>

      <!-- 新建向导：配置因子 → 选模板 → 生成预览 -->
      <div v-if="m08InWizard" class="m08-wiz">
        <div v-if="m08Snap.doneSteps <= 1" class="m08-panel">
          <div class="m08-panel-head">
            <span class="m08-panel-title">已配置因子：{{ m08FactorCount }} 个</span>
          </div>
          <div class="m08-factor-lines">
            <div v-for="(factor, index) in m08Factors" :key="factor.name + index" class="m08-factor-line">
              <b>{{ factor.name }}</b>
              <span>{{ factor.levels }}</span>
            </div>
          </div>
          <div class="m08-factor-add">
            <span>现场添加因子</span>
            <button
              v-for="item in m08QuickFactors"
              :key="item.name"
              type="button"
              @click="m08QuickAddFactor(item)"
            >+ {{ item.name }}</button>
            <span class="spacer"></span>
            <el-input v-model="m08FactorName" placeholder="因子名" style="width: 160px" @keyup.enter="m08AddFactorLine" />
            <el-button type="primary" @click="m08AddFactorLine">添加</el-button>
          </div>
          <div class="m08-wiz-foot">
            <el-button type="primary" @click="m08WizardNextFactors">下一步：选择模板与案例 →</el-button>
          </div>
        </div>

        <div v-else-if="m08Snap.doneSteps === 2" class="m08-panel">
          <div class="m08-panel-head">
            <span class="m08-panel-title">标准方案模板库（点击选择）</span>
          </div>
          <div class="m08-tpl-list">
            <button
              v-for="item in m08TemplateCards"
              :key="item.name"
              type="button"
              class="m08-tpl-card"
              :class="{ on: (m08CurrentRow?.template || m08TplForm.template) === item.name }"
              @click="m08PickTemplate(item.name)"
            >
              <b>{{ item.name }}</b>
              <span>{{ item.brief }}</span>
              <em v-if="item.recommend">推荐</em>
            </button>
          </div>
          <div class="m08-wiz-foot">
            <el-button @click="m08WizardBack">← 上一步</el-button>
            <el-button type="primary" @click="m08WizardToPreview">下一步：生成预览 →</el-button>
          </div>
        </div>

        <div v-else class="m08-panel m08-gen-panel">
          <div class="m08-panel-head"><span class="m08-panel-title">生成预览</span></div>
          <div class="m08-gen-body">
            <div v-if="!m08Generating" class="m08-pick">
              <div class="m08-pick-tabs">
                <button type="button" :class="{ on: m08PickTab === 'expert' }" @click="m08SetPickTab('expert')">专家</button>
                <button type="button" :class="{ on: m08PickTab === 'skill' }" @click="m08SetPickTab('skill')">技能</button>
                <span>已选 {{ m08ExpertIds.length }} 个专家 · {{ m08SkillIds.length }} 项技能</span>
              </div>
              <div class="m08-pick-chips">
                <button
                  v-for="chip in m08PickChips"
                  :key="chip"
                  type="button"
                  :class="{ on: m08PickChip === chip }"
                  @click="m08PickChip = chip"
                >{{ chip }}</button>
              </div>
              <div class="m08-pick-grid">
                <button
                  v-for="item in m08PickCards"
                  :key="item.id"
                  type="button"
                  class="m08-pick-card"
                  :class="{ on: m08PickOn(item.id) }"
                  @click="m08TogglePick(item.id)"
                >
                  <pick-avatar :id="item.id" />
                  <span class="m08-pick-main">
                    <b>{{ item.name }}</b>
                    <small>{{ item.brief }}</small>
                    <span class="m08-pick-tags"><em v-for="tag in item.tags" :key="tag">{{ tag }}</em></span>
                  </span>
                </button>
              </div>
            </div>
            <div class="m08-gen-foot">
              <p>将以「{{ m08CurrentRow?.template || '装备设计定型性能鉴定试验方案模板' }}」为骨架，由已选专家与技能融合考核指标、试验因子，装配五章大纲初稿。</p>
              <el-button v-if="!m08Generating" type="primary" @click="m08StartGenerate">生成初稿</el-button>
            </div>
            <div v-if="m08Generating" class="m08-gen-run">
              <div
                v-loading="true"
                class="m08-gen-loading"
                element-loading-text="详细方案装配中：按指标树逐章生成试验设计，判据与来源同步回填"
              ></div>
              <div class="m08-gen-bar"><i :style="{ width: m08GenProgress + '%' }"></i></div>
              <p>每项指标均生成条件、步骤、数据记录、判据与异常处置</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 左问答流式思考，右文档；第一次进入会先打出思考再展开正文 -->
      <div
        v-if="!m08InWizard"
        class="m08-work"
        :class="{ 'is-split': m08Snap.previewReady || m08Snap.doneSteps >= 4, 'is-open': m08DocShown }"
      >
      <div id="m08-chat-panel" class="m08-panel m08-thread">
        <div class="m08-thread-title">{{ m08CurrentRow?.name || '试验方案' }}</div>
        <div class="m08-thread-scroll">
          <div v-if="!(m08Snap.previewReady || m08Snap.doneSteps >= 4)" class="m08-chat-empty">
            请先完成「生成预览」，再在这里生成并查看文档。
          </div>
          <div
            v-for="(round, ri) in m08Rounds"
            :id="'m08-round-' + ri"
            :key="ri"
            class="m08-turn"
          >
            <div class="m08-ask">{{ round.user }}</div>
            <div class="m08-agent">
              <span>{{ (round.expertName || '大纲编制专家').slice(0, 1) }}</span>
              <b>{{ round.expertName || '大纲编制专家' }}</b>
            </div>
            <div class="m08-agent-meta">已处理 {{ round.streaming ? m08StreamElapsed : (round.elapsed || 1) }}s</div>
            <div v-if="round.streaming && !m08StreamThink.length" class="m08-agent-wait">正在读取指标库、推荐算法、试验因子和大纲…</div>
            <div v-if="round.streaming" class="m08-quotes">
              <p v-for="step in m08StreamThink" :key="step.label">
                <b>{{ step.label }}</b>
                <span>{{ step.text }}<i v-if="step.live" class="m08-caret"></i></span>
              </p>
            </div>
            <div v-else-if="round.think?.length" class="m08-quotes">
              <p v-for="step in round.think" :key="step.label">
                <b>{{ step.label }}</b>
                <span>{{ step.text }}</span>
              </p>
            </div>
            <div v-else-if="round.bot" class="m08-quotes"><p><span>{{ round.bot }}</span></p></div>
            <button
              v-if="!round.streaming && (round.resultVer || round.anchor || m08Snap.previewReady)"
              type="button"
              class="m08-doc-card"
              @click="m08ViewRoundDoc(round)"
            >
              <b>{{ m08CurrentRow?.name || '试验方案' }}.docx</b>
              <span>{{ round.resultVer || m08Snap.previewBadge }} · {{ round.where || '点击查看完整文档' }}</span>
            </button>
          </div>
          <button
            v-if="(m08Snap.previewReady || m08Snap.doneSteps >= 4) && !m08ChatStreaming"
            type="button"
            class="m08-artifacts"
            @click="m08FoldDoc"
          >{{ m08DocShown ? '收起文档' : '查看文档' }}</button>
        </div>
        <div class="m08-composer">
          <el-input
            v-model="m08ChatInput"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            :disabled="!m08ChatCanSend"
            placeholder="继续优化这份大纲，可点名指标、算法或章节"
            @keydown.enter.exact.prevent="m08SendChat"
          />
          <div class="m08-composer-bar">
            <span class="m08-composer-expert">{{ m08TalkExpert }}</span>
            <el-button type="primary" :disabled="!m08ChatCanSend" @click="m08SendChat">{{ m08ChatStreaming ? '生成中' : '发送' }}</el-button>
          </div>
        </div>
      </div>
      <div v-if="m08DocShown" id="m08-outline-panel" class="m08-panel m08-stage">
        <div class="m08-panel-head">
          <span class="m08-panel-title">{{ m08CurrentRow?.name || '试验方案' }}.docx</span>
          <span class="badge on" style="margin-left:auto"><i></i>{{ m08Snap.previewBadge }}</span>
          <el-button @click="m08ToggleAllChapters">{{ m08Chapters.every((ch) => m08ChapterOpen[ch.id || ch.no]) ? '全部收起' : '全部展开' }}</el-button>
          <el-button @click="m08ExportWord">导出 Word</el-button>
          <el-button @click="m08FoldDoc">收起</el-button>
        </div>
        <div class="m08-doc-wrap">
          <div class="m08-doc-layout" :class="{ 'is-plain': !m08CurrentRow?.fullDoc }">
            <aside v-if="m08CurrentRow?.fullDoc" class="m08-toc">
              <div class="m08-toc-title">文档目录</div>
              <button
                v-for="ch in m08Chapters"
                :key="ch.id || ch.no"
                type="button"
                :class="{ on: m08TocId === (ch.id || ch.no) }"
                @click="m08JumpDoc(ch.id || ch.no)"
              >{{ ch.no }} {{ ch.title }}</button>
            </aside>
            <article class="m08-doc">
              <header>
                <b>{{ m08CurrentRow?.name || '试验方案' }}.docx</b>
                <span>{{ m08Snap.previewBadge }} · {{ m08Chapters.length }}章</span>
              </header>
              <section v-for="ch in m08Chapters" :id="`doc-${ch.id || ch.no}`" :key="ch.id || ch.no" class="m08-ch">
                <button type="button" class="m08-ch-head" @click="m08ToggleChapter(ch.id || ch.no)">
                  <b>{{ ch.no }} {{ ch.title }}</b>
                  <span>{{ m08ChapterOpen[ch.id || ch.no] ? '收起' : '展开' }}</span>
                </button>
                <div v-show="m08ChapterOpen[ch.id || ch.no]" class="m08-ch-body" v-html="ch.content"></div>
              </section>
            </article>
          </div>
        </div>
      </div>
      </div>

      <!-- 版本条：V1 初稿 → 各轮对话优化 → 定稿；点击可回溯到对应校核轮次 -->
      <div v-if="!m08InWizard" class="m08-panel m08-ver-bar">
        <div class="m08-vers">
          <div v-for="(ver, vi) in m08Versions" :key="ver.ver" class="m08-ver-item">
            <div
              class="m08-ver-node"
              :class="{ final: ver.final, on: m08FocusVer === ver.ver }"
              @click="m08ClickVersion(ver, vi)"
            >
              <div class="m08-ver-dot">{{ ver.ver }}</div>
              <div class="m08-ver-label">{{ ver.label }}</div>
              <div class="m08-ver-time">{{ ver.time }}</div>
            </div>
            <div v-if="vi < m08Versions.length - 1" class="m08-ver-line"></div>
          </div>
        </div>
        <div class="m08-ver-foot">
          <el-button v-if="m08IsDraft" type="primary" plain @click="m08Finalize">定稿</el-button>
          <el-button v-else-if="m08IsFinal" @click="m08RevertDraft">回退草稿</el-button>
          <el-button
            type="primary"
            :disabled="!m08Snap.showMatch"
            @click="goResourceMatch"
          >
            资源匹配
          </el-button>
        </div>
      </div>
    </div>

    <!-- ═══ 第一级：方案列表页 ═══ -->
    <div v-else class="crud-body">
      <div class="toolbar">
        <el-button type="primary" @click="m08OpenCreate">＋ 新建方案</el-button>
        <span class="spacer"></span>
        <span class="hint">共 {{ m08List.length }} 个方案</span>
      </div>
      <div class="table-inner">
        <table>
          <thead>
            <tr>
              <th>方案名称</th>
              <th style="text-align:center">版本</th>
              <th>关联指标树版本</th>
              <th>大纲模板</th>
              <th>备注</th>
              <th style="text-align:center">状态</th>
              <th>更新时间</th>
              <th style="text-align:center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in m08List" :key="row.id" class="clickable" @click="m08OpenDetail(row)">
              <td style="font-weight:600;color:#1f3d5a">{{ row.name }}</td>
              <td style="text-align:center">
                <span class="m08-ver-pill">{{ row.ver }}</span>
              </td>
              <td style="color:#5c7084">{{ row.treeVer }}</td>
              <td style="color:#3f5062;font-size:13px" :title="row.template || ''">{{ row.template || '—' }}</td>
              <td class="m08-remark-cell" :title="row.remark || ''">{{ row.remark || '—' }}</td>
              <td style="text-align:center">
                <span
                  class="badge"
                  :class="row.status === '草稿' ? 'hold' : row.status === '已归档' ? 'run' : ''"
                  :style="row.status === '已定稿' ? 'background:#fff8e8;color:#c8902a' : ''"
                >
                  <i :style="row.status === '已定稿' ? 'background:#d0ab68' : ''"></i>{{ row.status }}
                </span>
              </td>
              <td style="color:#8a99a8;font-size:13px">{{ row.updatedAt }}</td>
              <td style="text-align:center" @click.stop>
                <button type="button" class="btn-link" @click="m08OpenDetail(row)">查看</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 新建方案 -->
    <el-dialog
      v-model="m08CreateVisible"
      title="新建方案 · 第一步：选定考核指标"
      width="760px"
      align-center
      :close-on-click-modal="false"
    >
      <el-form label-position="top" class="m08-create-form">
        <el-form-item label="方案名称" required>
          <el-input v-model="m08CreateForm.name" maxlength="80" />
        </el-form-item>
        <el-form-item label="选择项目" required>
          <el-select
            v-model="m08CreateForm.projectId"
            placeholder="请选择试验项目，自动带出指标树"
            style="width:100%"
            @change="m08SelectProject"
          >
            <el-option v-for="item in m08Projects" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="指标树" required>
          <div class="m08-tree-auto" :class="{ on: !!m08AutoTreeLabel }">{{ m08AutoTreeLabel || '选择项目后自动带出' }}</div>
        </el-form-item>
      </el-form>
      <div v-if="!m08CreateForm.projectId" class="m08-ind-empty">请先选择项目，系统将自动带出指标树，再勾选考核指标</div>
      <div v-else-if="!m08CreateForm.treeVer" class="m08-ind-empty">该项目暂无已发布指标树</div>
      <div v-else class="m08-ind-box">
        <div class="m08-ind-bar">
          <span>从{{ m08CreateForm.treeVer }}勾选本次考核指标（已选 {{ m08PickedIds.length }} 项）</span>
          <el-button @click="m08ToggleAllIndicators">{{ m08PickedIds.length === m08IndicatorRows.length ? '全不选' : '全选' }}</el-button>
        </div>
        <div class="m08-ind-grid">
          <label v-for="row in m08IndicatorRows" :key="row.id" :class="{ on: m08PickedIds.includes(row.id) }">
            <input type="checkbox" :checked="m08PickedIds.includes(row.id)" @change="m08ToggleIndicator(row.id)">
            <b>{{ row.name }}</b>
            <em>{{ row.criteria }}</em>
          </label>
        </div>
      </div>
      <template #footer>
        <el-button @click="m08CreateVisible = false">取消</el-button>
        <el-button type="primary" @click="m08GoFactorStep">下一步：配置试验因子</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script>
import { computed, nextTick, ref } from 'vue'
import { useRichPage } from '@/composables/rich/useRichPage'
import { schemeExpertGroups, schemeExperts, schemeSkillGroups, schemeSkills } from '@/data/schemeAgents'
import PickAvatar from '@/components/PickAvatar.vue'

export default {
  components: { PickAvatar },
  props: { page: Object, title: String },
  setup(props) {
    const ctx = useRichPage(props)
    const treeSelectRef = ref(null)
    const tplSelectRef = ref(null)
    const m08PickTab = ref('expert')
    const m08PickChip = ref('全部')
    const m08ExpertIds = ref(['ex-fire', 'ex-measure', 'ex-evidence', 'ex-outline'])
    const m08SkillIds = ref(['sk-outline', 'sk-criteria', 'sk-factor', 'sk-anomaly'])
    const m08PickChips = computed(() => (m08PickTab.value === 'expert' ? schemeExpertGroups : schemeSkillGroups))
    const m08PickCards = computed(() => {
      const source = m08PickTab.value === 'expert' ? schemeExperts : schemeSkills
      if (m08PickChip.value === '全部') return source
      return source.filter((item) => item.group === m08PickChip.value)
    })
    function m08SetPickTab(tab) {
      m08PickTab.value = tab
      m08PickChip.value = '全部'
    }
    function m08PickOn(id) {
      const list = m08PickTab.value === 'expert' ? m08ExpertIds.value : m08SkillIds.value
      return list.includes(id)
    }
    function m08TogglePick(id) {
      const list = m08PickTab.value === 'expert' ? m08ExpertIds : m08SkillIds
      const index = list.value.indexOf(id)
      if (index >= 0) list.value.splice(index, 1)
      else list.value.push(id)
    }

    function blurSelect() {
      nextTick(() => {
        treeSelectRef.value?.blur?.()
        tplSelectRef.value?.blur?.()
        const el = document.activeElement
        if (el && typeof el.blur === 'function') el.blur()
        try { window.getSelection()?.removeAllRanges() } catch (_) { /* ignore */ }
      })
    }

    function onSelectPicked() {
      blurSelect()
    }

    return {
      ...ctx,
      treeSelectRef,
      tplSelectRef,
      blurSelect,
      onSelectPicked,
      m08PickTab,
      m08PickChip,
      m08ExpertIds,
      m08SkillIds,
      m08PickChips,
      m08PickCards,
      m08SetPickTab,
      m08PickOn,
      m08TogglePick,
    }
  },
}
</script>

<style scoped>
.m08-detail-shell {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 18px 20px 16px;
  box-shadow: 0 6px 18px rgba(15, 55, 95, .04);
}
.m08-topbar { display: flex; align-items: center; gap: 10px; }
.m08-back {
  display: inline-flex; align-items: center; gap: 4px;
  border: 0; background: none; padding: 0; color: #1668a8; font-size: 13px; cursor: pointer;
}
.m08-back svg { width: 13px; height: 13px; }
.m08-sep { color: #d0dce8; }
.m08-title { font-weight: 700; font-size: 15px; color: #1f3d5a; }

.m08-steps {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 8px 4px 4px;
}
.m08-step-line {
  position: absolute;
  left: 12%;
  right: 12%;
  top: 22px;
  height: 2px;
  background: #d7e6f2;
  z-index: 0;
}
.m08-step { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.m08-step.clickable { cursor: pointer; }
.m08-step.clickable:hover .m08-step-dot { transform: scale(1.08); }
.m08-step-dot {
  width: 28px; height: 28px; border-radius: 50%;
  display: grid; place-items: center;
  font-size: 12px; font-weight: 700;
  border: 2px solid #c5d9ea; background: #fff; color: #8a99a8;
  transition: transform .15s ease;
}
.m08-step-label { font-size: 12.5px; color: #8a99a8; }
.m08-step-done .m08-step-dot { background: #2f9e62; border-color: #2f9e62; color: #fff; }
.m08-step-done .m08-step-label { color: #2f9e62; font-weight: 600; }
.m08-step-cur .m08-step-dot { border-color: #1668a8; color: #1668a8; background: #e8f2fb; }
.m08-step-cur .m08-step-label { color: #1668a8; font-weight: 600; }
.m08-step-focus .m08-step-dot { box-shadow: 0 0 0 3px rgba(22, 104, 168, .25); }
.m08-step-dlg-body { margin: 0 0 12px; font-size: 14px; line-height: 1.7; color: #3f5062; }
.m08-step-dlg-demo { margin: 0; font-size: 13px; line-height: 1.6; color: #0d4e83; background: #eaf3fd; padding: 10px 12px; border-radius: 8px; }

.m08-panel {
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
}
.m08-panel-head {
  padding: 10px 16px;
  border-bottom: 1px solid #eef3f8;
  display: flex;
  align-items: center;
  gap: 10px;
}
.m08-panel-title { font-weight: 600; font-size: 13.5px; color: #1f3d5a; }
.m08-factor-count { font-size: 20px; font-weight: 700; color: #c8902a; margin-left: 4px; }
.spacer { flex: 1; }

.m08-factor-grid {
  height: auto;
  max-height: 280px;
  padding: 6px 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: auto;
}
.m08-factor {
  position: relative;
  border: 0;
  border-bottom: 1px solid #eef3f8;
  border-radius: 0;
  padding: 8px 16px;
  background: #fff;
  cursor: pointer;
  height: auto;
  min-height: 0;
  display: flex;
  align-items: baseline;
  gap: 10px;
  box-sizing: border-box;
}
.m08-factor:hover { border-color: #b8cfe4; background: #f7fbfe; }
.m08-factor-name { font-size: 13px; font-weight: 600; color: #1f3d5a; }
.m08-factor-name::after { content: '：'; font-weight: 400; }
.m08-factor-range { margin-top: 0; font-size: 13px; color: #5c7084; line-height: 1.5; }
.m08-factor-tag {
  margin-left: auto;
  font-size: 11px; color: #1668a8; background: #e8f2fb;
  padding: 1px 6px; border-radius: 8px;
}
.m08-factor-form :deep(.el-form-item__label) {
  text-align: left;
  justify-content: flex-start;
}
.m08-step-dlg-draft {
  margin: 12px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #c8902a;
  background: #fff8e8;
  border: 1px solid #f0d48a;
  border-radius: 8px;
  padding: 8px 12px;
}
.m08-tpl-form {
  margin: 14px 0 4px;
}
.m08-tpl-form :deep(.el-form-item__label) {
  text-align: left;
  justify-content: flex-start;
  white-space: nowrap;
  line-height: 32px;
  height: auto;
}
.m08-tpl-form :deep(.el-form-item) {
  margin-bottom: 14px;
}
.m08-chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}
.m08-chip {
  height: 28px;
  padding: 0 12px;
  border-radius: 14px;
  border: 1px solid #d5e0ea;
  background: #f5f8fb;
  color: #5d7388;
  font-size: 13px;
  cursor: pointer;
  transition: all .14s;
}
.m08-chip:disabled {
  cursor: default;
  opacity: .85;
}
.m08-chip.on {
  background: #e8f3fb;
  border-color: #9ec8e8;
  color: #1668a8;
  font-weight: 600;
}
.m08-chip:not(:disabled):hover {
  border-color: #9ec8e8;
  color: #1668a8;
}

.m08-work.is-split:not(.is-open) .m08-thread { max-width: 880px; margin: 0 auto; }
.m08-work.is-open {
  display: grid;
  grid-template-columns: minmax(380px, 0.9fr) minmax(0, 1.16fr);
  gap: 14px;
  align-items: stretch;
}
.m08-stage {
  display: flex; flex-direction: column; min-height: 680px; max-height: 760px; overflow: hidden;
  animation: m08-doc-in .32s ease;
}
.m08-stage .m08-doc-wrap { flex: 1; min-height: 0; }
.m08-thread { display: flex; flex-direction: column; min-height: 680px; max-height: 760px; background: #fff; }
@keyframes m08-doc-in { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
.m08-thread-title {
  padding: 14px 18px 0; font-size: 16px; font-weight: 600; color: #1f3d5a;
}
.m08-thread-scroll { flex: 1; min-height: 0; overflow: auto; padding: 18px 22px 8px; }
.m08-turn { margin-bottom: 22px; }
.m08-ask {
  margin-left: auto; max-width: 72%; width: fit-content;
  background: #f2f4f7; color: #1f3d5a; border-radius: 12px; padding: 10px 14px;
  line-height: 1.6; font-size: 14px;
}
.m08-agent { display: flex; align-items: center; gap: 8px; margin-top: 16px; }
.m08-agent span {
  width: 28px; height: 28px; border-radius: 50%; background: #e8f3fb; color: #1668a8;
  display: grid; place-items: center; font-weight: 700; font-size: 13px;
}
.m08-agent b { color: #1f3d5a; font-size: 14px; }
.m08-agent-meta, .m08-agent-wait { margin: 6px 0 0 36px; color: #98a2b3; font-size: 13px; }
.m08-quotes { margin: 10px 0 0 36px; display: flex; flex-direction: column; gap: 10px; max-width: 760px; }
.m08-quotes p { margin: 0; }
.m08-quotes b { display: block; color: #0d4e83; font-size: 13px; margin-bottom: 2px; }
.m08-quotes span { color: #3f5062; font-size: 13.5px; line-height: 1.75; white-space: pre-wrap; }
.m08-doc-card {
  display: flex; flex-direction: column; align-items: flex-start; gap: 4px;
  margin: 12px 0 0 36px; max-width: 420px; text-align: left;
  border: 1px solid #d7e3ee; background: #fff; border-radius: 10px; padding: 12px 14px; cursor: pointer;
}
.m08-doc-card b { color: #1f3d5a; font-size: 14px; }
.m08-doc-card span { color: #7d90a3; font-size: 12.5px; }
.m08-doc-card:hover { border-color: #1668a8; background: #f4f9fd; }
.m08-artifacts {
  margin: 2px 0 10px 36px; border: 0; background: transparent; color: #1668a8;
  cursor: pointer; font-size: 13px; padding: 0;
}
.m08-artifacts:hover { text-decoration: underline; }
.m08-ch { border-top: 1px solid #eef3f8; }
.m08-ch-head {
  width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px;
  border: 0; background: transparent; padding: 12px 0 10px; cursor: pointer; text-align: left;
}
.m08-ch-head b { color: #0d4e83; font-size: 14.5px; }
.m08-ch-head span { flex: 0 0 auto; color: #1668a8; font-size: 12px; }
.m08-ch-body { padding-bottom: 8px; }
.m08-composer {
  margin: 0 16px 14px; border: 1px solid #e4ebf2; border-radius: 14px; padding: 10px 12px 8px;
  box-shadow: 0 8px 24px rgba(15, 55, 95, .05);
}
.m08-composer :deep(.el-textarea__inner) { box-shadow: none; border: 0; padding: 4px 2px; resize: none; }
.m08-stage .m08-panel-head :deep(.el-button + .el-button) { margin-left: 0; }
.m08-composer-bar { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.m08-composer-expert {
  margin-right: auto; color: #1668a8; background: #e8f3fb; border-radius: 999px;
  padding: 4px 10px; font-size: 12.5px;
}
.m08-outline, .m08-chat { display: flex; flex-direction: column; min-height: 480px; max-height: 640px; }
.m08-doc-wrap { flex: 1; min-height: 0; overflow: auto; background: #f4f7fb; padding: 16px; }
.m08-doc-layout { display: grid; grid-template-columns: 196px minmax(0, 1fr); gap: 12px; align-items: start; }
.m08-doc-layout.is-plain { grid-template-columns: 1fr; }
.m08-toc {
  position: sticky; top: 0; max-height: 640px; overflow: auto;
  background: #fff; border: 1px solid #e4ebf2; border-radius: 8px; padding: 8px 0;
}
.m08-toc-title { padding: 6px 12px 8px; font-size: 13px; font-weight: 700; color: #1f3d5a; }
.m08-toc button {
  display: block; width: 100%; text-align: left; border: 0; border-left: 3px solid transparent;
  background: transparent; padding: 8px 10px; font-size: 12.5px; line-height: 1.45; color: #3f5062; cursor: pointer;
}
.m08-toc button.on { background: #eaf3fd; border-left-color: #1668a8; color: #0d4e83; font-weight: 600; }
.m08-doc :deep(h5) { margin: 18px 0 8px; color: #0d4e83; font-size: 15px; }
.m08-doc :deep(h6) { margin: 12px 0 4px; color: #1f3d5a; font-size: 13.5px; }
.m08-doc :deep(b) { color: #0d4e83; }
.m08-chat .m08-panel-head { flex-wrap: wrap; }
.m08-chat-flow { flex: 1 0 100%; margin-left: 0; color: #8a99a8; font-size: 12px; }
.m08-chat-flow em { font-style: normal; }
.m08-chat-flow em.on { color: #3f5062; }
.m08-chat-flow em.now { color: #1668a8; font-weight: 700; }
.m08-think {
  background: #f4f8fb; border: 1px solid #e4eef6; border-radius: 8px; padding: 8px 10px; margin-bottom: 8px;
}
.m08-think.is-live { border-color: #c5daf0; background: #f7fbfe; }
.m08-think-title { font-size: 12px; font-weight: 700; color: #1668a8; margin-bottom: 6px; }
.m08-think-pulse {
  display: inline-block; width: 7px; height: 7px; margin-right: 6px; border-radius: 50%;
  background: #1668a8; vertical-align: 1px; animation: m08-pulse 1s ease infinite;
}
.m08-think p { margin: 0 0 6px; font-size: 12.5px; line-height: 1.65; color: #3f5062; }
.m08-think b { color: #0d4e83; }
.m08-made {
  background: #f3faf6; border: 1px solid #d7eedf; border-radius: 8px; padding: 8px 10px;
}
.m08-made b { display: block; color: #1d7a45; font-size: 13px; }
.m08-made p { margin: 4px 0 8px; font-size: 12.5px; line-height: 1.65; color: #3f5062; }
.m08-made button {
  border: 1px solid #b7d4ea; background: #fff; color: #1668a8;
  border-radius: 6px; height: 28px; padding: 0 10px; cursor: pointer; font-size: 12.5px;
}
.m08-made button:hover { background: #eaf3fd; }
.m08-doc {
  background: #fff;
  border: 1px solid #e4ebf2;
  border-radius: 4px;
  box-shadow: 0 8px 24px rgba(15, 55, 95, .08);
  padding: 22px 32px 36px;
  min-height: 420px;
}
.m08-doc header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e8eef5;
  padding-bottom: 10px;
  margin-bottom: 8px;
  color: #8a99a8;
  font-size: 12px;
}
.m08-doc header b { color: #1f3d5a; font-size: 14px; }
.m08-doc h4 { margin: 16px 0 6px; color: #0d4e83; font-size: 15px; }
.m08-doc section { font-size: 13.5px; line-height: 1.85; color: #3f5062; }
.m08-factor-lines { max-height: 360px; overflow: auto; }
.m08-factor-line {
  display: flex;
  gap: 12px;
  align-items: baseline;
  padding: 9px 16px;
  border-bottom: 1px solid #eef3f8;
  font-size: 13.5px;
}
.m08-factor-line b { flex: 0 0 128px; color: #1f3d5a; }
.m08-factor-line span { color: #5c7084; }
.m08-factor-add { display: flex; align-items: center; gap: 8px; padding: 12px 16px; flex-wrap: wrap; }
.m08-factor-add .spacer { flex: 1; }
.m08-factor-add button {
  border: 1px dashed #c5daf0;
  background: #fff;
  color: #1668a8;
  border-radius: 14px;
  height: 28px;
  padding: 0 10px;
  cursor: pointer;
}
.m08-wiz-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px; border-top: 1px solid #eef3f8; }
.m08-tpl-list { display: grid; gap: 10px; padding: 14px 16px; max-height: 420px; overflow: auto; }
.m08-tpl-card {
  position: relative;
  text-align: left;
  border: 1px solid #e0eaf3;
  border-radius: 10px;
  background: #fff;
  padding: 12px 14px;
  cursor: pointer;
}
.m08-tpl-card.on { border-color: #1668a8; background: #f4f9fd; }
.m08-tpl-card b { display: block; color: #1f3d5a; padding-right: 40px; }
.m08-tpl-card span { display: block; margin-top: 4px; color: #7d90a3; font-size: 12.5px; }
.m08-tpl-card em { position: absolute; right: 12px; top: 12px; font-style: normal; color: #c8902a; font-size: 12px; }
.m08-gen-body {
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
  padding: 14px 16px 18px;
  color: #5c7084;
}
.m08-pick { display: flex; flex-direction: column; gap: 10px; }
.m08-pick-tabs { display: flex; align-items: center; gap: 8px; }
.m08-pick-tabs button {
  border: 0; background: #f3f6f9; color: #4d6278; border-radius: 8px;
  height: 32px; padding: 0 14px; cursor: pointer;
}
.m08-pick-tabs button.on { background: #1668a8; color: #fff; }
.m08-pick-tabs span { margin-left: auto; color: #8a99a8; font-size: 12.5px; }
.m08-pick-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.m08-pick-chips button {
  border: 1px solid #d7e3ee; background: #fff; color: #4d6982;
  border-radius: 999px; height: 28px; padding: 0 12px; cursor: pointer;
}
.m08-pick-chips button.on { background: #e8f3fb; border-color: #1668a8; color: #1668a8; }
.m08-pick-grid {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px;
  max-height: 420px; overflow: auto;
}
.m08-pick-card {
  display: flex; gap: 12px; align-items: flex-start; text-align: left;
  border: 1px solid #e6edf4; border-radius: 12px; background: #fff;
  padding: 12px; cursor: pointer;
  box-shadow: 0 1px 2px rgba(20, 50, 80, .04);
}
.m08-pick-card.on { border-color: #1668a8; box-shadow: 0 0 0 1px #1668a8; }
.m08-pick-main { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.m08-pick-main b { color: #1a2332; font-size: 14px; line-height: 1.4; }
.m08-pick-main small {
  color: #7d8b9a; font-size: 12px; line-height: 1.55;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.m08-pick-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.m08-pick-tags em {
  font-style: normal; color: #66788a; background: #f4f6f8; border-radius: 6px;
  padding: 1px 7px; font-size: 12px;
}
.m08-gen-foot { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.m08-gen-foot p { margin: 0; text-align: center; line-height: 1.7; }
@media (max-width: 1100px) {
  .m08-pick-grid { grid-template-columns: 1fr 1fr; }
}
.m08-gen-run { width: 100%; text-align: left; }
.m08-gen-loading { position: relative; min-height: 148px; }
.m08-gen-bar { height: 8px; background: #e7eef5; border-radius: 99px; overflow: hidden; margin-top: 4px; }
.m08-gen-bar i { display: block; height: 100%; background: #1f3d5a; transition: width .25s linear; }
.m08-gen-run p { margin: 8px 0 0; font-size: 12px; color: #8a99a8; }
.m08-tree-auto {
  min-height: 32px;
  padding: 5px 12px;
  border: 1px solid #dce6ef;
  border-radius: 4px;
  background: #f7f9fb;
  color: #8a99a8;
  line-height: 22px;
}
.m08-tree-auto.on { color: #1f3d5a; background: #f4f9fd; border-color: #d3e4f2; }
.m08-ind-empty {
  border: 1px dashed #d5e3ef;
  border-radius: 10px;
  background: #f7fbfe;
  color: #8a99a8;
  text-align: center;
  padding: 28px 12px;
}
.m08-ind-bar { display: flex; justify-content: space-between; align-items: center; margin: 8px 0; color: #5c7084; font-size: 13px; }
.m08-ind-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 360px; overflow: auto; }
.m08-ind-grid label {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e4eef6;
  border-radius: 8px;
  padding: 8px 10px;
  background: #fff;
}
.m08-ind-grid label.on { border-color: #9ec8e8; background: #f4f9fd; }
.m08-ind-grid b { color: #1f3d5a; font-size: 13px; }
.m08-ind-grid em { margin-left: auto; color: #8a99a8; font-style: normal; font-size: 12px; white-space: nowrap; }
.m08-outline-body { display: grid; grid-template-columns: 180px 1fr; flex: 1; min-height: 0; }
.m08-outline-empty {
  flex: 1;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 28px 16px;
  text-align: center;
  color: #8a99a8;
  font-size: 13px;
  background: #f7fbfe;
  border-radius: 8px;
  margin: 4px 0 0;
}
.m08-outline-empty-title {
  font-size: 14px;
  font-weight: 600;
  color: #5c7084;
}
.m08-outline-empty p { margin: 0 0 6px; max-width: 320px; line-height: 1.6; }
.m08-chap-tree { border-right: 1px solid #eef3f8; padding: 8px 0; overflow: auto; }
.m08-chap {
  padding: 8px 14px; cursor: pointer; border-left: 3px solid transparent;
  font-size: 13px; color: #3f5062; display: flex; align-items: center; gap: 6px;
}
.m08-chap.on { background: #eaf3fd; border-left-color: #1668a8; color: #0d4e83; font-weight: 600; }
.m08-chap-no { font-size: 11px; color: #c6a15a; font-weight: 700; flex: 0 0 auto; }
.m08-chap-content { padding: 14px 16px; font-size: 13.5px; line-height: 1.8; color: #3f5062; overflow: auto; }
.m08-chap-h { font-weight: 700; font-size: 14px; color: #0d4e83; margin-bottom: 10px; }

.m08-chat-scroll { flex: 1; overflow: auto; padding: 12px 14px; min-height: 0; }
.m08-chat-empty { padding: 24px 8px; text-align: center; color: #8a99a8; font-size: 13px; }
.m08-round { margin-bottom: 14px; padding: 4px; border-radius: 8px; transition: background .2s; }
.m08-round-focus { background: #fff8e8; outline: 1px solid #f0d48a; }
.m08-bubble {
  max-width: 90%; padding: 8px 12px; border-radius: 10px; font-size: 13px; line-height: 1.6; margin-bottom: 6px;
}
.m08-bubble.user {
  margin-left: auto; background: #0d4e83; color: #fff; border-radius: 10px 10px 2px 10px;
}
.m08-bubble.bot { background: #f4f8fb; color: #2c3e50; border-radius: 10px 10px 10px 2px; }
.m08-bubble-meta { font-size: 11px; color: rgba(255, 255, 255, .6); margin-bottom: 4px; }
.m08-diff {
  background: #fffaed; border: 1px solid #f5e0a0; border-radius: 6px;
  padding: 7px 10px; font-size: 12px; color: #7a6020;
  display: flex; align-items: flex-start; gap: 6px;
}
.m08-diff span { flex: 0 0 auto; font-weight: 700; color: #c8902a; }
.m08-diff b { display: block; margin-bottom: 4px; color: #8a6420; }
.m08-diff p { margin: 0; }
.m08-diff mark, .m08-doc :deep(mark.m08-hl) {
  background: #fff3bf;
  color: #7a4e00;
  padding: 0 3px;
  border-radius: 3px;
  box-shadow: inset 0 -1px 0 #e3c36a;
}
.m08-hl-live { margin: 10px 0 0; line-height: 1.85; }
.m08-doc.is-writing { box-shadow: 0 0 0 2px rgba(22, 104, 168, .18); }
.m08-doc-live {
  margin: 0 16px;
  padding: 6px 10px;
  border-radius: 6px;
  background: #eaf3fd;
  color: #1668a8;
  font-size: 12px;
}
.m08-chat.is-streaming { box-shadow: 0 0 0 2px rgba(22, 104, 168, .16); }
.m08-live-tag {
  margin-left: auto;
  font-size: 12px;
  color: #1668a8;
  background: #eaf3fd;
  border-radius: 10px;
  padding: 2px 8px;
}
.m08-bubble-in { animation: m08-pop .28s ease; }
.m08-diff-in { animation: m08-pop .35s ease; }
.m08-bubble-live { min-height: 38px; }
.m08-typing { display: inline-flex; align-items: center; gap: 4px; color: #5c7084; }
.m08-typing i {
  width: 6px; height: 6px; border-radius: 50%; background: #1668a8;
  animation: m08-dot 1s infinite ease-in-out;
}
.m08-typing i:nth-child(2) { animation-delay: .15s; }
.m08-typing i:nth-child(3) { animation-delay: .3s; }
.m08-caret, .m08-doc :deep(.m08-caret) {
  display: inline-block; width: 1px; height: 1em; margin-left: 1px;
  background: #1668a8; vertical-align: text-bottom;
  animation: m08-blink .8s steps(1) infinite;
}
.m08-doc :deep(.m08-caret) { background: #7a4e00; }
@keyframes m08-pulse {
  0%, 100% { opacity: .35; transform: scale(.85); }
  50% { opacity: 1; transform: scale(1); }
}
@keyframes m08-dot {
  0%, 80%, 100% { transform: translateY(0); opacity: .35; }
  40% { transform: translateY(-3px); opacity: 1; }
}
@keyframes m08-blink { 50% { opacity: 0; } }
@keyframes m08-pop { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes m08-hl-in { from { background: #ffe08a; } to { background: #fff3bf; } }
.m08-chat-input {
  border-top: 1px solid #eef3f8; padding: 10px 12px 12px; flex: 0 0 auto;
}
.m08-chat-hint { margin: 0 0 8px; font-size: 12px; color: #8a99a8; }
.m08-chat-row { display: flex; gap: 8px; }
.m08-chat-row :deep(.el-button + .el-button) { margin-left: 0; }

.m08-ver-bar { padding: 12px 18px; }
.m08-vers { display: flex; align-items: center; }
.m08-ver-item { display: flex; align-items: center; flex: 1; }
.m08-ver-node {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  min-width: 80px; color: #5c7084; cursor: pointer; border-radius: 8px; padding: 4px 6px;
}
.m08-ver-node:hover { background: #f4f8fb; }
.m08-ver-node.final { color: #c8902a; }
.m08-ver-node.on .m08-ver-dot { box-shadow: 0 0 0 3px rgba(200, 144, 42, .28); }
.m08-ver-dot {
  width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center;
  font-size: 12.5px; font-weight: 700; border: 2px solid #c5d9ea; background: #f4f8fc;
}
.m08-ver-node.final .m08-ver-dot { background: #fff8e8; border-color: #d0ab68; color: #c8902a; }
.m08-ver-label { font-size: 11.5px; font-weight: 600; white-space: nowrap; }
.m08-ver-time { font-size: 11px; color: #8a99a8; white-space: nowrap; }
.m08-ver-line { flex: 1; height: 2px; background: linear-gradient(90deg, #c5d9ea, #d0ab68); margin-bottom: 18px; }
.m08-ver-foot {
  margin-top: 12px; padding-top: 12px; border-top: 1px solid #eef3f8;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px; /* UI rule：并排按钮间距 8px */
}
.m08-ver-foot :deep(.el-button + .el-button) {
  margin-left: 0;
}
.m08-remark-cell {
  max-width: 160px;
  color: #5c7084;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.m08-ver-pill {
  background: #e8f3fb; color: #0d4e83; font-size: 12px; padding: 2px 9px;
  border-radius: 10px; font-family: ui-monospace, monospace;
}
.clickable { cursor: pointer; }

.m08-create-form :deep(.el-form-item__label) {
  text-align: left;
  justify-content: flex-start;
  white-space: nowrap;
}
.m08-opt-meta {
  float: right;
  margin-left: 12px;
  color: #8a99a8;
  font-size: 12px;
}
@media (max-width: 1200px) {
  .m08-factor-grid { grid-template-columns: repeat(4, 1fr); }
  .m08-lower { grid-template-columns: 1fr; }
}
</style>
