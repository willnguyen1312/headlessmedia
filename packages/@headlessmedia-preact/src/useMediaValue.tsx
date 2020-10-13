import { useEffect, useReducer, useRef } from 'preact/hooks'
import { makeMediaUtils, mediaStore, MediaState } from '@headlessmedia/shared'

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
  const { subscribe, getState } = mediaStore
  const [value, forceUpdate] = useReducer((aha: number) => aha + 1, 0)
  const currentMediaRef = useRef(selector(getState(id) as MediaState))
  const mediaUtils = makeMediaUtils({ id })

  useEffect(() => {
    const { unsubscribe } = subscribe(id, mediaState => {
      const newCurrentMediaState = selector(mediaState)
      currentMediaRef.current = newCurrentMediaState

      forceUpdate(value + 1)
    })

    return unsubscribe
  }, [])

  return {
    ...currentMediaRef.current,
    ...mediaUtils,
  }
}
