<template>
  <div>
    <!-- 处理结果详情视图 -->
    <ResourceDetailPage
      v-if="detailRow"
      :detail="detailData"
      @back="detailRow = null"
    />

    <!-- 资源列表视图 -->
    <ResourceCatalogPage
      v-else
      :page="page"
      :title="title"
      @open-detail="openDetail"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { resourceDetails } from '@/data/mock'
import { buildParsedDetail } from '@/composables/resourceRegistry'
import {
  EQUIPMENT_REQ_SAMPLE_URL,
  isEquipmentReqDoc,
} from '@/data/equipmentReqDetail'
import ResourceCatalogPage from './ResourceCatalogPage.vue'
import ResourceDetailPage from './ResourceDetailPage.vue'

const props = defineProps({ page: Object, title: String })

const detailRow = ref(null)

// 根据资源名称查找详情：动态注册 > 装备总要求样例 > mock 预置 > 兜底
const detailData = computed(() => {
  if (!detailRow.value) return null
  const row = detailRow.value
  const dynamic = buildParsedDetail(row)
  if (dynamic) {
    return {
      ...dynamic,
      fileUrl: row.fileUrl || dynamic.fileUrl || (isEquipmentReqDoc(row.name) ? EQUIPMENT_REQ_SAMPLE_URL : ''),
    }
  }
  const preset = resourceDetails[row.name]
  if (preset) {
    return {
      ...preset,
      fileUrl: row.fileUrl || preset.fileUrl || (isEquipmentReqDoc(row.name) ? EQUIPMENT_REQ_SAMPLE_URL : ''),
    }
  }
  return {
    name: row.name,
    fmt: row.fmt,
    size: row.size,
    pages: row.pages === '—' ? '—' : row.pages,
    parsedAt: row.time,
    tableCount: 6,
    imageCount: 4,
    paraCount: 86,
    indexStatus: row.status === '已解析' ? '已建立' : '未建立',
    indexName: row.status === '已解析' ? `idx-${Date.now()}` : '—',
    indexAt: row.status === '已解析' ? row.time : '—',
    fileUrl: row.fileUrl || '',
    chapters: [
      { id: 'c1', title: '1 概述', level: 1 },
      {
        id: 'c2',
        title: '2 主体内容',
        level: 1,
        children: [
          { id: 'c2-1', title: '2.1 正文', level: 2 },
          { id: 'c2-2', title: '2.2 附表', level: 2 },
        ],
      },
      { id: 'c3', title: '3 结论', level: 1 },
    ],
  }
})

function openDetail(row) {
  detailRow.value = row
}
</script>
