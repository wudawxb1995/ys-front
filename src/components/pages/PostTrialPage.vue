<template>
  <div class="post-trial">
    <div class="post-trial-shell">
      <div class="entry-title">
        <h2>{{ title }}</h2>
      </div>

    <template v-if="stage === 'outline'">
      <div class="wizard-stack">
        <section class="sec-frame step-frame">
          <h3><i></i>编写步骤</h3>
          <el-steps :active="1" finish-status="success" align-center>
            <el-step v-for="step in wizardSteps" :key="step" :title="step" />
          </el-steps>
        </section>
        <section class="sec-frame">
          <h3><i></i>提纲概况</h3>
          <div class="outline-stats">
            <div class="stat"><div class="k">提纲章节</div><div class="n">8 <small>章</small></div></div>
            <div class="stat"><div class="k">提纲要点</div><div class="n">24 <small>项</small></div></div>
            <div class="stat"><div class="k">知识引用</div><div class="n">31 <small>条</small></div></div>
            <div class="stat"><div class="k">完整度</div><div class="n">100 <small>%</small></div></div>
          </div>
        </section>
        <div class="outline-layout">
          <section class="sec-frame">
            <h3>
              <i></i>自动生成提纲
              <span class="h3-actions">
                <el-button @click="toast('已按鉴定报告模板重新排序')">自动排序</el-button>
                <el-button @click="addOutline">新增章节</el-button>
              </span>
            </h3>
            <div
              v-for="item in outlineRows"
              :key="item.no"
              class="outline-row"
              :class="{ selected: selectedOutline.no === item.no }"
              @click="selectedOutline = item"
            >
              <span class="drag">⋮⋮</span>
              <span class="chapter-no">{{ item.no }}</span>
              <b>{{ item.name }}</b>
              <span class="source-pill">{{ item.source }}</span>
            </div>
          </section>
          <section class="sec-frame outline-editor">
            <h3><i></i>章节设计 <em class="ok">已通过完整性检查</em></h3>
            <div class="field">
              <span class="field-cap">章节名称</span>
              <el-input v-model="selectedOutline.name" />
            </div>
            <div class="field">
              <span class="field-cap">生成来源</span>
              <div class="source-box">
                <span>{{ selectedOutline.source }}</span>
                <el-tag size="small" type="success" effect="light">已绑定</el-tag>
              </div>
            </div>
            <div class="field">
              <span class="field-cap">章节要点</span>
              <div class="point-list">
                <div v-for="(child, index) in selectedOutline.children" :key="index">
                  <span class="drag">⋮⋮</span>
                  <el-input v-model="selectedOutline.children[index]" />
                  <el-button link type="danger" @click="removePoint(index)">删除</el-button>
                </div>
              </div>
              <el-button class="add-point" @click="addPoint">添加要点</el-button>
            </div>
            <div class="recommend-box">
              <b>智能建议</b>
              <p>{{ outlineAdvice }}</p>
            </div>
            <div class="editor-actions">
              <el-button @click="saveOutline">保存提纲</el-button>
              <el-button type="primary" @click="goTo('write', 'generate-requirement')">下一步：配置生成素材</el-button>
            </div>
          </section>
        </div>
      </div>
    </template>

    <template v-else-if="stage === 'need'">
      <div class="wizard-stack">
        <section class="sec-frame step-frame">
          <h3><i></i>编写步骤</h3>
          <el-steps :active="0" finish-status="success" align-center>
            <el-step v-for="step in wizardSteps" :key="step" :title="step" />
          </el-steps>
        </section>
        <section class="sec-frame">
          <h3><i></i>勾选本次生成素材 <em>每类选 1 项</em></h3>
          <section class="name-block">
            <div class="field">
              <span class="field-cap">报告名称</span>
              <el-input
                v-model="needForm.reportTitle"
                maxlength="48"
                show-word-limit
                placeholder="请输入报告名称"
              />
            </div>
          </section>
          <div class="need-grid">
            <section v-for="group in materialPools" :key="group.key" class="need-col">
              <div class="need-col-head">
                <b>{{ group.title }}</b>
              </div>
              <label
                v-for="opt in group.options"
                :key="opt.id"
                class="need-opt"
                :class="{ on: needForm[group.key] === opt.id, disabled: opt.disabled }"
              >
                <input
                  v-model="needForm[group.key]"
                  type="radio"
                  :name="'need-' + group.key"
                  :value="opt.id"
                  :disabled="opt.disabled"
                />
                <div>
                  <div class="need-opt-top">
                    <strong>{{ opt.name }}</strong>
                    <el-tag v-if="opt.recommend" size="small" type="primary" effect="light">推荐</el-tag>
                    <el-tag v-else-if="opt.disabled" size="small" type="info" effect="light">不可用</el-tag>
                  </div>
                  <p>{{ opt.meta }}</p>
                  <small>{{ opt.source }}</small>
                </div>
              </label>
            </section>
          </div>
          <div class="wizard-actions">
            <el-button @click="goTo('write', 'outline')">返回提纲</el-button>
            <el-button @click="applyRecommended">一键选推荐项</el-button>
            <el-button type="primary" :disabled="!needReady" @click="confirmNeedAndGo">确认素材并进入内容生成</el-button>
          </div>
        </section>
      </div>
    </template>

    <template v-else-if="stage === 'compose'">
      <template v-if="composeMode === 'wizard'">
        <div class="wizard-stack">
          <section class="sec-frame step-frame">
            <h3><i></i>编写步骤</h3>
            <el-steps :active="2" finish-status="success" align-center>
              <el-step v-for="step in wizardSteps" :key="step" :title="step" />
            </el-steps>
          </section>
          <section v-if="!selectionConfirmed" class="sec-frame empty-need">
            <h3><i></i>尚未选择生成素材</h3>
            <p>请先在「文档生成需求配置」中勾选指标树、试验数据与解读报告，再回到本页装配初稿。</p>
            <div class="wizard-actions">
              <el-button type="primary" @click="goTo('write', 'generate-requirement')">去勾选素材</el-button>
            </div>
          </section>
          <template v-else>
            <section class="sec-frame">
              <h3>
                <i></i>已选素材
                <em>{{ selectedCount }}/3</em>
                <span class="h3-actions">
                  <el-button @click="goTo('write', 'generate-requirement')">重新勾选</el-button>
                </span>
              </h3>
              <div class="material-grid">
                <article v-for="material in materials" :key="material.id" class="material-card" :class="material.tone">
                  <div class="material-top">
                    <span class="material-icon">{{ material.id === 'rule' ? '树' : material.id === 'data' ? '表' : '析' }}</span>
                    <el-tag size="small" type="success" effect="light">已选用</el-tag>
                  </div>
                  <b>{{ material.name }}</b>
                  <p>{{ material.meta }}</p>
                  <small>来源：{{ material.source }}</small>
                </article>
              </div>
            </section>
            <section class="sec-frame">
              <h3><i></i>报告命名</h3>
              <div class="compose-name">
                <b>{{ draftReport.title || composeSel.reportTitle || '某型性能鉴定试验报告' }}</b>
                <span>生成后 → {{ draftReport.fullName || `${draftReport.title || '某型性能鉴定试验报告'} V1（初稿）` }}</span>
                <el-button link type="primary" @click="goTo('write', 'generate-requirement')">修改名称</el-button>
              </div>
            </section>
            <section class="sec-frame outline-frame">
              <h3><i></i>提纲预览 <em>8 章</em></h3>
              <div class="outline-list">
                <div v-for="item in outlineRows" :key="item.no" class="outline-item">
                  <b>{{ item.no }} {{ item.name }}</b>
                  <span>{{ item.children.join(' · ') }}</span>
                  <em>{{ item.source }}</em>
                </div>
              </div>
              <div class="wizard-actions">
                <el-button @click="goTo('write', 'outline')">编辑提纲</el-button>
                <el-button type="primary" :disabled="assembling || !selectionConfirmed" @click="generateDraft">生成初稿</el-button>
              </div>
            </section>
          </template>
        </div>
      </template>

      <template v-else>
        <div class="document-toolbar">
          <div>
            <b>{{ draftReport.title }}</b>
            <span>{{ draftReport.version }}（{{ draftReport.stage }}）</span>
            <span class="good-tag">已生成</span>
          </div>
          <div class="btn-row"><el-button @click="composeMode = 'wizard'">返回编写向导</el-button><el-button @click="goTo('write', 'trace')">查看数据溯源</el-button><el-button type="primary" @click="submitReview">进入智能审查</el-button></div>
        </div>
        <div class="report-layout">
          <aside class="report-nav sec-frame">
            <div class="panel-title"><span>报告章节</span><small>8章</small></div>
            <button v-for="item in outlineRows" :key="item.no" :class="{ active: postTrialState.selectedChapter === item.name }" @click="postTrialState.selectedChapter = item.name"><span>{{ item.no }}</span>{{ item.name }}<em>✓</em></button>
          </aside>
          <section class="report-paper sec-frame">
            <div class="paper-title">
              <div>
                <small>第{{ selectedChapterMeta.no }}章</small>
                <h2>{{ postTrialState.selectedChapter }}</h2>
              </div>
              <span class="trace-badge">本节可溯源</span>
            </div>

            <template v-if="postTrialState.selectedChapter === '符合性判定'">
              <div class="event-summary">
                <b>第19发判定：{{ shot19.conclusion }}</b>
                <span>首测 {{ shot19.firstDh }} {{ shot19.unit }} 超差，温补校准后复测 {{ shot19.retestDh }} {{ shot19.unit }}，判据 ≤ {{ shot19.criterion }} {{ shot19.unit }}</span>
              </div>
              <p class="paper-text">{{ judgmentNarrative }}</p>
              <div class="metric-table-wrap">
                <el-table :data="metricRows" class="metric-ep" max-height="510">
                  <el-table-column prop="no" label="序号" width="72" align="center" />
                  <el-table-column prop="name" label="指标名称" min-width="150">
                    <template #default="{ row }">
                      <b>{{ row.name }}</b>
                      <small v-if="row.event" class="event-hint">{{ row.event }}</small>
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="实测值" min-width="168" show-overflow-tooltip />
                  <el-table-column prop="criterion" label="判据" min-width="140" />
                  <el-table-column label="符合性结论" width="120" align="center">
                    <template #default="{ row }">
                      <span class="badge" :class="statusBadgeClass(row.conclusion)"><i></i>{{ row.conclusion }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="引用" width="168" align="center">
                    <template #default="{ row }">
                      <div class="ops" style="justify-content:center">
                        <button type="button" @click="showSource(row)">引自 {{ row.source }}</button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </template>

            <template v-else-if="postTrialState.selectedChapter === '异常事件与处置'">
              <div class="event-summary">
                <b>{{ eventBridge.eventName }}闭环</b>
                <span>事件编号 {{ eventBridge.eventId }}</span>
              </div>
              <p class="paper-text">{{ eventBridge.narrative }}</p>
              <div class="scatter"><div class="target-ring r1"></div><div class="target-ring r2"></div><div class="target-ring r3"></div><i v-for="n in 8" :key="n" :style="scatterStyle(n)"></i><i class="outlier"></i><span>× 第19发首测</span><em>● 复测</em></div>
              <div class="cause-table">
                <div><b>候选根因</b><b>证据</b><b>结论</b></div>
                <div><span>{{ eventBridge.rootCause }}</span><span>温漂曲线与偏差同向，校准后恢复（置信度 {{ eventBridge.confidence }}）</span><strong>确认根因</strong></div>
                <div><span>机械安装偏差</span><span>复核无松动，静态检查正常</span><span>排除</span></div>
              </div>
              <div class="source-note">来源：{{ eventBridge.reportTitle }} · {{ eventBridge.reportSource }} · {{ eventBridge.reportVersion }}</div>
            </template>

            <template v-else>
              <p class="paper-text">{{ chapterBody.lead }}</p>
              <div class="chapter-points">
                <div v-for="(block, idx) in chapterBody.blocks" :key="idx" class="chapter-point">
                  <b>{{ selectedChapterMeta.no }}.{{ idx + 1 }} {{ block.title }}</b>
                  <p>{{ block.text }}</p>
                </div>
              </div>
              <div class="source-note">生成来源：{{ selectedChapterMeta.source }}</div>
            </template>

            <footer class="version-bar">
              <span>文档版本：<b>V1 初稿</b></span>
              <span>素材基线：{{ metricTreeLabel }} / {{ outlineBaseline }} / {{ dockLabel }}</span>
              <span>生成时间：2026-10-22 15:32</span>
            </footer>
          </section>
        </div>
      </template>
    </template>

    <template v-else-if="stage === 'trace'">
      <div class="wizard-stack">
        <section class="sec-frame">
          <h3>
            <i></i>文档生成溯源与版本管控
            <span class="h3-actions">
              <el-button @click="goTo('write', 'draft')">返回初稿</el-button>
              <el-button type="primary" @click="submitReview">进入智能审查</el-button>
            </span>
          </h3>
          <p class="review-meta">{{ draftReport.fullName }}</p>
        </section>
        <section class="sec-frame">
          <h3><i></i>追溯概况</h3>
          <div class="outline-stats">
            <div class="stat"><div class="k">过程节点</div><div class="n">8</div></div>
            <div class="stat"><div class="k">引用依据</div><div class="n">36</div></div>
            <div class="stat"><div class="k">文档版本</div><div class="n">2</div></div>
            <div class="stat"><div class="k">修改记录</div><div class="n">11</div></div>
          </div>
        </section>
        <section class="sec-frame">
          <h3><i></i>文档生成全过程</h3>
          <el-tabs v-model="traceTab">
            <el-tab-pane label="过程时间轴" name="timeline">
              <div class="flow-grid">
                <div v-for="(node, index) in lineage" :key="node.name" class="flow-node" :class="{ active: index === 5 }">
                  <b>{{ node.icon }}</b>
                  <strong>{{ node.name }}</strong>
                  <span>{{ node.time }}</span>
                  <small>{{ node.desc }}</small>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="条款关系图" name="graph">
              <div class="relate-list">
                <div v-for="row in traceRows" :key="row.clause" class="relate-item">
                  <b>{{ row.clause }}</b>
                  <span>{{ row.type }}</span>
                  <em>{{ row.source }} · {{ row.location }}</em>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="版本演进" name="version">
              <div class="version-list">
                <div class="version-card current"><b>V2 定稿</b><p>审查意见处理后形成</p><small>2026-10-22 16:38 · 7项意见已留痕</small></div>
                <div class="version-card"><b>V1 初稿</b><p>装配式生成</p><small>2026-10-22 15:32 · 素材基线 D-12/D-13</small></div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </section>
        <div class="trace-grid">
          <section class="sec-frame">
            <h3>
              <i></i>条款与引用追溯
              <span class="h3-actions">
                <el-button @click="toast('全部引用校验通过')">引用校验</el-button>
              </span>
            </h3>
            <div class="metric-table-wrap">
              <el-table :data="traceRows" class="metric-ep">
                <el-table-column prop="clause" label="文书条款" min-width="200" show-overflow-tooltip />
                <el-table-column prop="type" label="来源类型" width="120" />
                <el-table-column prop="source" label="来源名称" min-width="150" show-overflow-tooltip />
                <el-table-column prop="location" label="来源位置" min-width="140" show-overflow-tooltip />
                <el-table-column label="引用状态" width="110" align="center">
                  <template #default>
                    <span class="badge on"><i></i>引用有效</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" align="center">
                  <template #default="{ row }">
                    <div class="ops">
                      <button type="button" @click="toast(`已定位：${row.source} ${row.location}`)">跳转原文</button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </section>
          <section class="sec-frame">
            <h3><i></i>版本记录</h3>
            <div class="version-card current"><b>V2 定稿</b><p>审查意见处理后形成</p><small>2026-10-22 16:38 · 7项意见已留痕</small></div>
            <div class="version-card"><b>V1 初稿</b><p>装配式生成</p><small>2026-10-22 15:32 · 素材基线 D-12/D-13</small></div>
          </section>
        </div>
      </div>
    </template>

    <template v-else-if="stage === 'review'">
      <template v-if="reviewMode === 'tasks'">
        <section class="sec-frame">
          <h3><i></i>智能审查任务</h3>
          <div class="filter-row">
            <el-input v-model="taskSearch" placeholder="搜索任务名称或审查对象" clearable />
            <el-select v-model="taskStatus" style="width: 140px">
              <el-option label="全部状态" value="全部状态" />
              <el-option label="已完成" value="已完成" />
              <el-option label="待复核" value="待复核" />
            </el-select>
            <div class="btn-row">
              <el-button type="primary">查询</el-button>
              <el-button @click="taskSearch = ''; taskStatus = '全部状态'">重置</el-button>
            </div>
          </div>
          <div class="metric-table-wrap">
            <el-table :data="filteredTasks" class="metric-ep" table-layout="fixed" @row-click="openReview">
              <el-table-column prop="name" label="任务名称" min-width="200" show-overflow-tooltip />
              <el-table-column prop="target" label="审查对象" min-width="200" show-overflow-tooltip />
              <el-table-column prop="rules" label="审查规则集" min-width="220" show-overflow-tooltip />
              <el-table-column prop="issues" label="意见数" width="90" align="center" />
              <el-table-column label="状态" width="110" align="center">
                <template #default="{ row }">
                  <span class="badge" :class="statusBadgeClass(row.status)"><i></i>{{ row.status }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="time" label="完成时间" width="170" show-overflow-tooltip />
              <el-table-column label="操作" width="120" align="center">
                <template #default>
                  <div class="ops">
                    <button type="button" @click.stop="openReview">查看结果</button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </section>
      </template>
      <template v-else>
        <div class="wizard-stack">
          <section class="sec-frame">
            <h3>
              <i></i>{{ draftReport.title }}{{ draftReport.version }}审查
              <span class="h3-actions">
                <el-button @click="reviewMode = 'tasks'">返回任务列表</el-button>
                <el-button type="primary" @click="finalizeArchive">一键定稿归集</el-button>
              </span>
            </h3>
            <div class="review-meta">
              <span>术语规范 · 数据勾稽 · 判据引用</span>
              <div class="progress-line">
                <span>处理进度 {{ processedCount }}/7</span>
                <el-progress :percentage="Math.round(processedCount / 7 * 100)" :stroke-width="8" :show-text="false" color="#1668a8" />
              </div>
            </div>
          </section>
          <div class="review-layout">
            <section class="sec-frame">
              <h3><i></i>{{ draftReport.reviewTarget }}</h3>
              <div class="paper">
                <small>{{ activeIssue.location }}</small>
                <h2>{{ activeIssue.type === '判据引用' ? '6 符合性判定' : activeIssue.type === '数据勾稽' ? '8 结论与建议' : '1 试验任务概述' }}</h2>
                <p>根据试验任务安排，本次试验依据性能试验提纲组织实施，试验数据完整，过程记录可追溯。</p>
                <p class="highlight-line" :class="{ pulse: locating }">
                  {{ activeIssue.snippet }}
                  <el-tag size="small" type="warning" effect="light" class="issue-mark">审查意见 {{ activeIssue.id }}</el-tag>
                </p>
                <p>经逐项核对指标树、原始记录与数据汇总表，报告所列结果具备判定依据；相关修改将在定稿版本中保留处理记录。</p>
                <el-alert
                  class="located-tip"
                  type="info"
                  :closable="false"
                  show-icon
                  :title="`已定位到：${activeIssue.location}`"
                />
              </div>
            </section>
            <aside class="sec-frame issue-side">
              <h3>
                <i></i>审查意见
                <el-select v-model="issueFilter" style="width: 140px; margin-left: auto">
                  <el-option label="全部类型" value="全部类型" />
                  <el-option label="术语规范" value="术语规范" />
                  <el-option label="数据勾稽" value="数据勾稽" />
                  <el-option label="判据引用" value="判据引用" />
                </el-select>
              </h3>
              <div class="issue-list">
                <div v-for="group in issueGroups" :key="group.type" class="issue-group">
                  <div class="issue-group-title">{{ group.type }} · {{ group.items.length }} 条</div>
                  <article
                    v-for="issue in group.items"
                    :key="issue.id"
                    class="issue-card"
                    :class="{ active: activeIssue.id === issue.id }"
                    @click="locateIssue(issue)"
                  >
                    <div class="issue-top">
                      <el-tag size="small" type="warning" effect="light">{{ issue.type }}</el-tag>
                      <el-tag size="small" :type="issue.status === '已采纳' ? 'success' : 'warning'" effect="light">{{ issue.status }}</el-tag>
                    </div>
                    <h4>{{ issue.title }}</h4>
                    <p>位置：{{ issue.location }}</p>
                    <p>依据：{{ issue.basis }}</p>
                    <div class="issue-actions">
                      <div class="ops">
                        <button type="button" @click.stop="locateIssue(issue)">定位</button>
                      </div>
                      <span>{{ issue.handler }} · {{ issue.time.slice(11) }}</span>
                    </div>
                  </article>
                </div>
              </div>
              <div class="issue-detail">
                <b>智能修改建议</b>
                <p>{{ activeIssue.suggestion }}</p>
                <div class="btn-row">
                  <el-button @click="ignoreIssue">忽略</el-button>
                  <el-button type="primary" @click="acceptIssue">采纳建议</el-button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </template>
    </template>

    <template v-else-if="stage === 'archive'">
      <section class="sec-frame">
        <h3><i></i>文档归集 <em>试验报告V2（定稿）已入库</em></h3>
        <div class="filter-row">
          <el-input v-model="archiveSearch" placeholder="搜索文档名称或编号" clearable @keyup.enter="applyArchiveFilter" />
          <el-select v-model="archiveType" style="width: 180px">
            <el-option label="全部类型" value="全部类型" />
            <el-option label="性能鉴定试验报告" value="性能鉴定试验报告" />
            <el-option label="试验提纲" value="试验提纲" />
            <el-option label="异常分析报告" value="异常分析报告" />
          </el-select>
          <div class="btn-row">
            <el-button type="primary" @click="applyArchiveFilter">查询</el-button>
            <el-button @click="resetArchiveFilter">重置</el-button>
            <el-button @click="toast('批量归集窗口已打开')">新增</el-button>
          </div>
        </div>
        <div class="metric-table-wrap">
          <el-table :data="filteredArchive" class="metric-ep">
            <el-table-column prop="name" label="文档名称" min-width="220" />
            <el-table-column prop="type" label="类型" min-width="160" show-overflow-tooltip />
            <el-table-column prop="secret" label="密级" width="80" />
            <el-table-column prop="time" label="归集时间" width="170" />
            <el-table-column label="状态" width="110" align="center">
              <template #default="{ row }">
                <span class="badge" :class="statusBadgeClass(row.status)"><i></i>{{ row.status }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" align="center">
              <template #default="{ row }">
                <div class="ops">
                  <button type="button" @click="viewArchive(row)">查看</button>
                  <button type="button" @click="downloadArchive(row)">下载</button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="archive-foot"><span>试验报告V2（定稿）已完成版本固化与归档入库</span></div>
      </section>
    </template>
    </div>

    <div v-if="assembling || archiving" class="work-mask">
      <div>
        <b>{{ assembling ? '正在装配《性能鉴定试验报告》初稿' : '正在定稿归集' }}</b>
        <p>{{ workStage }}</p>
        <i><em :style="{ width: workProgress + '%' }"></em></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUi } from '@/composables/ui'
import { useDemoStore, finalizeTrialReport, confirmComposeSelection, markDraftReportGenerated } from '@/composables/demo-store'
import {
  archiveRows,
  postTrialMetrics,
  postTrialOutline,
  postTrialState,
  reviewIssues,
  reviewTasks,
} from '@/data/postTrial'

const props = defineProps({ page: Object, title: String })
const router = useRouter()
const { toast, openDrawer } = useUi()
const demoStore = useDemoStore()

const dock = computed(() => demoStore.trialDataDock || {})
const shot19 = computed(() => dock.value.shot19 || {
  shotNo: 19, firstDh: 0.42, retestDh: 0.18, criterion: 0.30, unit: 'mil', conclusion: '复测后符合',
})
const cause = computed(() => demoStore.confirmedRootCause || {})
const report = computed(() => demoStore.reportArchived || {})
const composeSel = computed(() => demoStore.composeSelection || {})
const selectionConfirmed = computed(() => Boolean(composeSel.value.confirmed))
const draftReport = computed(() => demoStore.draftReport || {
  title: '某型性能鉴定试验报告',
  version: 'V1',
  stage: '初稿',
  fullName: '某型性能鉴定试验报告 V1（初稿）',
  reviewTarget: '某型性能鉴定试验报告 V1',
  generated: false,
})

const metricTreeLabel = computed(() =>
  `指标树 ${demoStore.metricTreeVersion} · ${demoStore.metricTreeCount} 项`
)
const outlineBaseline = computed(() => {
  const ctx = demoStore.matchContext || {}
  if (ctx.schemeName) return ctx.schemeName.includes('V') ? ctx.schemeName.replace(/^某型装备/, '') : `${ctx.schemeName} ${ctx.ver || ''}`.trim()
  return '性能鉴定试验大纲 V4'
})
const dockLabel = computed(() =>
  `${dock.value.taskName || '精度试验数据回传接入'}（${dock.value.batch || 'D-07'} · ${dock.value.shotCount || 30}发）`
)

const outlineAdvice = computed(() =>
  '建议在「符合性判定」保留指标树版本与第19发事件关联字段；「异常事件与处置」章绑定已归档解读报告，便于审查溯源。'
)

/** 需求配置可选池：含推荐项与对照项 */
const materialPools = computed(() => [
  {
    key: 'ruleId',
    title: '指标树判据',
    hint: '来自试验指标树',
    options: [
      { id: 'tree-v1', name: metricTreeLabel.value, meta: '已发布 · 性能鉴定主基线', source: `试验指标树 ${demoStore.metricTreeVersion}`, recommend: true },
      { id: 'tree-v09', name: '指标树 V0.9 · 24 项', meta: '草稿 · 不宜作为定稿判据', source: '试验指标树 V0.9', recommend: false },
    ],
  },
  {
    key: 'dataId',
    title: '试验数据',
    hint: '来自精度试验数据回传',
    options: [
      {
        id: 'dock-t01',
        name: dock.value.taskName || '精度试验数据回传接入',
        meta: `${dock.value.batch || 'D-07'} · ${dock.value.shotCount || 30}发 · 含第19发复测`,
        source: `对接任务 ${dock.value.taskId || 'T01'} · ${dock.value.status || '成功'}`,
        recommend: true,
      },
      { id: 'dock-t02', name: '气象数据同步接入', meta: '30 组气象记录 · 不含弹道散布', source: '对接任务 T02', recommend: false },
    ],
  },
  {
    key: 'eventId',
    title: '异常解读报告',
    hint: '来自探针平台归档',
    options: [
      {
        id: 'rpt-001',
        name: report.value.title || '第19发超差事件解读报告',
        meta: `${report.value.rootCause || cause.value.name || '温补失效'} · ${report.value.retest || '复测符合'}`,
        source: `${report.value.source || '探针设计与智能定位平台'} · ${report.value.version || 'V1.1'}`,
        recommend: Boolean(report.value?.id),
      },
      { id: 'rpt-empty', name: '（暂无其它已归档解读报告）', meta: '请先在探针平台归档解读报告', source: '—', recommend: false, disabled: true },
    ],
  },
])

function recommendedNeedIds() {
  return {
    ruleId: 'tree-v1',
    dataId: 'dock-t01',
    eventId: report.value?.id ? 'rpt-001' : '',
    reportTitle: composeSel.value.reportTitle || draftReport.value.title || '某型性能鉴定试验报告',
  }
}

function applyNeedDefaults({ silent } = {}) {
  const rec = recommendedNeedIds()
  // 进入本页始终默认勾选「推荐」项；报告名称保留已填
  needForm.ruleId = rec.ruleId
  needForm.dataId = rec.dataId
  needForm.eventId = rec.eventId || 'rpt-001'
  needForm.reportTitle = composeSel.value.reportTitle || draftReport.value.title || rec.reportTitle
  if (!silent && !needForm.eventId) {
    toast('解读报告尚未归档，请先完成探针平台归档')
  }
}

const needForm = reactive({
  ruleId: 'tree-v1',
  dataId: 'dock-t01',
  eventId: report.value?.id ? 'rpt-001' : '',
  reportTitle: composeSel.value.reportTitle || draftReport.value.title || '某型性能鉴定试验报告',
})
applyNeedDefaults({ silent: true })

watch(() => props.page.stage, (s) => {
  if (s !== 'need') return
  applyNeedDefaults({ silent: true })
}, { immediate: true })

const needReady = computed(() => Boolean(
  needForm.ruleId
  && needForm.dataId
  && needForm.eventId
  && needForm.eventId !== 'rpt-empty'
  && String(needForm.reportTitle || '').trim(),
))

function applyRecommended() {
  const rec = recommendedNeedIds()
  needForm.ruleId = rec.ruleId
  needForm.dataId = rec.dataId
  needForm.eventId = rec.eventId
  if (!String(needForm.reportTitle || '').trim()) needForm.reportTitle = rec.reportTitle
  toast(needForm.eventId ? '已勾选推荐素材' : '解读报告尚未归档，请先完成探针平台归档')
}
function confirmNeedAndGo() {
  if (!needReady.value) return toast('请填写报告名称，并每类勾选一项可用素材')
  confirmComposeSelection({ ...needForm })
  toast(`已确认报告名称「${needForm.reportTitle.trim()}」`)
  goTo('write', 'draft')
}

function resolveSelectedOption(groupKey, id) {
  const group = materialPools.value.find((g) => g.key === groupKey)
  return group?.options.find((o) => o.id === id)
}

const materials = computed(() => {
  const rule = resolveSelectedOption('ruleId', composeSel.value.ruleId)
  const data = resolveSelectedOption('dataId', composeSel.value.dataId)
  const event = resolveSelectedOption('eventId', composeSel.value.eventId)
  return [
    { id: 'rule', name: rule?.name || '未选择指标树', meta: rule?.meta || '请先在需求配置中勾选', source: rule?.source || '—', tone: 'blue' },
    { id: 'data', name: data?.name || '未选择试验数据', meta: data?.meta || '请先在需求配置中勾选', source: data?.source || '—', tone: 'blue' },
    { id: 'event', name: event?.name || '未选择解读报告', meta: event?.meta || '请先在需求配置中勾选', source: event?.source || '—', tone: 'blue' },
  ]
})
const selectedCount = computed(() =>
  [composeSel.value.ruleId, composeSel.value.dataId, composeSel.value.eventId].filter(Boolean).length
)

const eventBridge = computed(() => {
  const s = shot19.value
  const root = cause.value.name || report.value.rootCause || '定位定向系统温补失效'
  return {
    eventId: cause.value.eventId || report.value.eventId || 'EVT-001',
    eventName: cause.value.eventName || report.value.eventName || '第19发超差事件',
    rootCause: root,
    confidence: cause.value.confidence ?? 0.86,
    reportTitle: report.value.title || '第19发超差事件解读报告',
    reportSource: report.value.source || '探针设计与智能定位平台',
    reportVersion: report.value.version || 'V1.1',
    narrative: `第${s.shotNo}发试验中发现立靶高低偏差超差（首测 ${s.firstDh} ${s.unit}，判据 ≤ ${s.criterion} ${s.unit}）。经探针设计与智能定位平台定位，根因为${root}；完成温补校准后，对同一工况组织复测，复测值为 ${s.retestDh} ${s.unit}，符合判据要求。数据来源：${dock.value.taskName || '精度试验数据回传接入'}（${dock.value.batch || 'D-07'}）。`,
  }
})

const judgmentNarrative = computed(() =>
  `依据${metricTreeLabel.value}、${dockLabel.value}及复测记录，对${demoStore.metricTreeCount}项性能指标逐项完成符合性判定。${demoStore.metricTreeCount - 1}项直接符合，立靶高低偏差经温补校准后${shot19.value.conclusion}（关联${cause.value.eventName || '第19发超差事件'}）。`
)

const selectedChapterMeta = computed(() => {
  const hit = outlineRows.value.find((item) => item.name === postTrialState.selectedChapter)
  return hit || { no: '6', name: postTrialState.selectedChapter, source: '自动装配', children: [] }
})

/** 非第6/7章的正文：按章节区分，避免 1～6 共用符合性判定表 */
const chapterBody = computed(() => {
  const name = postTrialState.selectedChapter
  const children = selectedChapterMeta.value.children || []
  const tree = metricTreeLabel.value
  const dockName = dock.value.taskName || '精度试验数据回传接入'
  const batch = dock.value.batch || 'D-07'
  const shots = dock.value.shotCount || 30
  const outline = outlineBaseline.value
  const evt = cause.value.eventName || '第19发超差事件'
  const rpt = report.value.title || '第19发超差事件解读报告'

  const catalog = {
    试验任务概述: {
      lead: `本章说明本次性能鉴定试验的任务来源、鉴定目的与受试对象，报告编制依据提纲「${outline}」。`,
      blocks: [
        { title: '任务来源', text: `依据定型鉴定任务安排，组织某型装备性能鉴定试验，形成《性能鉴定试验报告》初稿。` },
        { title: '鉴定目的', text: `核验受试对象在规定工况下是否满足${tree}所列判据，并形成可追溯判定结论。` },
        { title: '受试对象', text: '受试对象为某型 A01，试验工况覆盖机动、火力与环境适应性相关科目。' },
      ],
    },
    试验依据: {
      lead: `本章列明试验引用标准、判定规则及判据版本，主判据基线为${tree}。`,
      blocks: [
        { title: '引用标准', text: `试验组织与判定执行${tree}及性能鉴定相关标准条款。` },
        { title: '判定规则', text: '逐项比对实测值与判据；超差科目允许在完成处置后组织复测并单独说明。' },
        { title: '版本说明', text: `判据版本以${tree}为准，提纲版本与「${outline}」保持一致。` },
      ],
    },
    试验条件: {
      lead: '本章汇总试验环境、设备保障与人员分工，保证实施过程可复核。',
      blocks: [
        { title: '环境条件', text: '试验在规定温湿度与气象窗口内实施，气象同步数据已接入。' },
        { title: '设备与保障', text: '弹道测量、遥测与标定台等设备按大纲配置，状态检查通过。' },
        { title: '人员分工', text: '试验指挥、数据采集与质量监督岗位齐全，职责划分明确。' },
      ],
    },
    试验实施: {
      lead: `本章记录样本与工况安排、实施过程及数据质量情况，原始数据来自「${dockName}」。`,
      blocks: [
        { title: '样本与工况', text: `共安排 ${shots} 发有效样本及 1 组复测工况，覆盖大纲规定科目。` },
        { title: '实施过程', text: `按大纲科目顺序实施；第19发触发超差告警后暂停，完成温补校准后再组织复测。` },
        { title: '数据质量', text: `${batch} 回传数据完整性校验通过，缺失率满足入库要求。` },
      ],
    },
    试验结果: {
      lead: `本章给出原始结果、统计结果与图表汇总，数据基线为 ${batch}（${shots}发）及复测记录。`,
      blocks: [
        { title: '原始结果', text: `30 发原始记录已汇集；其中第19发立靶高低偏差首测 ${shot19.value.firstDh} ${shot19.value.unit}。` },
        { title: '统计结果', text: '除立靶高低偏差外，其余指标统计量均落在判据区间内。' },
        { title: '图表汇总', text: '弹着点散布、时序曲线等图表见附件；复测数据单列，不重复计入 30 发统计量。' },
      ],
    },
    结论与建议: {
      lead: `综合${tree}判定结果与「${rpt}」，形成鉴定结论与后续建议。`,
      blocks: [
        { title: '鉴定结论', text: `${demoStore.metricTreeCount} 项指标中 ${demoStore.metricTreeCount - 1} 项直接符合，立靶高低偏差经处置后${shot19.value.conclusion}，总体满足鉴定要求。` },
        { title: '遗留事项', text: `「${evt}」已闭环，复测记录与审查意见需随定稿一并留痕。` },
        { title: '后续建议', text: '建议将温补校准规程纳入例行维护，并在后续批次试验中加强温漂监测。' },
      ],
    },
  }

  const preset = catalog[name]
  if (preset) return preset
  return {
    lead: `本章依据提纲自动装配，生成来源：${selectedChapterMeta.value.source}。`,
    blocks: (children.length ? children : ['本章要点']).map((title) => ({
      title,
      text: `围绕「${title}」完成条文整理，细节可在定稿前继续校核。`,
    })),
  }
})

const metricRows = computed(() => postTrialMetrics.map((row) => {
  const treeSrc = `指标树 ${demoStore.metricTreeVersion}`
  if (!row.linkedShot) return { ...row, source: treeSrc }
  const s = shot19.value
  return {
    ...row,
    value: `首测 ${s.firstDh} / 复测 ${s.retestDh} ${s.unit}`,
    criterion: `≤ ${s.criterion} ${s.unit}`,
    conclusion: s.conclusion,
    source: treeSrc,
    event: `关联${cause.value.eventName || '第19发超差事件'} ${cause.value.eventId || 'EVT-001'}`,
  }
}))
const stage = computed(() => props.page.stage)
const wizardSteps = ['汇集素材', '设计提纲', '生成初稿', '审校定稿']
function buildOutlineRows() {
  const reportTitle = demoStore.reportArchived?.title || '第19发超差事件解读报告'
  const dockName = demoStore.trialDataDock?.taskName || '精度试验数据回传接入'
  const tree = `指标树 ${demoStore.metricTreeVersion}`
  return postTrialOutline.map((item) => {
    let source = item.source
    if (item.no === '2') source = tree
    if (item.no === '5') source = `${dockName} T01`
    if (item.no === '6') source = `${tree} + D-07 汇总`
    if (item.no === '7') source = reportTitle
    return { ...item, source, children: [...item.children] }
  })
}
const outlineRows = ref(buildOutlineRows())
const selectedOutline = ref(outlineRows.value[5])
watch(
  () => [demoStore.metricTreeVersion, demoStore.reportArchived?.title, demoStore.trialDataDock?.taskName],
  () => {
    const prevNo = selectedOutline.value?.no
    const next = buildOutlineRows()
    outlineRows.value = next.map((row) => {
      const old = outlineRows.value.find((o) => o.no === row.no)
      return old ? { ...row, name: old.name, children: old.children } : row
    })
    selectedOutline.value = outlineRows.value.find((o) => o.no === prevNo) || outlineRows.value[5]
  },
)
const composeMode = ref('wizard')
const traceTab = ref('timeline')
const reviewMode = ref(props.page.entry === 'result' ? 'result' : 'tasks')
watch(() => [props.page.stage, props.page.entry], () => {
  if (props.page.stage === 'compose') composeMode.value = 'wizard'
  if (props.page.stage === 'review') reviewMode.value = props.page.entry === 'result' ? 'result' : 'tasks'
})
const taskSearch = ref('')
const taskStatus = ref('全部状态')
const issueFilter = ref('全部类型')
const archiveSearch = ref('')
const archiveType = ref('全部类型')
/** 已生效的查询条件（仅点「查询」后更新，避免输入即过滤） */
const archiveQuery = ref({ search: '', type: '全部类型' })
function applyArchiveFilter() {
  archiveQuery.value = { search: archiveSearch.value.trim(), type: archiveType.value }
}
function resetArchiveFilter() {
  archiveSearch.value = ''
  archiveType.value = '全部类型'
  archiveQuery.value = { search: '', type: '全部类型' }
}
const assembling = ref(false)
const archiving = ref(false)
const locating = ref(false)
const workProgress = ref(0)
const workStage = ref('')

const lineage = computed(() => [
  { icon: '需', name: '需求配置', time: '14:56', desc: '报告类型与生成范围' },
  { icon: '模', name: '模板引用', time: '15:02', desc: '标准模板 V3.2' },
  { icon: '纲', name: '提纲生成', time: '15:08', desc: '8章24项要点' },
  { icon: '知', name: '知识提取', time: '15:14', desc: `${dockLabel.value} + 解读报告已汇集` },
  { icon: '数', name: '数据装配', time: '15:25', desc: `${demoStore.metricTreeCount}项判定 · 第19发复测闭环` },
  { icon: '文', name: '内容生成', time: '15:32', desc: '初稿 V1 已生成' },
  { icon: '审', name: '智能审查', time: '15:46', desc: '发现7条意见' },
  { icon: '定', name: '版本定稿', time: '16:38', desc: demoStore.trialReportV2Archived ? '定稿 V2 已归集' : '待定稿归集' },
])

const traceRows = computed(() => {
  const s = shot19.value
  const tree = `指标树 ${demoStore.metricTreeVersion}`
  return [
    { clause: `立靶高低偏差 ≤ ${s.criterion} ${s.unit}`, type: '指标树判据', source: tree, location: '6.5.19' },
    { clause: `首测${s.firstDh} / 复测${s.retestDh} ${s.unit}`, type: '试验数据', source: dock.value.taskName || '精度试验数据回传接入', location: `D-07 第${s.shotNo}发及复测记录` },
    { clause: `${cause.value.name || '温补失效'}及校准处置`, type: '异常解读', source: report.value.title || '第19发超差事件解读报告', location: `${cause.value.eventId || 'EVT-001'} 根因结论` },
    { clause: '越壕宽 ≥ 1.8 m', type: '指标树判据', source: tree, location: '6.3.9' },
  ]
})

/** 审查任务列表：首条审查对象与已生成报告名称联动 */
const liveReviewTasks = computed(() => {
  const r = draftReport.value
  const target = r.reviewTarget || '某型性能鉴定试验报告 V1'
  const taskName = `${r.title || '某型性能鉴定试验报告'}${r.version || 'V1'}审查`
  return reviewTasks.map((task) => {
    if (task.id !== 'review-v1') return task
    return {
      ...task,
      name: taskName,
      target,
      status: r.generated ? '已完成' : '待审查',
      time: r.generatedAt || task.time,
      linked: true,
    }
  })
})
const filteredTasks = computed(() => liveReviewTasks.value.filter((task) => {
  const matchSearch = !taskSearch.value || `${task.name}${task.target}`.includes(taskSearch.value)
  const matchStatus = taskStatus.value === '全部状态' || task.status === taskStatus.value
  return matchSearch && matchStatus
}))
const filteredIssues = computed(() => reviewIssues.filter((issue) => issueFilter.value === '全部类型' || issue.type === issueFilter.value))
const issueGroups = computed(() => ['术语规范', '数据勾稽', '判据引用']
  .map((type) => ({ type, items: filteredIssues.value.filter((issue) => issue.type === type) }))
  .filter((group) => group.items.length))
const activeIssue = computed(() => reviewIssues.find((issue) => issue.id === postTrialState.activeIssueId) || reviewIssues[0])
const processedCount = computed(() => reviewIssues.filter((issue) => issue.status === '已采纳').length)
/** 归集列表：试验报告V2 / 提纲 / 解读报告与 store 同步 */
const liveArchiveRows = computed(() => {
  const r = report.value
  const ctx = demoStore.matchContext || {}
  return archiveRows.map((row) => {
    if (row.id === 'RPT-2026-1022-001') {
      const r = draftReport.value
      return {
        ...row,
        name: demoStore.trialReportV2Archived
          ? (r.fullName || '试验报告V2（定稿）')
          : '试验报告V2（定稿）',
        version: r.version === 'V2' ? 'V2' : row.version,
        time: demoStore.trialReportArchivedAt || row.time,
        status: demoStore.trialReportV2Archived ? '已入库' : '待入库',
        source: `${r.title || '某型性能鉴定试验报告'}${r.version === 'V2' ? 'V1' : (r.version || 'V1')}审查任务`,
      }
    }
    if (row.id === 'OUT-2026-1018-006' && ctx.ver) {
      return {
        ...row,
        name: ctx.schemeName?.includes('提纲') || ctx.schemeName?.includes('大纲')
          ? (ctx.schemeName.includes('大纲') ? `性能试验提纲${ctx.ver}` : ctx.schemeName)
          : `性能试验提纲${ctx.ver}`,
        version: ctx.ver,
        source: ctx.schemeName ? `试验设计阶段 · ${ctx.schemeName}` : row.source,
      }
    }
    if (row.id === 'RPT-001' && r?.title) {
      return {
        ...row,
        name: r.title,
        version: r.version || row.version,
        time: r.archivedAt || row.time,
        source: r.source || row.source,
        status: '已入库',
      }
    }
    return row
  })
})
const filteredArchive = computed(() => liveArchiveRows.value.filter((row) => {
  const { search, type } = archiveQuery.value
  const matchSearch = !search || `${row.name}${row.id}${row.source}`.includes(search)
  const matchType = type === '全部类型' || row.type === type
  return matchSearch && matchType
}))

function goTo(sid, mid) {
  router.push({ name: 'app', params: { pid: 'doc', sid, mid } })
}
function addOutline() {
  outlineRows.value.push({ no: String(outlineRows.value.length + 1), name: '新增章节', source: '人工维护', children: ['新增要点'] })
  selectedOutline.value = outlineRows.value.at(-1)
  toast('已新增章节，可在右侧编辑')
}
function addPoint() {
  selectedOutline.value.children.push('新增要点')
}
function removePoint(index) {
  if (selectedOutline.value.children.length === 1) return toast('每章至少保留一个要点')
  selectedOutline.value.children.splice(index, 1)
}
function saveOutline() {
  toast('提纲已保存，并同步到知识驱动文档生成')
}
function runWork(flag, stages, done) {
  if (assembling.value || archiving.value) return
  flag.value = true
  workProgress.value = 6
  workStage.value = stages[0]
  let step = 0
  const timer = setInterval(() => {
    step += 1
    workProgress.value = Math.min(100, step * 25)
    workStage.value = stages[Math.min(stages.length - 1, step)]
    if (step < stages.length) return
    clearInterval(timer)
    flag.value = false
    done()
  }, 420)
}
function generateDraft() {
  if (!selectionConfirmed.value) {
    toast('请先在「文档生成需求配置」勾选素材')
    return goTo('write', 'generate-requirement')
  }
  assembling.value = true
  workProgress.value = 80
  workStage.value = '正在按已选素材与提纲装配初稿…'
  setTimeout(() => {
    assembling.value = false
    markDraftReportGenerated()
    postTrialState.generated = true
    postTrialState.currentVersion = 'V1（初稿）'
    postTrialState.selectedChapter = '符合性判定'
    composeMode.value = 'preview'
    toast(`已生成「${demoStore.draftReport.fullName}」，${demoStore.metricTreeCount} 项判定已写入`)
  }, 240)
}
function showSource(metric) {
  const linked = Boolean(metric.event || metric.linkedShot)
  openDrawer(`${metric.name} · 原文溯源`, [
    { label: '文书位置', value: '第六章 符合性判定' },
    { label: '实测值', value: metric.value },
    { label: '判据', value: metric.criterion },
    { label: '结论', value: metric.conclusion },
    { label: '出处', value: metric.source },
    { label: '数据回传', value: linked
      ? `${dock.value.taskName || '精度试验数据回传接入'} · ${dock.value.batch || 'D-07'} 第19发及复测`
      : `${dock.value.taskName || '精度试验数据回传接入'} · ${dock.value.shotCount || 30}发汇总` },
    ...(linked ? [
      { label: '关联事件', value: `${cause.value.eventName || '第19发超差事件'}（${cause.value.eventId || 'EVT-001'}）` },
      { label: '解读报告', value: `${report.value.title || '第19发超差事件解读报告'} · ${report.value.version || 'V1.1'}` },
      { label: '确认根因', value: cause.value.name || report.value.rootCause || '定位定向系统温补失效' },
    ] : []),
  ])
}
function submitReview() {
  if (!draftReport.value.generated) {
    toast('请先生成初稿后再进入审查')
    return
  }
  toast(`已关联审查对象：${draftReport.value.reviewTarget}`)
  goTo('review', 'run')
}
function openReview() {
  reviewMode.value = 'result'
  locateIssue(reviewIssues.find((issue) => issue.id === 7) || reviewIssues[0])
}
function locateIssue(issue) {
  postTrialState.activeIssueId = issue.id
  locating.value = false
  requestAnimationFrame(() => { locating.value = true })
  toast(`已定位：${issue.location}`)
}
function acceptIssue() {
  if (activeIssue.value.status === '已采纳') return toast('该意见已采纳并留痕')
  activeIssue.value.status = '已采纳'
  activeIssue.value.handler = '当前用户'
  activeIssue.value.time = '2026-10-22 16:31'
  toast('已采纳修改建议，处理记录已留痕')
}
function ignoreIssue() {
  toast('已记录忽略原因，意见保留在审查轨迹中')
}
function finalizeArchive() {
  runWork(archiving, [
    '固化审查留痕与版本 V2',
    '写入文档归集库',
    '更新状态为已入库',
    '归集完成',
  ], () => {
    reviewIssues.forEach((issue) => { issue.status = '已采纳' })
    postTrialState.archived = true
    postTrialState.currentVersion = 'V2（定稿）'
    finalizeTrialReport()
    toast('试验报告 V2 已入库')
    goTo('collect', 'document-type-archive')
  })
}
function viewArchive(row) {
  openDrawer(row.name, [
    { label: '文档编号', value: row.id },
    { label: '文档类型', value: row.type },
    { label: '版本', value: row.version },
    { label: '归集状态', value: row.status },
    { label: '责任部门', value: row.owner },
    { label: '来源链路', value: row.source },
    { label: '归集时间', value: row.time },
  ])
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildArchiveDocHtml(row) {
  const title = row.name || '归档文档'
  const meta = `
<p class="meta">文档编号：${escapeHtml(row.id)}　类型：${escapeHtml(row.type)}　版本：${escapeHtml(row.version)}　密级：${escapeHtml(row.secret)}　归集时间：${escapeHtml(row.time)}　责任部门：${escapeHtml(row.owner)}</p>
<p class="meta">来源链路：${escapeHtml(row.source)}　状态：${escapeHtml(row.status)}</p>`

  // 定稿试验报告：写入 8 章提纲 + 符合性判定摘要 + 第19发闭环
  if (row.type === '性能鉴定试验报告' || row.id === 'RPT-2026-1022-001') {
    const r = draftReport.value
    const s = shot19.value
    const chapters = outlineRows.value.map((c) =>
      `<tr><td>${escapeHtml(c.no)}</td><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.source)}</td><td>${escapeHtml((c.children || []).join('、'))}</td></tr>`
    ).join('')
    const metricHtml = metricRows.value.slice(0, 28).map((m) =>
      `<tr><td>${m.no}</td><td>${escapeHtml(m.name)}</td><td>${escapeHtml(m.value)}</td><td>${escapeHtml(m.criterion)}</td><td>${escapeHtml(m.conclusion)}</td></tr>`
    ).join('')
    return `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
body{font-family:SimSun,宋体,serif;font-size:12pt;line-height:1.8;color:#222}
h1{font-size:18pt;text-align:center;color:#0d4e83}
h2{font-size:14pt;color:#0d4e83;margin-top:1.2em;border-bottom:1px solid #ccc;padding-bottom:4px}
table{border-collapse:collapse;width:100%;margin:8px 0 14px}
th,td{border:1px solid #999;padding:6px 10px;text-align:left;vertical-align:top}
th{background:#f3f8fd}
.meta{color:#555;margin:6px 0}
.box{background:#f4f8fc;padding:10px 12px;margin:8px 0}
.warn{background:#fff8e6;border-left:4px solid #d0ab68;padding:10px 12px;margin:8px 0}
</style></head><body>
<h1>${escapeHtml(title)}</h1>
${meta}
<hr/>
<h2>一、文档说明</h2>
<div class="box">本题名以需求配置确认为准：<b>${escapeHtml(r.title || title)}</b>；当前版本 <b>${escapeHtml(r.version || row.version || 'V2')}</b>（${escapeHtml(r.stage || '定稿')}）。素材基线：${escapeHtml(metricTreeLabel.value)} / ${escapeHtml(outlineBaseline.value)} / ${escapeHtml(dockLabel.value)}。</div>
<h2>二、报告章节结构</h2>
<table><thead><tr><th>章号</th><th>章节</th><th>生成来源</th><th>要点</th></tr></thead><tbody>${chapters}</tbody></table>
<h2>三、符合性判定摘要</h2>
<p>${escapeHtml(judgmentNarrative.value)}</p>
<div class="warn"><b>第19发判定：</b>首测 ${s.firstDh} ${s.unit} → 复测 ${s.retestDh} ${s.unit}，判据 ≤ ${s.criterion} ${s.unit}，结论：${escapeHtml(s.conclusion)}（${escapeHtml(cause.value.eventId || 'EVT-001')}）。</div>
<table><thead><tr><th>序号</th><th>指标名称</th><th>实测值</th><th>判据</th><th>结论</th></tr></thead><tbody>${metricHtml}</tbody></table>
<h2>四、异常事件与处置</h2>
<p>${escapeHtml(eventBridge.value.narrative)}</p>
<p>确认根因：${escapeHtml(eventBridge.value.rootCause)}（置信度 ${eventBridge.value.confidence}）。来源：${escapeHtml(eventBridge.value.reportTitle)} · ${escapeHtml(eventBridge.value.reportVersion)}。</p>
<h2>五、归档信息</h2>
<p>本文档已完成版本固化与归集入库，可进入下一阶段知识化转化。</p>
</body></html>`
  }

  // 解读报告
  if (row.type === '异常分析报告' || row.id === 'RPT-001') {
    const rpt = report.value
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>body{font-family:SimSun,宋体,serif;font-size:12pt;line-height:1.8}h1{text-align:center;color:#0d4e83}.meta{color:#555}.box{background:#f4f8fc;padding:10px 12px;margin:8px 0}</style></head><body>
<h1>${escapeHtml(title)}</h1>
${meta}
<hr/>
<div class="box">
<p><b>关联事件：</b>${escapeHtml(rpt.eventName || cause.value.eventName || '第19发超差事件')}（${escapeHtml(rpt.eventId || cause.value.eventId || 'EVT-001')}）</p>
<p><b>确认根因：</b>${escapeHtml(rpt.rootCause || cause.value.name || '定位定向系统温补失效')}</p>
<p><b>复测结论：</b>${escapeHtml(rpt.retest || shot19.value.conclusion)}</p>
<p><b>归档来源：</b>${escapeHtml(rpt.source || row.source)}</p>
</div>
<p>${escapeHtml(eventBridge.value.narrative)}</p>
</body></html>`
  }

  // 提纲及其他
  const points = outlineRows.value.map((c) =>
    `<li><b>${escapeHtml(c.no)} ${escapeHtml(c.name)}</b> — ${escapeHtml((c.children || []).join('、'))}（来源：${escapeHtml(c.source)}）</li>`
  ).join('')
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>body{font-family:SimSun,宋体,serif;font-size:12pt;line-height:1.8}h1{text-align:center;color:#0d4e83}.meta{color:#555}</style></head><body>
<h1>${escapeHtml(title)}</h1>
${meta}
<hr/>
<p>本文档为归集库导出件，内容依据当前系统已确认素材与提纲生成。</p>
<ol>${points}</ol>
</body></html>`
}

/** 归集库下载：HTML → .doc（与方案/解读报告导出同路径） */
function downloadArchive(row) {
  if (!row) return
  const title = (row.name || '归档文档').replace(/[\\/:*?"<>|]/g, '_')
  const html = buildArchiveDocHtml(row)
  const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title}.doc`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  toast(`已下载「${row.name}」Word 文档`)
}
/** 状态点样式：与 Crud / 探针列表 .badge 一致 */
function statusBadgeClass(status) {
  const s = String(status || '')
  if (['已入库', '已完成', '符合', '引用有效', '已采纳'].includes(s)) return 'on'
  if (['复测后符合', '待复核', '采纳中', '待审查', '待入库'].includes(s)) return 'warn'
  return 'hold'
}
function scatterStyle(index) {
  const points = [[47, 42], [52, 48], [45, 53], [57, 45], [49, 58], [42, 47], [55, 55], [51, 39]]
  return { left: `${points[index - 1][0]}%`, top: `${points[index - 1][1]}%` }
}
</script>

<style scoped>
/* 与探针详情白底壳一致 */
.post-trial-shell {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #fff;
  border: 1px solid var(--line, #e0eaf3);
  border-radius: 12px;
  padding: 18px 20px 16px;
  box-shadow: 0 6px 18px rgba(15, 55, 95, .04);
}
.entry-title { margin-bottom: 2px; padding-bottom: 12px; border-bottom: 1px solid #eef3f8; }
.entry-title h2 { font-size: 18px; color: #1f3d5a; font-weight: 700; }
.name-block {
  border: 1px solid #e6eef6;
  border-radius: 8px;
  padding: 12px 14px 4px;
  background: #f7fbfe;
  margin-bottom: 14px;
}
.compose-name {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 4px 0;
}
.compose-name b { font-size: 15px; color: #0d4e83; }
.compose-name span { font-size: 13px; color: #6d8092; }
.need-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
.need-col {
  border: 1px solid #d6e6f5;
  border-radius: 10px;
  padding: 12px;
  background: #f7fbff;
  min-width: 0;
}
.need-col-head { margin-bottom: 10px; }
.need-col-head b { font-size: 14px; color: #0d4e83; }
.need-opt {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px;
  border-radius: 8px;
  border: 1.5px solid #d6e6f5;
  background: #f0f7fc;
  margin-bottom: 8px;
  cursor: pointer;
}
.need-opt:last-child { margin-bottom: 0; }
.need-opt.on {
  border-color: #1668a8;
  background: #e8f2fb;
}
.need-opt.disabled { opacity: 0.55; cursor: not-allowed; background: #f0f7fc; }
.need-opt input { margin-top: 3px; accent-color: #1668a8; }
.need-opt-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.need-opt strong { font-size: 13.5px; color: #0d4e83; }
.need-opt p { margin: 4px 0 2px; font-size: 12.5px; color: #4a5d6e; line-height: 1.45; }
.need-opt small { font-size: 12px; color: #8a99a8; }
.empty-need p { color: #6d8092; font-size: 13.5px; line-height: 1.6; margin-bottom: 12px; }
.chapter-points { display: flex; flex-direction: column; gap: 12px; margin: 14px 0 10px; }
.chapter-point {
  border: 1px solid #e6eef6;
  border-radius: 8px;
  padding: 12px 14px;
  background: #f7fbfe;
}
.chapter-point b { display: block; color: #0d4e83; font-size: 14px; margin-bottom: 6px; }
.chapter-point p { color: #4a5d6e; font-size: 13.5px; line-height: 1.65; margin: 0; }
@media (max-width: 1200px) {
  .need-grid { grid-template-columns: 1fr; }
}
.btn-row { display: flex; gap: 8px; align-items: center; }
.btn-row :deep(.el-button + .el-button) { margin-left: 0; }
.wizard-stack { display: flex; flex-direction: column; gap: 14px; }
/* 内段虚线框：对齐探针详情 m14-dash */
.sec-frame {
  border: 1.5px dashed #b7d4ee;
  border-radius: 12px;
  padding: 14px 16px 16px;
  background: #fff;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.sec-frame h3 {
  font-size: 14px;
  font-weight: 700;
  color: #1f3d5a;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex: 0 0 auto;
}
.sec-frame h3 i { width: 4px; height: 16px; background: var(--blue, #0868b7); border-radius: 2px; display: inline-block; }
.sec-frame h3 em {
  margin-left: auto;
  font-style: normal;
  font-size: 12px;
  font-weight: 500;
  color: #8a99a8;
  background: #f4f8fc;
  padding: 2px 8px;
  border-radius: 8px;
}
.sec-frame h3 em.ok { color: #16843a; background: #e4f6e8; }
.sec-frame h3 .h3-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
  align-items: center;
}
.sec-frame h3 .h3-actions :deep(.el-button + .el-button) { margin-left: 0; }
.outline-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}
.outline-stats .stat {
  background: #f5f9fd;
  border-radius: 12px;
  padding: 14px 16px;
  min-width: 0;
}
.outline-stats .k { font-size: 12px; color: #8a99a8; margin-bottom: 6px; }
.outline-stats .n { font-size: 24px; font-weight: 800; color: #1668a8; line-height: 1.1; }
.outline-stats .n small { font-size: 13px; font-weight: 400; color: #7a8b9a; }
.outline-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr);
  gap: 16px;
  align-items: start;
}
.outline-row {
  display: grid;
  grid-template-columns: 18px 28px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 8px;
}
.outline-row:last-child { margin-bottom: 0; }
.outline-row:hover:not(.selected) { background: #f8fbfe; }
.outline-row.selected { background: #e8f2fb; box-shadow: inset 3px 0 #1668a8; }
.outline-row .drag { color: #aab8c4; }
.outline-row .chapter-no { color: #8a99a8; font-size: 13px; }
.outline-row b { color: #1f3d5a; font-size: 14px; font-weight: 600; }
.source-pill {
  color: #1668a8;
  background: #e8f2fb;
  border: 1px solid #c5dced;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  white-space: nowrap;
}
.field { margin-bottom: 14px; }
.field-cap { display: block; font-size: 12px; color: #8a99a8; margin-bottom: 6px; }
.source-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid #d5e0ea;
  border-radius: 6px;
  color: #3f5062;
  background: #fff;
  font-size: 14px;
}
.point-list { display: flex; flex-direction: column; gap: 8px; }
.point-list > div {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}
.add-point { margin-top: 8px; }
.recommend-box {
  margin-top: 4px;
  padding: 12px 14px;
  background: #f7fbfe;
  border: 1px solid #e6eef6;
  border-radius: 8px;
}
.recommend-box b { color: #0d4e83; font-size: 13px; }
.recommend-box p { color: #5a6b7c; font-size: 12.5px; margin-top: 6px; line-height: 1.6; }
.editor-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.editor-actions :deep(.el-button + .el-button) { margin-left: 0; }
.step-frame :deep(.el-step__title) { font-size: 14px; font-weight: 600; line-height: 1.4; }
.step-frame :deep(.el-step__head.is-success),
.step-frame :deep(.el-step__title.is-success),
.step-frame :deep(.el-step__head.is-process),
.step-frame :deep(.el-step__title.is-process) { color: #1668a8; border-color: #1668a8; }
.step-frame :deep(.el-step__title.is-process) { color: #0d4e83; font-weight: 700; }
.step-frame :deep(.el-step__head.is-success .el-step__icon),
.step-frame :deep(.el-step__head.is-process .el-step__icon) {
  background: #1668a8;
  border-color: #1668a8;
  color: #fff;
}
.step-frame :deep(.el-step__head.is-wait),
.step-frame :deep(.el-step__title.is-wait) { color: #8a99a8; border-color: #c5d4e2; }
.step-frame :deep(.el-step__line) { background-color: #d6e8f6; }
.step-frame :deep(.el-step.is-success .el-step__line) { background-color: #7eadd4; }
.step-frame :deep(.el-step.is-horizontal .el-step__line) { top: 16px; }
.material-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.material-card {
  min-width: 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f8fbfe;
  border: 1px solid #e4ecf4;
  border-radius: 12px;
}
.material-card.gold { background: #fffaf0; border-color: #efd291; }
.material-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.material-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: #e8f2fb;
  color: #1668a8;
  font-weight: 700;
  font-size: 13px;
  flex: 0 0 36px;
}
.material-card.gold .material-icon { background: #fff8e0; color: #8a6000; }
.material-card b { font-size: 15px; font-weight: 600; color: #1f3d5a; line-height: 1.4; }
.material-card p { margin: 0; font-size: 13px; color: #4a5a6a; line-height: 1.55; }
.material-card small { color: #8a99a8; font-size: 12px; line-height: 1.4; }
.outline-list { display: flex; flex-direction: column; gap: 8px; }
.outline-item {
  display: grid;
  grid-template-columns: 168px minmax(0, 1fr) 140px;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  background: #f8fbfe;
  border-radius: 10px;
  font-size: 13px;
}
.outline-item b { color: #1f3d5a; font-weight: 600; }
.outline-item span { color: #6d8092; min-width: 0; }
.outline-item em { color: #8a6000; font-style: normal; text-align: right; }
.wizard-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.wizard-actions :deep(.el-button + .el-button) { margin-left: 0; }
.metric-table-wrap {
  border: 1px solid var(--line, #dce8f2);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(15, 55, 95, .04);
}
.metric-ep { width: 100%; }
.metric-ep :deep(.el-table__inner-wrapper::before) { display: none; }
.metric-ep :deep(.el-table__header-wrapper th.el-table__cell) {
  background: var(--head, #eaf3fa);
  color: #33506a;
  font-weight: 600;
  font-size: 14.5px;
  white-space: nowrap;
  overflow: visible;
}
.metric-ep :deep(.el-table__header .cell) {
  white-space: nowrap !important;
  overflow: visible;
  text-overflow: clip;
}
.metric-ep :deep(.el-table__cell) { font-size: 14.5px; color: #3f5062; }
.metric-ep :deep(.el-table__body tr:hover > td.el-table__cell) { background: #f6fafd; }
/* 与 Crud / 解读报告列表一致 */
.ops {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.ops button {
  background: none;
  border: 0;
  color: var(--blue, #0868b7);
  padding: 2px 6px;
  font-size: 13.5px;
  border-radius: 4px;
  cursor: pointer;
  line-height: 1.4;
}
.ops button:hover { background: #e7f2fb; color: #0d4e83; }
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border-radius: 12px;
  font-size: 12.5px;
  white-space: nowrap;
}
.badge i { width: 6px; height: 6px; border-radius: 50%; display: block; }
.badge.on { background: var(--ok-bg, #e8f8ee); color: var(--ok, #16843a); }
.badge.on i { background: #2fbf4a; }
.badge.warn { background: #fff7e6; color: #d48806; }
.badge.warn i { background: #faad14; }
.badge.hold { background: #eef1f4; color: #7c8fa2; }
.badge.hold i { background: #a7b7c6; }
.review-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: #6d8092;
  font-size: 13px;
}
.progress-line { display: flex; align-items: center; gap: 10px; min-width: 240px; }
.progress-line .el-progress { flex: 1; }
.review-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, .8fr);
  gap: 16px;
  align-items: stretch;
}
.paper {
  background: #f8fbfe;
  border-radius: 12px;
  padding: 24px 28px;
  min-height: 520px;
}
.paper > small { color: #8a6000; font-size: 12px; }
.paper h2 {
  color: #0d4e83;
  font-size: 20px;
  margin: 8px 0 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2ebf3;
}
.paper p { font-size: 13.5px; line-height: 1.9; color: #3f5062; margin: 14px 0; text-indent: 2em; }
.highlight-line {
  position: relative;
  background: #eef6fc;
  border: 1px solid #b7d4ee;
  border-radius: 10px;
  padding: 12px 14px;
  text-indent: 0 !important;
}
.highlight-line .issue-mark { position: absolute; right: 12px; top: -10px; }
.located-tip { margin-top: 16px; }
.issue-side { min-width: 0; }
.issue-list { max-height: 440px; overflow: auto; }
.issue-group { margin-bottom: 10px; }
.issue-group-title { font-size: 12px; color: #1668a8; font-weight: 600; margin: 4px 2px 8px; }
.issue-card {
  padding: 12px;
  border: 1px solid #e4ecf4;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  margin-bottom: 8px;
}
.issue-card:last-child { margin-bottom: 0; }
.issue-card.active { background: #eef6fc; border-color: #1668a8; }
.issue-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.issue-card h4 { font-size: 13.5px; color: #1f3d5a; margin: 8px 0 6px; font-weight: 600; }
.issue-card p { font-size: 12px; color: #6d8092; margin-top: 4px; }
.issue-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.issue-actions span { font-size: 12px; color: #8a99a8; }
.issue-detail {
  margin-top: 12px;
  padding: 12px 14px;
  background: #f8fbfe;
  border-radius: 12px;
}
.issue-detail b { color: #0d4e83; font-size: 13px; }
.issue-detail p { font-size: 12.5px; line-height: 1.6; margin: 8px 0 12px; color: #4a5a6a; }
.flow-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 12px;
  padding: 4px 0 8px;
}
.flow-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 132px;
  padding: 14px 8px;
  background: #f8fbfe;
  border: 1px solid #e4ecf4;
  border-radius: 12px;
}
.flow-node > b {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #e8f2fb;
  color: #1668a8;
  font-size: 13px;
}
.flow-node strong { margin-top: 8px; color: #1f3d5a; font-size: 13px; }
.flow-node span { color: #8a6000; font-size: 12px; margin: 4px 0; }
.flow-node small { color: #8a99a8; font-size: 12px; line-height: 1.4; }
.flow-node.active { border-color: #1668a8; background: #e8f2fb; }
.relate-list { display: flex; flex-direction: column; gap: 8px; padding: 4px 0 8px; }
.relate-item {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) 110px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  background: #f8fbfe;
  border-radius: 10px;
  font-size: 13px;
}
.relate-item b { color: #1f3d5a; font-weight: 600; }
.relate-item span { color: #1668a8; }
.relate-item em { color: #8a99a8; font-style: normal; }
.trace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 16px;
  align-items: start;
}
.version-list { display: flex; flex-direction: column; gap: 8px; }
.version-card {
  border: 1px solid #e4ecf4;
  border-radius: 12px;
  padding: 14px;
  background: #f8fbfe;
  margin-bottom: 8px;
}
.version-card:last-child { margin-bottom: 0; }
.version-card.current { background: #eef6fc; border-color: #1668a8; }
.version-card b { display: block; color: #0d4e83; font-size: 14px; }
.version-card p { margin: 6px 0; color: #4a5a6a; font-size: 13px; }
.version-card small { color: #8a99a8; font-size: 12px; }
@media (max-width: 1500px) {
  .flow-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
.event-hint { display: block; color: #b57b0a; margin-top: 3px; font-size: 12px; }
.filter-row { display: flex; gap: 8px; align-items: center; margin-bottom: 16px; }
.filter-row .el-input { flex: 1; }
.pt-table { width: 100%; }
.issue-group { margin-bottom: 10px; }
.issue-group-title { font-size: 12px; color: #8a6a22; font-weight: 700; margin: 4px 2px 8px; }
.back-bar { border: 0; background: transparent; color: #0868b7; cursor: pointer; font-size: 14px; padding: 0; }
.back-bar:hover { text-decoration: none; }
.post-trial {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 20px 22px;
  box-shadow: 0 6px 18px rgba(15, 55, 95, .04);
  min-width: 0;
  color: #2f465b;
  position: relative;
}
.work-mask { position: fixed; inset: 0; z-index: 30; background: rgba(244, 248, 252, .82); display: grid; place-items: center; }
.work-mask > div { width: min(460px, 86%); background: #fff; border: 1px solid #d5e4f0; border-radius: 10px; padding: 22px 24px; box-shadow: 0 12px 32px rgba(13, 62, 102, .12); }
.work-mask b { color: #07518f; font-size: 16px; }
.work-mask p { margin: 8px 0 14px; color: #5d7388; font-size: 13px; min-height: 20px; }
.work-mask i { display: block; height: 8px; border-radius: 6px; background: #e3edf5; overflow: hidden; }
.work-mask em { display: block; height: 100%; width: 0; background: linear-gradient(90deg, #0b6dbd, #d0ab68); transition: width .35s ease; }
.highlight-line.pulse { animation: locatePulse .7s ease; }
@keyframes locatePulse { 0% { box-shadow: 0 0 0 0 rgba(208, 171, 104, .7); } 100% { box-shadow: 0 0 0 8px rgba(208, 171, 104, 0); } }
.post-head, .document-toolbar, .review-overview, .review-toolbar, .archive-banner { background: #fff; border: 1px solid #e0eaf3; border-radius: 9px; padding: 15px 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; box-shadow: 0 5px 16px rgba(18,61,96,.04); }
.post-head h2 { color: #074b88; font-size: 23px; margin-top: 2px; }
.post-head p { color: #75889b; font-size: 13.5px; margin-top: 5px; }
.module-code { display: inline-flex; color: #a36e0c; background: #fff5dc; border: 1px solid #efd291; border-radius: 4px; font-size: 12px; font-weight: 700; padding: 2px 7px; }
.head-actions { display: flex; gap: 10px; align-items: center; }
.baseline { color: #7a8c9e; font-size: 12px; }
.post-panel { background: #fff; border: 1px solid #dfe9f2; border-radius: 9px; padding: 14px; min-width: 0; }
.panel-title { display: flex; align-items: center; justify-content: space-between; min-height: 30px; padding-bottom: 10px; color: #074b88; font-weight: 700; font-size: 16px; }
.panel-title > span:first-child::before { content: ''; display: inline-block; width: 4px; height: 17px; margin-right: 8px; border-radius: 3px; background: #0868b7; vertical-align: -3px; }
.panel-title > div { display: flex; gap: 7px; }
.mini-btn, .link-btn, .source-link { border: 0; background: transparent; color: #0868b7; cursor: pointer; font-size: 12.5px; }
.mini-btn { border: 1px solid #b7d1e8; border-radius: 4px; padding: 5px 10px; background: #fff; }
.mini-btn.gold { border-color: #d7ac58; color: #a36e0c; }
.good-tag, .result-tag { display: inline-flex; align-items: center; border-radius: 10px; padding: 3px 9px; background: #e1f6e8; color: #16843a; font-size: 12px; font-style: normal; white-space: nowrap; }
.result-tag.gold, .status-badge { background: #fff2d6; color: #b67800; }
.post-kpis { margin-bottom: 14px; }
.status-badge { background: #fff2d6; color: #b67800; }
.material-card.blue .status-badge { background: #e1f1fd; color: #0872c5; }
.compose-grid { display: grid; grid-template-columns: 1.35fr .65fr; gap: 14px; }
.chapter-preview { display: grid; grid-template-columns: 190px 1fr 150px; gap: 12px; align-items: center; padding: 10px 9px; border-top: 1px solid #edf2f6; font-size: 13px; }
.chapter-preview b { color: #264b6b; }
.chapter-preview span { color: #718396; }
.chapter-preview em { color: #aa740d; font-style: normal; text-align: right; }
.generate-panel { display: flex; flex-direction: column; }
.config-row { display: flex; justify-content: space-between; gap: 20px; padding: 12px 4px; border-bottom: 1px solid #edf2f6; font-size: 13px; }
.config-row span { color: #7c8fa2; }.config-row b { color: #2f4e68; text-align: right; }
.check-list { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 16px 0; color: #21834a; font-size: 13px; }
.generate-btn { margin-top: auto; min-height: 74px; border: 0; border-radius: 7px; color: #fff; background: linear-gradient(135deg,#0b6dbd,#06477f); box-shadow: 0 8px 18px rgba(5,72,128,.22); }
.generate-btn span, .generate-btn small { display: block; }.generate-btn span { font-size: 18px; font-weight: 700; }.generate-btn small { margin-top: 5px; color: #cfe7fa; }
.drag { color: #aab8c4; }
.document-toolbar > div { display: flex; align-items: center; gap: 10px; }.document-toolbar b { color: #07518f; font-size: 17px; }.document-toolbar span { color: #718396; font-size: 12px; }.report-layout { display: grid; grid-template-columns: 220px 1fr; gap: 14px; align-items: start; }.report-nav { padding: 10px; position: sticky; top: 0; }.report-nav button { width: 100%; height: 42px; display: grid; grid-template-columns: 25px 1fr 20px; align-items: center; text-align: left; border: 0; background: transparent; color: #486078; border-radius: 5px; padding: 0 8px; }.report-nav button.active { background: #e9f5fe; color: #0868b7; font-weight: 700; box-shadow: inset 3px 0 #1668a8; }.report-nav button em { color: #258b47; font-style: normal; }.report-paper { padding: 18px 20px; }.paper-title { display: flex; justify-content: space-between; border-bottom: 2px solid #d9e6f0; padding-bottom: 12px; }.paper-title small { color: #8a99a8; }.paper-title h2 { color: #124d7f; margin-top: 4px; }.trace-badge { align-self: center; color: #1668a8; border: 1px solid #b7d4ee; background: #eef6fc; border-radius: 14px; padding: 5px 10px; font-size: 12px; }.paper-text { margin: 14px 0; line-height: 1.8; font-size: 13.5px; }.metric-table, .simple-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }.metric-table th, .simple-table th { position: sticky; top: 0; z-index: 1; background: #eaf3fa; color: #31516c; text-align: left; padding: 10px 9px; }.metric-table td, .simple-table td { border-top: 1px solid #e8eef4; padding: 9px; }.metric-table tr.focus { background: #fff8e8; }.metric-table td small, .simple-table td small { display: block; color: #b57b0a; margin-top: 3px; }.source-link { white-space: nowrap; }.version-bar { display: flex; flex-wrap: wrap; gap: 24px; margin-top: 12px; padding: 10px 12px; background: #f3f7fa; color: #60778b; font-size: 12px; }.event-summary { display: flex; align-items: center; justify-content: space-between; margin: 18px 0 8px; padding: 10px 12px; background: #eef6fc; border-left: 4px solid #1668a8; }.event-summary b { color: #0d4e83; }.event-summary span { font-size: 12px; color: #4a6a82; }.scatter { height: 220px; position: relative; overflow: hidden; background: linear-gradient(135deg,#f8fbfd,#eef6fb); border: 1px solid #dbe7f0; border-radius: 7px; }.target-ring { position: absolute; border: 1px solid #8fb9d6; border-radius: 50%; left: 50%; top: 50%; transform: translate(-50%,-50%); }.r1{width:180px;height:180px}.r2{width:120px;height:120px}.r3{width:60px;height:60px}.scatter i { position:absolute;width:8px;height:8px;border-radius:50%;background:#0b72c4;transform:translate(-50%,-50%)}.scatter i.outlier{left:76%;top:24%;background:#d0ab68;width:13px;height:13px;box-shadow:0 0 0 5px rgba(208,171,104,.2)}.scatter span,.scatter em{position:absolute;bottom:10px;font-size:12px;font-style:normal}.scatter span{right:18px;color:#aa7108}.scatter em{right:125px;color:#0b72c4}.cause-table{margin-top:10px;border:1px solid #e4ebf1}.cause-table>div{display:grid;grid-template-columns:1fr 1.6fr .7fr}.cause-table b,.cause-table span,.cause-table strong{padding:9px;border-right:1px solid #e4ebf1}.cause-table>div:first-child{background:#eaf3fa}.source-note{text-align:right;margin-top:8px;color:#a7710c;font-size:12px}
.lineage-panel { margin-bottom: 14px; }.tab-line button { border: 0; background: transparent; color: #72869a; padding: 4px 10px; }.tab-line button.active { color: #0868b7; border-bottom: 2px solid #0868b7; }.lineage-flow { display: grid; grid-template-columns: repeat(8, 1fr); gap: 14px; padding: 18px 4px 10px; }.lineage-node { position: relative; display: flex; min-height: 132px; align-items: center; flex-direction: column; text-align: center; padding: 13px 8px; border: 1px solid #dce8f2; border-radius: 7px; background: #fbfdff; }.lineage-node:not(:last-child)::after { content: '→'; position: absolute; right: -17px; top: 45px; color: #3386c5; font-weight: 700; }.lineage-node > b { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 8px; background: #e9f5fe; color: #0868b7; }.lineage-node strong { margin-top: 8px; color: #245371; }.lineage-node span { color: #9a741e; font-size: 11px; margin: 3px 0; }.lineage-node small { color: #7f90a0; line-height: 1.4; }.lineage-node.active { border-color: #0b72c4; box-shadow: 0 0 0 2px rgba(11,114,196,.12); }.trace-grid { display: grid; grid-template-columns: 1fr 300px; gap: 14px; }.version-item { border: 1px solid #e0e8ef; border-radius: 7px; padding: 14px; margin-bottom: 10px; }.version-item b,.version-item span,.version-item small { display:block }.version-item b { color:#07518f }.version-item span { margin:6px 0;color:#415b71 }.version-item small{color:#8797a6}.version-item.current{border-color:#dbbd7b;background:#fffaf0}
.review-overview > div { display: flex; flex-direction: column; gap: 4px; }.review-overview b, .archive-banner > div:first-child b { color: #07518f; font-size: 18px; }.review-overview span, .archive-banner > div:first-child span { color: #76899a; font-size: 13px; }.filter-row { display: flex; gap: 9px; }.filter-row input { flex: 1; }.filter-row input, .filter-row select, .issue-head select { height: 34px; border: 1px solid #d3dfe9; border-radius: 5px; padding: 0 10px; color: #496076; background: #fff; }.task-table tr { cursor: pointer; }.task-table tr:hover { background:#f4f9fd }.task-table tr.important { background:#fffaf0 }.issue-count { display:inline-grid;place-items:center;min-width:27px;height:27px;border-radius:14px;background:#fff0cf;color:#ae7206;font-weight:700 }.archive-banner { background: linear-gradient(100deg,#062e52,#0b5f9d); color:#fff; border:0; }.archive-banner > div:first-child b { color:#f2d99d }.archive-banner > div:first-child span { color:#d5e6f3 }.archive-banner > div { display:flex;align-items:center;gap:18px }.archive-banner > div:first-child { flex-direction:column;align-items:flex-start;gap:5px }.archive-banner > div:last-child > span { color:#d8e7f2;font-size:12px }.archive-banner > div:last-child > span b { display:block;color:#fff;font-size:21px;margin-top:4px }.archive-table{margin-top:14px}.archive-table tr.archived{background:#fffaf0;box-shadow:inset 3px 0 #d0ab68}.archive-table td:last-child{white-space:nowrap}.archive-table td:last-child button{margin-right:8px}.archive-foot{display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding:11px 15px;background:#eef8f1;border:1px solid #cfe8d7;border-radius:7px;color:#267442;font-size:12.5px}.archive-foot b{color:#9a6c11}
@media (max-width: 1500px) { .lineage-flow { grid-template-columns: repeat(4,1fr) }.lineage-node:not(:last-child)::after{display:none}.chapter-preview{grid-template-columns:160px 1fr 120px}.post-trial{min-width:980px} }
</style>
