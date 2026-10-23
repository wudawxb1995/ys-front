<template>
  <div class="rich-type-m08">


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
              @click="goResourceMatch">
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
  </div>
</template>

<script>
import { useRichPage } from '@/composables/rich/useRichPage'

export default {
  props: { page: Object, title: String },
  setup(props) {
    return useRichPage(props)
  },
}
</script>
