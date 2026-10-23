import { reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const state = reactive({
  toast: '',
  timer: 0,
  modal: null,
  drawer: null,
})

export function useUi() {
  /** Toast → ElMessage，保持原调用签名 */
  function toast(msg) {
    const text = String(msg || '')
    state.toast = text
    clearTimeout(state.timer)
    state.timer = setTimeout(() => { state.toast = '' }, 2200)
    ElMessage({
      message: text,
      type: 'info',
      duration: 2200,
      grouping: true,
    })
  }

  /** 确认框 → ElMessageBox，成功回调与原来一致 */
  function confirm(message, onOk, danger = true) {
    ElMessageBox.confirm(message, danger ? '操作确认' : '提示', {
      confirmButtonText: danger ? '确认' : '确定',
      cancelButtonText: '取消',
      type: danger ? 'warning' : 'info',
      customClass: 'ys-confirm-box',
    })
      .then(() => { onOk && onOk() })
      .catch(() => {})
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
