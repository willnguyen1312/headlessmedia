<template>
  <button @click="handleClick">{{ buttonText }}</button>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useMediaValue } from '@headlessmedia/vue'

import { mediaId } from '../const'

export default defineComponent({
  name: 'Control',
  setup() {
    const { paused, setPaused } = useMediaValue({ id: mediaId })

    const buttonText = computed(() => (paused ? 'Play' : 'Pause'))

    const handleClick = () => setPaused(!paused)

    return { paused, buttonText, handleClick }
  },
})
</script>

<style scoped></style>
