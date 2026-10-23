<template>
  <div class="rich-type-entry">

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
