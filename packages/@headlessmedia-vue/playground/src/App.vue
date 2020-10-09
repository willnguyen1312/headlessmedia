<template>
  <Control />
  <video
    width="800"
    height="400"
    controls
    src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    v-on="mediaEventHanlders"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useMedia } from '@headlessmedia/vue'

import Control from './components/Control.vue'

import { mediaId } from './const'

export default defineComponent({
  components: {
    Control,
  },
  name: 'App',
  setup() {
    const { getMediaProps } = useMedia({ id: mediaId })
    const mediaEventHanlders = getMediaProps()

    return { mediaEventHanlders }
  },
})
</script>
