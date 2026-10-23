<template>
  <div class="rich-type-m11">


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

      <!-- 四算法 Tab（默认「基于规则」） -->
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
