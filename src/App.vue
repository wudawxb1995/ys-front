<template>
  <router-view />
  <ToastHost />
  <ModalHost />
</template>

<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import ToastHost from './components/ToastHost.vue'
import ModalHost from './components/ModalHost.vue'
import { useUi } from './composables/ui'

const route = useRoute()
const { closeModal, closeDrawer } = useUi()
watch(() => route.fullPath, () => {
  closeModal()
  closeDrawer()
})
</script>
