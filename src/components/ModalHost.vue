<template>
  <div v-if="state.modal" class="modal-mask" @click.self="closeModal">
    <div class="modal">
      <h3>{{ state.modal.title }}</h3>
      <p v-if="state.modal.message" style="line-height:1.7;color:#3f5062">{{ state.modal.message }}</p>
      <div v-if="state.modal.fields" class="form-grid" style="grid-template-columns:1fr">
        <div v-for="f in state.modal.fields" :key="f.key" class="field">
          <label>{{ f.label }}</label>
          <select-field
            v-if="f.options"
            v-model="state.modal.model[f.key]"
            :options="f.options"
          />
          <textarea v-else-if="f.type === 'textarea'" v-model="state.modal.model[f.key]" />
          <input v-else v-model="state.modal.model[f.key]" :placeholder="f.placeholder || ''" />
        </div>
      </div>
      <div class="foot">
        <button class="btn btn-outline" @click="closeModal">取消</button>
        <button class="btn" :class="state.modal.danger ? 'btn-solid-danger' : 'btn-primary'" @click="ok">
          {{ state.modal.confirmText || '确定' }}
        </button>
      </div>
    </div>
  </div>
  <div v-if="state.drawer" class="drawer-mask" @click.self="closeDrawer">
    <div class="drawer">
      <h3>{{ state.drawer.title }}</h3>
      <div class="kv">
        <template v-for="(p, i) in state.drawer.pairs" :key="i">
          <b>{{ p.label }}</b>
          <span>{{ p.value }}</span>
        </template>
      </div>
      <div class="foot">
        <button class="btn btn-primary" @click="closeDrawer">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUi } from '@/composables/ui'
import SelectField from '@/components/SelectField.vue'
const { state, closeModal, closeDrawer } = useUi()
function ok() {
  const modal = state.modal
  const payload = modal.model ? { ...modal.model } : true
  closeModal()
  modal.onOk && modal.onOk(payload)
}
</script>
