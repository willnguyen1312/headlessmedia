import { useEffect, useReducer, useRef } from 'react'
import {
  makeMediaUtils,
  mediaStore,
  MediaState,
  MediaValueUtils,
  identity,
  isEqual,
} from '@headlessmedia/shared'

type Selector = <T>(mediaState: MediaState) => T

export interface UseMediaValueArg {
  id: string
  selector: Selector
}

export const useMediaValue = <T,>({
  id,
  selector = identity,
}: {
  id: string
  selector: (mediaState: MediaState) => T
}): T & MediaValueUtils => {
  const { subscribe, getState } = mediaStore
  const [, forceUpdate] = useReducer((aha: number) => aha + 1, 0)
  const currentMediaRef = useRef(selector && selector(getState(id) as MediaState))
  const mediaUtils = makeMediaUtils({ id })

  useEffect(() => {
    const { unsubscribe } = subscribe(id, (mediaState: MediaState) => {
      const newCurrentMediaState = selector(mediaState)
      if (selector === identity) {
        currentMediaRef.current = newCurrentMediaState
        forceUpdate()
        return
      }

      if (!isEqual(newCurrentMediaState, currentMediaRef.current)) {
        currentMediaRef.current = newCurrentMediaState
        forceUpdate()
      }
    })

    return unsubscribe
  }, [])

  return {
    ...currentMediaRef.current,
    ...mediaUtils,
  }
}
