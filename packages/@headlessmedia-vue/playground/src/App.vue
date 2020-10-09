<template>
  <Control />
  <Video />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useMedia } from '@headlessmedia/vue'

import Control from './components/Control.vue'
import Video from './components/Video.vue'

import { mediaId } from './const'

export default defineComponent({
  components: { Control, Video },
})
</script>
