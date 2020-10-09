import { useEffect, useReducer, useRef } from 'react'

// import { MediaStatus } from '../constants'
// import { callAll } from '../utils'
import { pubsubs, MediaState } from '../MediaPubSub'

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
  const { subscribe, getState } = pubsubs
  const [, forceUpdate] = useReducer((aha: number) => aha + 1, 0)
  const currentMediaRef = useRef(selector(getState(id) as MediaState))

  useEffect(() => {
    const { unsubscribe } = subscribe(id, mediaState => {
      const newCurrentMediaState = selector(mediaState)
      currentMediaRef.current = newCurrentMediaState

      forceUpdate()
    })

    return unsubscribe
  }, [])

  return { ...currentMediaRef.current }
}
