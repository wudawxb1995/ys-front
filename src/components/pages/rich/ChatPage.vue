<template>
  <div class="rich-type-chat">

      <div class="chat-wrap">
        <div class="chat-side">
          <div class="side-title">会话主题</div>
          <div v-for="t in topics" :key="t" class="topic" :class="{ on: t === topic }" @click="topic = t">{{ t }}</div>
        </div>
        <div class="chat-main">
          <div class="chat-bar">{{ topic }}</div>
          <div class="msgs">
            <div v-for="(m, i) in messages" :key="i" class="bubble" :class="m.role">
              {{ m.text }}
              <span v-if="m.src" class="src">来源：{{ m.src }}</span>
            </div>
          </div>
          <div class="suggest">
            <button v-for="q in suggests" :key="q" @click="ask(q)">{{ q }}</button>
          </div>
          <div class="chat-input">
            <input v-model="input" placeholder="请输入问题，支持多轮补充" @keyup.enter="ask(input)" />
            <button class="btn btn-primary" @click="ask(input)">发送</button>
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
