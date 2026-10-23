<template>
  <div class="rich-type-m30">


      <div style="display:grid;grid-template-columns:240px 1fr;gap:14px;align-items:start">

        <!-- 左：三级体系树 -->
        <div class="panel" style="padding:14px 0">
          <div style="font-size:13px;font-weight:700;color:var(--navy-2);padding:0 14px 10px">技术体系</div>
          <div v-for="dir in m30Tree.children" :key="dir.name">
            <!-- 二级 -->
            <div class="m30-dir" :class="{on: m30ExpandedDir===dir.name}" @click="m30ExpandedDir = m30ExpandedDir===dir.name ? null : dir.name">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;transition:transform .2s" :style="{transform: m30ExpandedDir===dir.name?'rotate(90deg)':'rotate(0)'}"><polyline points="9 18 15 12 9 6"/></svg>
              {{ dir.name }}
            </div>
            <template v-if="m30ExpandedDir===dir.name">
              <div v-for="sub in dir.children" :key="sub.name"
                class="m30-sub" :class="{highlight: sub.highlight}">
                <span v-if="sub.highlight" style="color:var(--gold);margin-right:4px">★</span>{{ sub.name }}
              </div>
            </template>
          </div>
        </div>

        <!-- 右：SVG 图谱画布 -->
        <div class="panel" style="padding:16px;overflow:hidden">
          <div style="font-size:13px;font-weight:700;color:var(--navy-2);margin-bottom:12px">技术体系知识图谱</div>
          <svg viewBox="0 0 800 540" width="100%" style="display:block">

            <!-- ── 中心节点 (340, 290) ── -->
            <circle cx="340" cy="290" r="46" fill="var(--navy)"/>
            <text x="340" y="286" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">试验鉴定</text>
            <text x="340" y="302" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">技术</text>

            <!-- ── 6个二级方向节点（r=168，等角度，0°朝右） ── -->
            <!-- 0°  定位定向技术  (508, 290) -->
            <line x1="340" y1="290" x2="508" y2="290" stroke="#b7cbe0" stroke-width="1.5"/>
            <circle cx="508" cy="290" r="36" fill="var(--blue)"/>
            <text x="508" y="287" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="600">定位定向</text>
            <text x="508" y="300" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="600">技术</text>

            <!-- 60°  弹道修正技术  (424, 145) -->
            <line x1="340" y1="290" x2="424" y2="145" stroke="#b7cbe0" stroke-width="1.5"/>
            <circle cx="424" cy="145" r="36" fill="var(--blue)"/>
            <text x="424" y="142" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="600">弹道修正</text>
            <text x="424" y="155" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="600">技术</text>

            <!-- 120°  惯导技术  (172, 145) -->
            <line x1="340" y1="290" x2="172" y2="145" stroke="#b7cbe0" stroke-width="1.5"/>
            <circle cx="172" cy="145" r="36" fill="var(--blue)"/>
            <text x="172" y="142" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="600">惯导</text>
            <text x="172" y="155" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="600">技术</text>

            <!-- 180°  遥测技术  (172, 290) -->
            <line x1="340" y1="290" x2="172" y2="290" stroke="#b7cbe0" stroke-width="1.5"/>
            <circle cx="172" cy="290" r="36" fill="var(--blue)"/>
            <text x="172" y="287" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="600">遥测</text>
            <text x="172" y="300" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="600">技术</text>

            <!-- 240°  气象修正  (256, 435) -->
            <line x1="340" y1="290" x2="256" y2="435" stroke="#b7cbe0" stroke-width="1.5"/>
            <circle cx="256" cy="435" r="36" fill="var(--blue)"/>
            <text x="256" y="432" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="600">气象</text>
            <text x="256" y="445" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="600">修正</text>

            <!-- 300°  信号处理  (424, 435) -->
            <line x1="340" y1="290" x2="424" y2="435" stroke="#b7cbe0" stroke-width="1.5"/>
            <circle cx="424" cy="435" r="36" fill="var(--blue)"/>
            <text x="424" y="432" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="600">信号</text>
            <text x="424" y="445" text-anchor="middle" fill="#fff" font-size="10.5" font-weight="600">处理</text>

            <!-- ── 定位定向技术三级节点（右侧展开，偏上/平/偏下） ── -->
            <!-- 温补技术  (640, 210) -->
            <line x1="508" y1="290" x2="640" y2="210" stroke="#b7cbe0" stroke-width="1.2"/>
            <circle cx="640" cy="210" r="28" fill="#e8f2fb" stroke="#b8d9f4" stroke-width="1.2"/>
            <text x="640" y="207" text-anchor="middle" fill="var(--navy-2)" font-size="10.5" font-weight="600">温补</text>
            <text x="640" y="220" text-anchor="middle" fill="var(--navy-2)" font-size="10.5" font-weight="600">技术</text>

            <!-- 定向精度校准  (660, 290) -->
            <line x1="508" y1="290" x2="660" y2="290" stroke="#b7cbe0" stroke-width="1.2"/>
            <circle cx="660" cy="290" r="28" fill="#e8f2fb" stroke="#b8d9f4" stroke-width="1.2"/>
            <text x="660" y="287" text-anchor="middle" fill="var(--navy-2)" font-size="10">定向精度</text>
            <text x="660" y="299" text-anchor="middle" fill="var(--navy-2)" font-size="10">校准</text>

            <!-- 初始对准  (640, 370) -->
            <line x1="508" y1="290" x2="640" y2="370" stroke="#b7cbe0" stroke-width="1.2"/>
            <circle cx="640" cy="370" r="28" fill="#e8f2fb" stroke="#b8d9f4" stroke-width="1.2"/>
            <text x="640" y="367" text-anchor="middle" fill="var(--navy-2)" font-size="10.5">初始</text>
            <text x="640" y="380" text-anchor="middle" fill="var(--navy-2)" font-size="10.5">对准</text>

            <!-- ── 温补技术 → 麦金色案例子节点 ── -->
            <!-- 连线：温补技术顶部(640,182) → 案例矩形底部(640,140) -->
            <line x1="640" y1="182" x2="640" y2="140" stroke="var(--gold)" stroke-width="1.8" stroke-dasharray="4 2"/>

            <!-- 案例节点矩形 -->
            <rect x="572" y="90" width="136" height="50" rx="8" fill="#fff8e0" stroke="var(--gold)" stroke-width="1.8"/>
            <text x="640" y="111" text-anchor="middle" fill="#8a6000" font-size="10" font-weight="600">第19发超差事件</text>
            <text x="640" y="126" text-anchor="middle" fill="#8a6000" font-size="10" font-weight="600">温补失效案例</text>

            <!-- 徽标（案例矩形顶部居中）-->
            <rect x="597" y="68" width="86" height="20" rx="10" fill="var(--gold)"/>
            <text x="640" y="82" text-anchor="middle" fill="#fff" font-size="10" font-weight="600">本次试验沉淀</text>

          </svg>
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
