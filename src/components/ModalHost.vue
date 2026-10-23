<template>
  <!-- 表单弹窗：ElDialog -->
  <el-dialog
    :model-value="!!state.modal"
    :title="state.modal?.title || ''"
    width="480px"
    align-center
    destroy-on-close
    @close="closeModal"
  >
    <template v-if="state.modal">
      <p v-if="state.modal.message" class="modal-msg">{{ state.modal.message }}</p>
      <div v-if="state.modal.fields" class="form-grid">
        <div v-for="f in state.modal.fields" :key="f.key" class="field">
          <label>{{ f.label }}</label>
          <select-field
            v-if="f.options"
            v-model="state.modal.model[f.key]"
            :options="f.options"
          />
          <el-input
            v-else-if="f.type === 'textarea'"
            v-model="state.modal.model[f.key]"
            type="textarea"
            :rows="3"
          />
          <el-input
            v-else
            v-model="state.modal.model[f.key]"
            :placeholder="f.placeholder || ''"
          />
        </div>
      </div>
    </template>
    <template #footer>
      <el-button @click="closeModal">取消</el-button>
      <el-button
        :type="state.modal?.danger ? 'danger' : 'primary'"
        @click="ok"
      >{{ state.modal?.confirmText || '确定' }}</el-button>
    </template>
  </el-dialog>

  <!-- 详情抽屉：ElDrawer -->
  <el-drawer
    :model-value="!!state.drawer"
    :title="state.drawer?.title || ''"
    direction="rtl"
    size="400px"
    destroy-on-close
    @close="closeDrawer"
  >
    <div v-if="state.drawer" class="kv">
      <template v-for="(p, i) in state.drawer.pairs" :key="i">
        <b>{{ p.label }}</b>
        <span>{{ p.value }}</span>
      </template>
    </div>
    <template #footer>
      <el-button type="primary" @click="closeDrawer">关闭</el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { useUi } from '@/composables/ui'
import SelectField from '@/components/SelectField.vue'

const { state, closeModal, closeDrawer } = useUi()

function ok() {
  const modal = state.modal
  if (!modal) return
  const payload = modal.model ? { ...modal.model } : true
  closeModal()
  modal.onOk && modal.onOk(payload)
}
</script>

<style scoped>
.modal-msg { line-height: 1.7; color: #3f5062; margin-bottom: 8px; }
.form-grid { display: flex; flex-direction: column; gap: 12px; }
.field label {
  display: block;
  margin-bottom: 6px;
  font-size: 13.5px;
  color: #4a5a6a;
}
.kv {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 10px 12px;
  font-size: 14px;
}
.kv b { color: #6d8092; font-weight: 500; }
.kv span { color: #3f5062; word-break: break-all; }
</style>
