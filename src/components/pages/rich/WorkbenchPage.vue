<template>
  <div class="rich-type-workbench">

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
  </div>
</template>

<script>
import { useRichPage } from '@/composables/rich/useRichPage'
import SelectField from '@/components/SelectField.vue'

export default {
  components: { SelectField },
  props: { page: Object, title: String },
  setup(props) {
    return useRichPage(props)
  },
}
</script>
