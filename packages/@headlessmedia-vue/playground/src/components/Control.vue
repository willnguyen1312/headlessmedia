<template>
  <button @click="handleClick">{{ buttonText }}</button>
  <h6>Current time: {{ currentTime }}</h6>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useMediaValue } from '@headlessmedia/vue'

import { mediaId } from '../const'

export default defineComponent({
  name: 'Control',
  setup() {
    const { paused, setPaused, currentTime } = useMediaValue({ id: mediaId })

    const buttonText = computed(() => (paused.value ? 'Play' : 'Pause'))

    const handleClick = () => setPaused(!paused.value)

    return { buttonText, paused, handleClick, currentTime }
  },
})
</script>
