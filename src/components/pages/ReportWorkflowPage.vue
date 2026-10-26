<template>
  <div class="report-workflow">
    <template v-if="isReview && activeReview">
      <section class="flow-toolbar">
        <div><el-button text @click="backToReport(activeReview.reportId)">← 返回报告</el-button><span class="muted">审查标准：报告内容审查规则 V1.0 · {{ activeReview.reportTitle }} V{{ activeReview.version }}</span></div>
        <el-button @click="goReviewList">审查任务列表</el-button>
      </section>
      <section class="flow-toolbar review-summary">
        <div><b>审查意见 {{ activeReview.issues.length }} 条</b><span v-for="level in ['严重', '重要', '一般']" :key="level" :class="severityClass(level)">{{ level }} {{ activeReview.issues.filter(i => i.severity === level).length }} 条</span><span class="muted">已处理 {{ processedCount }} / {{ activeReview.issues.length }}</span></div>
        <span class="muted">点击右侧意见，定位原文并高亮</span>
      </section>
      <div class="review-columns">
        <section class="flow-panel original-pane">
          <div class="pane-heading"><b>报告原文</b><span>{{ activeReview.sections.length }} 章</span></div>
          <div class="original-scroll"><ReportDocument ref="reviewDocument" :sections="activeReview.sections" :active-block="activeIssue?.blockId" /></div>
        </section>
        <section class="flow-panel opinion-pane">
          <div class="review-tabs"><button v-for="type in reviewTypes" :key="type" :class="{ selected: issueFilter === type }" @click="issueFilter = type">{{ type }}</button></div>
          <div class="opinion-scroll">
            <el-empty v-if="!filteredIssues.length" description="当前范围内没有审查意见" />
            <article v-for="issue in filteredIssues" :key="issue.id" class="opinion" :class="{ selected: selectedIssueId === issue.id }" @click="locateIssue(issue)">
              <div class="opinion-head"><el-tag size="small">{{ issue.type }}</el-tag><span :class="severityClass(issue.severity)">{{ issue.severity }}风险</span><el-tag class="issue-status" :type="issue.status === '已采纳' ? 'success' : 'info'" size="small">{{ issue.status }}</el-tag></div>
              <button class="location-link" @click.stop="locateIssue(issue)">⌖ {{ issue.location }}</button>
              <small>提出的问题</small><h4>{{ issue.title }}</h4><blockquote>{{ issue.originalText }}</blockquote>
              <div class="opinion-basis"><small>审查依据</small><p>{{ issue.basis }}</p></div>
              <div class="opinion-suggestion"><small>修改建议</small><p>{{ issue.suggestion }}</p></div>
              <div v-if="editingIssueId === issue.id" class="manual-edit" @click.stop><el-input v-model="manualText" type="textarea" :rows="5" /><p class="muted">请核实依据后补充内容，修改将同步到报告。</p><el-button @click="editingIssueId = ''">取消</el-button><el-button type="primary" @click="saveManualIssue(issue)">保存并采纳</el-button></div>
              <div v-if="issue.status === '待处理' && editingIssueId !== issue.id" class="opinion-actions"><el-button type="danger" plain @click.stop="rejectIssue(issue)">驳回</el-button><el-button type="primary" @click.stop="acceptIssue(issue)">{{ issue.replacement ? '采纳并修改' : '编辑并采纳' }}</el-button></div>
              <p v-else-if="issue.handledAt" class="muted handled">{{ issue.status }} · {{ issue.handledAt }}<span v-if="issue.reason"> · {{ issue.reason }}</span></p>
            </article>
          </div>
        </section>
      </div>
    </template>

    <template v-else-if="isReview">
      <section class="flow-toolbar"><div><h2>审查任务</h2><p>选取报告与规则包，检查术语、数据口径和引用依据。</p></div><el-button type="primary" @click="openReviewDialog()">＋ 新建审查任务</el-button></section>
      <section class="flow-panel"><el-table :data="workflow.reviews"><el-table-column label="任务" width="190"><template #default="{ row }">审查任务 · {{ row.id.slice(-6) }}</template></el-table-column><el-table-column prop="reportTitle" label="审查对象" min-width="240"/><el-table-column label="规则包" min-width="200"><template #default="{ row }">{{ row.packs.join(' / ') }}</template></el-table-column><el-table-column label="意见数" width="90"><template #default="{ row }">{{ row.issues.length }}</template></el-table-column><el-table-column prop="status" label="状态" width="100"/><el-table-column prop="createdAt" label="创建时间" width="180"/><el-table-column label="操作" width="110"><template #default="{ row }"><el-button link type="primary" @click="openReviewResult(row)">查看结果</el-button></template></el-table-column></el-table><el-empty v-if="!workflow.reviews.length" description="暂无审查任务，请先生成报告初稿" /></section>
    </template>

    <template v-else-if="view === 'list'">
      <section class="flow-toolbar"><div><h2>报告管理</h2><p>按已发布指标树关联试验材料，完成报告编写与审查。</p></div><el-button type="primary" @click="newReport">＋ 新建报告</el-button></section>
      <section class="flow-panel"><el-table :data="workflow.reports"><el-table-column label="报告名称" min-width="340"><template #default="{ row }"><el-button link type="primary" @click="openReport(row)">{{ row.title }}</el-button></template></el-table-column><el-table-column label="当前环节" width="150"><template #default="{ row }">{{ stageLabel(row.stage) }}</template></el-table-column><el-table-column label="状态" width="120"><template #default="{ row }"><el-tag :type="row.stage === 'final' ? 'success' : 'primary'">{{ row.stage === 'final' ? '已完成' : '进行中' }}</el-tag></template></el-table-column><el-table-column prop="createdAt" label="创建时间" width="180"/><el-table-column label="操作" width="160"><template #default="{ row }"><el-button link type="primary" @click="editReport(row)">编辑</el-button><el-button link type="danger" @click="deleteReport(row)">删除</el-button></template></el-table-column></el-table><el-empty v-if="!workflow.reports.length" description="暂无报告，点击新建报告开始编写" /></section>
    </template>

    <template v-else-if="view === 'config'">
      <section class="flow-toolbar"><div><h2>{{ editingReportId ? '编辑报告配置' : '新建报告' }}</h2><p>选择指标树后自动关联对应的试验结果和材料。</p></div><el-button @click="goReportList">返回报告列表</el-button></section>
      <section class="flow-panel padded"><h3><span class="step-number">1</span>报告信息与指标树</h3><div class="form-grid"><el-form-item label="报告名称" label-position="top" required><el-input v-model="form.title" maxlength="80" placeholder="请输入报告名称" /></el-form-item><el-form-item label="选择已发布指标树" label-position="top" required><el-select v-model="form.treeId" placeholder="请选择指标树，自动关联试验结果" @change="selectTree"><el-option v-for="tree in publishedTrees" :key="tree.id" :label="`${tree.version} · ${tree.count} 项指标`" :value="tree.id" /></el-select></el-form-item></div><el-alert v-if="!publishedTrees.length" type="warning" :closable="false" title="暂无已发布指标树，请先完成指标树发布。" /></section>
      <section v-if="configMaterials" class="flow-panel padded"><h3><span class="step-number">2</span>自动关联试验材料 <span class="ready-label">材料已关联</span></h3><div class="material-stats"><div><small>指标树与判据</small><strong>{{ configMaterials.metrics.length }} 项</strong><span>{{ configMaterials.tree.version }} · 已关联</span></div><div><small>试验结果与符合性判定</small><strong>{{ configMaterials.metrics.length }} / {{ configMaterials.metrics.length }} 项</strong><span>{{ resultSummary(configMaterials) }}</span></div><div><small>精度原始数据</small><strong>{{ configMaterials.shotCount }} + 1 发</strong><span>正式记录 + 独立复测记录</span></div><div class="gold"><small>异常定位与根因分析</small><strong>{{ configMaterials.cause }}</strong><span>事件 {{ configMaterials.eventId }}</span></div></div><div class="material-preview-grid"><div class="preview-table"><h4>{{ configMaterials.metrics.length }} 项试验结果预览</h4><el-table :data="configMaterials.metrics" height="310"><el-table-column prop="name" label="指标" min-width="160"/><el-table-column prop="value" label="实测结果" min-width="160"/><el-table-column prop="conclusion" label="判定" width="105"/></el-table></div><div class="analysis-preview"><small>异常分析报告</small><h4>{{ configMaterials.analysisTitle }}</h4><p>原始异常：第 {{ configMaterials.shot.shotNo }} 发 · {{ configMaterials.shot.firstDh }} mil</p><p>根因候选：{{ configMaterials.cause }}（置信度 {{ configMaterials.confidence }}）</p><p>复测结果：{{ configMaterials.shot.retestDh }} mil · {{ configMaterials.shot.retestDh <= configMaterials.shot.criterion ? '复测后符合' : '复测不符合' }}</p><p>证据材料：异常分析、原始记录、标定资料与复测数据。</p><small>来源版本：{{ configMaterials.analysisVersion }}</small></div></div></section>
      <section class="flow-panel padded"><h3><span class="step-number">{{ configMaterials ? 3 : 2 }}</span>选择报告模板</h3><div class="template-grid"><button v-for="template in reportTemplates" :key="template.id" class="template-card" :class="{ selected: form.templateId === template.id }" @click="form.templateId = template.id"><h3>{{ template.name }} <span v-if="form.templateId === template.id">✓</span></h3><p>{{ template.description }}</p><div class="chapter-grid"><span v-for="(chapter, i) in template.chapters" :key="chapter">第{{ i + 1 }}章 {{ chapter }}</span></div></button></div></section>
      <section class="flow-toolbar"><span class="muted">创建后进入报告编写工作台，关联材料将作为本报告的生成基线。</span><el-button type="primary" :disabled="!configReady" @click="saveReportConfig">{{ editingReportId ? '保存配置并进入编写' : '创建报告并进入编写' }}</el-button></section>
    </template>

    <template v-else-if="currentReport">
      <section class="flow-toolbar"><div><h2>{{ currentReport.title }}</h2><p>{{ currentReport.materials.tree.version }} · {{ currentTemplate.name }} · {{ currentReport.materials.metrics.length }} 项结果 · {{ stageLabel(currentReport.stage) }}</p></div><el-button @click="goReportList">返回报告列表</el-button></section>
      <section class="flow-panel padded"><h3>试验材料 <small class="muted">按指标树自动关联，点击卡片预览</small></h3><div class="material-cards"><button v-for="card in materialCards" :key="card.id" @click="previewMaterial = card.id"><div><el-tag size="small">{{ card.label }}</el-tag><span>已关联</span></div><b>{{ card.title }}</b><small>{{ card.source }}</small></button></div><div v-if="currentReport.stage === 'materials'" class="section-actions"><span class="muted">指标判定、正式记录、复测记录及异常分析已进入编写范围。</span><el-button type="primary" @click="generateOutline">按模板生成提纲</el-button></div></section>
      <section v-if="currentReport.stage === 'outline'" class="flow-panel padded"><h3>报告提纲 <small class="muted">{{ currentTemplate.chapters.length }} 章</small></h3><div class="outline-grid"><article v-for="(chapter, i) in currentTemplate.chapters" :key="chapter"><b>第{{ i + 1 }}章 {{ chapter }}</b><p>{{ outlineDescriptions[i] }}</p></article></div><div class="section-actions"><span class="muted">按选定模板组织已关联材料，生成连续正文及判定表。</span><el-button type="primary" @click="generateDraft">生成报告初稿</el-button></div></section>
      <section v-if="currentReport.sections.length" class="flow-panel draft-panel"><div class="pane-heading"><b>初稿预览 · V{{ currentReport.version }}</b><div><el-button @click="sendToReview">送智能审查</el-button><el-button type="primary" :disabled="currentReport.stage === 'final'" @click="finalizeReport">{{ currentReport.stage === 'final' ? '已定稿' : '定稿' }}</el-button></div></div><ReportDocument :sections="currentReport.sections" /></section>
    </template>
    <el-empty v-else description="该报告不存在或已删除"><el-button @click="goReportList">返回报告列表</el-button></el-empty>

    <el-dialog v-model="reviewDialog" title="新建审查任务" width="560px" :close-on-click-modal="false">
      <div class="dialog-label">选择审查对象（已生成初稿）</div><div class="report-options"><label v-for="report in draftReports" :key="report.id" :class="{ selected: reviewReportId === report.id }"><input v-model="reviewReportId" type="radio" :value="report.id"/><span>{{ report.title }} <small>V{{ report.version }} · {{ stageLabel(report.stage) }}</small></span></label><el-empty v-if="!draftReports.length" description="请先生成报告初稿" /></div>
      <div class="dialog-label">勾选审查规则包</div><el-checkbox-group v-model="selectedPacks"><el-checkbox v-for="pack in reviewRulePacks" :key="pack" :value="pack" border>{{ pack }}</el-checkbox></el-checkbox-group>
      <template #footer><el-button @click="reviewDialog = false">取消</el-button><el-button type="primary" :disabled="!reviewReportId || !selectedPacks.length" @click="startReview">启动审查</el-button></template>
    </el-dialog>
    <el-dialog :model-value="Boolean(previewMaterial)" :title="materialCards.find(c => c.id === previewMaterial)?.title || '材料预览'" width="850px" @close="previewMaterial = ''">
      <template v-if="currentReport"><el-table v-if="previewMaterial === 'tree' || previewMaterial === 'results'" :data="currentReport.materials.metrics" max-height="470"><el-table-column prop="name" label="指标" min-width="170"/><el-table-column prop="criterion" label="判据" min-width="120"/><el-table-column v-if="previewMaterial === 'results'" prop="value" label="实测结果" min-width="180"/><el-table-column v-if="previewMaterial === 'results'" prop="conclusion" label="判定" width="110"/></el-table><template v-else-if="previewMaterial === 'data'"><el-table :data="currentReport.materials.shots" max-height="420"><el-table-column prop="id" label="发次"/><el-table-column prop="dH" label="高低偏差 (mil)"/><el-table-column prop="dL" label="方向偏差 (mil)"/><el-table-column prop="v0" label="初速 (m/s)"/></el-table><p class="preview-retest">独立复测：第 {{ currentReport.materials.shot.shotNo }} 发对应工况，高低偏差 {{ currentReport.materials.shot.retestDh }} mil。</p></template><template v-else><p>事件：{{ currentReport.materials.eventId }}</p><p>候选根因：{{ currentReport.materials.cause }} · 置信度 {{ currentReport.materials.confidence }}</p><p>原始异常：{{ currentReport.materials.shot.firstDh }} mil → 复测：{{ currentReport.materials.shot.retestDh }} mil</p><p>来源：{{ currentReport.materials.analysisTitle }} · {{ currentReport.materials.analysisVersion }}</p></template></template>
    </el-dialog>
    <div v-if="busy" class="workflow-loading" role="status" aria-live="polite"><div><span class="loading-spinner"></span><h3>{{ busyTitle }}</h3><p>{{ busyDetail }}</p><el-progress :percentage="progress" :stroke-width="7" :show-text="false"/></div></div>
  </div>
</template>
