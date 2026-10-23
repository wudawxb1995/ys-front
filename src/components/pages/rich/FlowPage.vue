<template>
  <div class="rich-type-flow">

      <div class="chain">
        <div
          v-for="item in flowChain"
          :key="item.key"
          :class="item.isArrow ? 'arrow' : ['node', { on: item.title === flowOn.title }]"
          @click="!item.isArrow && (flowOn = item)"
        >
          <template v-if="!item.isArrow">
            <em>{{ String(item.idx + 1).padStart(2, '0') }}</em>
            <b>{{ item.title }}</b>
            <p>{{ item.text }}</p>
          </template>
          <template v-else>→</template>
        </div>
      </div>
      <div class="panel" style="margin-top:12px">
        <h3><i></i>{{ flowOn.title }}</h3>
        <p style="color:#3f5062;line-height:1.75">{{ flowOn.detail }}</p>
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
