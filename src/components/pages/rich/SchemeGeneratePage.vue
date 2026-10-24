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
      <p class="m08-steps-hint">
        {{ m08IsDraft
          ? '草稿可点击任一步骤继续配置（仅弹窗，不页内跳转）'
          : '点击已完成步骤可查看说明（仅弹窗，不页内跳转）' }}
      </p>

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

      <!-- 因子面板 -->
      <div id="m08-factor-panel" class="m08-panel">
        <div class="m08-panel-head">
          <span class="m08-panel-title">试验因子配置</span>
          <span class="m08-factor-count">已配置因子：{{ m08FactorCount }}个</span>
          <span class="m08-factor-tip">
            {{ m08Snap.factorOk ? '（≥ 20 个，符合指标要求）' : '（未达 ≥20，草稿/归档快照）' }}
          </span>
          <span class="spacer"></span>
          <el-button
            :disabled="m08Snap.readonlyFactors"
            @click="m08AddFactor"
          >+ 新增因子</el-button>
        </div>
        <div class="m08-factor-grid">
          <div
            v-for="(f, i) in m08Factors"
            :key="f.name + i"
            class="m08-factor"
            @click="m08Snap.readonlyFactors ? (m08SelFactor = i) : m08OpenFactorDialog(i)"
          >
            <div class="m08-factor-name">{{ f.name }}</div>
            <div class="m08-factor-range">{{ f.levels }}</div>
            <div class="m08-factor-tag">{{ f.cat }}</div>
          </div>
        </div>
      </div>

      <!-- 大纲 + 对话 -->
      <div class="m08-lower">
        <div id="m08-outline-panel" class="m08-panel m08-outline">
          <div class="m08-panel-head">
            <span class="m08-panel-title">大纲预览</span>
            <span
              class="badge"
              :style="m08CurrentRow?.status === '已定稿' ? 'background:#fff8e8;color:#c8902a;margin-left:auto' : 'margin-left:auto'"
              :class="m08CurrentRow?.status === '已定稿' ? '' : 'on'"
            >
              <i :style="m08CurrentRow?.status === '已定稿' ? 'background:#d0ab68' : ''"></i>{{ m08Snap.previewBadge }}
            </span>
            <el-button @click="m08ExportWord">导出 Word</el-button>
          </div>
          <div class="m08-outline-body">
            <div class="m08-chap-tree">
              <div
                v-for="(ch, i) in m08Chapters"
                :key="ch.no"
                class="m08-chap"
                :class="{ on: m08ActiveChapter === i }"
                @click="m08ActiveChapter = i"
              >
                <span class="m08-chap-no">{{ ch.no }}</span>
                {{ ch.title }}
              </div>
            </div>
            <div class="m08-chap-content">
              <div class="m08-chap-h">{{ m08Chapters[m08ActiveChapter]?.no }} {{ m08Chapters[m08ActiveChapter]?.title }}</div>
              <div v-html="m08Chapters[m08ActiveChapter]?.content"></div>
            </div>
          </div>
        </div>

        <div id="m08-chat-panel" class="m08-panel m08-chat">
          <div class="m08-panel-head">
            <span class="m08-panel-title">多轮校核优化</span>
          </div>
          <div class="m08-chat-scroll">
            <div v-if="!m08Rounds.length" class="m08-chat-empty">
              暂无校核记录。草稿可在下方输入框追加一轮优化要求。
            </div>
            <div
              v-for="(round, ri) in m08Rounds"
              :id="'m08-round-' + ri"
              :key="ri"
              class="m08-round"
              :class="{ 'm08-round-focus': m08FocusVer === ('V' + (ri + 2)) }"
            >
              <div class="m08-bubble user">
                <div class="m08-bubble-meta">第{{ ['一', '二', '三', '四', '五'][ri] || (ri + 1) }}轮 · {{ round.time }}</div>
                {{ round.user }}
              </div>
              <div class="m08-bubble bot">{{ round.bot }}</div>
              <div class="m08-diff">
                <span>△ 差异</span>{{ round.diff }}
              </div>
            </div>
          </div>
          <div class="m08-chat-input">
            <p class="m08-chat-hint">{{ m08Snap.chatHint }}</p>
            <div class="m08-chat-row">
              <el-input
                v-model="m08ChatInput"
                :disabled="!m08ChatCanSend"
                placeholder="输入优化要求，如：补充寒区贮存工况…"
                @keyup.enter="m08SendChat"
              />
              <el-button type="primary" :disabled="!m08ChatCanSend" @click="m08SendChat">发送</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 版本条：V1 初稿 → 各轮对话优化 → 定稿；点击可回溯到对应校核轮次 -->
      <div class="m08-panel m08-ver-bar">
        <p class="m08-ver-hint">版本演进由右侧「多轮校核优化」对话驱动：V1 初稿 → 第1轮→V2 → 第2轮→V3 → 第3轮→V4 定稿。点击节点可跳转到对应轮次。</p>
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
      title="新建方案"
      width="560px"
      align-center
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form label-width="7.2em" require-asterisk-position="right" class="m08-create-form">
        <el-form-item label="方案名称" required>
          <el-input v-model="m08CreateForm.name" maxlength="80" placeholder="如 某型装备性能鉴定试验大纲" />
        </el-form-item>
        <el-form-item label="初始版本" required>
          <el-radio-group v-model="m08CreateForm.ver">
            <el-radio value="V1">V1 初稿</el-radio>
            <el-radio value="V2">V2</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="关联指标树" required>
          <el-select
            ref="treeSelectRef"
            v-model="m08CreateForm.treeVer"
            placeholder="请选择指标树版本"
            style="width:100%"
            popper-class="m08-select-popper"
            @change="onSelectPicked('tree')"
            @visible-change="(open) => !open && onSelectPicked('tree')"
          >
            <el-option
              v-for="op in m08TreeOptions"
              :key="op.value"
              :label="op.label"
              :value="op.value"
            >
              <span>{{ op.label }}</span>
              <span class="m08-opt-meta">{{ op.status }} · {{ op.count || 0 }} 项</span>
            </el-option>
          </el-select>
          <div class="m08-create-hint">选项来自「数据模型管理」指标树列表，与建模结果联动</div>
        </el-form-item>
        <el-form-item label="大纲模板" required>
          <el-select
            ref="tplSelectRef"
            v-model="m08CreateForm.template"
            style="width:100%"
            popper-class="m08-select-popper"
            @change="onSelectPicked('tpl')"
            @visible-change="(open) => !open && onSelectPicked('tpl')"
          >
            <el-option v-for="t in m08TemplateOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="初始状态">
          <el-radio-group v-model="m08CreateForm.status">
            <el-radio value="草稿">草稿</el-radio>
            <el-radio value="已定稿">已定稿</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="m08CreateForm.remark"
            type="textarea"
            :rows="2"
            maxlength="120"
            show-word-limit
            placeholder="可选，说明本方案考核范围或生成约束"
          />
        </el-form-item>
        <el-form-item label="创建后">
          <el-checkbox v-model="m08CreateForm.openAfter">立即进入生成结果页</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="m08CreateVisible = false">取消</el-button>
        <el-button type="primary" @click="m08SubmitCreate">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { nextTick, ref } from 'vue'
