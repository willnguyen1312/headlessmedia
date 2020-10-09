import { ref, reactive, watchEffect } from 'vue'
import { clamp } from '@headlessmedia/shared'

import { mediaStore, MediaState } from '../MediaStore'

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
  const { getState } = mediaStore
  const getMedia = () => getState(id)?.mediaElement
  const mediaState = reactive(new Map<string, MediaState>())
  const pausedRef = ref<boolean>(true)
  const playPromiseRef = ref<Promise<void>>()

  watchEffect(() => {
    // mediaState.set(id, getState(id) as MediaState)
    console.log(getState(id))
  })

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
  const setPaused = async (paused: boolean) => {
    const media = getMedia()
    if (media) {
      // We need to store the latest paused state in ref for later access
      pausedRef.value = paused

      if (paused) {
        const playPromise = playPromiseRef.value
        if (playPromise) {
          await playPromise

          playPromiseRef.value = undefined
          // Check the latest paused state
          if (pausedRef.value) {
            media.pause()
          }
        } else {
          // IE doesn't return promise, we can just hit pause method
          media.pause()
        }
      } else {
        // Modern browser return a promise, undefined in IE
        playPromiseRef.value = media.play()
      }
    }
  }

  return {
    ...(mediaState.get(id) as MediaState),
    setCurrentTime,
    setMuted,
    setPaused,
    setPlaybackRate,
    setVolume,
  }
}
