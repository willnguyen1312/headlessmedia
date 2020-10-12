<template>
  <select v-model="selectedVideoSource">
    <option v-for="videoSource in videoSources" :key="videoSource">
      {{ videoSource }}
    </option>
  </select>
  <video width="800" height="400" controls :src="selectedVideoSource" v-on="mediaEventHanlders" />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useMedia } from '@headlessmedia/vue'
import { videoSources } from '@headlessmedia/shared'

import { mediaId } from '../const'

export default defineComponent({
  setup() {
    const selectedVideoSource = ref<string>(videoSources[0])
    const { getMediaProps } = useMedia({ id: mediaId })
    const mediaEventHanlders = getMediaProps()

    return { mediaEventHanlders, selectedVideoSource, videoSources }
  },
})
</script>
