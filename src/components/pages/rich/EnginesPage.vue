<template>
  <div class="rich-type-engines">

      <div class="engine-grid">
        <div v-for="e in engines" :key="e.name" class="engine">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <h4>{{ e.name }}</h4>
            <span class="badge" :class="e.on ? 'on' : 'hold'"><i></i>{{ e.on ? '启用' : '停用' }}</span>
          </div>
          <p>{{ e.vendor }} · {{ e.type }}</p>
          <p>准确率 {{ e.acc }} · {{ e.lang }}</p>
          <p>{{ e.cap }}</p>
          <button class="btn btn-outline" style="margin-top:8px" @click="e.on = !e.on; toast(e.on ? '已启用' : '已停用')">{{ e.on ? '停用' : '启用' }}</button>
        </div>
      </div>
  </div>
</template>

<script>
import { useRichPage } from '@/composables/rich/useRichPage'

export default {
  props: { page: Object, title: String },
  setup(props) {
    return useRichPage(props)
  },
}
</script>
