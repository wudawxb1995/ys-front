<template>
  <div class="aw">
    <div v-if="page.scene === 'studio'" class="aw-studio">
      <AgentStudioView embedded :mode="page.focus || 'design'" />
    </div>

    <template v-else>
      <header class="aw-head">
        <div>
          <div class="aw-kicker">{{ kicker }}</div>
          <h2>{{ title }}</h2>
          <p>{{ intro }}</p>
        </div>
        <div class="aw-kpis">
          <span v-for="item in kpis" :key="item.label"><b>{{ item.value }}</b>{{ item.label }}</span>
        </div>
      </header>

      <section v-if="page.scene === 'component'" class="aw-split">
        <div class="aw-list">
          <button v-for="item in flowComponents" :key="item.id" :class="{ on: item.id === currentComponent.id }" @click="focusTo(item.id)">
            <b>{{ item.name }}</b>
            <small>{{ item.type }}</small>
          </button>
        </div>
        <div class="aw-card">
          <h3>{{ currentComponent.name }}组件</h3>
          <p>{{ currentComponent.desc }}</p>
          <div class="aw-grid">
            <label>输入<small>{{ currentComponent.input }}</small></label>
            <label>输出<small>{{ currentComponent.output }}</small></label>
            <label>参数类型<small>{{ currentComponent.type }}</small></label>
            <label>默认值<small>沿用上游节点</small></label>
          </div>
          <div class="aw-actions">
            <button class="primary" @click="openCanvas">加入编排画布</button>
            <button @click="toast(`${currentComponent.name}组件调试通过`)">单组件调试</button>
          </div>
        </div>
      </section>

      <section v-else-if="page.scene === 'schemes'" class="aw-card">
        <table>
          <thead><tr><th>编排方案</th><th>场景</th><th>节点</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="item in agentTemplates" :key="item.id">
              <td><b>{{ item.name }}</b><small>{{ item.brief }}</small></td>
              <td>{{ item.category }}</td>
              <td>{{ item.nodes }}</td>
              <td><em :class="item.featured ? 'on' : ''">{{ item.featured ? '已发布' : '草稿' }}</em></td>
              <td><button @click="openScheme(item)">打开编排</button></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section v-else-if="page.scene === 'monitor'" class="aw-stack">
        <div class="aw-meters">
          <article v-for="meter in meters" :key="meter.label" :class="{ on: meter.id === page.focus || page.focus === 'all' }">
            <span>{{ meter.label }}</span>
            <b>{{ meter.value }}</b>
            <i><s :style="{ width: meter.percent }"></s></i>
          </article>
        </div>
        <div class="aw-card">
          <table>
            <thead><tr><th>已发布智能体</th><th>状态</th><th>调度时延</th><th>并发</th><th>最近调用</th></tr></thead>
            <tbody>
              <tr v-for="row in services" :key="row.name">
                <td>{{ row.name }}</td>
                <td><em class="on">{{ row.status }}</em></td>
                <td>{{ row.delay }}</td>
                <td>{{ row.concurrent }}</td>
                <td>{{ row.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-else-if="page.scene === 'role'" class="aw-card">
        <table>
          <thead><tr><th>角色</th><th>查看</th><th>编辑</th><th>执行</th><th>管理</th></tr></thead>
          <tbody>
            <tr v-for="role in roles" :key="role.name">
              <td><b>{{ role.name }}</b><small>{{ role.desc }}</small></td>
              <td><input type="checkbox" :checked="role.view" disabled></td>
              <td><input type="checkbox" :checked="role.edit" disabled></td>
              <td><input type="checkbox" :checked="role.run" disabled></td>
              <td><input type="checkbox" :checked="role.admin" disabled></td>
            </tr>
          </tbody>
        </table>
        <div class="aw-actions"><button class="primary" @click="toast('角色权限已保存')">保存权限</button></div>
      </section>

      <section v-else class="aw-split">
        <div class="aw-list">
          <button v-for="step in steps" :key="step.id" :class="{ on: step.id === page.focus }" @click="focusTo(step.id)">
            <b>{{ step.name }}</b>
            <small>{{ step.state }}</small>
          </button>
        </div>
        <div class="aw-card">
          <h3>{{ activeStep.name }}</h3>
          <p>{{ activeStep.desc }}</p>
          <div class="aw-fields">
            <label v-for="field in activeStep.fields" :key="field.label">{{ field.label }}<input :value="field.value" readonly></label>
          </div>
          <pre v-if="activeStep.sample">{{ activeStep.sample }}</pre>
          <div class="aw-actions">
            <button class="primary" @click="toast(`${activeStep.name}已完成`)">{{ activeStep.action }}</button>
            <button v-if="page.scene === 'invoke' || page.scene === 'capsule'" @click="openCanvas">查看编排</button>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AgentStudioView from '@/views/AgentStudioView.vue'
import { useUi } from '@/composables/ui'
import { agentTemplates } from '@/data/agentTemplates'
import { flowComponents } from '@/data/agentMenus'

const props = defineProps({ page: Object, title: String })
const route = useRoute()
const router = useRouter()
const { toast } = useUi()

const sceneCopy = {
  schemes: ['编排方案', '已发布和草稿中的智能体工作流在这里统一管理，可回到画布继续编排。'],
  component: ['流程组件', '预置 14 个流程组件。选中组件可查看输入输出，并加入当前编排画布。'],
  node: ['节点参数', '为当前节点定义输入输出、校验类型、设置默认值，并完成单组件调试。'],
  integrate: ['外部能力', '把资源库、大模型和工具插件接到智能体，支持同步和版本切换。'],
  capsule: ['能力封装', '以 API 接入训推平台，把知识库、模型和工具组合成可发布的服务。'],
  monitor: ['运行监控', '已发布智能体的服务状态、CPU、内存和网络在同一面板查看。调度时延按不含网络时延统计。'],
  role: ['角色权限', '按角色分配查看、编辑、执行和管理权限。'],
  invoke: ['封装调用', '取已编排工作流封装成智能体，完成登记、上下线和调用。'],
  release: ['发布集成', '用 Web 页面或接口把智能体交给第三方，并控制启停与访问。'],
  'plugin-dev': ['插件开发', '按 Python、Java 规范创建插件，开发阶段即可验证。'],
  'plugin-proto': ['协议适配', '同一套调用入口适配 MCP、HTTP、TCP 和自定义协议。'],
  'plugin-life': ['插件管理', '插件从注册、校验、审核到上下线留在同一本台账。'],
  'plugin-debug': ['插件调试', '配置入参后在线执行，采集并查看调试日志和运行状态。'],
  'plugin-perm': ['插件权限', '设置可见范围和调用权限，调用前先做校验。'],
  'mod-pack': ['模块封装', '把工作流收成可复用模块，写清名称、参数、返回值和使用场景。'],
  'mod-call': ['模块调用', '配置智能体之间的嵌套和跨智能体调用，并映射参数与返回值。'],
}

const stepBook = {
  node: [
    ['input', '输入参数', '定义节点接收的字段、类型和是否必填。', [['参数名', 'indicator_list'], ['类型', '数组'], ['必填', '是'], ['来源', '文档提取.正文']], '确认参数'],
    ['output', '输出参数', '定义节点向下游交出的结果结构。', [['参数名', 'checked_list'], ['类型', '数组'], ['说明', '通过校验的指标']], '确认输出'],
    ['type', '类型校验', '连线前后核对参数类型，避免字符串写入数值字段。', [['上游', 'string 指标值'], ['本节点', 'number 指标值'], ['结果', '需先做数据转换']], '重新校验'],
    ['default', '默认值', '上游缺省时使用默认模型和默认知识库。', [['模型', '鉴定-Qwen32B'], ['知识库', '试验鉴定资源库'], ['温度', '0.2']], '保存默认值'],
    ['map', '关联映射', '把上游字段映射到本节点入参。', [['正文', 'document.text'], ['页码', 'document.page'], ['指标名', 'dict.name']], '保存映射'],
    ['debug', '单组件调试', '只跑当前组件，查看输入输出和耗时。', [['组件', '指标抽取'], ['输入', '第 12 页原文'], ['耗时', '860 ms']], '开始调试'],
    ['log', '组件日志', '按节点查看本次编排的执行日志。', [['时间', '16:21:08'], ['节点', '量纲校验'], ['级别', 'INFO']], '刷新日志'],
  ],
  integrate: [
    ['kb', '知识库关联', '智能体绑定试验鉴定资源库中的标准、指标和历史结论。', [['知识库', '定型指标字典'], ['文档', '1,286'], ['状态', '已关联']], '保存关联'],
    ['sync', '知识库同步', '资源库更新后同步到当前智能体，保留版本。', [['最近同步', '今天 15:40'], ['新增', '12 条'], ['结果', '成功']], '立即同步'],
    ['model', '大模型接入', '接入训推平台已部署的领域模型。', [['模型', '鉴定-Qwen32B'], ['参数量', '32B'], ['状态', '在线']], '接入模型'],
    ['version', '版本切换', '同一业务可在多个模型版本之间切换。', [['当前', 'Qwen32B-v1.3'], ['可选', 'GLM32B-v1.0'], ['影响', '仅本智能体']], '切换版本'],
    ['tool', '工具接入', '把已上线插件作为工具节点快速接入。', [['插件', '指标单位换算'], ['协议', 'HTTP'], ['状态', '可调用']], '接入工具'],
    ['config', '集成配置', '汇总知识库、模型和工具，形成本智能体的能力配置。', [['知识库', '2'], ['模型', '1'], ['工具', '3']], '保存配置'],
  ],
  capsule: [
    ['api', '训推 API 接入', '通过训推平台 API 取得模型推理能力。', [['地址', '/v1/chat/completions'], ['模型', '鉴定-Qwen32B'], ['鉴权', '内部令牌']], '测试接入'],
    ['kb', '知识库封装', '把资源库检索封装成可复用的知识服务。', [['服务名', 'kb.indicator.search'], ['返回', '条款 + 页码'], ['超时', '3s']], '生成封装'],
    ['model', '大模型封装', '固定模型、温度和提示词模板后对外提供。', [['服务名', 'llm.extract'], ['温度', '0.2'], ['输出', '指标 JSON']], '生成封装'],
    ['tool', '工具封装', '把单位换算、文档解析等插件收成工具服务。', [['服务名', 'tool.unit.convert'], ['协议', 'HTTP'], ['状态', '草稿']], '生成封装'],
    ['combo', '组合封装', '知识检索、模型抽取和量纲校验合成一个服务。', [['步骤', '检索 → 抽取 → 校验'], ['来源', '关键指标抽取'], ['输出', '指标表']], '组合封装'],
    ['param', '参数管理', '管理封装服务的入参、默认值和必填项。', [['入参', 'file_id'], ['默认模型', '鉴定-Qwen32B'], ['必填', '是']], '保存参数'],
    ['result', '结果生成', '按约定结构生成组合调用结果。', [['指标', '28 条'], ['待确认', '2 条'], ['溯源', '已保留']], '生成结果'],
    ['verify', '调用验证', '用样例请求验证封装服务，时延不含网络延迟。', [['样例', '定型试验报告'], ['时延', '1.6s'], ['结论', '通过']], '发起验证'],
    ['publish', '服务发布', '验证通过后发布，供工具调用平台和第三方集成。', [['版本', 'v1.0'], ['并发', '10'], ['状态', '待发布']], '发布服务'],
  ],
  invoke: [
    ['fetch', '获取工作流', '读取编排平台已保存的工作流方案。', [['方案', '关键指标抽取'], ['节点', '6'], ['状态', '已发布']], '获取方案'],
    ['pack', '封装智能体', '把工作流登记为一个可调用的智能体。', [['名称', '关键指标抽取'], ['入口', '运行'], ['返回', '指标 JSON']], '完成封装'],
    ['register', '服务登记', '登记服务标识、负责人和可见范围。', [['标识', 'agent.extract'], ['负责人', '管理员'], ['范围', '鉴定业务']], '登记服务'],
    ['online', '上线', '上线后即可被页面和接口调用。', [['当前', '草稿'], ['目标', '在线'], ['并发', '10']], '确认上线'],
    ['offline', '下线', '下线后停止新的调用，保留历史记录。', [['当前', '在线'], ['影响', '第三方集成暂停'], ['记录', '保留']], '确认下线'],
    ['entry', '调用入口', '维护页面入口和接口入口。', [['页面', '/agent/extract'], ['接口', 'POST /agent/run'], ['方法', '同步']], '保存入口'],
    ['exec', '执行调用', '用样例任务执行一次智能体。', [['输入', '定型试验报告.pdf'], ['时延', '1.6s'], ['输出', '28 条指标']], '执行'],
    ['doc', '调用说明', '说明入参、出参、错误码和时延指标。', [['时延', '≤ 3s'], ['并发', '≥ 10'], ['网络', '不计入']], '查看说明'],
  ],
  release: [
    ['config', '发布配置', '选择要集成的智能体、版本和可见部门。', [['智能体', '试验文档辅助审查'], ['版本', 'v1.2'], ['部门', '鉴定试验']], '保存配置'],
    ['web', 'Web 集成', '生成可嵌入业务系统的页面地址。', [['地址', '/embed/review'], ['宽度', '100%'], ['鉴权', '单点登录']], '复制地址'],
    ['api', '接口集成', '向第三方开放运行接口。', [['方法', 'POST /agent/run'], ['入参', 'agent_id, input'], ['返回', 'result, cites']], '复制接口'],
    ['third', '集成关系', '查看哪些业务系统正在使用该智能体。', [['系统', '文档审校台'], ['方式', 'Web'], ['状态', '使用中']], '查看关系'],
    ['start', '启停控制', '集成后的服务可单独启动或停止。', [['当前', '运行中'], ['操作', '停止'], ['影响', '仅该集成']], '切换状态'],
    ['access', '访问控制', '限制可调用该集成的应用和角色。', [['应用', '审校台'], ['角色', '审查员'], ['结果', '允许']], '保存访问'],
    ['setting', '配置控制', '调整超时、并发和失败重试。', [['超时', '3s'], ['并发', '10'], ['重试', '1 次']], '保存配置'],
    ['status', '状态管理', '查看集成服务是否在线和最近一次调用。', [['状态', '在线'], ['最近', '今天 16:02'], ['成功率', '99.2%']], '刷新状态'],
    ['unbind', '解除集成', '解除后第三方不再能调用，编排方案仍保留。', [['对象', '文档审校台'], ['方式', '解除 Web 集成'], ['确认', '需要']], '解除集成'],
  ],
  'plugin-dev': [
    ['create', '创建插件', '登记插件名称、用途和适用的鉴定环节。', [['名称', '指标单位换算'], ['语言', 'Python'], ['用途', '量纲换算']], '创建'],
    ['python', 'Python 规范', '入口函数、依赖声明和返回结构按平台规范编写。', [['入口', 'run(payload)'], ['依赖', 'requirements.txt'], ['返回', 'JSON']], '查看规范'],
    ['java', 'Java 规范', '实现平台约定的插件接口并打包。', [['接口', 'AgentPlugin'], ['构建', 'Maven'], ['返回', 'PluginResult']], '查看规范'],
    ['spec', '规范管理', '维护各语言的必填项和校验规则。', [['语言', 'Python / Java'], ['版本', 'v2'], ['状态', '启用']], '保存规范'],
    ['content', '内容管理', '管理插件说明、示例入参和变更记录。', [['版本', '0.3'], ['示例', 'MPa → kPa'], ['更新', '今天']], '保存内容'],
    ['verify', '开发验证', '在注册前用样例验证插件能否跑通。', [['样例', '315 MPa'], ['结果', '315000 kPa'], ['结论', '通过']], '开始验证'],
  ],
  'plugin-proto': [
    ['mcp-in', 'MCP 接入', '登记符合 MCP 协议的工具插件。', [['名称', '标准条款检索'], ['协议', 'MCP'], ['端点', 'mcp://kb.clause']], '接入'],
    ['mcp-call', 'MCP 调用', '按工具名和参数调用 MCP 插件。', [['工具', 'search_clause'], ['参数', '低温试验'], ['返回', '条款片段']], '调用'],
    ['http', 'HTTP 调用', '用 HTTP 调用已注册插件。', [['方法', 'POST'], ['路径', '/plugins/unit'], ['超时', '3s']], '调用'],
    ['tcp', 'TCP 调用', '对长连接设备或内部服务使用 TCP 适配。', [['地址', '10.0.8.21:8600'], ['报文', 'JSON 行'], ['状态', '已连通']], '测试连接'],
    ['custom', '自定义协议', '为未覆盖的协议补充适配器。', [['协议名', '鉴定内部总线'], ['适配器', 'bus-adapter'], ['状态', '草稿']], '保存适配'],
    ['verify', '适配验证', '用统一样例核对各协议返回结构。', [['样例', '指标查询'], ['协议', 'MCP / HTTP'], ['结果', '结构一致']], '开始验证'],
    ['unify', '统一调用', '编排节点不区分协议，走同一调用入口。', [['入口', 'plugin.invoke'], ['路由', '按插件标识'], ['日志', '统一采集']], '查看入口'],
  ],
  'plugin-life': [
    ['register', '插件注册', '提交名称、协议、负责人和说明。', [['名称', '指标单位换算'], ['协议', 'HTTP'], ['负责人', '管理员']], '提交注册'],
    ['check', '信息校验', '检查必填项、协议和示例是否完整。', [['必填', '通过'], ['示例', '通过'], ['协议', '通过']], '重新校验'],
    ['audit', '插件审核', '审核通过后才允许上线。', [['申请人', '管理员'], ['意见', '可用于量纲校验'], ['结论', '通过']], '审核通过'],
    ['online', '上线', '上线后编排画布可以选择该插件。', [['当前', '待上线'], ['范围', '鉴定业务'], ['版本', '0.3']], '确认上线'],
    ['offline', '下线', '下线后新的编排不能再选用，已用流程给出提示。', [['当前', '在线'], ['影响', '2 条工作流'], ['处理', '保留历史']], '确认下线'],
    ['ledger', '管理台账', '汇总全部插件的协议、状态和版本。', [['在册', '18'], ['在线', '11'], ['待审核', '2']], '导出账台'],
  ],
  'plugin-debug': [
    ['config', '调试配置', '选择插件和调试入参。', [['插件', '指标单位换算'], ['入参', '315 MPa'], ['环境', '沙箱']], '保存配置'],
    ['run', '在线调试', '在沙箱执行插件并返回结果。', [['耗时', '120 ms'], ['输出', '315000 kPa'], ['结论', '成功']], '执行调试'],
    ['collect', '日志采集', '调试过程中的请求和响应写入日志。', [['采集', '开启'], ['保留', '7 天'], ['级别', 'INFO']], '开始采集'],
    ['view', '日志查看', '按时间查看本次调试日志。', [['16:18:02', '收到入参'], ['16:18:02', '换算完成'], ['16:18:02', '返回结果']], '刷新日志'],
    ['status', '运行状态', '查看插件进程、最近成功和失败次数。', [['状态', '运行中'], ['成功', '126'], ['失败', '1']], '刷新状态'],
  ],
  'plugin-perm': [
    ['config', '权限配置', '为插件指定可见部门和可调用角色。', [['插件', '标准条款检索'], ['部门', '鉴定试验'], ['角色', '编排员']], '保存配置'],
    ['scope', '可见范围', '设置哪些人能在画布里看到该插件。', [['范围', '本部门'], ['例外', '管理员'], ['状态', '已设置']], '保存范围'],
    ['scope-check', '可见校验', '当前用户是否可以看见该插件。', [['用户', '管理员'], ['插件', '标准条款检索'], ['结果', '可见']], '执行校验'],
    ['call', '调用权限', '设置谁可以在运行时调用该插件。', [['角色', '执行员'], ['动作', '调用'], ['状态', '允许']], '保存权限'],
    ['call-check', '调用校验', '运行前检查调用方是否具备权限。', [['调用方', '审校台'], ['插件', '标准条款检索'], ['结果', '允许']], '执行校验'],
  ],
  'mod-pack': [
    ['pack', '模块封装', '选择一条工作流，封装成可被其他智能体引用的模块。', [['来源', '关键指标抽取'], ['模块', '指标抽取模块'], ['节点', '6']], '封装模块'],
    ['name', '名称配置', '模块名称在调用时作为标识展示。', [['名称', '指标抽取模块'], ['标识', 'mod.extract'], ['版本', '1.0']], '保存名称'],
    ['desc', '描述配置', '说明模块解决的鉴定业务问题。', [['描述', '从定型资料抽取指标并保留页码'], ['适用', '资料再造'], ['负责人', '管理员']], '保存描述'],
    ['input', '输入参数', '约定调用方必须传入的参数。', [['参数', 'file_id'], ['类型', '字符串'], ['必填', '是']], '保存入参'],
    ['output', '返回值', '约定模块返回的结构和溯源字段。', [['返回', 'indicators[]'], ['溯源', 'page, quote'], ['格式', 'JSON']], '保存返回值'],
    ['info', '功能信息', '维护功能说明和版本记录。', [['功能', '抽取、校验、回写'], ['版本', '1.0'], ['更新', '今天']], '保存信息'],
    ['scene', '使用场景', '标明模块适合嵌在哪些业务流程。', [['场景', '资料再造 / 报告生成'], ['不适合', '实时设备控制'], ['状态', '已配置']], '保存场景'],
    ['reuse', '复用管理', '查看模块被哪些智能体引用。', [['引用', '3 个智能体'], ['最近', '鉴定报告生成'], ['状态', '可复用']], '查看引用'],
  ],
  'mod-call': [
    ['rel', '调用关系', '配置智能体之间谁调用谁。', [['调用方', '鉴定报告生成'], ['被调', '指标抽取模块'], ['方式', '同步']], '保存关系'],
    ['exec', '调用执行', '按已配置关系执行一次调用。', [['输入', '试验报告'], ['耗时', '1.8s'], ['结果', '成功']], '执行调用'],
    ['nest', '嵌套关系', '模块内部再引用其他模块。', [['外层', '报告生成模块'], ['内层', '审查意见模块'], ['层级', '2']], '保存嵌套'],
    ['nest-exec', '嵌套执行', '按嵌套顺序执行并汇总结果。', [['顺序', '抽取 → 审查 → 成文'], ['状态', '通过'], ['输出', '报告章节']], '执行嵌套'],
    ['cross', '跨智能体配置', '不同智能体之间传递指定参数。', [['来源', '知识问答'], ['目标', '风险研判'], ['参数', 'clause_id']], '保存配置'],
    ['cross-exec', '跨智能体执行', '实际发起跨智能体调用。', [['时延', '2.1s'], ['并发', '10 以内'], ['结果', '成功']], '执行调用'],
    ['map', '参数映射', '把上游输出字段映射到被调模块入参。', [['file_id', 'document.id'], ['stage', 'task.stage'], ['model', '默认模型']], '保存映射'],
    ['result', '返回映射', '把模块返回值写回调用方变量。', [['indicators', 'context.metrics'], ['cites', 'context.sources'], ['状态', '已映射']], '保存映射'],
    ['combo', '组合业务', '多个模块串成一条复杂鉴定业务。', [['组合', '抽取 + 审查 + 报告'], ['模块', '3'], ['状态', '可运行']], '保存组合'],
    ['verify', '组合验证', '用样例跑通组合，确认参数和返回都能接上。', [['样例', '定型试验报告'], ['结论', '通过'], ['断点', '无']], '开始验证'],
  ],
}

const heading = computed(() => props.title || '智能体编排')
const copy = computed(() => sceneCopy[props.page?.scene] || ['智能体编排', ''])
const kicker = computed(() => copy.value[0])
const intro = computed(() => copy.value[1])
const kpis = computed(() => [
  { value: '14', label: '流程组件' },
  { value: '≤3s', label: '调度时延' },
  { value: '10', label: '并发路数' },
])
const currentComponent = computed(() => flowComponents.find((item) => item.id === props.page?.focus) || flowComponents[0])
const steps = computed(() => (stepBook[props.page?.scene] || []).map(([id, name, desc, fields, action]) => ({
  id,
  name,
  desc,
  state: id === props.page?.focus ? '当前' : '已配置',
  fields: fields.map(([label, value]) => ({ label, value })),
  action,
  sample: '',
})))
const activeStep = computed(() => steps.value.find((item) => item.id === props.page?.focus) || steps.value[0] || { name: '', desc: '', fields: [], action: '确定' })
const meters = [
  { id: 'status', label: '服务状态', value: '6 在线', percent: '100%' },
  { id: 'cpu', label: 'CPU', value: '37%', percent: '37%' },
  { id: 'mem', label: '内存', value: '52%', percent: '52%' },
  { id: 'net', label: '网络', value: '18 MB/s', percent: '28%' },
]
const services = [
  { name: '关键指标抽取', status: '在线', delay: '1.6s', concurrent: '4 / 10', time: '今天 16:12' },
  { name: '试验文档辅助审查', status: '在线', delay: '1.9s', concurrent: '2 / 10', time: '今天 15:48' },
  { name: '试验鉴定知识问答', status: '在线', delay: '1.4s', concurrent: '3 / 10', time: '今天 15:20' },
]
const roles = [
  { name: '管理员', desc: '全部智能体', view: true, edit: true, run: true, admin: true },
  { name: '编排员', desc: '本部门方案', view: true, edit: true, run: true, admin: false },
  { name: '执行员', desc: '已发布服务', view: true, edit: false, run: true, admin: false },
  { name: '查看员', desc: '只读', view: true, edit: false, run: false, admin: false },
]

const scenePrefix = {
  component: 'comp',
  node: 'node',
  integrate: 'integ',
  capsule: 'capsule',
  invoke: 'call',
  release: 'release',
  'plugin-dev': 'dev',
  'plugin-proto': 'proto',
  'plugin-life': 'life',
  'plugin-debug': 'debug',
  'plugin-perm': 'perm',
  'mod-pack': 'pack',
  'mod-call': 'cross',
}
function focusTo(id) {
  const prefix = scenePrefix[props.page?.scene]
  if (!prefix) return
  router.push({ name: 'app', params: { ...route.params, mid: `${prefix}-${id}` } })
}
function openCanvas() {
  router.push({ name: 'app', params: { pid: 'agent', sid: 'flow', mid: 'build-design' } })
}
function openScheme(item) {
  router.push({ name: 'app', params: { pid: 'agent', sid: 'flow', mid: 'build-design' }, query: { tpl: item.id } })
}
</script>

<style scoped>
.aw { min-width: 0; }
.aw-studio { height: calc(100vh - 148px); min-height: 560px; border: 1px solid #e2ebf3; border-radius: 12px; overflow: hidden; background: #fff; }
.aw-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-end; margin-bottom: 14px; }
.aw-kicker { color: #8a6a2b; font-size: 12px; font-weight: 700; letter-spacing: .4px; }
.aw-head h2 { margin-top: 4px; color: #0d4e83; font-size: 22px; }
.aw-head p { margin-top: 6px; color: #6d8092; font-size: 13.5px; line-height: 1.7; max-width: 760px; }
.aw-kpis { display: flex; gap: 8px; }
.aw-kpis span, .aw-meters article { background: #fff; border: 1px solid #e2ebf3; border-radius: 10px; padding: 10px 14px; color: #7d90a3; font-size: 12px; }
.aw-kpis b, .aw-meters b { display: block; color: #0d4e83; font-size: 18px; }
.aw-split { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 14px; }
.aw-list, .aw-card { background: #fff; border: 1px solid #e2ebf3; border-radius: 12px; }
.aw-list { padding: 8px; max-height: calc(100vh - 250px); overflow: auto; }
.aw-list button { width: 100%; display: flex; justify-content: space-between; gap: 8px; text-align: left; border: 0; background: transparent; border-radius: 8px; padding: 10px 12px; color: #3e5163; }
.aw-list button.on { background: #e8f3fb; color: #1668a8; }
.aw-list b { font-size: 13.5px; font-weight: 600; }
.aw-list small, .aw-card small { color: #8a99a8; font-size: 12px; }
.aw-card { padding: 18px 20px; }
.aw-card h3 { color: #14365c; font-size: 18px; }
.aw-card p { margin: 8px 0 14px; color: #5d7388; line-height: 1.7; font-size: 13.5px; }
.aw-grid, .aw-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.aw-grid label, .aw-fields label { display: block; background: #f7fbfe; border: 1px solid #e4eef6; border-radius: 8px; padding: 10px 12px; color: #7d90a3; font-size: 12px; }
.aw-grid small { display: block; margin-top: 4px; color: #16324f; font-size: 14px; }
.aw-fields input { width: 100%; margin-top: 6px; border: 1px solid #d7e3ee; border-radius: 8px; padding: 8px 10px; color: #16324f; background: #fff; }
.aw-actions { display: flex; gap: 8px; margin-top: 16px; }
.aw-actions button, td button { height: 34px; padding: 0 14px; border: 1px solid #c5daf0; border-radius: 8px; background: #fff; color: #1a6eae; }
.aw-actions .primary { background: #0d4e83; border-color: #0d4e83; color: #fff; }
.aw-card table { width: 100%; border-collapse: collapse; }
.aw-card th, .aw-card td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #eef3f8; font-size: 13px; color: #3e5163; vertical-align: top; }
.aw-card th { color: #7d90a3; font-weight: 600; font-size: 12px; }
.aw-card td b, .aw-card td small { display: block; }
.aw-card em { font-style: normal; color: #8a6a2b; background: #fbf6ea; border-radius: 999px; padding: 2px 8px; font-size: 12px; }
.aw-card em.on { color: #1f7a3a; background: #e8f6ec; }
.aw-meters { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px; }
.aw-meters article.on { border-color: #1668a8; }
.aw-meters i { display: block; height: 6px; margin-top: 8px; background: #e7eef5; border-radius: 99px; overflow: hidden; }
.aw-meters s { display: block; height: 100%; background: #1668a8; }
.aw-stack { min-width: 0; }
pre { margin-top: 12px; background: #f7fbfe; border-radius: 8px; padding: 12px; color: #3e5163; font-size: 12px; white-space: pre-wrap; }
</style>
