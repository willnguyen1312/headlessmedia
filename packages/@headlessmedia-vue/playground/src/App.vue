<template>
  <button @click="show = !show">{{ show ? 'Hide' : 'Show' }}</button>
  <template v-if="show">
    <Control />
    <Video />
  </template>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useMedia } from 'headlessmedia-vue'

import Control from './components/Control.vue'
import Video from './components/Video.vue'

import { mediaId } from './const'

export default defineComponent({
  components: { Control, Video },
  setup() {
    const show = ref(true)

    return { show }
  },
})
</script>
