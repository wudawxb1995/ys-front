<template>
  <div>
    <div class="page-head" v-if="page.type !== 'dashboard'">
      <h2>{{ title }}</h2>
      <p>{{ page.desc }}</p>
      <div class="deco"></div>
    </div>

    <template v-if="page.type === 'entry'">
      <div class="split" style="grid-template-columns: 1fr 1.1fr; align-items: start;">
        <!-- 左：资源信息登记 -->
        <div class="panel">
          <h3><i></i>资源信息登记</h3>

          <!-- 资源名称（全宽） -->
          <div class="form-row">
            <label><span class="req">*</span>资源名称</label>
            <input v-model="form.name" placeholder="如：东方红-LF2204轮式拖拉机定型试验报告" />
          </div>

          <!-- 资源类别 + 文件格式（两列） -->
          <div class="form-cols">
            <div class="form-row">
              <label><span class="req">*</span>资源类别</label>
              <select-field v-model="form.cat" :options="['定型资料','历史试验数据','标准规范','专业文献']" placeholder="请选择类别" />
            </div>
            <div class="form-row">
              <label><span class="req">*</span>文件格式</label>
              <select-field v-model="form.fmt" :options="['DOCX','PDF','TXT','XLSX','JPG','PNG','MP4','MP3','CSV']" placeholder="请选择格式" />
            </div>
          </div>

          <!-- 数据模态 + 文件大小（两列） -->
          <div class="form-cols">
            <div class="form-row">
              <label>数据模态</label>
              <select-field v-model="form.modal" :options="['文本','图像','表格','音视频']" placeholder="请选择模态" />
            </div>
            <div class="form-row">
              <label>文件大小（MB）</label>
              <input v-model="form.size" type="number" placeholder="如：36.5" />
            </div>
          </div>

          <!-- 页数（全宽） -->
          <div class="form-row">
            <label>页数</label>
            <input v-model="form.pages" type="number" placeholder="如：128" />
          </div>

          <!-- 解析模式 -->
          <div class="form-row">
            <label>解析模式</label>
            <div class="radio-row">
              <label><input type="radio" value="即时解析" v-model="form.mode" /> 即时解析</label>
              <label><input type="radio" value="暂存" v-model="form.mode" /> 暂存</label>
            </div>
            <p class="hint" style="margin-top:6px">即时解析：录入后立即调度解析引擎处理；暂存：仅入库保存，后续在解析任务管理中统一发起。</p>
          </div>

          <button class="btn btn-primary" style="width:100%;margin-top:4px" @click="addToList">加入导入清单</button>
        </div>

        <!-- 右：批量导入清单 -->
        <div class="panel">
          <h3 style="justify-content:space-between">
            <span style="display:flex;align-items:center;gap:8px"><i></i>批量导入清单</span>
            <span style="font-size:13px;color:#8a99a8;font-weight:400">支持单次批量导入（≥50篇 / ≥500MB）</span>
          </h3>
          <div style="display:flex;justify-content:flex-end;margin-bottom:12px">
            <button class="btn btn-primary" @click="commitList">
              确认录入（{{ importList.length }}）
            </button>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th>名称</th>
                  <th>类别</th>
                  <th>格式</th>
                  <th>大小(MB)</th>
                  <th>解析模式</th>
                  <th style="text-align:center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!importList.length">
                  <td colspan="7" class="empty">清单为空，请先在左侧登记资源信息</td>
                </tr>
                <tr v-for="(item, i) in importList" :key="i">
                  <td>{{ i + 1 }}</td>
                  <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ item.name }}</td>
                  <td>{{ item.cat }}</td>
                  <td>{{ item.fmt }}</td>
                  <td>{{ item.size || '—' }}</td>
                  <td>{{ item.mode }}</td>
                  <td style="text-align:center">
                    <div class="ops" style="justify-content:center">
                      <a class="danger" @click="importList.splice(i, 1)">删除</a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'workbench'">
      <div class="toolbar" style="align-items:center;margin-bottom:14px;background:#fff;border:1px solid #e4ecf4;border-radius:8px;padding:10px 16px">
        <span style="font-size:13.5px;color:#4a5a6a;font-weight:600;white-space:nowrap;flex:0 0 auto">审核对象</span>
        <div style="width:280px;flex:0 0 280px">
          <select-field v-model="docId" :options="docs.map(d => ({ value: d.id, label: d.name }))" placeholder="请选择文档" />
        </div>
        <button class="btn btn-primary" style="height:36px;padding:0 18px;white-space:nowrap" @click="toast('审核意见已保存')">保存审核</button>
        <button class="btn btn-outline" style="height:36px;padding:0 18px;white-space:nowrap" @click="toast('已调整章节层级')">调整层级</button>
      </div>
      <div class="workbench">
        <div class="wb-col">
          <h4>解析结果目录</h4>
          <div v-for="c in chapters" :key="c.id" class="dir-item" :class="{ on: c.id === cur.id }" @click="cur = c">
            {{ c.title }}<small :class="c.tag === '已确认' ? 'ok' : 'wait'">{{ c.tag }}</small>
          </div>
        </div>
        <div class="wb-col">
          <h4>审核与编辑</h4>
          <div class="editor">
            <div class="field"><label>章节标题</label><input v-model="cur.title" /></div>
            <div class="field" style="margin-top:10px"><label>正文内容</label><textarea v-model="cur.body" style="height:180px" /></div>
            <p style="margin-top:10px;font-size:13px;color:#6d8092">实体识别预览：<span class="ent">东方红-LF2204</span>　<span class="ent">162 kW</span>　<span class="ent">DG/T 001-2025</span></p>
            <div style="margin-top:12px;display:flex;gap:8px">
              <button class="btn btn-outline" @click="toast('已新增实体标注')">新增实体</button>
              <button class="btn btn-danger" @click="toast('已删除当前条目')">删除当前条目</button>
            </div>
          </div>
        </div>
        <div class="wb-col">
          <h4>源文件预览</h4>
          <div class="source">
            <h5 :class="{ hit: cur.id === 'c1' }">第一章 概述</h5>
            <p>受生产企业委托，对<span class="hit">东方红-LF2204</span>轮式拖拉机开展定型试验，验证其是否满足 DG/T 001-2025 的定型鉴定要求。</p>
            <h5>第二章 试验条件与仪器设备</h5>
            <p>试验地点：河南省洛阳市拖拉机试验场；环境温度 12～26 ℃；牵引设备：300 kN 负荷车。</p>
            <h5 :class="{ hit: cur.id === 'c3' }">第三章 性能试验结果</h5>
            <p>动力输出轴试验：标定转速 540/1000 r/min，发动机标定功率 <span class="hit">162 kW</span>，动力输出轴功率 138.5 kW。</p>
            <p>牵引性能试验：最大牵引力 38.6 kN，滑转率 8.2%，牵引功率 118.4 kW。</p>
            <h5>第四章 可靠性试验</h5>
            <p>累计作业 750 h，一般故障 2 次，MTBF = 375 h。</p>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'parse'">
      <div class="tabs">
        <button v-for="t in parseTabs" :key="t" :class="{ on: tab === t }" @click="tab = t">{{ t }}</button>
      </div>
      <div class="split" style="grid-template-columns: 1fr 1fr">
        <div class="panel">
          <h3><i></i>解析能力</h3>
          <ul class="check-list">
            <li v-for="item in parsePoints" :key="item" style="list-style:none;padding:8px 0;border-bottom:1px solid #f0f4f8;color:#3f5062">{{ item }}</li>
          </ul>
        </div>
        <div class="panel">
          <h3><i></i>解析结果预览</h3>
          <div class="kv">
            <b>机型</b><span>东方红-LF2204</span>
            <b>关键指标</b><span>标定功率 162 kW；牵引力 38.6 kN</span>
            <b>段落主旨</b><span>本章给出动力输出与牵引性能的实测结果</span>
            <b>语义关系</b><span>指标—数值、项目—方法、结论—标准条款</span>
            <b>调度引擎</b><span>{{ tab === '图像解析' ? '文档OCR识别引擎 95.6%' : tab === '表格解析' ? '表格结构识别引擎 94.1%' : '领域多模态大模型 92.4%' }}</span>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'engines'">
      <div class="engine-grid">
        <div v-for="e in engines" :key="e.name" class="engine">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <h4>{{ e.name }}</h4>
            <span class="badge" :class="e.on ? 'on' : 'hold'"><i></i>{{ e.on ? '启用' : '停用' }}</span>
          </div>
          <p>{{ e.vendor }} · {{ e.type }}</p>
          <p>准确率 {{ e.acc }} · {{ e.lang }}</p>
          <p>{{ e.cap }}</p>
          <button class="btn btn-outline" style="margin-top:8px" @click="e.on = !e.on; toast(e.on ? '已启用' : '已停用')">{{ e.on ? '停用' : '启用' }}</button>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'clean'">
      <div class="split" style="grid-template-columns: 1fr 1fr">
        <div class="panel">
          <h3><i></i>去噪归一规则</h3>
          <div class="check-list">
            <label v-for="r in rules" :key="r.name"><input type="checkbox" v-model="r.on" /> {{ r.name }}（{{ r.target }}）</label>
          </div>
        </div>
        <div class="panel">
          <h3><i></i>执行清洗</h3>
          <div class="field"><label>选择资源</label>
            <select-field v-model="cleanRes" :options="['东方红-LF2204轮式拖拉机定型试验报告','雷沃谷神4LZ-8谷物联合收割机鉴定大纲']" placeholder="请选择资源" />
          </div>
          <button class="btn btn-primary" style="margin-top:12px" @click="runClean">执行清洗</button>
        </div>
      </div>
      <div class="table-wrap" style="margin-top:12px">
        <table>
          <thead><tr><th>数据资源</th><th>应用规则</th><th>剔除噪声</th><th>状态</th><th>处理时间</th></tr></thead>
          <tbody>
            <tr v-for="log in cleanLogs" :key="log.time"><td>{{ log.res }}</td><td>{{ log.rule }}</td><td>{{ log.n }}</td><td><span class="badge on"><i></i>已完成</span></td><td>{{ log.time }}</td></tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-else-if="page.type === 'export'">
      <div class="panel">
        <h3><i></i>批量导出配置</h3>
        <p class="hint" style="margin-bottom:8px">第一步：勾选已解析文档</p>
        <div class="check-list">
          <label v-for="n in exportDocs" :key="n"><input type="checkbox" checked /> {{ n }}</label>
        </div>
        <p class="hint" style="margin:12px 0 8px">第二步：选择目标格式</p>
        <div class="code-tabs">
          <button v-for="f in ['JSON','DOCX','Markdown','PDF','TXT']" :key="f" :class="{ on: fmt === f }" @click="fmt = f">{{ f }}</button>
        </div>
        <button class="btn btn-primary" @click="toast('已生成 ' + fmt + ' 导出任务')">开始导出</button>
      </div>
      <CrudPage :page="{ type:'crud', desc:'最近导出任务', dataset:'exports' }" title="导出成果" style="margin-top:8px" />
    </template>

    <template v-else-if="page.type === 'graph'">
      <div class="toolbar">
        <input v-model="gkey" class="g-search" placeholder="搜索节点名称或类型" />
        <button class="btn btn-outline" @click="toast('已切换为三维布局预览')">三维展示</button>
        <button class="btn btn-primary" @click="toast('节点已加入画布，可在右侧编辑属性')">新建节点</button>
        <button class="btn btn-outline" @click="toast('图谱压缩包已开始导出')">导出压缩包</button>
      </div>
      <div class="graph-wrap">
        <svg class="graph-svg" viewBox="0 0 760 520">
          <line v-for="e in graphEdges" :key="e[0]+e[1]" :x1="nodeMap[e[0]].x" :y1="nodeMap[e[0]].y" :x2="nodeMap[e[1]].x" :y2="nodeMap[e[1]].y" stroke="#b7cbe0" stroke-width="1.4" />
          <g v-for="n in graphNodes" :key="n.id" @click="activeNode = n" style="cursor:pointer">
            <circle :cx="n.x" :cy="n.y" :r="n.id === activeNode.id ? 30 : 26" :fill="n.color" :stroke="nodeHit(n) ? '#e3bd6a' : '#fff'" :stroke-width="nodeHit(n) ? 4 : 2" />
            <text :x="n.x" :y="n.y + 4" text-anchor="middle" font-size="12" font-weight="700" :fill="n.color === '#d0ab68' ? '#5a3e12' : '#fff'">{{ n.type.slice(0, 2) }}</text>
            <text :x="n.x" :y="n.y + 48" text-anchor="middle" font-size="12" fill="#1d3e5c" paint-order="stroke" stroke="#f7fbfe" stroke-width="4">{{ n.label }}</text>
          </g>
        </svg>
        <div class="panel node-card">
          <h4>{{ activeNode.label }}</h4>
          <p>类型：{{ activeNode.type }}</p>
          <p>{{ activeNode.detail }}</p>
          <div class="actions">
            <button class="btn btn-outline" @click="toast('关系已保存')">编辑关系</button>
            <button class="btn btn-primary" @click="toast('已打开原文溯源')">原文溯源</button>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'chat'">
      <div class="chat-wrap">
        <div class="chat-side">
          <div class="side-title">会话主题</div>
          <div v-for="t in topics" :key="t" class="topic" :class="{ on: t === topic }" @click="topic = t">{{ t }}</div>
        </div>
        <div class="chat-main">
          <div class="chat-bar">{{ topic }}</div>
          <div class="msgs">
            <div v-for="(m, i) in messages" :key="i" class="bubble" :class="m.role">
              {{ m.text }}
              <span v-if="m.src" class="src">来源：{{ m.src }}</span>
            </div>
          </div>
          <div class="suggest">
            <button v-for="q in suggests" :key="q" @click="ask(q)">{{ q }}</button>
          </div>
          <div class="chat-input">
            <input v-model="input" placeholder="请输入问题，支持多轮补充" @keyup.enter="ask(input)" />
            <button class="btn btn-primary" @click="ask(input)">发送</button>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'code'">
      <div class="code-tabs">
        <button v-for="l in codeLangs" :key="l" :class="{ on: lang === l }" @click="lang = l">{{ l }}</button>
      </div>
      <pre class="code" v-html="codeHtml"></pre>
      <div style="margin-top:10px;display:flex;gap:8px">
        <button class="btn btn-primary" @click="toast('已写入代码成果库')">保存成果</button>
        <button class="btn btn-outline" @click="toast('已生成函数、参数与执行逻辑注释')">生成注释</button>
        <button class="btn btn-outline" @click="toast('未发现语法错误，建议核对滑转率分母')">纠错检查</button>
      </div>
    </template>

    <template v-else-if="page.type === 'radar'">
      <div class="split" style="grid-template-columns: 360px 1fr">
        <div class="panel">
          <h3><i></i>能力雷达 · 东方红-LF2204</h3>
          <svg viewBox="0 0 320 300" width="100%">
            <polygon points="160,40 262,112 230,230 90,230 58,112" fill="none" stroke="#d5e4f2" />
            <polygon points="160,78 226,126 206,204 112,204 94,126" fill="rgba(22,104,168,.25)" stroke="#1668a8" />
            <text x="150" y="32" font-size="12" fill="#0d4e83">打击 86</text>
            <text x="266" y="116" font-size="12" fill="#0d4e83">机动 82</text>
            <text x="214" y="252" font-size="12" fill="#0d4e83">防护 78</text>
            <text x="48" y="252" font-size="12" fill="#0d4e83">可靠 90</text>
            <text x="20" y="116" font-size="12" fill="#0d4e83">效率 84</text>
          </svg>
        </div>
        <div class="panel">
          <h3><i></i>能力矩阵</h3>
          <div class="table-wrap">
            <table>
              <thead><tr><th>维度</th><th>得分</th><th>主要依据</th><th>状态</th></tr></thead>
              <tbody>
                <tr v-for="r in radarRows" :key="r.name"><td>{{ r.name }}</td><td>{{ r.score }}</td><td>{{ r.basis }}</td><td><span class="badge on"><i></i>达标</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'timeline'">
      <div class="panel">
        <div class="timeline">
          <div v-for="item in timeline" :key="item.t" class="tl-item">
            <b>{{ item.t }} · {{ item.title }}</b>
            <p>{{ item.text }}</p>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'flow'">
      <div class="chain">
        <div
          v-for="item in flowChain"
          :key="item.key"
          :class="item.isArrow ? 'arrow' : ['node', { on: item.title === flowOn.title }]"
          @click="!item.isArrow && (flowOn = item)"
        >
          <template v-if="!item.isArrow">
            <em>{{ String(item.idx + 1).padStart(2, '0') }}</em>
            <b>{{ item.title }}</b>
            <p>{{ item.text }}</p>
          </template>
          <template v-else>→</template>
        </div>
      </div>
      <div class="panel" style="margin-top:12px">
        <h3><i></i>{{ flowOn.title }}</h3>
        <p style="color:#3f5062;line-height:1.75">{{ flowOn.detail }}</p>
      </div>
    </template>

    <template v-else-if="page.type === 'canvas'">
      <div class="split" style="grid-template-columns: 1fr 280px">
        <div class="canvas">
          <svg class="canvas-lines">
            <line v-for="(e, i) in canvasLinks" :key="i" :x1="e[0].x + 75" :y1="e[0].y + 28" :x2="e[1].x + 75" :y2="e[1].y + 28" />
          </svg>
          <div v-for="n in canvasNodes" :key="n.title" class="wf-node" :class="{ on: n.title === canvasOn.title }" :style="{ left: n.x + 'px', top: n.y + 'px' }" @click="canvasOn = n">
            <b>{{ n.title }}</b><span>{{ n.sub }}</span>
          </div>
        </div>
        <div class="panel">
          <h3><i></i>节点参数</h3>
          <p style="color:#3f5062;line-height:1.7;margin-bottom:8px">{{ canvasOn.detail }}</p>
          <div class="field"><label>输入参数</label><input :value="canvasOn.input" /></div>
          <div class="field" style="margin-top:8px"><label>输出参数</label><input :value="canvasOn.output" /></div>
          <button class="btn btn-primary" style="margin-top:12px" @click="toast('组件调试通过，日志已写入')">在线调试</button>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'cards'">
      <div class="cards">
        <div v-for="c in cardList" :key="c.title" class="info-card" @click="toast('已打开「' + c.title + '」')">
          <div class="tag">{{ c.tag }}</div>
          <h4>{{ c.title }}</h4>
          <p>{{ c.text }}</p>
          <button class="btn btn-ghost" @click.stop="toast('已打开「' + c.title + '」')">查看</button>
        </div>
      </div>
    </template>

    <template v-else-if="page.type === 'report'">
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button class="btn btn-primary" @click="toast('报告已保存')">保存</button>
        <button class="btn btn-outline" @click="toast('已导出 Word')">导出 Word</button>
        <button class="btn btn-outline" @click="toast('已导出 PDF')">导出 PDF</button>
      </div>
      <article class="doc-paper">
        <h3>{{ paper.title }}</h3>
        <div class="meta">{{ paper.meta }}</div>
        <div v-for="sec in paper.sections" :key="sec.h" class="paper-sec">
          <h4>{{ sec.h }}</h4>
          <p>{{ sec.p }}</p>
        </div>
      </article>
    </template>

    <template v-else-if="page.type === 'stats'">
      <div class="kpi-row">
        <div v-for="k in statKpis" :key="k.label" class="kpi">
          <div class="mark"><Icon :name="kpiIcon(k.label)" /></div>
          <div class="label">{{ k.label }}</div>
          <div class="value">{{ k.value }}<small>{{ k.unit }}</small></div>
        </div>
      </div>
      <div class="split" style="grid-template-columns: 1.2fr .8fr">
        <div class="panel">
          <h3><i></i>{{ statChart.title }}</h3>
          <div class="bars">
            <div v-for="item in statChart.data" :key="item[0]" class="bar-col">
              <div class="num">{{ item[1] }}</div>
              <div class="bar" :style="{ height: Math.max(12, item[1] / statMax * 130) + 'px' }"></div>
              <div class="lb">{{ item[0] }}</div>
            </div>
          </div>
        </div>
        <div class="panel">
          <h3><i></i>结构分布</h3>
          <div v-for="d in dist" :key="d.name" class="dist-row">
            <div class="dist-meta"><span>{{ d.name }}</span><b>{{ d.v }}%</b></div>
            <div class="progress"><span :style="{ width: d.v + '%' }"></span></div>
          </div>
        </div>
      </div>
    </template>

    <!-- ── 镜头一（M01）数据资源目录 两级页面 ─────────────────────────── -->
    <template v-else-if="page.type === 'm01'">

      <!-- ═══ 第二级：处理结果详情页 ═══ -->
      <template v-if="m01Detail">
        <!-- 返回条 -->
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <span style="display:inline-flex;align-items:center;gap:4px;font-size:13px;color:#1668a8;cursor:pointer" @click="m01Detail=null">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:13px;height:13px"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            返回资源目录
          </span>
          <span style="color:#d0dce8">|</span>
          <span style="font-size:13px;color:#3f5062;font-weight:500">{{ m01Detail.name }}</span>
        </div>

        <!-- 文件信息条 -->
        <div style="background:#fff;border:1px solid #e4ecf4;border-radius:8px;padding:14px 18px;margin-bottom:14px;display:flex;align-items:center;gap:16px">
          <div style="width:44px;height:44px;border-radius:8px;background:linear-gradient(135deg,#c0392b,#e74c3c);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex:0 0 44px">PDF</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:15px;font-weight:700;color:#1a3a5a">{{ m01Detail.name }}</div>
            <div style="font-size:13px;color:#8a99a8;margin-top:3px">
              {{ m01Detail.pages }} 页 &nbsp;·&nbsp; {{ m01Detail.size }} &nbsp;·&nbsp; 解析完成：{{ m01Detail.parsedAt }}
            </div>
          </div>
          <span class="badge on" style="flex:0 0 auto"><i></i>处理完成</span>
        </div>

        <!-- 主体：左侧章节树 + 右侧统计与索引 -->
        <div style="display:grid;grid-template-columns:280px 1fr;gap:14px;align-items:stretch">

          <!-- 左：章节结构树 -->
          <div class="chapter-panel">
            <div style="padding:10px 14px;border-bottom:1px solid #eef3f8;font-weight:600;font-size:13.5px;color:#1f3d5a;flex:0 0 auto">章节结构</div>
            <div style="padding:6px 0;flex:1;overflow:auto">
              <div v-for="ch in m01Detail.chapters" :key="ch.id">
                <!-- 一级章节 -->
                <div
                  style="padding:7px 14px;font-size:13.5px;color:#1f3d5a;font-weight:500;display:flex;align-items:center;gap:6px;cursor:pointer"
                  :style="m01SelChapter===ch.id ? 'background:#eaf3fd;color:#0d4e83' : ''"
                  @click="m01SelChapter=ch.id; m01SelSub=null"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:12px;height:12px;flex:0 0 auto;color:#c6a15a"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  {{ ch.title }}
                </div>
                <!-- 二级子章节 -->
                <div v-if="ch.children" v-for="sub in ch.children" :key="sub.id"
                  style="padding:6px 14px 6px 32px;font-size:13px;color:#5c7084;cursor:pointer;display:flex;align-items:center;gap:5px"
                  :style="m01SelSub===sub.id ? 'background:#f4f9fe;color:#0d4e83' : ''"
                  @click.stop="m01SelChapter=ch.id; m01SelSub=sub.id"
                >
                  <span style="width:5px;height:5px;border-radius:50%;background:currentColor;flex:0 0 auto;opacity:.5"></span>
                  {{ sub.title }}
                </div>
              </div>
            </div>
          </div>

          <!-- 右：统计卡片 + 语义索引 -->
          <div style="display:flex;flex-direction:column;gap:14px">
            <!-- 三张统计小卡片横排 -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
              <div style="background:#fff;border:1px solid #e4ecf4;border-radius:8px;padding:16px 18px;text-align:center">
                <div style="font-size:28px;font-weight:700;color:#0d4e83">{{ m01Detail.tableCount }}</div>
                <div style="font-size:13px;color:#8a99a8;margin-top:4px">表格识别</div>
                <div style="font-size:12px;color:#b0bec9;margin-top:2px">张</div>
              </div>
              <div style="background:#fff;border:1px solid #e4ecf4;border-radius:8px;padding:16px 18px;text-align:center">
                <div style="font-size:28px;font-weight:700;color:#0d4e83">{{ m01Detail.imageCount }}</div>
                <div style="font-size:13px;color:#8a99a8;margin-top:4px">图片解析</div>
                <div style="font-size:12px;color:#b0bec9;margin-top:2px">幅</div>
              </div>
              <div style="background:#fff;border:1px solid #e4ecf4;border-radius:8px;padding:16px 18px;text-align:center">
                <div style="font-size:28px;font-weight:700;color:#0d4e83">{{ m01Detail.paraCount }}</div>
                <div style="font-size:13px;color:#8a99a8;margin-top:4px">段落识别</div>
                <div style="font-size:12px;color:#b0bec9;margin-top:2px">段</div>
              </div>
            </div>

            <!-- 语义索引状态卡 -->
            <div class="crud-body" style="padding:16px 18px">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
                <svg viewBox="0 0 24 24" fill="none" stroke="#0d4e83" stroke-width="1.8" style="width:18px;height:18px;flex:0 0 auto"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
                <span style="font-size:14px;font-weight:600;color:#1f3d5a">语义索引状态</span>
                <span class="badge on" style="margin-left:auto"><i></i>已建立</span>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                  <div style="font-size:12px;color:#8a99a8;margin-bottom:4px">索引库名称</div>
                  <div style="font-size:13.5px;color:#1f3d5a;font-weight:500">{{ m01Detail.indexName }}</div>
                </div>
                <div>
                  <div style="font-size:12px;color:#8a99a8;margin-bottom:4px">建立时间</div>
                  <div style="font-size:13.5px;color:#1f3d5a">{{ m01Detail.indexAt }}</div>
                </div>
                <div>
                  <div style="font-size:12px;color:#8a99a8;margin-bottom:4px">索引状态</div>
                  <div style="font-size:13.5px;color:#49a36a;font-weight:600">✓ 已建立，可检索</div>
                </div>
                <div>
                  <div style="font-size:12px;color:#8a99a8;margin-bottom:4px">向量维度</div>
                  <div style="font-size:13.5px;color:#1f3d5a">1024 维</div>
                </div>
              </div>
              <div style="margin-top:14px;padding-top:12px;border-top:1px solid #eef3f8;display:flex;gap:8px">
                <button class="btn btn-primary" style="height:32px;padding:0 14px;font-size:13px" @click="toast('已打开语义检索窗口')">语义检索</button>
                <button class="btn btn-outline" style="height:32px;padding:0 14px;font-size:13px" @click="toast('已重建语义索引')">重建索引</button>
              </div>
            </div>

            <!-- 实体识别概况 -->
            <div v-if="m01Detail.entities?.length" class="crud-body" style="padding:16px 18px">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
                <svg viewBox="0 0 24 24" fill="none" stroke="#0d4e83" stroke-width="1.8" style="width:18px;height:18px;flex:0 0 auto"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 17h7M17 14v7"/></svg>
                <span style="font-size:14px;font-weight:600;color:#1f3d5a">实体识别概况</span>
                <span style="margin-left:auto;font-size:12px;color:#8a99a8">共 {{ m01Detail.entities.reduce((s,e)=>s+e.count,0) }} 个</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:9px">
                <div v-for="ent in m01Detail.entities" :key="ent.label" style="display:flex;align-items:center;gap:10px">
                  <span style="width:76px;flex:0 0 76px;font-size:12.5px;color:#5c7084;text-align:right;white-space:nowrap">{{ ent.label }}</span>
                  <div style="flex:1;height:8px;background:#eef3f8;border-radius:4px;overflow:hidden">
                    <div
                      style="height:100%;background:linear-gradient(90deg,#1668a8,#4d9fd6);border-radius:4px;transition:width .4s"
                      :style="`width:${Math.round(ent.count / m01Detail.entities.reduce((s,e)=>s+e.count,0) * 100)}%`"
                    ></div>
                  </div>
                  <span style="width:24px;flex:0 0 24px;font-size:12.5px;font-weight:600;color:#1f3d5a;text-align:right">{{ ent.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ═══ 第一级：资源目录列表页 ═══ -->
      <template v-else>
        <div style="display:grid;grid-template-columns:200px 1fr;gap:14px;align-items:start">

          <!-- 左：分类目录树 -->
          <div class="crud-body" style="padding:0;overflow:hidden">
            <div style="padding:10px 14px;border-bottom:1px solid #eef3f8;font-weight:600;font-size:13px;color:#1f3d5a">资料分类</div>
            <div style="padding:4px 0">
              <div
                v-for="cat in m01Cats"
                :key="cat.key"
                style="padding:9px 14px;display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13.5px;border-left:3px solid transparent"
                :style="m01ActiveCat===cat.key
                  ? 'background:#eaf3fd;color:#0d4e83;font-weight:600;border-left-color:#1668a8'
                  : 'color:#3f5062'"
                @click="m01ActiveCat=cat.key"
              >
                <span style="flex:1">{{ cat.label }}</span>
                <span
                  style="font-size:11.5px;padding:1px 7px;border-radius:10px;font-weight:600"
                  :style="m01ActiveCat===cat.key ? 'background:#1668a8;color:#fff' : 'background:#eef3f8;color:#6d8092'"
                >{{ cat.count }}</span>
              </div>
            </div>
          </div>

          <!-- 右：资源列表 -->
          <div class="crud-body">
            <!-- 操作栏 -->
            <div class="toolbar">
              <button class="btn btn-primary" style="height:36px;padding:0 18px;font-size:14px;gap:6px;display:inline-flex;align-items:center" @click="toast('已打开导入面板')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="width:15px;height:15px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                导入
              </button>
              <div style="position:relative;display:inline-flex;align-items:center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="position:absolute;left:9px;width:14px;height:14px;color:#a0aab4;pointer-events:none"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
                <input v-model="m01Search" placeholder="搜索资源名称…" style="height:36px;border:1px solid #d5e0ea;border-radius:6px;padding:0 10px 0 30px;font-size:13.5px;color:#3f5062;outline:none;background:#fff;width:240px" />
                <button v-if="m01Search" @click="m01Search=''" style="position:absolute;right:8px;background:none;border:none;color:#a0aab4;cursor:pointer;font-size:15px;line-height:1;padding:0">×</button>
              </div>
              <span class="spacer"></span>
              <span class="hint">共 {{ m01FilteredRows.length }} 条资源</span>
            </div>
            <!-- 表格 -->
            <div class="table-inner">
              <table>
                <thead>
                  <tr>
                    <th>资源名称</th>
                    <th style="width:90px">类型</th>
                    <th style="width:80px;text-align:center">密级</th>
                    <th style="width:90px">大小</th>
                    <th style="width:150px">入库时间</th>
                    <th style="text-align:center;width:80px">处理状态</th>
                    <th style="text-align:center;width:100px">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in m01FilteredRows"
                    :key="row.name"
                    style="cursor:pointer"
                    @click="m01OpenDetail(row)"
                  >
                    <td>
                      <div style="display:flex;align-items:center;gap:8px">
                        <!-- 格式图标 -->
                        <span
                          style="font-size:10px;font-weight:700;padding:2px 5px;border-radius:3px;flex:0 0 auto"
                          :style="row.fmt==='PDF' ? 'background:#fde8e8;color:#c0392b' : row.fmt==='DOCX'||row.fmt==='WPS' ? 'background:#e8f0fe;color:#1a56db' : row.fmt==='XLSX'||row.fmt==='CSV' ? 'background:#e8fde8;color:#1a8a3a' : 'background:#f0f0f0;color:#555'"
                        >{{ row.fmt }}</span>
                        <span style="font-size:13.5px;color:#1f3d5a;font-weight:500">{{ row.name }}</span>
                      </div>
                    </td>
                    <td style="color:#5c7084;font-size:13px">{{ row.cat }}</td>
                    <td style="text-align:center">
                      <!-- 密级麦金色标签 -->
                      <span style="background:#fff8e8;color:#c8902a;border:1px solid #f0d080;border-radius:10px;padding:2px 8px;font-size:11.5px;font-weight:600">{{ m01Secret(row.cat) }}</span>
                    </td>
                    <td style="color:#8a99a8;font-size:13px">{{ row.size }}</td>
                    <td style="color:#8a99a8;font-size:13px">{{ row.time }}</td>
                    <td style="text-align:center">
                      <span class="badge" :class="row.status==='已解析'?'on':row.status==='解析中'?'run':'hold'">
                        <i></i>{{ row.status==='已解析' ? '已完成' : row.status }}
                      </span>
                    </td>
                    <td style="text-align:center" @click.stop>
                      <button class="btn-link" @click="m01OpenDetail(row)">查看详情</button>
                    </td>
                  </tr>
                  <tr v-if="!m01FilteredRows.length" class="empty-row">
                    <td colspan="7" class="empty">暂无符合条件的资源</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
    </template>

    <!-- ── 镜头二（M02）指标抽取结果 两级页面 ─────────────────────────── -->
    <template v-else-if="page.type === 'm02'">

      <!-- ═══ 第二级：D-01 任务抽取结果页 ═══ -->
      <template v-if="m02Detail">
        <!-- 返回条 -->
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:13.5px;color:#7c8fa2">
          <span style="display:inline-flex;align-items:center;gap:4px;font-size:13px;color:#1668a8;cursor:pointer" @click="m02Detail=null">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:13px;height:13px"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            返回任务列表
          </span>
          <span style="color:#d0dce8">|</span>
          <span style="color:#3f5062;font-weight:500">{{ m02Detail.name }}</span>
        </div>

        <!-- 文档信息条 -->
        <div style="background:#fff;border:1px solid #e4ecf4;border-radius:8px;padding:14px 18px;margin-bottom:10px;display:flex;align-items:center;gap:16px">
          <div style="width:42px;height:42px;border-radius:8px;background:linear-gradient(135deg,#2b6cb0,#1668a8);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex:0 0 42px">DOCX</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:15px;font-weight:600;color:#1a3a5a">{{ m02Detail.doc }}</div>
            <div style="font-size:13px;color:#8a99a8;margin-top:3px">来源文档：{{ m02Detail.name }} &nbsp;·&nbsp; 抽取完成：{{ m02Detail.finishedAt }}</div>
          </div>
          <button class="btn btn-primary" style="height:34px;padding:0 18px;font-size:13.5px;white-space:nowrap" @click="toast('已提交审核，进入人工核验队列')">提交审核</button>
        </div>

        <!-- 性能域筛选标签 -->
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">
          <span style="font-size:13px;color:#6d8092">性能域：</span>
          <button
            v-for="d in m02Domains"
            :key="d"
            class="m02-domain-tag"
            :class="{ on: m02ActiveDomains.has(d) }"
            @click="m02ToggleDomain(d)"
          >{{ d }}</button>
          <button class="btn btn-ghost" style="height:26px;padding:0 8px;font-size:12.5px" @click="m02ActiveDomains = new Set(m02Domains)">全选</button>
          <button class="btn btn-ghost" style="height:26px;padding:0 8px;font-size:12.5px" @click="m02ActiveDomains = new Set()">清空</button>
        </div>

        <!-- 统计横条 -->
        <div style="background:linear-gradient(100deg,#062848,#0b3e6e);border-radius:8px;padding:12px 20px;margin-bottom:12px;display:flex;align-items:center;gap:32px">
          <div style="display:flex;align-items:baseline;gap:5px">
            <span style="font-size:26px;font-weight:700;color:#fff">{{ m02VisibleRows.length }}</span>
            <span style="font-size:13px;color:#aac4de">项指标</span>
          </div>
          <div style="width:1px;height:28px;background:rgba(255,255,255,.15)"></div>
          <div style="display:flex;align-items:baseline;gap:5px">
            <span style="font-size:26px;font-weight:700;color:#fff">{{ m02ActiveDomains.size }}</span>
            <span style="font-size:13px;color:#aac4de">个性能域</span>
          </div>
          <div style="width:1px;height:28px;background:rgba(255,255,255,.15)"></div>
          <div style="display:flex;align-items:baseline;gap:5px">
            <span style="font-size:26px;font-weight:700;color:#e3bd6a">{{ m02PendingCount2 }}</span>
            <span style="font-size:13px;color:#aac4de">项待人工审核</span>
          </div>
          <div style="margin-left:auto;font-size:13px;color:#7ca5c8">
            置信度：
            <span style="display:inline-block;width:28px;height:7px;background:#1668a8;border-radius:3px;vertical-align:middle;margin:0 4px 0 2px"></span>≥0.90
            <span style="display:inline-block;width:28px;height:7px;background:#a8c8e8;border-radius:3px;vertical-align:middle;margin:0 4px 0 10px"></span>0.80–0.90
            <span style="display:inline-block;width:28px;height:7px;background:#d0ab68;border-radius:3px;vertical-align:middle;margin:0 4px 0 10px"></span>&lt;0.80
          </div>
        </div>

        <!-- 抽取结果表 -->
        <div class="crud-body" style="padding-bottom:16px">
          <!-- 表头工具栏 -->
          <div class="toolbar">
            <span class="hint">共 <b style="color:#0d4e83">{{ m02VisibleRows.length }}</b> 项抽取结果</span>
          </div>
          <div class="table-inner">
            <table>
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th>指标名称</th>
                  <th>指标值</th>
                  <th>单位</th>
                  <th style="max-width:200px">判据</th>
                  <th style="text-align:center;white-space:nowrap">所属性能域</th>
                  <th style="text-align:center;width:140px">置信度</th>
                  <th style="text-align:center">状态</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, idx) in m02VisibleRows"
                  :key="row.id"
                  :class="{ 'm02-gold-row': row.conf < 0.80 }"
                >
                  <td class="col-idx" style="color:#8a99a8">{{ idx + 1 }}</td>
                  <td style="font-weight:500;color:#1f3d5a;white-space:nowrap">{{ row.name }}</td>
                  <td style="font-family:monospace;color:#0d4e83;font-weight:600">{{ row.value }}</td>
                  <td style="color:#6d8092;white-space:nowrap">{{ row.unit }}</td>
                  <td style="font-size:13px;color:#5c7084;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" :title="row.criteria">{{ row.criteria }}</td>
                  <td style="text-align:center">
                    <span class="m02-domain-pill">{{ row.domain }}</span>
                  </td>
                  <td style="text-align:center">
                    <div style="display:flex;align-items:center;gap:6px;justify-content:center">
                      <div style="width:64px;height:7px;background:#e6eef5;border-radius:4px;overflow:hidden;flex:0 0 64px">
                        <div :style="{ width: (row.conf*100).toFixed(0)+'%', height:'100%', borderRadius:'4px', background: row.conf>=0.90 ? '#1668a8' : row.conf>=0.80 ? '#a8c8e8' : '#d0ab68' }"></div>
                      </div>
                      <span style="font-size:12.5px;font-weight:600;min-width:34px;text-align:right" :style="{ color: row.conf>=0.90 ? '#1668a8' : row.conf>=0.80 ? '#4a7fa8' : '#c8902a' }">{{ (row.conf*100).toFixed(0) }}%</span>
                    </div>
                  </td>
                  <td style="text-align:center">
                    <span class="badge" :class="row.status==='已确认'?'on':row.status==='待审核'?'warn':'hold'">
                      <i></i>{{ row.status }}
                    </span>
                  </td>
                </tr>
                <tr v-if="!m02VisibleRows.length" class="empty-row">
                  <td colspan="8" class="empty">当前性能域筛选下无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- ═══ 第一级：抽取任务列表页 ═══ -->
      <template v-else>
        <div class="crud-body">
          <!-- 操作栏 -->
          <div class="toolbar">
            <button class="btn btn-primary" style="height:36px;padding:0 18px;font-size:14px;gap:6px;display:inline-flex;align-items:center" @click="toast('已打开新建抽取任务面板')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="width:15px;height:15px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              新建抽取任务
            </button>
            <div style="position:relative;display:inline-flex;align-items:center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="position:absolute;left:9px;width:14px;height:14px;color:#a0aab4;pointer-events:none"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
              <input
                v-model="m02FilterDoc"
                placeholder="搜索来源文档…"
                style="height:36px;border:1px solid #d5e0ea;border-radius:6px;padding:0 10px 0 30px;font-size:13.5px;color:#3f5062;outline:none;background:#fff;width:260px"
              />
              <button v-if="m02FilterDoc" @click="m02FilterDoc=''" style="position:absolute;right:8px;background:none;border:none;color:#a0aab4;cursor:pointer;font-size:15px;line-height:1;padding:0">×</button>
            </div>
            <span class="spacer"></span>
            <span class="hint">共 {{ m02TaskList.length }} 个任务</span>
          </div>

          <!-- 任务列表表格 -->
          <div class="table-inner">
            <table>
              <thead>
                <tr>
                  <th style="min-width:260px">任务名称</th>
                  <th>来源文档</th>
                  <th style="text-align:center;width:100px">抽取指标数</th>
                  <th style="text-align:center;width:90px">状态</th>
                  <th style="width:160px">完成时间</th>
                  <th style="text-align:center;width:120px">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="task in m02FilteredTasks"
                  :key="task.doc"
                  :style="task.status === '已完成' ? 'cursor:pointer' : ''"
                  @click="task.status === '已完成' && m02OpenDetail(task)"
                >
                  <td>
                    <span style="font-size:13.5px;color:#1f3d5a;font-weight:500">{{ task.name }}</span>
                  </td>
                  <td style="color:#3f5062;max-width:260px;overflow:hidden;text-overflow:ellipsis">{{ task.doc }}</td>
                  <td style="text-align:center">
                    <span style="font-size:16px;font-weight:700;color:#0d4e83">{{ task.count }}</span>
                  </td>
                  <td style="text-align:center">
                    <span class="badge" :class="task.status==='已完成'?'on':task.status==='进行中'?'run':'hold'">
                      <i></i>{{ task.status }}
                    </span>
                  </td>
                  <td style="color:#6d8092;white-space:nowrap">{{ task.finishedAt || '—' }}</td>
                  <td style="text-align:center">
                    <div class="ops">
                      <button
                        v-if="task.status === '已完成'"
                        @click.stop="m02OpenDetail(task)"
                      >查看结果</button>
                      <button @click.stop="toast('已打开任务配置')">配置</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!m02FilteredTasks.length" class="empty-row">
                  <td colspan="6" class="empty">暂无符合条件的抽取任务</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </template>

    <!-- ── 镜头三（M03）标准化数据建模 ─────────────────────────────────── -->
    <template v-else-if="page.type === 'm03'">

      <!-- ═══ 第二级：指标树详情页 ═══ -->
      <template v-if="m03DetailOpen">
        <!-- 版本信息条 -->
        <div class="crud-body" style="margin-bottom:14px;padding:14px 18px">
          <div style="display:flex;align-items:center;gap:16px">
            <!-- 返回 -->
            <span style="display:inline-flex;align-items:center;gap:4px;font-size:13px;color:#1668a8;cursor:pointer" @click="m03DetailOpen=false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:13px;height:13px"><polyline points="15 18 9 12 15 6"/></svg>
              返回列表
            </span>
            <div style="width:1px;height:22px;background:#dde8f0"></div>
            <div style="display:flex;align-items:center;gap:10px;flex:1">
              <span style="font-weight:700;font-size:15px;color:#1f3d5a">指标树 V1.0</span>
              <span class="badge on"><i></i>已发布</span>
              <span style="font-size:13px;color:#8a99a8">发布时间：2026-10-08 09:24</span>
            </div>
            <button class="btn btn-outline" disabled style="height:32px;padding:0 16px;font-size:13px;opacity:.45;cursor:not-allowed">发布</button>
          </div>
        </div>

        <!-- 主体：左树 + 右属性面板 -->
        <div style="display:grid;grid-template-columns:320px 1fr;gap:14px;align-items:stretch">

          <!-- 左：四级指标树 -->
          <div class="crud-body" style="padding:0;overflow:hidden;display:flex;flex-direction:column">
            <div style="padding:10px 14px;border-bottom:1px solid #eef3f8;display:flex;align-items:center;gap:8px;flex:0 0 auto">
              <span style="font-weight:600;font-size:13.5px;color:#1f3d5a">指标树结构</span>
              <button class="btn btn-ghost" style="margin-left:auto;height:26px;padding:0 8px;font-size:12px;color:#4a7fa8" @click="m03ExpandAll">展开全部</button>
            </div>
            <div style="padding:6px 0;flex:1;overflow:auto">
              <m03-tree-node
                v-for="node in m03Tree"
                :key="node.id"
                :node="node"
                :sel-id="m03SelId"
                @select="m03Select"
              />
            </div>
          </div>

          <!-- 右：属性面板 -->
          <div class="crud-body" style="padding:0;overflow:hidden;display:flex;flex-direction:column">
            <template v-if="m03SelNode">
              <!-- 标题栏 -->
              <div style="padding:10px 14px;border-bottom:1px solid #eef3f8;display:flex;align-items:center;gap:8px;flex:0 0 auto">
                <span style="font-weight:600;font-size:13.5px;color:#1f3d5a">指标属性</span>
                <span class="badge on" style="margin-left:auto"><i></i>已确认</span>
              </div>
              
              <!-- 内容区 -->
              <div style="padding:16px 18px;flex:1;overflow:auto">
                <div style="margin-bottom:16px">
                  <div style="font-size:16px;font-weight:700;color:#1f3d5a">{{ m03SelNode.name }}</div>
                  <div style="margin-top:4px;font-size:13px;color:#8a99a8">指标项 · 属性详情</div>
                </div>

                <!-- 基本属性 -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
                  <div class="m03-field">
                    <div class="m03-field-label">指标名称</div>
                    <div class="m03-field-value">{{ m03SelNode.name }}</div>
                  </div>
                  <div class="m03-field">
                    <div class="m03-field-label">指标值</div>
                    <div class="m03-field-value" style="font-weight:600;color:#0d4e83">{{ m03SelNode.value }}</div>
                  </div>
                  <div class="m03-field">
                    <div class="m03-field-label">判据类型</div>
                    <div class="m03-field-value">{{ m03SelNode.criteriaType }}</div>
                  </div>
                  <div class="m03-field">
                    <div class="m03-field-label">考核方式</div>
                    <div class="m03-field-value">{{ m03SelNode.examMethod }}</div>
                  </div>
                </div>

                <!-- 来源文档关联区 -->
                <div style="border:1px solid #d8eaf7;border-radius:8px;padding:12px 14px;background:#f4f9fe">
                  <div style="font-size:12.5px;font-weight:600;color:#4a7fa8;margin-bottom:10px;letter-spacing:.5px">来源文档</div>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:30px;height:30px;background:#0d4e83;border-radius:6px;display:grid;place-items:center;flex:0 0 auto">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" style="width:16px;height:16px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div style="flex:1">
                      <div style="font-weight:600;font-size:13.5px;color:#1f3d5a">D-01《某型装备研制总要求》</div>
                      <div style="font-size:12.5px;color:#8a99a8;margin-top:2px">第 12 页 · {{ m03SelNode.srcSection }}</div>
                    </div>
                    <button @click="toast('原文定位：第12页')" style="width:32px;height:32px;border:1px solid #c8dff0;border-radius:6px;background:#fff;cursor:pointer;display:grid;place-items:center;color:#4a7fa8;flex:0 0 auto" title="查看原文">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:15px;height:15px"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </button>
                  </div>
                </div>

                <div style="margin-top:14px;padding-top:12px;border-top:1px solid #eef3f8;display:flex;gap:8px">
                  <button class="btn btn-outline" @click="toast('已打开编辑面板')">编辑属性</button>
                  <button class="btn btn-outline" @click="toast('已跳转原文')">原文追溯</button>
                </div>
              </div>
            </template>
            <div v-else style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#a0aab4;font-size:13.5px;padding:24px">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:36px;height:36px;margin-bottom:8px;color:#c8d8e8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
              点击左侧树节点查看指标属性
            </div>
          </div>
        </div>
      </template>

      <!-- ═══ 第一级：指标树列表页 ═══ -->
      <template v-else>
        <div class="crud-body">
          <div class="toolbar">
            <button class="btn btn-primary" style="height:36px;padding:0 18px;font-size:14px;gap:6px;display:inline-flex;align-items:center" @click="toast('已打开新建指标树面板')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="width:15px;height:15px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              新建指标树
            </button>
            <span class="spacer"></span>
            <span class="hint">共 {{ m03List.length }} 个版本</span>
          </div>
          <div class="table-inner">
            <table>
              <thead>
                <tr>
                  <th>版本号</th>
                  <th>关联来源文档</th>
                  <th style="text-align:center">指标项数</th>
                  <th style="text-align:center">状态</th>
                  <th>发布时间</th>
                  <th style="text-align:center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in m03List"
                  :key="row.id"
                  style="cursor:pointer"
                  @click="m03OpenDetail(row)"
                >
                  <td style="font-weight:600;color:#1f3d5a">{{ row.version }}</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:6px">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="width:13px;height:13px;color:#0d4e83;flex:0 0 auto"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <span style="color:#3f5062">{{ row.srcDoc }}</span>
                    </div>
                  </td>
                  <td style="text-align:center;font-weight:600;color:#0d4e83">{{ row.count }}</td>
                  <td style="text-align:center">
                    <span class="badge" :class="row.status==='已发布'?'on':row.status==='草稿'?'hold':'warn'">
                      <i></i>{{ row.status }}
                    </span>
                  </td>
                  <td style="color:#8a99a8;font-size:13px">{{ row.publishedAt || '—' }}</td>
                  <td style="text-align:center" @click.stop>
                    <button class="btn-link" @click="m03OpenDetail(row)">查看</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </template>

    <!-- ── 镜头四（M08）试验方案生成结果 ─────────────────────────────── -->
    <template v-else-if="page.type === 'm08'">

      <!-- ═══ 第二级：生成结果页 ═══ -->
      <template v-if="m08DetailOpen">

        <!-- 返回按钮 -->
        <div style="margin-bottom:12px">
          <span style="display:inline-flex;align-items:center;gap:4px;font-size:13px;color:#1668a8;cursor:pointer" @click="m08DetailOpen=false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:13px;height:13px"><polyline points="15 18 9 12 15 6"/></svg>
            返回列表
          </span>
        </div>

        <!-- 四步向导步骤条（全部完成）-->
        <div class="m08-steps" style="margin-bottom:14px">
          <div v-for="(s, i) in m08Steps" :key="s.name" class="m08-step m08-step-done">
            <div class="m08-step-dot">✓</div>
            <div class="m08-step-label">{{ s.name }}</div>
          </div>
          <div class="m08-step-line"></div>
        </div>

        <!-- 因子面板 -->
        <div class="crud-body" style="margin-bottom:14px;padding:0;overflow:hidden">
          <!-- 标题栏 -->
          <div style="padding:10px 16px;border-bottom:1px solid #eef3f8;display:flex;align-items:center;gap:10px">
            <span style="font-weight:600;font-size:13.5px;color:#1f3d5a">试验因子配置</span>
            <!-- 麦金色大字计数 -->
            <span style="font-size:20px;font-weight:700;color:#c8902a;margin-left:6px">已配置因子：22个</span>
            <span style="font-size:13px;color:#8a99a8;margin-left:4px">（≥ 20 个，符合指标要求）</span>
            <span style="flex:1"></span>
            <button class="btn btn-outline" style="height:30px;padding:0 12px;font-size:13px" @click="toast('已新增空白因子')">+ 新增因子</button>
          </div>
          <!-- 因子卡片网格 -->
          <div style="padding:14px 16px;display:grid;grid-template-columns:repeat(6,1fr);gap:10px">
            <div
              v-for="(f, i) in m08Factors"
              :key="f.name"
              class="m08-factor"
              :class="{ sel: m08SelFactor === i }"
              @click="m08SelFactor = i"
            >
              <div class="m08-factor-name">{{ f.name }}</div>
              <div class="m08-factor-range" style="margin-top:5px;font-size:11.5px;color:#5c7084;line-height:1.5">{{ f.levels }}</div>
              <div class="m08-factor-tag">{{ f.cat }}</div>
            </div>
          </div>
        </div>

        <!-- 下部：大纲预览 + 对话优化 并排 -->
        <div style="display:grid;grid-template-columns:1fr 400px;gap:14px;align-items:stretch;height:420px">

          <!-- 左：大纲预览区 -->
          <div class="crud-body" style="padding:0;overflow:hidden;display:flex;flex-direction:column">
            <div style="padding:10px 16px;border-bottom:1px solid #eef3f8;display:flex;align-items:center;gap:8px;flex:0 0 auto">
              <span style="font-weight:600;font-size:13.5px;color:#1f3d5a">大纲预览</span>
              <span class="badge on" style="margin-left:auto"><i></i>V4 定稿</span>
              <button class="btn btn-outline" style="height:28px;padding:0 10px;font-size:12.5px" @click="toast('已下载大纲文档')">导出 Word</button>
            </div>
            <!-- 章节树 + 正文 -->
            <div style="display:grid;grid-template-columns:180px 1fr;flex:1;min-height:0">
              <!-- 章节树 -->
              <div style="border-right:1px solid #eef3f8;padding:8px 0;overflow:auto">
                <div
                  v-for="(ch, i) in m08Chapters"
                  :key="ch.no"
                  style="padding:8px 14px;cursor:pointer;border-left:3px solid transparent;font-size:13px;color:#3f5062;display:flex;align-items:center;gap:6px"
                  :style="m08ActiveChapter===i ? 'background:#eaf3fd;border-left-color:#1668a8;color:#0d4e83;font-weight:600' : ''"
                  @click="m08ActiveChapter=i"
                >
                  <span style="font-size:11px;color:#c6a15a;font-weight:700;flex:0 0 auto">{{ ch.no }}</span>
                  {{ ch.title }}
                </div>
              </div>
              <!-- 正文预览 -->
              <div style="padding:14px 16px;font-size:13.5px;line-height:1.8;color:#3f5062;overflow:auto">
                <div style="font-weight:700;font-size:14px;color:#0d4e83;margin-bottom:10px">{{ m08Chapters[m08ActiveChapter]?.no }} {{ m08Chapters[m08ActiveChapter]?.title }}</div>
                <div v-html="m08Chapters[m08ActiveChapter]?.content"></div>
              </div>
            </div>
          </div>

          <!-- 右：对话优化面板 -->
          <div class="crud-body" style="padding:0;overflow:hidden;display:flex;flex-direction:column">
            <div style="padding:10px 16px;border-bottom:1px solid #eef3f8;font-weight:600;color:#0d4e83;font-size:13.5px;flex:0 0 auto">多轮校核优化</div>
            <!-- 3轮对话记录（可滚动）-->
            <div style="flex:1;overflow:auto;padding:12px 14px;min-height:0">
              <div v-for="(round, ri) in m08Rounds" :key="ri" style="margin-bottom:14px">
                <!-- 用户消息 -->
                <div style="display:flex;justify-content:flex-end;margin-bottom:6px">
                  <div style="max-width:85%;background:#0d4e83;color:#fff;padding:8px 12px;border-radius:10px 10px 2px 10px;font-size:13px;line-height:1.6">
                    <div style="font-size:11px;color:rgba(255,255,255,.6);margin-bottom:4px">第{{ ['一','二','三'][ri] }}轮 · {{ round.time }}</div>
                    {{ round.user }}
                  </div>
                </div>
                <!-- 平台回复 -->
                <div style="display:flex;justify-content:flex-start;margin-bottom:6px">
                  <div style="max-width:90%;background:#f4f8fb;color:#2c3e50;padding:8px 12px;border-radius:10px 10px 10px 2px;font-size:13px;line-height:1.6">
                    {{ round.bot }}
                  </div>
                </div>
                <!-- 差异摘要 -->
                <div style="background:#fffaed;border:1px solid #f5e0a0;border-radius:6px;padding:7px 10px;font-size:12px;color:#7a6020;display:flex;align-items:flex-start;gap:6px">
                  <span style="flex:0 0 auto;font-weight:700;color:#c8902a">△ 差异</span>
                  {{ round.diff }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 版本条 -->
        <div class="crud-body" style="margin-top:14px;padding:12px 18px">
          <div style="display:flex;align-items:center;gap:0">
            <div v-for="(ver, vi) in m08Versions" :key="ver.ver" style="display:flex;align-items:center;gap:0;flex:1">
              <!-- 版本节点 -->
              <div
                style="display:flex;flex-direction:column;align-items:center;gap:4px;min-width:80px"
                :style="ver.final ? 'color:#c8902a' : 'color:#5c7084'"
              >
                <div
                  style="width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font-size:12.5px;font-weight:700;border:2px solid"
                  :style="ver.final ? 'background:#fff8e8;border-color:#d0ab68;color:#c8902a' : 'background:#f4f8fc;border-color:#c5d9ea;color:#5c7084'"
                >{{ ver.ver }}</div>
                <div style="font-size:11.5px;font-weight:600;white-space:nowrap">{{ ver.label }}</div>
                <div style="font-size:11px;color:#8a99a8;white-space:nowrap">{{ ver.time }}</div>
              </div>
              <!-- 连线（最后一个不加）-->
              <div v-if="vi < m08Versions.length-1" style="flex:1;height:2px;background:linear-gradient(90deg,#c5d9ea,#d0ab68);margin-bottom:18px"></div>
            </div>
          </div>
          <!-- 资源匹配按钮 -->
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid #eef3f8;display:flex;justify-content:flex-end">
            <button class="btn btn-primary" style="height:36px;padding:0 20px;font-size:14px;gap:8px;display:inline-flex;align-items:center"
              @click="router.push({ name: 'app', params: { pid: 'design', sid: 'match', mid: 'rec' } })">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:15px;height:15px">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              资源匹配
            </button>
          </div>
        </div>
      </template>

      <!-- ═══ 第一级：方案列表页 ═══ -->
      <template v-else>
        <div class="crud-body">
          <div class="toolbar">
            <button class="btn btn-primary" style="height:36px;padding:0 18px;font-size:14px;gap:6px;display:inline-flex;align-items:center" @click="toast('已打开新建方案配置面板')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="width:15px;height:15px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              新建方案
            </button>
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
                <tr v-for="row in m08List" :key="row.id" style="cursor:pointer" @click="m08OpenDetail(row)">
                  <td style="font-weight:600;color:#1f3d5a">{{ row.name }}</td>
                  <td style="text-align:center">
                    <span style="background:#e8f3fb;color:#0d4e83;font-size:12px;padding:2px 9px;border-radius:10px;font-family:monospace">{{ row.ver }}</span>
                  </td>
                  <td style="color:#5c7084">{{ row.treeVer }}</td>
                  <td style="text-align:center">
                    <!-- 已定稿用麦金色 -->
                    <span
                      class="badge"
                      :style="row.status==='已定稿' ? 'background:#fff8e8;color:#c8902a' : ''"
                      :class="row.status==='已定稿' ? '' : row.status==='草稿' ? 'hold' : 'run'"
                    >
                      <i :style="row.status==='已定稿' ? 'background:#d0ab68' : ''"></i>{{ row.status }}
                    </span>
                  </td>
                  <td style="color:#8a99a8;font-size:13px">{{ row.updatedAt }}</td>
                  <td style="text-align:center" @click.stop>
                    <button class="btn-link" @click="m08OpenDetail(row)">查看</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </template>

    <!-- ── 镜头五（M11）资源推荐四算法 ────────────────────────────────── -->
    <template v-else-if="page.type === 'm11'">

      <!-- 需求摘要卡（浅蓝底，自动解析自定稿方案） -->
      <div style="background:#eef7fe;border:1px solid #c8e0f5;border-radius:10px;padding:14px 18px;margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <svg viewBox="0 0 24 24" fill="none" stroke="#0d4e83" stroke-width="1.8" style="width:16px;height:16px;flex:0 0 auto"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <span style="font-weight:700;font-size:13.5px;color:#0d4e83">需求摘要</span>
          <span style="font-size:12.5px;color:#4a7fa8">自动解析自定稿方案《某型装备性能鉴定试验大纲 V4》</span>
          <button class="btn btn-outline" style="margin-left:auto;height:28px;padding:0 10px;font-size:12.5px" @click="toast('已重新解析方案')">重新解析</button>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <span v-for="tag in m11ReqTags" :key="tag" style="display:inline-flex;align-items:center;gap:5px;background:#fff;border:1px solid #b8d8f0;border-radius:16px;padding:4px 12px;font-size:13px;color:#1668a8;font-weight:500">
            <span style="width:6px;height:6px;border-radius:50%;background:#1668a8;flex:0 0 auto"></span>
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 四算法 Tab（并排，当前"多维度综合"麦金色下划线） -->
      <div style="display:flex;gap:0;border-bottom:2px solid #e2ebf3;margin-bottom:14px">
        <button
          v-for="t in m11Tabs"
          :key="t.key"
          style="padding:10px 22px;background:none;border:none;font-size:14px;cursor:pointer;position:relative;white-space:nowrap;transition:color .15s"
          :style="m11Tab===t.key
            ? 'color:#1f3d5a;font-weight:700'
            : 'color:#7c8fa2'"
          @click="m11Tab=t.key"
        >
          {{ t.label }}
          <!-- 下划线：选中的"多维度综合"用麦金色，其余用鉴定蓝 -->
          <span
            v-if="m11Tab===t.key"
            style="position:absolute;bottom:-2px;left:0;right:0;height:3px;border-radius:2px"
            :style="{ background: t.key==='hybrid' ? '#d0ab68' : '#1668a8' }"
          ></span>
        </button>
      </div>

      <!-- 算法描述条 -->
      <div style="margin-bottom:12px;display:flex;align-items:center;gap:8px;font-size:13px;color:#5c7084">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:14px;height:14px;color:#1668a8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        算法：<b style="color:#0d4e83">{{ m11CurrentTab?.algo }}</b>&nbsp;·&nbsp;{{ m11CurrentTab?.desc }}
      </div>

      <!-- 匹配结果列表 -->
      <div class="crud-body" style="margin-bottom:14px">
        <div class="table-inner" style="padding:16px">
          <table>
            <thead>
              <tr>
                <th style="width:60px;text-align:center">排名</th>
                <th>资源名称</th>
                <th>类型</th>
                <th style="width:220px">综合匹配度</th>
                <th>命中理由摘要</th>
                <th style="text-align:center">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(r, i) in m11CurrentResults"
                :key="r.res"
                style="cursor:pointer"
                :style="i===0 ? 'background:#fffaed' : ''"
                :class="{ 'm11-sel-row': m11SelIdx===i }"
                @click="m11SelIdx=i"
              >
                <!-- 排名 -->
                <td style="text-align:center">
                  <div style="display:flex;align-items:center;justify-content:center;gap:4px">
                    <!-- 第1名麦金色星标 -->
                    <svg v-if="i===0" viewBox="0 0 24 24" fill="#d0ab68" style="width:15px;height:15px;flex:0 0 auto"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span style="font-weight:700" :style="i===0 ? 'color:#c8902a' : 'color:#5c7084'">{{ i + 1 }}</span>
                  </div>
                </td>
                <!-- 资源名称 -->
                <td style="font-weight:600;color:#1f3d5a">{{ r.res }}</td>
                <!-- 类型 -->
                <td>
                  <span style="background:#edf5fc;color:#1668a8;font-size:12px;padding:2px 8px;border-radius:10px">{{ r.cat }}</span>
                </td>
                <!-- 综合匹配度 -->
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="flex:1;height:8px;background:#e6eef5;border-radius:6px;overflow:hidden">
                      <div
                        :style="{
                          width: (r.score*100).toFixed(0)+'%',
                          height: '100%',
                          borderRadius: '6px',
                          background: r.score>=0.90 ? 'linear-gradient(90deg,#d0ab68,#c8902a)' : 'linear-gradient(90deg,#4b95cc,#0d4e83)'
                        }"
                      ></div>
                    </div>
                    <span style="font-size:13px;font-weight:700;min-width:38px;text-align:right"
                      :style="{ color: r.score>=0.90 ? '#c8902a' : '#0d4e83' }">
                      {{ (r.score*100).toFixed(2).replace(/\.?0+$/, '') }}
                    </span>
                  </div>
                </td>
                <!-- 命中理由 -->
                <td style="font-size:13px;color:#5c7084;max-width:260px;white-space:normal;line-height:1.5">
                  <span v-if="i===0" style="color:#c8902a;font-weight:600;margin-right:4px">★</span>{{ r.reason }}
                </td>
                <!-- 操作 -->
                <td style="text-align:center" @click.stop>
                  <button class="btn btn-primary" style="height:28px;padding:0 10px;font-size:12.5px" @click="toast('已采纳：'+r.res)">采纳</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 四算法综合对比（TOP1 资源横排） -->
      <div class="crud-body" style="padding:14px 16px">
        <div style="font-size:13.5px;font-weight:600;color:#0d4e83;margin-bottom:12px">四算法综合对比（各算法 TOP1 资源）</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
          <div
            v-for="t in m11Tabs"
            :key="t.key"
            style="border-radius:8px;padding:12px 14px;border:1px solid"
            :style="t.key===m11Tab
              ? (t.key==='hybrid' ? 'background:#fffaed;border-color:#d0ab68' : 'background:#edf5fc;border-color:#9ec8e8')
              : 'background:#f7fbfe;border-color:#e8f2fb'"
          >
            <div style="font-size:12px;color:#8a99a8;margin-bottom:6px;font-weight:500">{{ t.label }}</div>
            <div
              style="font-weight:700;font-size:22px;margin-bottom:4px"
              :style="{ color: t.key==='hybrid' ? '#c8902a' : '#0d4e83' }"
            >{{ (m11Results[t.key][0].score*100).toFixed(0) }}%</div>
            <div style="font-size:12.5px;color:#3f5062;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ m11Results[t.key][0].res }}</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUi } from '@/composables/ui'
import { useRows } from '@/composables/tables'
import { nowText } from '@/utils/format'
import CrudPage from '@/components/pages/CrudPage.vue'
import Icon from '@/components/Icon.vue'
import M05TreeNode from '@/components/M05TreeNode.vue'
import M03TreeNode from '@/components/M03TreeNode.vue'
import SelectField from '@/components/SelectField.vue'
import { resourceDetails } from '@/data/mock'

function kpiIcon(label = '') {
  if (/卡片/.test(label)) return 'card'
  if (/问答/.test(label)) return 'chat'
  if (/图谱|关系/.test(label)) return 'graph'
  if (/接口|服务/.test(label)) return 'plugin'
  if (/算法|模型/.test(label)) return 'model'
  if (/任务|对接/.test(label)) return 'flow'
  if (/准确|率|评估/.test(label)) return 'chart'
  if (/文档|报告|资源|数据/.test(label)) return 'folder'
  return 'chart'
}

const props = defineProps({ page: Object, title: String })
const { toast } = useUi()
const router = useRouter()
const route = useRoute()

const tab = ref('文本解析')
const parseTabs = ['文本解析', '图像解析', '表格解析']
const parsePoints = computed(() => ({
  文本解析: ['关键信息精准提取：机型、指标、数值、标准编号', '段落主旨归纳：按章节生成摘要与目录', '语义关系识别：指标与数值、项目与方法', '中英文双语，支持印刷体、繁体与手写体上下文'],
  图像解析: ['OCR 识别图像中的文字与图形', '标准印刷体及有线表格准确率不低于 95%', '单张图片支持 30 MB 以上', '解析时间每 MB 不大于 10 秒'],
  表格解析: ['识别行列关系与单元格内容', '不可编辑表格转为结构化数据', '复杂表格保留表头层级', '结果可回写指标抽取'],
}[tab.value]))

const engines = reactive([
  { name: '领域多模态大模型', vendor: '中科智算 · V3.2', on: true, type: '多模态理解', acc: '92.4%', lang: '中文 / 英文', cap: '文本解析、语义关系识别' },
  { name: '文档OCR识别引擎', vendor: '华光识图 · V5.1', on: true, type: '文字识别', acc: '95.6%', lang: '中文 / 英文 / 繁体 / 手写体', cap: '图像文字、复杂表格' },
  { name: '语音转写ASR引擎', vendor: '讯飞聆声 · V4.0', on: true, type: '语音识别', acc: '86.2%', lang: '中文', cap: '试验音视频转写，准确率不低于 85%' },
  { name: '表格结构识别引擎', vendor: '格致表格 · V2.6', on: false, type: '结构识别', acc: '94.1%', lang: '中文 / 英文', cap: '行列识别、不可编辑表格转换' },
])

const rules = reactive([
  { name: '页眉页脚页码剔除', target: '去除版式噪声', on: true },
  { name: '乱码与特殊符号清理', target: '文本可用性修复', on: true },
  { name: '单位与术语归一', target: '统一 kW、kN、r/min', on: true },
  { name: '重复段落合并', target: '结构整合', on: true },
])
const cleanRes = ref('东方红-LF2204轮式拖拉机定型试验报告')
const cleanLogs = ref([
  { res: '东方红-LF2204轮式拖拉机定型试验报告', rule: '页眉页脚页码剔除', n: '126 处', time: '2026-10-09 14:06' },
  { res: 'NY/T 2090-2025', rule: '单位与术语归一', n: '38 处', time: '2026-10-10 09:18' },
])
function runClean() {
  cleanLogs.value.unshift({ res: cleanRes.value, rule: '已启用规则', n: '54 处', time: nowText() })
  toast('清洗完成，噪声已剔除并完成归一')
}

const fmt = ref('JSON')
const exportDocs = ['东方红-LF2204定型试验报告', '雷沃谷神4LZ-8鉴定大纲', 'NY/T 2090-2025', 'DG/T 001-2025']

const fieldMap = {
  extract: [
    { key: 'name', label: '抽取条目', required: true, placeholder: '如：动力性能指标' },
    { key: 'scope', label: '文档范围', options: ['定型试验报告', '鉴定大纲', '原始记录'] },
    { key: 'kind', label: '内容类型', options: ['性能指标', '技术参数', '试验结论'] },
    { key: 'fmt', label: '结果格式', options: ['结构化字段', 'JSON', '表格'] },
    { key: 'note', label: '抽取说明', type: 'textarea' },
  ],
  graphUpload: [
    { key: 'name', label: '构建任务', required: true },
    { key: 'mode', label: '构建方式', type: 'radio', options: ['表格构建', '文本构建'] },
    { key: 'file', label: '数据说明', placeholder: '批量上传文件名' },
    { key: 'dict', label: '字典推荐', options: ['启用', '关闭'] },
  ],
  sft: [
    { key: 'name', label: '数据配置任务', required: true },
    { key: 'src', label: '源数据集', options: ['定型报告语料-2026Q3', '指标抽取指令集', '标准条款问答对'] },
    { key: 'need', label: '需求描述', type: 'textarea' },
    { key: 'tag', label: '自动标签', placeholder: '拖拉机,指标' },
  ],
}
const defaultFields = [
  { key: 'name', label: '资源名称', required: true, placeholder: '如：东方红-LF2204轮式拖拉机定型试验报告' },
  { key: 'cat', label: '资源类别', required: true, options: ['定型资料', '历史试验数据', '标准规范', '专业文献'] },
  { key: 'fmt', label: '文件格式', required: true, options: ['DOCX', 'PDF', 'TXT', 'XLSX', 'JPG', 'PNG', 'MP4', 'MP3', 'CSV'] },
  { key: 'modal', label: '数据模态', options: ['文本', '图像', '表格', '音视频'] },
  { key: 'size', label: '文件大小（MB）', placeholder: '如：36.5' },
  { key: 'pages', label: '页数', placeholder: '如：128' },
  { key: 'mode', label: '解析模式', type: 'radio', options: ['即时解析', '暂存'] },
]
const fields = computed(() => fieldMap[props.page.entryKey] || defaultFields)
const form = reactive({ mode: '即时解析' })
function resetForm() { Object.keys(form).forEach((k) => delete form[k]); form.mode = '即时解析' }
const formTitle = computed(() => props.page.entryKey === 'extract' ? '抽取条目配置' : props.page.entryKey === 'sft' ? '微调数据配置' : '资源信息登记')
const sideNote = '提交后写入对应数据目录。即时解析会生成解析任务；暂存仅入库。批量场景支持不少于 50 篇、总容量不少于 500 MB。'
const notes = ['单文档支持 100 MB、1000 页以上', '图片支持 30 MB 以上', '音视频支持 100 MB 以上', '中英文双语解析']

// 批量导入清单
const importList = ref([])

function addToList() {
  if (fields.value.some((f) => f.required && !form[f.key])) { toast('请填写必填项'); return }
  importList.value.push({
    name: form.name,
    cat: form.cat || '定型资料',
    fmt: form.fmt || 'PDF',
    modal: form.modal || '文本',
    size: form.size || '—',
    pages: form.pages || '—',
    mode: form.mode || '即时解析',
  })
  toast('已加入导入清单')
  resetForm()
}

function commitList() {
  if (!importList.value.length) { toast('导入清单为空'); return }
  if (props.page.dataset) {
    const rows = useRows(props.page.dataset)
    importList.value.forEach((item) => {
      rows.unshift({
        name: item.name, cat: item.cat, fmt: item.fmt, modal: item.modal,
        size: item.size === '—' ? '—' : item.size + ' MB',
        pages: item.pages, status: item.mode === '即时解析' ? '解析中' : '暂存',
        by: 'Mona', time: nowText(),
      })
    })
  }
  toast(`成功录入 ${importList.value.length} 项资源，已进入数据资源目录`)
  importList.value = []
}

function submitEntry() {
  if (fields.value.some((f) => f.required && !form[f.key])) { toast('请填写必填项'); return }
  if (props.page.dataset) {
    const rows = useRows(props.page.dataset)
    rows.unshift({ name: form.name || '新建记录', cat: form.cat || '定型资料', fmt: form.fmt || 'PDF', modal: form.modal || '文本', size: (form.size || '10') + (String(form.size || '').includes('MB') ? '' : ' MB'), pages: form.pages || '—', status: form.mode === '暂存' ? '暂存' : '解析中', by: 'Mona', time: nowText(), value: '—', unit: '—', machine: '东方红-LF2204', source: '新录入', page: '—', score: '—', stage: '性能试验鉴定', docs: '新归集', state: '待整理', updated: nowText() })
  }
  toast('已提交，可在目录中查看')
  resetForm()
}

const docs = [
  { id: 'a', name: '东方红-LF2204轮式拖拉机定型试验报告' },
  { id: 'b', name: '雷沃谷神4LZ-8鉴定大纲' },
]
const docId = ref('a')
const chapters = reactive([
  { id: 'c1', title: '第一章 概述', tag: '已确认', body: '说明试验目的与依据。对东方红-LF2204开展定型试验。' },
  { id: 'c2', title: '第二章 试验条件', tag: '已确认', body: '洛阳拖拉机试验场，300 kN 负荷车，电涡流测功机。' },
  { id: 'c3', title: '第三章 性能试验结果', tag: '待审核', body: '标定功率 162 kW，牵引力 38.6 kN，滑转率 8.2%。' },
  { id: 'c4', title: '第四章 可靠性试验', tag: '待审核', body: '累计 750 h，MTBF 375 h。' },
])
const cur = ref(chapters[2])

const graphs = {
  resume: {
    nodes: [
      { id: 'm', label: '东方红-LF2204', type: '农业机械', x: 380, y: 250, color: '#0d4e83', detail: '轮式拖拉机，技术状态 B2，定型试验已完成。' },
      { id: 'i', label: '标定功率 162 kW', type: '性能指标', x: 180, y: 120, color: '#d0ab68', detail: '来源定型报告 P.17，已人工确认。' },
      { id: 't', label: '牵引性能试验', type: '试验', x: 580, y: 130, color: '#3f88bd', detail: '混凝土路面，最大牵引力 38.6 kN。' },
      { id: 'e', label: '滑转率归零', type: '事件', x: 600, y: 360, color: '#d48806', detail: '配重调整后复测合格。' },
      { id: 's', label: 'DG/T 001-2025', type: '标准规范', x: 170, y: 380, color: '#2f9e62', detail: '轮式拖拉机鉴定技术规范。' },
    ],
    edges: [['m', 'i'], ['m', 't'], ['t', 'e'], ['t', 's'], ['m', 's']],
  },
  schema: {
    nodes: [
      { id: 'a', label: '农业机械', type: '节点类型', x: 380, y: 80, color: '#0d4e83', detail: '属性：型号、类别、企业。' },
      { id: 'b', label: '性能指标', type: '节点类型', x: 160, y: 240, color: '#d0ab68', detail: '关系：农业机械—具备指标。' },
      { id: 'c', label: '试验', type: '节点类型', x: 380, y: 400, color: '#3f88bd', detail: '关系：开展试验、依据标准。' },
      { id: 'd', label: '事件', type: '节点类型', x: 600, y: 240, color: '#d48806', detail: '内置因果、条件、组成。' },
    ],
    edges: [['a', 'b'], ['a', 'c'], ['c', 'd'], ['b', 'c']],
  },
  probe: {
    nodes: [
      { id: 'p', label: '牵引力滑转探针', type: '探针', x: 380, y: 250, color: '#0d4e83', detail: '定位维度：指标关系。关注牵引力与滑转率。' },
      { id: 'q', label: '滑转率 8.2%', type: '指标值', x: 170, y: 140, color: '#d0ab68', detail: '实测值，接近关注阈值。' },
      { id: 'r', label: '配重不足', type: '原因', x: 590, y: 140, color: '#c4472d', detail: '历史同类问题的根因。' },
      { id: 'u', label: '调整配重', type: '措施', x: 560, y: 380, color: '#2f9e62', detail: '专家经验：前配重增加后复测。' },
    ],
    edges: [['p', 'q'], ['p', 'r'], ['r', 'u']],
  },
  resource: {
    nodes: [
      { id: 'a', label: '牵引试验', type: '试验', x: 380, y: 240, color: '#0d4e83', detail: '历史高频试验项目。' },
      { id: 'b', label: '300 kN 负荷车', type: '设备', x: 180, y: 120, color: '#3f88bd', detail: '聚类：牵引加载。' },
      { id: 'c', label: '混凝土跑道', type: '场地', x: 590, y: 130, color: '#d0ab68', detail: '洛阳 1.2 km 标准路面。' },
      { id: 'd', label: '电涡流测功机', type: '仪器', x: 220, y: 390, color: '#2f9e62', detail: '0–250 kW，用于 PTO。' },
    ],
    edges: [['a', 'b'], ['a', 'c'], ['a', 'd']],
  },
  tech: {
    nodes: [
      { id: 'a', label: '传动控制', type: '技术簇', x: 380, y: 230, color: '#0d4e83', detail: '三级体系中的技术原理层。' },
      { id: 'b', label: '无级变速匹配', type: '创新点', x: 160, y: 110, color: '#d0ab68', detail: '牵引功率提高约 6%。' },
      { id: 'c', label: '收获损失控制', type: '技术簇', x: 590, y: 140, color: '#3f88bd', detail: '剥皮与清选相关。' },
      { id: 'd', label: '变量施药', type: '创新点', x: 560, y: 370, color: '#2f9e62', detail: '药液减量约 12%。' },
    ],
    edges: [['a', 'b'], ['a', 'c'], ['c', 'd']],
  },
}
const graph = computed(() => graphs[props.page.graphKey] || graphs.resume)
const graphNodes = computed(() => graph.value.nodes)
function nodeHit(n) {
  const q = gkey.value.trim()
  if (!q) return false
  return `${n.label}${n.type}`.includes(q)
}
const graphEdges = computed(() => graph.value.edges)
const nodeMap = computed(() => Object.fromEntries(graph.value.nodes.map((n) => [n.id, n])))
const activeNode = ref(graphs.resume.nodes[0])
const gkey = ref('')
watch(graph, (g) => { activeNode.value = g.nodes[0]; gkey.value = '' }, { immediate: true })
watch(gkey, (q) => {
  const hit = graphNodes.value.find((n) => `${n.label}${n.type}`.includes(q.trim()))
  if (q.trim() && hit) activeNode.value = hit
})

const chatBank = {
  kg: {
    topics: ['标定功率问答', '滑转率判定', '可靠性计算'],
    suggests: ['LF2204标定功率是多少？', '滑转率依据哪条标准？', 'MTBF如何计算？'],
    reply: (q) => {
      if (q.includes('滑转')) return { text: '东方红-LF2204 混凝土路面最大牵引力对应滑转率为 8.2%。判定依据为 DG/T 001-2025 牵引性能条款。', src: '定型试验报告 P.36；DG/T 001-2025' }
      if (q.includes('MTBF') || q.includes('可靠')) return { text: '可靠性试验累计作业 750 h，一般故障 2 次，MTBF = 375 h，满足定型要求。', src: '五征/东方红可靠性记录；NY/T 2090-2025' }
      return { text: '东方红-LF2204 发动机标定功率为 162 kW，动力输出轴功率 138.5 kW，标定转速 540/1000 r/min。', src: '定型试验报告 P.17' }
    },
  },
  cause: {
    topics: ['滑转率偏高', '收获损失波动', '早期故障'],
    suggests: ['为什么滑转率偏高？', '给出复测建议'],
    reply: () => ({ text: '根因倾向为前配重不足，导致驱动轮滑转升高。历史探针“牵引力滑转耦合”给出相同结论。建议增加前配重后按原工况复测牵引力-滑转曲线。', src: '探针推理图谱 · 专家经验 2026-06' }),
  },
  scheme: {
    topics: ['LF2204 补充试验', '4LZ-8 收获方案'],
    suggests: ['补充低速档牵引因子', '把样本量调到 24'],
    reply: (q) => ({ text: `已按「${q || '补充约束'}」调整方案：保留 PTO、牵引、制动、噪声四组必做项目，牵引因子增至低速三档，总因子 24 个，与轮拖定型模板一致。`, src: '轮式拖拉机定型试验方案模板 V2.1' }),
  },
  code: {
    topics: ['PTO 计算脚本', '滑转率拟合'],
    suggests: ['检查除零', '补充转速单位换算'],
    reply: () => ({ text: '语法检查通过。逻辑上滑转率计算应使用理论速度与实际速度之差除以理论速度，当前草稿把分母写成了实际速度，建议修正后再跑一组 8.2% 的已知样例。', src: '编码纠错智能体' }),
  },
  recommend: {
    topics: ['补充牵引试验', '收获损失试验'],
    suggests: ['只要洛阳场地', '测功机需要 200 kW 以上'],
    reply: () => ({ text: '在余弦相似度与欧氏距离两类算法下，优先推荐 300 kN 负荷车和洛阳混凝土跑道，相似度 0.93，可溯源至 2024 年大马力轮拖定型案例。', src: '试验资源图谱' }),
  },
  draft: {
    topics: ['性能试验大纲', '呈批件'],
    suggests: ['生成大纲提纲', '把话术改成请示'],
    reply: () => ({ text: '已按鉴定大纲模板生成提纲：1 任务来源 2 试验对象 3 试验项目与指标 4 条件与仪器 5 方法 6 数据处理 7 判定准则。术语已校准为“动力输出轴功率”“滑转率”。', src: '术语库 · 动力性能' }),
  },
  rule: {
    topics: ['一致性规则', '章节完整性'],
    suggests: ['报告数值必须回链大纲', '关联 DG/T 001'],
    reply: () => ({ text: '已生成规则：若性能试验报告中的指标数值与性能试验大纲不一致，且偏差超过允差，则判定为强制性跨文档冲突，并引用 DG/T 001 对应条款作为依据。', src: '审查规则库' }),
  },
  prompt: {
    topics: ['指标抽取提示', '审查提示'],
    suggests: ['生成收获机械抽取提示'],
    reply: () => ({ text: '未命中完全匹配的预制模板，已生成新模板：角色为鉴定指标抽取员，输出 JSON 字段 machine、indicator、value、unit、page、standard，禁止编造未出现的数值。', src: '提示词生成智能体' }),
  },
  debug: {
    topics: ['Qwen32B 调试', 'GLM32B 调试'],
    suggests: ['温度 0.2 抽取功率', 'Top P 0.8'],
    reply: () => ({ text: '当前参数 temperature=0.2，top_p=0.8，top_k=40。输出：发动机标定功率 162 kW。与标准答案一致。', src: '在线调试 · 鉴定-Qwen32B-v3' }),
  },
  kb: {
    topics: ['本周问答', '个人知识库'],
    suggests: ['定型鉴定和推广鉴定有何区别？', '把上一问改得更具体'],
    reply: (q) => ({ text: q.includes('区别') ? '定型鉴定验证新产品是否达到鉴定大纲和标准规定的性能、安全性与可靠性；推广鉴定侧重在用或拟推广机型的适用性评价。两者依据的大纲深度不同。' : '已根据上一轮上下文补充：若针对轮式拖拉机，定型需覆盖动力、牵引、制动、噪声与可靠性。', src: '领域通识库 · NY/T 2090-2025' }),
  },
}
const bank = computed(() => chatBank[props.page.chatKey] || chatBank.kg)
const topics = computed(() => bank.value.topics)
const topic = ref(bank.value.topics[0])
const suggests = computed(() => bank.value.suggests)
const messages = ref([{ role: 'bot', text: '可以围绕试验指标、标准条款或方案约束提问，回答会附带引用。', src: '' }])
const input = ref('')
function ask(q) {
  const text = (q || '').trim()
  if (!text) return
  messages.value.push({ role: 'user', text })
  const ans = bank.value.reply(text)
  messages.value.push({ role: 'bot', ...ans })
  input.value = ''
}

const lang = ref('Python')
const codeLangs = computed(() => props.page.codeKey === 'json' ? ['JSON'] : ['Python', 'C++', 'MATLAB'])
const codeHtml = computed(() => {
  if (props.page.codeKey === 'json') {
    return `{
  <span class="kw">"innovation"</span>: <span class="str">"双行星排无级变速匹配牵引工况"</span>,
  <span class="kw">"subject"</span>: <span class="str">"传动系统"</span>,
  <span class="kw">"action"</span>: <span class="str">"匹配优化"</span>,
  <span class="kw">"effect"</span>: <span class="str">"牵引功率提高 6%"</span>,
  <span class="kw">"scene"</span>: <span class="str">"轮式拖拉机牵引试验"</span>
}`
  }
  const map = {
    Python: `<span class="kw">def</span> slip_ratio(v_theory, v_actual):\n    <span class="cmt"># 滑转率 = (理论速度 - 实际速度) / 理论速度</span>\n    <span class="kw">return</span> (v_theory - v_actual) / v_theory\n\n<span class="cmt"># 东方红-LF2204 混凝土路面样例，期望约 0.082</span>\nprint(slip_ratio(<span class="str">2.44</span>, <span class="str">2.24</span>))`,
    'C++': `<span class="kw">double</span> slipRatio(<span class="kw">double</span> vTheory, <span class="kw">double</span> vActual) {\n  <span class="cmt">// 避免理论速度为 0</span>\n  <span class="kw">if</span> (vTheory &lt;= 0) <span class="kw">return</span> 0;\n  <span class="kw">return</span> (vTheory - vActual) / vTheory;\n}`,
    MATLAB: `<span class="kw">function</span> s = slipRatio(vTheory, vActual)\n<span class="cmt">% 牵引试验滑转率</span>\ns = (vTheory - vActual) ./ vTheory;\n<span class="kw">end</span>`,
  }
  return map[lang.value] || map.Python
})

const radarRows = [
  { name: '打击（作业效能）', score: '86', basis: '标定功率、PTO 功率达到大纲' },
  { name: '机动', score: '82', basis: '牵引通过与滑转率满足限值' },
  { name: '防护', score: '78', basis: '制动、噪声、安全防护合格' },
  { name: '可靠性', score: '90', basis: 'MTBF 375 h' },
  { name: '作业效率', score: '84', basis: '牵引功率 118.4 kW' },
]

const timeline = [
  { t: '2025-11-02', title: '设计冻结 B2', text: 'PTO 传动比确定，覆盖 540/1000 r/min。依据设计任务书。' },
  { t: '2026-03-12', title: '性能变更', text: '补充双转速动力输出，技术状态由 B1 升至 B2。' },
  { t: '2026-06-18', title: '问题归零', text: '牵引试验滑转率偏高，调整配重后复测合格。' },
  { t: '2026-08-02', title: '可靠性节点', text: '累计作业 750 h，一般故障 2 次。' },
  { t: '2026-10-08', title: '定型报告归档', text: '报告完成解析与指标确认，进入成果验收。' },
]

const flows = {
  probe: [
    { title: '读取探针', text: '牵引力滑转耦合', detail: '加载探针的应用范围、定位维度和关注信号。' },
    { title: '对齐文档', text: '总案 / 大纲 / 报告', detail: '在三份文书中定位牵引力、滑转率及其限值。' },
    { title: '异常定位', text: '滑转率贴近阈值', detail: '实测 8.2%，标记为需关注的异常指标，节点为牵引性能试验。' },
    { title: '合规风险', text: '复测记录不完整', detail: '归零过程有结论，原始复测曲线附件缺失，列为潜在合规风险。' },
    { title: '输出依据', text: '图谱 + 条款', detail: '依据历史探针、专家措施和 DG/T 001 牵引条款生成思维链。' },
  ],
  reason: [
    { title: '问句理解', text: '意图识别', detail: '识别用户问的是指标事实、原因还是时间变化。' },
    { title: '溯源分析', text: '回链原文', detail: '定位指标所在报告页码和标准条款。' },
    { title: '推理分析', text: '规则判断', detail: '用阈值和关系判断是否满足鉴定要求。' },
    { title: '关联分析', text: '指标—试验—事件', detail: '沿知识图谱展开相关实体。' },
    { title: '时序 / 时空', text: '状态变化', detail: '比较技术状态阶段，并关联试验场地与时间。' },
  ],
  docs: [
    { title: '研制总要求', text: '指标源头', detail: '提出战技指标和功能要求，向下游传递。' },
    { title: '试验总案', text: '任务分解', detail: '把指标拆成试验项目和时间节点。' },
    { title: '性能试验大纲', text: '方法细化', detail: '明确方法、样本量、仪器和判定准则。' },
    { title: '性能试验报告', text: '结果回写', detail: '用实测值响应大纲，差异需可解释。' },
  ],
  review: [
    { title: '语义规则', text: '条款符合性', detail: '按已发布规则检查必需要素和数值。' },
    { title: '本体逻辑', text: '概念约束', detail: '校验指标、项目、时间节点的关系是否闭合。' },
    { title: '图谱推理', text: '跨文档', detail: '在六类文书间比对同一实体。' },
    { title: '策略组合', text: '自适应', detail: '定型审查启用一致性+完整性+术语三项策略。' },
    { title: '结果回写', text: '批注与建议', detail: '问题分级，并绑定依据。' },
  ],
}
const flowNodes = computed(() => flows[props.page.flowKey] || flows.probe)
const flowOn = ref(flowNodes.value[0])
const flowChain = computed(() => {
  const nodes = flowNodes.value
  const result = []
  nodes.forEach((n, i) => {
    result.push({ ...n, idx: i, isArrow: false, key: n.title })
    if (i < nodes.length - 1) result.push({ isArrow: true, key: n.title + '-arrow' })
  })
  return result
})

const canvases = {
  agent: [
    { title: '问题分类', sub: '组件', x: 30, y: 40, input: 'query', output: 'intent', detail: '区分指标问答、方案生成和审查三类问题。' },
    { title: '知识检索', sub: '组件', x: 220, y: 40, input: 'intent', output: 'passages', detail: '调用资源库统一接口召回证据。' },
    { title: '条件分支', sub: '组件', x: 410, y: 40, input: 'intent', output: 'branch', detail: '审查类走冲突比对，其余走抽取。' },
    { title: '文档提取', sub: '组件', x: 220, y: 180, input: 'fileId', output: 'blocks', detail: '调用解析模块获取章节。' },
    { title: '参数提取', sub: '组件', x: 410, y: 180, input: 'blocks', output: 'indicators', detail: '按指标模式抽取数值。' },
    { title: '代码执行', sub: '组件', x: 600, y: 180, input: 'indicators', output: 'judge', detail: '计算是否超出允差。' },
    { title: 'HTTP 请求', sub: '组件', x: 410, y: 320, input: 'payload', output: 'response', detail: '回写业务系统。' },
  ],
  entity: [
    { title: '战技指标', sub: '实体', x: 40, y: 60, input: '总要求/大纲', output: '指标实体', detail: '抽取名称、数值、单位、允差。' },
    { title: '试验项目', sub: '实体', x: 250, y: 60, input: '大纲/报告', output: '项目实体', detail: '抽取方法与样本量。' },
    { title: '验证', sub: '约束', x: 250, y: 210, input: '项目 → 指标', output: '关系', detail: '方向：项目验证指标，禁止反向缺失。' },
    { title: '时间节点', sub: '实体', x: 460, y: 60, input: '总案', output: '节点', detail: '计划时间不得晚于报告形成时间。' },
  ],
  review: [
    { title: '任务规划', sub: '智能体', x: 40, y: 80, input: '审查目标', output: '步骤', detail: '自主规划单文档或跨文档路径。' },
    { title: '术语技能包', sub: '技能', x: 240, y: 40, input: '正文', output: '术语问题', detail: '加载术语一致性技能。' },
    { title: '数值技能包', sub: '技能', x: 240, y: 180, input: '指标', output: '冲突', detail: '比对六类文书中的同一指标。' },
    { title: '人工确认', sub: '交互', x: 460, y: 110, input: '问题清单', output: '复核意见', detail: '审查人员可改判等级。' },
  ],
}
const canvasNodes = computed(() => canvases[props.page.canvasKey] || canvases.agent)
const canvasOn = ref(canvasNodes.value[0])
const canvasLinks = computed(() => canvasNodes.value.slice(0, -1).map((n, i) => [n, canvasNodes.value[i + 1]]))

const cardSets = {
  knowledge: [
    { tag: '平台卡片', title: '轮式拖拉机动力指标', text: '汇总标定功率、PTO 功率、标定转速的常见问法与标准出处。' },
    { tag: '平台卡片', title: '牵引性能鉴定方法', text: '牵引力、滑转率、牵引功率的试验条件与判定要点。' },
    { tag: '个人卡片', title: '我的收获机械问答', text: '基于当前账号近期提问，聚合总损失率、含杂率、破碎率。' },
    { tag: '参数卡片', title: '东方红-LF2204', text: '162 kW / 38.6 kN / MTBF 375 h，可跳转原文。' },
    { tag: '方法卡片', title: '可靠性试验', text: '有效度、故障分类和 MTBF 计算步骤。' },
    { tag: '个人卡片', title: '待核对指标', text: '滑转率、播种合格率仍处于待审核。' },
  ],
  modalPref: [
    { tag: '文本', title: '要点与关系', text: '提取章节主旨、指标与数值、项目与方法的语义关系。' },
    { tag: '图像', title: '文字与图形', text: '识别铭牌、曲线图坐标和表格截图。' },
    { tag: '视频', title: '事件导览', text: '按作业过程切分事件，标记异常片段。' },
    { tag: '跨模态', title: '对照策略', text: '同一指标在文本、表格、影像中的值必须可对齐。' },
  ],
  fusion: [
    { tag: '推荐', title: '东方红 LF2204 / LX2204', text: '型号相近，建议融合为企业产品系列，保留各自试验。' },
    { tag: '推荐', title: '滑转率 / 打滑率', text: '术语同义，融合到规范名“滑转率”。' },
    { tag: '预览', title: '融合后节点', text: '指标节点减少 2 个，关系保持可追溯。' },
  ],
  layers: [
    { tag: '原始库', title: '未处理资料', text: '定型报告、扫描件、影像按原样保存，容量计入 10 TB 以上资源池。' },
    { tag: '基础库', title: '结构化解析', text: '章节、表格、实体和指标，可供抽取与审查复用。' },
    { tag: '推理库', title: '二次分析', text: '图谱、问答对、审查结论和创新点，服务智能体。' },
  ],
  trainParam: [
    { tag: '默认', title: '训练集 90%', text: '测试集 10%，适用于指标抽取指令数据。' },
    { tag: '默认', title: 'LoRA rank 16', text: '学习率 1e-4，可在微调系统中覆盖。' },
    { tag: '手动', title: '长文审查', text: '建议降低批大小，保留更长上下文。' },
  ],
  judgeTpl: [
    { tag: '决策层', title: '年度技术研判', text: '含成熟度、趋势、优先级、高价值方向。' },
    { tag: '专业组', title: '拖拉机专题', text: '按传动、液压、电控三条技术原理展开。' },
    { tag: '项目', title: '立项查重简报', text: '八个维度的相似度对照表。' },
  ],
}
const cardList = computed(() => cardSets[props.page.cardKey] || cardSets.knowledge)

const papers = {
  compare: {
    title: '东方红-LF2204 技术状态阶段对比',
    meta: 'B1（2025-11）  →  B2（2026-03）  →  定型（2026-10）',
    sections: [
      { h: '变更内容', p: 'B2 增加 1000 r/min 动力输出转速，传动比调整，其余整机布置保持不变。' },
      { h: '影响分析', p: 'PTO 试验需覆盖双转速；牵引性能限值不变。滑转率问题已归零，不改变定型结论。' },
      { h: '原文回溯', p: '设计任务书第 4 章、定型报告第 3 章、问题归零单 Q-2026-0618。' },
    ],
  },
  topic: {
    title: '轮式拖拉机牵引性能专题',
    meta: '个性化专题 · 依据 Mona 近期问答生成 · 可下载',
    sections: [
      { h: '一、指标定义', p: '牵引力、滑转率、牵引功率构成牵引性能的基本观测项。' },
      { h: '二、LF2204 实测', p: '最大牵引力 38.6 kN，滑转率 8.2%，牵引功率 118.4 kW。' },
      { h: '三、方法要点', p: '混凝土路面、规定配重、负荷车加载。多媒体：牵引曲线图、现场影像片段。' },
    ],
  },
  probe: {
    title: '牵引力滑转异常解读报告',
    meta: '探针：牵引力滑转耦合 · 2026-10-18',
    sections: [
      { h: '异常描述', p: '滑转率在最大牵引力点达到 8.2%，高于该场地历史均值。' },
      { h: '根因', p: '前配重不足。图谱中 2024 年同类机型有相同路径。' },
      { h: '处置', p: '增加前配重并复测。复测后滑转率回落，问题归零。' },
    ],
  },
  scheme: {
    title: 'LF2204 轮式拖拉机定型试验方案（初稿）',
    meta: '模板 V2.1 · 试验因子 24 个 · 可编辑',
    sections: [
      { h: '1 试验依据', p: 'NY/T 2090-2025、DG/T 001-2025，以及研制总要求中的动力、牵引、安全指标。' },
      { h: '2 因子设计', p: '覆盖转速、负荷、挡位、配重、路面、环境温度等 24 个因子，不少于指标要求的 20 个。' },
      { h: '3 资源', p: '300 kN 负荷车、电涡流测功机、洛阳混凝土跑道。' },
    ],
  },
  outline: {
    title: '性能试验大纲提纲',
    meta: '已做术语校准',
    sections: [
      { h: '1 任务来源', p: '依据试验总案和研制总要求。' },
      { h: '2 试验项目', p: '动力输出、牵引、制动、噪声、可靠性。' },
      { h: '3 判定准则', p: '指标数值不得低于总要求，方法符合 DG/T 001。' },
    ],
  },
  std: {
    title: 'DG/T 001-2025 审查要点',
    meta: '自动解析结果',
    sections: [
      { h: '结构', p: '范围、规范性引用文件、术语、试验条件、试验方法、判定规则。' },
      { h: '审查要点', p: '动力、牵引、安全、可靠性章节不得缺失；数值须带单位。' },
    ],
  },
  api: {
    title: '统一数据与模型服务接口',
    meta: '供智能体和业务平台调用',
    sections: [
      { h: 'GET /kb/passages', p: '按知识库、分类和语义检索高精度参考片段，返回原文位置。' },
      { h: 'POST /model/chat', p: '指定模型版本、温度、Top P、Top K，返回生成结果与置信度。' },
      { h: 'POST /agent/run', p: '按智能体标识执行已发布工作流，返回结构化结果。' },
    ],
  },
  review: {
    title: 'LF2204 定型文件一致性审查报告',
    meta: '问题 7 项 · 高 2 · 中 3 · 低 2',
    sections: [
      { h: '审查逻辑', p: '先抽取六类文书实体，再按一致性、完整性、术语三条策略联合推理。' },
      { h: '主要问题', p: '报告牵引力 36.2 kN 与大纲 38 kN 不一致；大纲缺少环境条件章节。' },
      { h: '溯源', p: '依据：跨文档一致性规则 V1.4；原文位于大纲 P.12 与报告 P.36。' },
    ],
  },
  tree: {
    title: '三级技术体系',
    meta: '技术原理 / 试验类型 / 应用领域',
    sections: [
      { h: '传动与控制', p: '无级变速、牵引滑转控制、负荷传感液压。对应牵引试验与 PTO 试验。' },
      { h: '收获损失', p: '割台、脱粒、剥皮、清选。对应田间收获试验。' },
      { h: '变量作业', p: '施药决策、播种监测。对应植保与播种试验。' },
    ],
  },
  judge: {
    title: '拖拉机传动技术研判报告',
    meta: '模板：年度技术研判 · 决策层',
    sections: [
      { h: '技术成熟度', p: '机械传动成熟，无级变速与滑转闭环控制处于工程化验证阶段。' },
      { h: '趋势', p: '电控传动与作业质量闭环是高价值方向。' },
      { h: '优先级', p: '建议优先安排牵引滑转控制的鉴定方法研究。' },
    ],
  },
}
const paper = computed(() => papers[props.page.reportKey] || papers.scheme)

const statPack = {
  situation: {
    kpis: [
      { label: '在试任务', value: '6', unit: '项' },
      { label: '占用资源', value: '14', unit: '台套' },
      { label: '异常问题', value: '3', unit: '项' },
      { label: '已出结果', value: '11', unit: '份' },
    ],
    chart: { title: '本周试验任务', data: [['牵引', 4], ['PTO', 3], ['收获', 2], ['可靠', 2], ['安全', 1]] },
    dist: [{ name: '任务', v: 40 }, { name: '资源', v: 35 }, { name: '环境', v: 25 }],
  },
  probe: {
    kpis: [
      { label: '历史探针问题', value: '86', unit: '条' },
      { label: '配重类成因', value: '22', unit: '条' },
      { label: '传感器类', value: '15', unit: '条' },
      { label: '已关闭', value: '71', unit: '条' },
    ],
    chart: { title: '近六月异常趋势', data: [['5月', 9], ['6月', 14], ['7月', 11], ['8月', 8], ['9月', 7], ['10月', 6]] },
    dist: [{ name: '配重与附着', v: 36 }, { name: '仪器', v: 24 }, { name: '操作', v: 22 }, { name: '环境', v: 18 }],
  },
  agent: {
    kpis: [
      { label: '在线智能体', value: '6', unit: '个' },
      { label: 'CPU', value: '37', unit: '%' },
      { label: '内存', value: '52', unit: '%' },
      { label: '调度时延', value: '1.6', unit: 's' },
    ],
    chart: { title: '今日调用', data: [['抽取', 120], ['审查', 80], ['问答', 96], ['方案', 34], ['探针', 28]] },
    dist: [{ name: '成功', v: 96 }, { name: '超时', v: 3 }, { name: '失败', v: 1 }],
  },
  default: {
    kpis: [
      { label: '累计上传', value: '286', unit: '项' },
      { label: '已审核', value: '214', unit: '项' },
      { label: '待审核', value: '37', unit: '项' },
      { label: '存储占用', value: '1.8', unit: 'TB' },
    ],
    chart: { title: '近7日历史上传', data: [['10-13', 18], ['10-14', 26], ['10-15', 15], ['10-16', 32], ['10-17', 22], ['10-18', 12], ['10-19', 20]] },
    dist: [{ name: '定型资料', v: 46 }, { name: '历史试验', v: 28 }, { name: '标准规范', v: 16 }, { name: '专业文献', v: 10 }],
  },
}
const pack = computed(() => statPack[props.page.statsKey] || statPack.default)
const statKpis = computed(() => pack.value.kpis)
const statChart = computed(() => pack.value.chart)
const dist = computed(() => pack.value.dist)
const statMax = computed(() => Math.max(...statChart.value.data.map((d) => d[1])))

// ── 镜头一（M01）数据资源目录 两级页面 ──────────────────────────────

const m01Resources = useRows('resources')

// 左侧分类目录树（4类+计数）
const m01Cats = computed(() => {
  const all = m01Resources
  const cats = ['定型资料', '历史试验数据', '标准规范', '专业文献']
  const list = [{ key: 'all', label: '全部资料', count: all.length }]
  cats.forEach((c) => list.push({ key: c, label: c, count: all.filter((r) => r.cat === c).length }))
  return list
})

const m01ActiveCat = ref('all')
const m01Search = ref('')

const m01FilteredRows = computed(() => {
  let rows = m01Resources
  if (m01ActiveCat.value !== 'all') rows = rows.filter((r) => r.cat === m01ActiveCat.value)
  if (m01Search.value.trim()) rows = rows.filter((r) => r.name.includes(m01Search.value.trim()))
  return rows
})

// 密级 mock（按类别默认）
function m01Secret(cat) {
  return { '定型资料': '秘密', '历史试验数据': '内部', '标准规范': '公开', '专业文献': '内部' }[cat] || '内部'
}

// 第二级：处理结果详情
const m01Detail = ref(null)
const m01SelChapter = ref(null)
const m01SelSub = ref(null)

function m01OpenDetail(row) {
  const detail = resourceDetails[row.name]
  if (!detail) { toast('该资源暂无处理结果详情'); return }
  m01Detail.value = { ...detail, secret: m01Secret(row.cat) }
  m01SelChapter.value = detail.chapters?.[0]?.id || null
  m01SelSub.value = null
}

// ── 镜头二（M02）指标抽取结果 两级页面 ──────────────────────────────

// 第一级：任务列表——从 resources 数据派生，与数据资源目录保持一致
const m02Resources = useRows('resources')

// 固定 mock 指标数（按资源名称映射）
const m02CountMap = {
  '某型装备研制总要求（D-01）': 28,
  '雷沃谷神4LZ-8谷物联合收割机鉴定大纲': 15,
  'NY/T 2090-2025 农业机械试验鉴定通则': 21,
  '五征4YZP-4自走式玉米收获机可靠性试验报告': 18,
  '约翰迪尔S770联合收割机对比试验影像': 9,
  '农业机械智能化技术发展综述（2025）': 7,
  'DG/T 001-2025 农业轮式拖拉机鉴定技术规范': 12,
  '植保无人飞机作业性能测试数据集': 6,
}

// 从 resources 派生任务列表
const m02Tasks = computed(() =>
  m02Resources.map((res, idx) => {
    const taskStatus = res.status === '已解析' ? '已完成'
      : res.status === '解析中' ? '进行中' : '排队中'
    const count = taskStatus === '已完成' ? (m02CountMap[res.name] || Math.floor(idx * 3 + 5)) : 0
    return {
      name: res.name,
      fmt: res.fmt,
      doc: res.name,
      count,
      status: taskStatus,
      finishedAt: taskStatus === '已完成' ? res.time : null,
    }
  })
)
const m02FilterDoc = ref('')
const m02DocOptions = computed(() => m02Resources.map((r) => r.name))
const m02FilteredTasks = computed(() =>
  m02Tasks.value.filter((t) => !m02FilterDoc.value || t.doc.includes(m02FilterDoc.value))
)
const m02TaskList = computed(() => m02Tasks.value)

// 第二级：D-01 抽取结果
const m02Detail = ref(null)
function m02OpenDetail(task) {
  m02Detail.value = task
  m02ActiveDomains.value = new Set(m02Domains)
}

const m02Domains = ['机动', '火力', '防护', '可靠性', '环境适应性', '电磁兼容', '信息能力']
const m02ActiveDomains = ref(new Set(m02Domains))
function m02ToggleDomain(d) {
  const s = new Set(m02ActiveDomains.value)
  s.has(d) ? s.delete(d) : s.add(d)
  m02ActiveDomains.value = s
}

// D-01 的 28 条指标数据
const m02IndRows = reactive([
  { id: 'i01', name: '最大公路速度',       value: '≥ 65',    unit: 'km/h',   criteria: '≥ 60 km/h（研制总要求 4.1.1）',    domain: '机动',     conf: 0.96, status: '已确认' },
  { id: 'i02', name: '最大越野速度',       value: '≥ 35',    unit: 'km/h',   criteria: '≥ 30 km/h（研制总要求 4.1.2）',    domain: '机动',     conf: 0.94, status: '已确认' },
  { id: 'i03', name: '最大行程',           value: '≥ 500',   unit: 'km',     criteria: '≥ 450 km（研制总要求 4.1.3）',     domain: '机动',     conf: 0.91, status: '已确认' },
  { id: 'i04', name: '爬坡度',             value: '≥ 30',    unit: '°',      criteria: '≥ 25°（研制总要求 4.1.4）',        domain: '机动',     conf: 0.93, status: '已确认' },
  { id: 'i05', name: '涉水深度',           value: '≥ 1.2',   unit: 'm',      criteria: '≥ 1.0 m（研制总要求 4.1.5）',      domain: '机动',     conf: 0.88, status: '已确认' },
  { id: 'i06', name: '主炮口径',           value: '125',     unit: 'mm',     criteria: '= 125 mm（研制总要求 5.1.1）',      domain: '火力',     conf: 0.99, status: '已确认' },
  { id: 'i07', name: '穿甲弹初速',         value: '≥ 1700',  unit: 'm/s',    criteria: '≥ 1650 m/s（研制总要求 5.1.2）',   domain: '火力',     conf: 0.97, status: '已确认' },
  { id: 'i08', name: '射速',               value: '6–8',     unit: '发/min', criteria: '6～8发/min（研制总要求 5.2.1）',    domain: '火力',     conf: 0.95, status: '已确认' },
  { id: 'i09', name: '最大射程',           value: '≥ 4000',  unit: 'm',      criteria: '≥ 3500 m（研制总要求 5.2.2）',     domain: '火力',     conf: 0.92, status: '已确认' },
  { id: 'i10', name: '首发命中概率',       value: '≥ 0.85',  unit: '',       criteria: '≥ 0.80（研制总要求 5.3.1）',       domain: '火力',     conf: 0.76, status: '待审核' },
  { id: 'i11', name: '装甲防护等级',       value: 'RHA 600', unit: 'mm',     criteria: '等效均质钢 ≥ 550 mm（5.4.1）',     domain: '防护',     conf: 0.90, status: '已确认' },
  { id: 'i12', name: '核生化防护等级',     value: '超压 ≥ 4', unit: 'Pa',    criteria: '超压值 ≥ 3 Pa（研制总要求 5.4.2）', domain: '防护',     conf: 0.86, status: '已确认' },
  { id: 'i13', name: '主动防护覆盖角',     value: '360',     unit: '°',      criteria: '360° 全向（研制总要求 5.4.3）',    domain: '防护',     conf: 0.83, status: '已确认' },
  { id: 'i14', name: 'MTBF',               value: '≥ 320',   unit: 'h',      criteria: '≥ 300 h（研制总要求 6.1.1）',      domain: '可靠性',   conf: 0.94, status: '已确认' },
  { id: 'i15', name: 'MTTR',               value: '≤ 2',     unit: 'h',      criteria: '≤ 4 h（研制总要求 6.1.2）',        domain: '可靠性',   conf: 0.91, status: '已确认' },
  { id: 'i16', name: '使用可用度',         value: '≥ 0.92',  unit: '',       criteria: '≥ 0.90（研制总要求 6.1.3）',       domain: '可靠性',   conf: 0.87, status: '已确认' },
  { id: 'i17', name: '寿命',               value: '≥ 25',    unit: '年',     criteria: '≥ 20 年（研制总要求 6.2.1）',      domain: '可靠性',   conf: 0.78, status: '待审核' },
  { id: 'i18', name: '高温工作温度上限',   value: '≥ 55',    unit: '℃',      criteria: '≥ 50 ℃（研制总要求 7.1.1）',      domain: '环境适应性', conf: 0.93, status: '已确认' },
  { id: 'i19', name: '低温工作温度下限',   value: '≤ −40',   unit: '℃',      criteria: '≤ −40 ℃（研制总要求 7.1.2）',     domain: '环境适应性', conf: 0.90, status: '已确认' },
  { id: 'i20', name: '防尘等级',           value: 'IP6X',    unit: '',       criteria: '≥ IP5X（研制总要求 7.2.1）',       domain: '环境适应性', conf: 0.85, status: '已确认' },
  { id: 'i21', name: '防水等级',           value: 'IP67',    unit: '',       criteria: '≥ IP56（研制总要求 7.2.2）',       domain: '环境适应性', conf: 0.89, status: '已确认' },
  { id: 'i22', name: '传导发射限值',       value: '≤ RE102', unit: '',       criteria: 'RE102 B类（研制总要求 8.1.1）',     domain: '电磁兼容', conf: 0.82, status: '已确认' },
  { id: 'i23', name: '辐射敏感度阈值',     value: '≥ RS103', unit: '',       criteria: 'RS103 C类（研制总要求 8.1.2）',     domain: '电磁兼容', conf: 0.75, status: '待审核' },
  { id: 'i24', name: '综合电子系统接口',   value: 'MIL-STD', unit: '',       criteria: 'MIL-STD-1553B（研制总要求 8.2.1）', domain: '电磁兼容', conf: 0.91, status: '已确认' },
  { id: 'i25', name: '态势感知刷新率',     value: '≥ 2',     unit: 'Hz',     criteria: '≥ 1 Hz（研制总要求 9.1.1）',       domain: '信息能力', conf: 0.94, status: '已确认' },
  { id: 'i26', name: '通信距离',           value: '≥ 30',    unit: 'km',     criteria: '≥ 20 km（研制总要求 9.1.2）',      domain: '信息能力', conf: 0.92, status: '已确认' },
  { id: 'i27', name: '数据链吞吐量',       value: '≥ 2',     unit: 'Mbps',   criteria: '≥ 1 Mbps（研制总要求 9.2.1）',    domain: '信息能力', conf: 0.88, status: '已确认' },
  { id: 'i28', name: '目标识别距离',       value: '≥ 3000',  unit: 'm',      criteria: '≥ 2500 m（研制总要求 9.2.2）',    domain: '信息能力', conf: 0.86, status: '已确认' },
])

const m02VisibleRows = computed(() =>
  m02IndRows.filter((r) => m02ActiveDomains.value.has(r.domain))
)
const m02PendingCount2 = computed(() =>
  m02VisibleRows.value.filter((r) => r.status === '待审核').length
)

// ── 镜头三（M03）标准化数据建模 ──────────────────────────────────────

// 指标树列表
const m03List = ref([
  { id: 'v1', version: '指标树 V1.0', srcDoc: 'D-01《某型装备研制总要求》', count: 28, status: '已发布', publishedAt: '2026-10-08 09:24' },
  { id: 'v2', version: '指标树 V0.9', srcDoc: 'D-01《某型装备研制总要求》', count: 24, status: '草稿',   publishedAt: null },
])

const m03DetailOpen = ref(false)
function m03OpenDetail() { m03DetailOpen.value = true }

// 四级树：根节点"某型装备" → 7个性能域 → 指标类 → 指标项
const m03Tree = ref([
  {
    id: 'root', name: '某型装备', level: 0, open: true, icon: 'device',
    children: [
      {
        id: 'd-jd', name: '机动', level: 1, open: true, badge: 5,
        children: [
          {
            id: 'c-jd-1', name: '速度指标', level: 2, open: true,
            children: [
              { id: 'i-jd-1', name: '最大公路速度',  level: 3, value: '≥ 65 km/h',  criteriaType: '定量', examMethod: '实测',   srcSection: '4.1 速度性能要求' },
              { id: 'i-jd-2', name: '最大越野速度',  level: 3, value: '≥ 35 km/h',  criteriaType: '定量', examMethod: '实测',   srcSection: '4.1 速度性能要求' },
            ],
          },
          {
            id: 'c-jd-2', name: '机动能力', level: 2, open: false,
            children: [
              { id: 'i-jd-3', name: '最大行程',  level: 3, value: '≥ 500 km',   criteriaType: '定量', examMethod: '测试',   srcSection: '4.2 行程与续航' },
              { id: 'i-jd-4', name: '爬坡度',    level: 3, value: '≥ 30°',      criteriaType: '定量', examMethod: '试验',   srcSection: '4.3 越障性能' },
              { id: 'i-jd-5', name: '涉水深度',  level: 3, value: '≥ 1.2 m',    criteriaType: '定量', examMethod: '试验',   srcSection: '4.4 涉水性能' },
            ],
          },
        ],
      },
      {
        id: 'd-hl', name: '火力', level: 1, open: false, badge: 5,
        children: [
          {
            id: 'c-hl-1', name: '主炮性能', level: 2, open: false,
            children: [
              { id: 'i-hl-1', name: '主炮口径',     level: 3, value: '125 mm',      criteriaType: '定量', examMethod: '检验',   srcSection: '5.1 主炮系统' },
              { id: 'i-hl-2', name: '穿甲弹初速',   level: 3, value: '≥ 1700 m/s',  criteriaType: '定量', examMethod: '实测',   srcSection: '5.1 主炮系统' },
            ],
          },
          {
            id: 'c-hl-2', name: '射击效能', level: 2, open: false,
            children: [
              { id: 'i-hl-3', name: '射速',         level: 3, value: '6–8 发/min',  criteriaType: '定量', examMethod: '测试',   srcSection: '5.2 射击性能' },
              { id: 'i-hl-4', name: '最大射程',     level: 3, value: '≥ 4000 m',    criteriaType: '定量', examMethod: '实测',   srcSection: '5.2 射击性能' },
              { id: 'i-hl-5', name: '首发命中概率', level: 3, value: '≥ 0.85',      criteriaType: '定量', examMethod: '统计',   srcSection: '5.3 命中精度' },
            ],
          },
        ],
      },
      {
        id: 'd-fh', name: '防护', level: 1, open: false, badge: 3,
        children: [
          {
            id: 'c-fh-1', name: '装甲防护', level: 2, open: false,
            children: [
              { id: 'i-fh-1', name: '装甲防护等级',   level: 3, value: 'RHA 600 mm', criteriaType: '定量', examMethod: '检验', srcSection: '5.4 防护性能' },
              { id: 'i-fh-2', name: '核生化防护等级', level: 3, value: '超压 ≥ 4 Pa', criteriaType: '定量', examMethod: '测试', srcSection: '5.4 防护性能' },
              { id: 'i-fh-3', name: '主动防护覆盖角', level: 3, value: '360°',        criteriaType: '定量', examMethod: '验证', srcSection: '5.4 防护性能' },
            ],
          },
        ],
      },
      {
        id: 'd-kk', name: '可靠性', level: 1, open: false, badge: 4,
        children: [
          {
            id: 'c-kk-1', name: '可靠性指标', level: 2, open: false,
            children: [
              { id: 'i-kk-1', name: 'MTBF',   level: 3, value: '≥ 320 h',   criteriaType: '定量', examMethod: '统计',   srcSection: '6.1 可靠性要求' },
              { id: 'i-kk-2', name: 'MTTR',   level: 3, value: '≤ 2 h',     criteriaType: '定量', examMethod: '测试',   srcSection: '6.1 可靠性要求' },
              { id: 'i-kk-3', name: '使用可用度', level: 3, value: '≥ 0.92', criteriaType: '定量', examMethod: '统计',   srcSection: '6.1 可靠性要求' },
              { id: 'i-kk-4', name: '寿命',   level: 3, value: '≥ 25 年',   criteriaType: '定量', examMethod: '分析',   srcSection: '6.2 寿命要求' },
            ],
          },
        ],
      },
      {
        id: 'd-hj', name: '环境适应性', level: 1, open: false, badge: 4,
        children: [
          {
            id: 'c-hj-1', name: '温度适应性', level: 2, open: false,
            children: [
              { id: 'i-hj-1', name: '高温工作温度上限', level: 3, value: '≥ 55 ℃',  criteriaType: '定量', examMethod: '试验', srcSection: '7.1 温度环境' },
              { id: 'i-hj-2', name: '低温工作温度下限', level: 3, value: '≤ −40 ℃', criteriaType: '定量', examMethod: '试验', srcSection: '7.1 温度环境' },
            ],
          },
          {
            id: 'c-hj-2', name: '防护等级', level: 2, open: false,
            children: [
              { id: 'i-hj-3', name: '防尘等级', level: 3, value: 'IP6X',  criteriaType: '定量', examMethod: '检验', srcSection: '7.2 防尘防水' },
              { id: 'i-hj-4', name: '防水等级', level: 3, value: 'IP67',  criteriaType: '定量', examMethod: '检验', srcSection: '7.2 防尘防水' },
            ],
          },
        ],
      },
      {
        id: 'd-dz', name: '电磁兼容', level: 1, open: false, badge: 3,
        children: [
          {
            id: 'c-dz-1', name: '电磁特性', level: 2, open: false,
            children: [
              { id: 'i-dz-1', name: '传导发射限值',     level: 3, value: '≤ RE102',     criteriaType: '定量', examMethod: '测试', srcSection: '8.1 电磁兼容性能' },
              { id: 'i-dz-2', name: '辐射敏感度阈值',   level: 3, value: '≥ RS103',     criteriaType: '定量', examMethod: '测试', srcSection: '8.1 电磁兼容性能' },
              { id: 'i-dz-3', name: '综合电子系统接口', level: 3, value: 'MIL-STD-1553B', criteriaType: '定性', examMethod: '检验', srcSection: '8.2 接口标准' },
            ],
          },
        ],
      },
      {
        id: 'd-xx', name: '信息能力', level: 1, open: false, badge: 4,
        children: [
          {
            id: 'c-xx-1', name: '态势与通信', level: 2, open: false,
            children: [
              { id: 'i-xx-1', name: '态势感知刷新率', level: 3, value: '≥ 2 Hz',      criteriaType: '定量', examMethod: '测试', srcSection: '9.1 信息处理' },
              { id: 'i-xx-2', name: '通信距离',       level: 3, value: '≥ 30 km',      criteriaType: '定量', examMethod: '实测', srcSection: '9.1 信息处理' },
              { id: 'i-xx-3', name: '数据链吞吐量',   level: 3, value: '≥ 2 Mbps',     criteriaType: '定量', examMethod: '测试', srcSection: '9.2 数据链' },
              { id: 'i-xx-4', name: '目标识别距离',   level: 3, value: '≥ 3000 m',     criteriaType: '定量', examMethod: '实测', srcSection: '9.2 数据链' },
            ],
          },
        ],
      },
    ],
  },
])

const m03SelId = ref('i-jd-1')

function flatM03Nodes(nodes) {
  const res = []
  nodes.forEach((n) => { res.push(n); if (n.children) res.push(...flatM03Nodes(n.children)) })
  return res
}
const m03AllNodes = computed(() => flatM03Nodes(m03Tree.value))
const m03SelNode = computed(() => m03AllNodes.value.find((n) => n.id === m03SelId.value) || null)

function m03Select(node) { m03SelId.value = node.id }
function m03ExpandAll() {
  m03AllNodes.value.forEach((n) => { if (n.children) n.open = true })
}



// ── 镜头四（M08）试验方案生成结果 ────────────────────────────────────

// 第一级：方案列表
const m08List = ref([
  { id: 'm1', name: '某型装备性能鉴定试验大纲 V4', ver: 'V4', treeVer: '指标树 V1.0', status: '已定稿', updatedAt: '2026-10-08 10:42' },
  { id: 'm2', name: '某型装备性能鉴定试验大纲 V3', ver: 'V3', treeVer: '指标树 V0.9', status: '已归档', updatedAt: '2026-10-06 15:20' },
  { id: 'm3', name: '某型装备性能鉴定试验大纲 V1', ver: 'V1', treeVer: '指标树 V0.9', status: '草稿',   updatedAt: '2026-10-04 09:11' },
])
const m08DetailOpen = ref(false)
function m08OpenDetail() { m08DetailOpen.value = true }

// 四步向导（全部完成）
const m08Steps = [
  { name: '选定考核指标' },
  { name: '配置试验因子' },
  { name: '选择模板与案例' },
  { name: '生成预览' },
]

// 22个因子卡片（含取值水平）
const m08Factors = reactive([
  { name: '温度',       levels: '−41℃贮存 / −41℃工作 / 常温 / +55℃', cat: '环境' },
  { name: '路面',       levels: '硬路面 / 砂石 / 泥泞',                cat: '环境' },
  { name: '最大公路速度', levels: '≥ 65 km/h',                         cat: '机动' },
  { name: '最大越野速度', levels: '≥ 35 km/h',                         cat: '机动' },
  { name: '最大行程',   levels: '≥ 500 km',                            cat: '机动' },
  { name: '爬坡度',     levels: '≥ 30°',                               cat: '机动' },
  { name: '涉水深度',   levels: '≥ 1.2 m',                             cat: '机动' },
  { name: '主炮口径',   levels: '125 mm',                              cat: '火力' },
  { name: '穿甲弹初速', levels: '≥ 1700 m/s',                          cat: '火力' },
  { name: '射速',       levels: '6–8 发/min',                          cat: '火力' },
  { name: '最大射程',   levels: '≥ 4000 m',                            cat: '火力' },
  { name: '首发命中概率', levels: '≥ 0.85',                            cat: '火力' },
  { name: 'MTBF',       levels: '≥ 320 h',                            cat: '可靠性' },
  { name: 'MTTR',       levels: '≤ 2 h',                              cat: '可靠性' },
  { name: '使用可用度', levels: '≥ 0.92',                              cat: '可靠性' },
  { name: '防护等级',   levels: 'RHA 600 mm / 核生化',                 cat: '防护' },
  { name: '防尘防水',   levels: 'IP67 / IP6X',                        cat: '环境' },
  { name: '传导发射',   levels: '≤ RE102 B类',                        cat: '电磁' },
  { name: '辐射敏感度', levels: '≥ RS103 C类',                        cat: '电磁' },
  { name: '态势感知刷新率', levels: '≥ 2 Hz',                         cat: '信息' },
  { name: '通信距离',   levels: '≥ 30 km',                            cat: '信息' },
  { name: '目标识别距离', levels: '≥ 3000 m',                         cat: '信息' },
])
const m08SelFactor = ref(0)

// 大纲章节树
const m08ActiveChapter = ref(3) // 默认显示"试验项目与方法"章
const m08Chapters = [
  { no: '第一章', title: '试验目的', content: '本试验旨在对某型装备进行全面性能鉴定，验证各项技术指标是否满足研制总要求（D-01）规定的性能指标，为装备定型提供依据。<br><br>试验依据：《某型装备研制总要求》（D-01）、军标 GJB 4239-2001。' },
  { no: '第二章', title: '试验条件', content: '2.1 环境条件<br>试验在标准试验场地进行，温度范围 −41℃ 至 +55℃，分贮存工况与工作工况两类。路面条件覆盖硬路面、砂石路面、泥泞路面三类。<br><br>2.2 试验装备<br>受试装备编号：SB-2026-001，配置标准弹药基数，燃油满载。' },
  { no: '第三章', title: '试验项目与方法', content: '3.1 机动性能试验<br>3.1.1 最大公路速度：在硬路面直线段测量，取三次均值，判据 <b style="color:#0d4e83">≥ 65 km/h <svg viewBox="0 0 24 24" fill="none" stroke="#1668a8" stroke-width="2" style="width:13px;height:13px;display:inline;vertical-align:middle"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></b>（引自指标树 D-01·4.1.1）<br><br>3.1.2 最大越野速度：砂石路面测量，判据 <b style="color:#0d4e83">≥ 35 km/h <svg viewBox="0 0 24 24" fill="none" stroke="#1668a8" stroke-width="2" style="width:13px;height:13px;display:inline;vertical-align:middle"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></b>（引自指标树 D-01·4.1.2）<br><br>3.2 电磁兼容考核（第1轮对话新增）<br>按 GJB 1389B 执行传导发射与辐射敏感度测试，判据 ≤ RE102 B类 / ≥ RS103 C类。' },
  { no: '第四章', title: '测量要求', content: '4.1 速度测量：使用标定 GPS 测速仪，精度 ±0.2 km/h。<br>4.2 火力测量：弹道测量仪精度 ±0.5 m/s，计时精度 ±0.01 s。<br>4.3 可靠性记录：故障严格按 GJB 451A 分类，A 类故障单独统计。' },
  { no: '第五章', title: '数据处理与判据', content: '5.1 判据引用自指标树 V1.0<br><br><table style="border-collapse:collapse;width:100%;font-size:13px"><thead><tr style="background:#eaf3fa"><th style="padding:6px 10px;text-align:left;border:1px solid #dce8f2">指标名称</th><th style="padding:6px 10px;text-align:left;border:1px solid #dce8f2">判据</th><th style="padding:6px 10px;border:1px solid #dce8f2">来源</th></tr></thead><tbody><tr><td style="padding:6px 10px;border:1px solid #dce8f2">最大公路速度</td><td style="padding:6px 10px;border:1px solid #dce8f2;font-weight:600;color:#0d4e83">≥ 65 km/h</td><td style="padding:6px 10px;border:1px solid #dce8f2;text-align:center"><svg viewBox="0 0 24 24" fill="none" stroke="#1668a8" stroke-width="2" style="width:14px;height:14px;vertical-align:middle"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></td></tr><tr><td style="padding:6px 10px;border:1px solid #dce8f2">首发命中概率</td><td style="padding:6px 10px;border:1px solid #dce8f2;font-weight:600;color:#0d4e83">≥ 0.85</td><td style="padding:6px 10px;border:1px solid #dce8f2;text-align:center"><svg viewBox="0 0 24 24" fill="none" stroke="#1668a8" stroke-width="2" style="width:14px;height:14px;vertical-align:middle"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></td></tr><tr><td style="padding:6px 10px;border:1px solid #dce8f2">MTBF</td><td style="padding:6px 10px;border:1px solid #dce8f2;font-weight:600;color:#0d4e83">≥ 320 h</td><td style="padding:6px 10px;border:1px solid #dce8f2;text-align:center"><svg viewBox="0 0 24 24" fill="none" stroke="#1668a8" stroke-width="2" style="width:14px;height:14px;vertical-align:middle"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></td></tr></tbody></table>' },
]

// 3轮对话记录
const m08Rounds = [
  {
    time: '10-05 14:22',
    user: '补充关键词"电磁兼容考核"',
    bot: '已在第三章"试验项目与方法"中新增 3.2 节"电磁兼容考核"，按 GJB 1389B 标准执行传导发射与辐射敏感度测试，涉及因子已同步更新。',
    diff: '新增 3.2 节电磁兼容考核，新增因子：传导发射（≤ RE102 B类）、辐射敏感度（≥ RS103 C类）',
  },
  {
    time: '10-06 09:41',
    user: '设计思路：寒区因子细化',
    bot: '已将温度因子从"−41℃/常温/+55℃"拆分为"−41℃贮存 / −41℃工作 / 常温 / +55℃"四个水平，寒区工作与贮存分别考核，方案因子总数维持 22 个。',
    diff: '温度因子水平由 3 个扩展为 4 个：新增"−41℃工作"水平，与"−41℃贮存"分列',
  },
  {
    time: '10-07 16:08',
    user: '判据与指标树核对',
    bot: '已对第五章判据表全面核对并自动回填：最大公路速度 ≥ 65 km/h、首发命中概率 ≥ 0.85、MTBF ≥ 320 h 等 22 项指标值均引用自指标树 V1.0，每项右侧标注来源链接。',
    diff: '判据表新增来源引用标注：22 项指标值与指标树 V1.0 完成映射，3 项低置信度指标以橙色标注',
  },
]

// 版本条
const m08Versions = [
  { ver: 'V1', label: '初稿',     time: '10-04 09:11', final: false },
  { ver: 'V2', label: '一轮优化', time: '10-05 14:35', final: false },
  { ver: 'V3', label: '二轮优化', time: '10-06 09:55', final: false },
  { ver: 'V4', label: '定稿',     time: '10-08 10:42', final: true  },
]



// ── 镜头五（M11）资源推荐四算法 ─────────────────────────────────────

// 需求摘要标签（自动解析自定稿方案）
const m11ReqTags = ['−41℃ 寒区环境能力', '2000 m 射击靶道', '遥测采集能力']

// 默认选中"基于规则"
const m11Tab = ref('rule')

const m11Tabs = [
  { key: 'rule',     label: '基于规则',       algo: '规则匹配', desc: '按需求标签逐条规则过滤，满足全部约束的资源才进入候选' },
  { key: 'content',  label: '基于内容相似度', algo: '内容相似度（余弦）', desc: '将资源描述向量化，与需求摘要做余弦相似计算' },
  { key: 'collab',   label: '基于协同过滤',   algo: '协同过滤', desc: '基于历史试验案例中同类需求的资源使用频次协同推荐' },
  { key: 'hybrid',   label: '多维度综合',     algo: '多维度综合（加权融合）', desc: '规则×0.35 + 内容相似度×0.35 + 协同过滤×0.30，融合排序' },
]

const m11BaseResults = [
  {
    res: '某综合试验场寒区',
    cat: '试验场地',
    spec: '−50℃ 低温实验室 + 2400 m 靶道',
    case: '2024 年某型装备定型案例',
    reason: '满足全部 3 条需求标签：寒区能力 / 2000 m 靶道 / 遥测采集',
  },
  {
    res: '高原综合试验场',
    cat: '试验场地',
    spec: '海拔 4200 m，2200 m 靶道',
    case: '2023 年高原环境试验案例',
    reason: '满足靶道与遥测需求，缺−41℃寒区低温环境',
  },
  {
    res: '某电磁兼容试验中心',
    cat: '专项场地',
    spec: '全域屏蔽，满足 GJB 1389B',
    case: '2025 年电磁兼容专项案例',
    reason: '满足遥测采集需求，不满足靶道与寒区需求',
  },
  {
    res: '某机动性能试验跑道',
    cat: '试验场地',
    spec: '1500 m 混凝土跑道',
    case: '2023 年机动性能试验案例',
    reason: '靶道长度 1500 m，不满足 2000 m 要求',
  },
  {
    res: '室内环境模拟舱（B 型）',
    cat: '试验设备',
    spec: '−40℃ ~ +80℃，内尺寸 3×3×3 m',
    case: '部件环境耐受性案例',
    reason: '可满足寒区温度，但无法容纳整车级试验',
  },
]
const m11Results = {
  rule:    m11BaseResults.map((r, i) => ({ ...r, score: [0.91, 0.78, 0.62, 0.54, 0.43][i] })),
  content: m11BaseResults.map((r, i) => ({ ...r, score: [0.88, 0.82, 0.71, 0.65, 0.58][i] })),
  collab:  m11BaseResults.map((r, i) => ({ ...r, score: [0.86, 0.79, 0.68, 0.60, 0.52][i] })),
  hybrid:  m11BaseResults.map((r, i) => ({ ...r, score: [0.91, 0.80, 0.67, 0.59, 0.49][i] })),
}
const m11CurrentTab = computed(() => m11Tabs.find((t) => t.key === m11Tab.value))
const m11CurrentResults = computed(() => m11Results[m11Tab.value] || m11Results.hybrid)
const m11SelIdx = ref(0)

</script>
