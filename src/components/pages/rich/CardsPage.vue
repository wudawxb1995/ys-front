<template>
  <div class="rich-type-cards">

      <div class="cards">
        <div v-for="c in cardList" :key="c.title" class="info-card" @click="toast('已打开「' + c.title + '」')">
          <div class="tag">{{ c.tag }}</div>
          <h4>{{ c.title }}</h4>
          <p>{{ c.text }}</p>
          <button class="btn btn-ghost" @click.stop="toast('已打开「' + c.title + '」')">查看</button>
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
