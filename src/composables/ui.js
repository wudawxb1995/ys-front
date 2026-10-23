import { reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const state = reactive({
  toast: '',
  timer: 0,
  modal: null,
  drawer: null,
})

function inferToastType(text) {
  if (/失败|错误|无法|不能|禁止|无效|不支持/.test(text) || /^请/.test(text)) return 'error'
  return 'success'
}

export function useUi() {
  /** Toast → ElMessage。第二参为 success / error / warning / info；省略则默认 success（失败文案仍推断为 error） */
  function toast(msg, type) {
    const text = String(msg || '')
    const kind = type || inferToastType(text)
    state.toast = text
    clearTimeout(state.timer)
    state.timer = setTimeout(() => { state.toast = '' }, 2200)
    ElMessage({
      message: text,
      type: kind,
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
