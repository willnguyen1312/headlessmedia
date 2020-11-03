import { reactive, toRefs, onUnmounted } from 'vue'
import { makeMediaUtils, mediaStore, makeInitialMediaState } from 'headlessmedia-shared'

export interface UseMediaValueArg {
  id: string
}

export const useMediaValue = ({ id }: { id: string }) => {
  const currentMediaState = reactive(makeInitialMediaState())
  const { subscribe } = mediaStore
  const mediaUtils = makeMediaUtils({ id })

  const { unsubscribe } = subscribe(id, latestState => {
    Object.keys(latestState).forEach(key => {
      // @ts-ignore
      currentMediaState[key] = latestState[key]
    })
  })

  onUnmounted(unsubscribe)

  return {
    ...toRefs(currentMediaState),
    ...mediaUtils,
  }
}
