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
import ResourceCatalogPage from './ResourceCatalogPage.vue'
import ResourceDetailPage from './ResourceDetailPage.vue'

const props = defineProps({ page: Object, title: String })

const detailRow = ref(null)

// 根据资源名称查找详情；若无预置详情则用通用兜底数据
const detailData = computed(() => {
  if (!detailRow.value) return null
  const preset = resourceDetails[detailRow.value.name]
  if (preset) return preset
  // 兜底：根据 row 动态生成
  return {
    name: detailRow.value.name,
    fmt: detailRow.value.fmt,
    size: detailRow.value.size,
    pages: detailRow.value.pages === '—' ? '—' : detailRow.value.pages,
    parsedAt: detailRow.value.time,
    tableCount: 6,
    imageCount: 4,
    paraCount: 86,
    indexStatus: detailRow.value.status === '已解析' ? '已建立' : '未建立',
    indexName: detailRow.value.status === '已解析' ? `idx-${Date.now()}` : '—',
    indexAt: detailRow.value.status === '已解析' ? detailRow.value.time : '—',
    chapters: [
      { id: 'c1', title: '1 概述', level: 1 },
      { id: 'c2', title: '2 主体内容', level: 1, children: [
        { id: 'c2-1', title: '2.1 正文', level: 2 },
        { id: 'c2-2', title: '2.2 附表', level: 2 },
      ]},
      { id: 'c3', title: '3 结论', level: 1 },
    ],
  }
})

function openDetail(row) {
  detailRow.value = row
}
</script>
