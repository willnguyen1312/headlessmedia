<template>
  <select v-model="selectedMediaSource">
    <option v-for="mediaSource in mediaSources" :key="mediaSource">
      {{ mediaSource }}
    </option>
  </select>
  <video
    style="display: block;"
    :id="mediaId"
    width="800"
    height="400"
    controls
    :src="selectedMediaSource"
    v-on="mediaEventHanlders"
  />
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue'
import { useMedia } from '@headlessmedia/vue'
import { mediaSources } from '@headlessmedia/shared'

import { mediaId } from '../const'

export default defineComponent({
  setup() {
    const selectedMediaSource = ref<string>(mediaSources[0])
    const mediaEventHanlders = ref<object>({})

    const { getMediaProps } = useMedia({
      id: mediaId,
      mediaSource: selectedMediaSource,
    })

    watchEffect(() => {
      mediaEventHanlders.value = getMediaProps.value()
    })

    return { mediaEventHanlders, selectedMediaSource, mediaSources, mediaId }
  },
})
</script>

<style scoped>
.wrapper {
  width: 800px;
  display: flex;
  flex-direction: column;
}
</style>
