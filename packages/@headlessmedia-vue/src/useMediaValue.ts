import { reactive, toRefs, onUnmounted } from 'vue'
import { clamp, mediaStore, initialMediaState } from '@headlessmedia/shared'

export interface UseMediaValueArg {
  id: string
}

export interface UseMediaValueUtils {
  setCurrentTime: (currentTime: number) => void
  setPlaybackRate: (playbackRate: number) => void
  setVolume: (volume: number) => void
  setPaused: (paused: boolean) => void
  setMuted: (muted: boolean) => void
}

export const useMediaValue = ({ id }: { id: string }) => {
  const currentMediaState = reactive(initialMediaState)
  const { getState, subscribe } = mediaStore
  const getMedia = () => getState(id)?.mediaElement
  let paused = true
  let playPromise: null | Promise<void> = null

  const { unsubscribe } = subscribe(id, latestState => {
    Object.keys(latestState).forEach(key => {
      // @ts-ignore
      currentMediaState[key] = latestState[key]
    })
  })

  onUnmounted(unsubscribe)

  const setCurrentTime = (currentTime: number) => {
    const media = getMedia()
    if (media) {
      const newCurrentTime = clamp(currentTime, 0, media.duration)
      media.currentTime = newCurrentTime
    }
  }

  const setPlaybackRate = (playbackRate: number) => {
    const media = getMedia()
    if (media) {
      media.playbackRate = playbackRate
    }
  }

  const setVolume = (volume: number) => {
    const media = getMedia()
    // Browsers only allow 0 to 1 volume value
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/volume
    if (media) {
      const newVolume = clamp(volume, 0, 1)
      media.volume = newVolume
    }
  }

  const setMuted = (muted: boolean) => {
    const media = getMedia()
    if (media) {
      media.muted = muted
    }
  }

  // We need this special handler to handle play/pause methods across browsers
  // https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
  const setPaused = async (newPaused: boolean) => {
    const media = getMedia()
    if (media) {
      // We need to store the latest paused state in ref for later access
      paused = newPaused

      if (paused) {
        if (playPromise) {
          await playPromise

          playPromise = null
          // Check the latest paused state
          if (paused) {
            media.pause()
          }
        } else {
          // IE doesn't return promise, we can just hit pause method
          media.pause()
        }
      } else {
        // Modern browser return a promise, undefined in IE
        playPromise = media.play()
      }
    }
  }

  return {
    ...toRefs(currentMediaState),
    setCurrentTime,
    setMuted,
    setPaused,
    setPlaybackRate,
    setVolume,
  }
}
