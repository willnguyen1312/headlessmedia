<template>
  <h1>Hello there</h1>
</template>

<script>
import { defineComponent } from 'vue'
import { getTen } from '@headlessmedia/shared'

export default defineComponent({
  name: 'App',
  setup() {
    // const value = getTen()
    console.log(getTen())
    // return { value }
  },
})
</script>
