import { reactive } from 'vue'
import { cloneRows, datasets } from '@/data/mock'

const cache = reactive({})

export function useRows(datasetId) {
  if (!datasetId) return []
  if (!cache[datasetId]) cache[datasetId] = cloneRows(datasetId)
  return cache[datasetId]
}

export function datasetOf(id) {
  return datasets[id]
}
