import { useEffect, useReducer, useRef } from 'preact/hooks'
import { makeMediaUtils, mediaStore, MediaState, isEqual } from '@headlessmedia/shared'

type Selector = <T>(mediaState: MediaState) => T

export interface UseMediaValueArg {
  id: string
  selector: Selector
}

export const useMediaValue = <T,>({
  id,
  selector,
}: {
  id: string
  selector: (mediaState: MediaState) => T
}) => {
  const { subscribe, getState } = mediaStore
  const [value, forceUpdate] = useReducer((aha: number) => aha + 1, 0)
  const currentMediaRef = useRef<T>(selector(getState(id))) as React.MutableRefObject<T>
  const mediaUtils = makeMediaUtils({ id })

  useEffect(() => {
    const { unsubscribe } = subscribe(id, (mediaState: MediaState) => {
      const newCurrentMediaState = selector(mediaState)
      if (!isEqual(newCurrentMediaState, currentMediaRef.current)) {
        currentMediaRef.current = newCurrentMediaState
        forceUpdate(value + 1)
      }
    })

    return unsubscribe
  }, [])

  return {
    ...currentMediaRef.current,
    ...mediaUtils,
  }
}
