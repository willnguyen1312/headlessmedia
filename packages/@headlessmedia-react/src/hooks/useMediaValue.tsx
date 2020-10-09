import { useEffect, useReducer, useRef } from 'react'
import { clamp } from '@headlessmedia/shared'

import { pubsubs, MediaState } from '../MediaPubSub'

type Selector = <T>(mediaState: MediaState) => T

export interface UseMediaValueArg {
  id: string
  selector: Selector
}

export interface UseMediaValueUtils {
  setCurrentTime: (currentTime: number) => void
  setPlaybackRate: (playbackRate: number) => void
  setVolume: (volume: number) => void
  setPaused: (paused: boolean) => void
  setMuted: (muted: boolean) => void
}

export const useMediaValue = <T,>({
  id,
  selector,
}: {
  id: string
  selector: (mediaState: MediaState) => T
}): T & UseMediaValueUtils => {
  const { subscribe, getState } = pubsubs
  const [, forceUpdate] = useReducer((aha: number) => aha + 1, 0)
  const currentMediaRef = useRef(selector(getState(id) as MediaState))
  const getMedia = () => getState(id)?.mediaElement
  const pausedRef = useRef<boolean>(true)
  const playPromiseRef = useRef<Promise<void>>()

  useEffect(() => {
    const { unsubscribe } = subscribe(id, mediaState => {
      const newCurrentMediaState = selector(mediaState)
      currentMediaRef.current = newCurrentMediaState

      forceUpdate()
    })

    return unsubscribe
  }, [])

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
      pausedRef.current = paused

      if (paused) {
        const playPromise = playPromiseRef.current
        if (playPromise) {
          await playPromise

          playPromiseRef.current = undefined
          // Check the latest paused state
          if (pausedRef.current) {
            media.pause()
          }
        } else {
          // IE doesn't return promise, we can just hit pause method
          media.pause()
        }
      } else {
        // Modern browser return a promise, undefined in IE
        playPromiseRef.current = media.play()
      }
    }
  }

  return {
    ...currentMediaRef.current,
    setCurrentTime,
    setMuted,
    setPaused,
    setPlaybackRate,
    setVolume,
  }
}
