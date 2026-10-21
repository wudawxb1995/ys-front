import { reactive } from 'vue'

const state = reactive({
  toast: '',
  timer: 0,
  modal: null,
  drawer: null,
})

export function useUi() {
  function toast(msg) {
    state.toast = msg
    clearTimeout(state.timer)
    state.timer = setTimeout(() => { state.toast = '' }, 2200)
  }
  function confirm(message, onOk, danger = true) {
    state.modal = {
      title: danger ? '操作确认' : '提示',
      message,
      danger,
      confirmText: danger ? '确认' : '确定',
      onOk,
    }
  }
  function openForm(title, fields, onOk) {
    state.modal = {
      title,
      fields,
      model: Object.fromEntries(fields.map((f) => [f.key, f.value || ''])),
      confirmText: '保存',
      onOk,
    }
  }
  function openDrawer(title, pairs) {
    state.drawer = { title, pairs }
  }
  function closeModal() { state.modal = null }
  function closeDrawer() { state.drawer = null }
  return { state, toast, confirm, openForm, openDrawer, closeModal, closeDrawer }
}