import { useRichPage } from '@/composables/rich/useRichPage'

export default {
  props: { page: Object, title: String },
  setup(props) {
    const ctx = useRichPage(props)
    const treeSelectRef = ref(null)
    const tplSelectRef = ref(null)

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

    return { ...ctx, treeSelectRef, tplSelectRef, blurSelect, onSelectPicked }
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
.m08-steps-hint { margin: -4px 0 0; font-size: 12px; color: #8a99a8; text-align: center; }
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
.m08-factor-tip { font-size: 13px; color: #8a99a8; }
.spacer { flex: 1; }

.m08-factor-grid {
  /* 固定约两行：卡高 72 + 间距 10 + 上下内边距 28 */
  height: 182px;
  padding: 14px 16px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  align-content: start;
  overflow-x: hidden;
  overflow-y: auto;
}
.m08-factor {
  position: relative;
  border: 1px solid #e0eaf3;
  border-radius: 8px;
  padding: 10px 10px 12px;
  background: #fff;
  cursor: pointer;
  height: 72px;
  min-height: 72px;
  box-sizing: border-box;
  overflow: hidden;
}
.m08-factor:hover { border-color: #b8cfe4; background: #f7fbfe; }
.m08-factor-name { font-size: 13px; font-weight: 600; color: #1f3d5a; padding-right: 36px; }
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
.m08-factor-range { margin-top: 5px; font-size: 11.5px; color: #5c7084; line-height: 1.5; }
.m08-factor-tag {
  position: absolute; top: 8px; right: 8px;
  font-size: 11px; color: #1668a8; background: #e8f2fb;
  padding: 1px 6px; border-radius: 8px;
}

.m08-lower {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 14px;
  align-items: stretch;
  min-height: 400px;
}
.m08-outline, .m08-chat { display: flex; flex-direction: column; min-height: 400px; max-height: 420px; }
.m08-outline-body { display: grid; grid-template-columns: 180px 1fr; flex: 1; min-height: 0; }
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
.m08-chat-input {
  border-top: 1px solid #eef3f8; padding: 10px 12px 12px; flex: 0 0 auto;
}
.m08-chat-hint { margin: 0 0 8px; font-size: 12px; color: #8a99a8; }
.m08-chat-row { display: flex; gap: 8px; }
.m08-chat-row :deep(.el-button + .el-button) { margin-left: 0; }

.m08-ver-bar { padding: 12px 18px; }
.m08-ver-hint { margin: 0 0 12px; font-size: 12.5px; color: #5c7084; line-height: 1.6; }
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
  margin-left: 0; /* 禁止与 gap 叠加 */
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
.m08-create-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #8a99a8;
  line-height: 1.5;
}

@media (max-width: 1200px) {
  .m08-factor-grid { grid-template-columns: repeat(4, 1fr); }
  .m08-lower { grid-template-columns: 1fr; }
}
</style>
