<template>
  <div class="rich-type-timeline">

      <div class="panel">
        <div class="timeline">
          <div v-for="item in timeline" :key="item.t" class="tl-item">
            <b>{{ item.t }} · {{ item.title }}</b>
            <p>{{ item.text }}</p>
          </div>
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
