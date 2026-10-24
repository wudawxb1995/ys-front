import { reactive } from 'vue'
import {
  buildEquipmentReqDetail,
  isEquipmentReqDoc,
} from '@/data/equipmentReqDetail'

/** 录入后动态注册的解析详情（key = 资源名称） */
const detailMap = reactive({})

export function registerResourceDetail(name, detail) {
  if (!name || !detail) return
  detailMap[name] = detail
}

export function getRegisteredDetail(name) {
  return detailMap[name] || null
}

export function buildParsedDetail(row) {
  if (!row) return null
  const registered = getRegisteredDetail(row.name)
  if (registered) {
    return {
      ...registered,
      fileUrl: row.fileUrl || registered.fileUrl,
      name: row.name,
      fmt: row.fmt || registered.fmt,
      size: row.size || registered.size,
      pages: row.pages && row.pages !== '—' ? row.pages : registered.pages,
      parsedAt: row.time || registered.parsedAt,
    }
  }
  if (isEquipmentReqDoc(row.name)) {
    return buildEquipmentReqDetail(row)
  }
  return null
}

export function guessFileUrl(fileName, file) {
  if (isEquipmentReqDoc(fileName)) {
    return '/samples/某型装备研制总要求.pdf'
  }
  if (file && typeof URL !== 'undefined' && URL.createObjectURL) {
    try {
      return URL.createObjectURL(file)
    } catch {
      return ''
    }
  }
  return ''
}
