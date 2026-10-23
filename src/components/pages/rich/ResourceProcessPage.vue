<template>
  <div class="rich-type-m01">


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
