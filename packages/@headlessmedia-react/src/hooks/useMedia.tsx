import { MediaHTMLAttributes, useEffect } from 'react'

import { MediaStatus } from '../constants'
import { callAll } from '../utils'
import { pubsubs } from '../MediaPubSub'

export interface UseMediaArg {
  id: string
}

type MediaContextInternalEvents =
  | 'onSeeking'
  | 'onSeeked'
  | 'onRateChange'
  | 'onVolumeChange'
  | 'onCanPlay'
  | 'onWaiting'
  | 'onPause'
  | 'onPlay'
  | 'onTimeUpdate'
  | 'onProgress'
  | 'onDurationChange'
  | 'onError'

export type MergedEventListeners = Record<MediaContextInternalEvents, ReturnType<typeof callAll>>

const getMedia = (id: string): HTMLMediaElement => {
  const media = document.getElementById(id)
  if (!media) {
    throw new Error('Media element is not available')
  }

  return media as HTMLMediaElement
}

export const useMedia = ({ id }: UseMediaArg) => {
  let timeoutLoadingId: NodeJS.Timeout
  const { update, remove } = pubsubs
  const _onSeeked = () => update(id, { seeking: false })

  const _onError = () => update(id, { status: MediaStatus.ERROR })

  const _onTimeUpdate = () => update(id, { currentTime: getMedia(id).currentTime })

  const _onRateChange = () => update(id, { playbackRate: getMedia(id).playbackRate })

  const _onPause = () => update(id, { paused: true, ended: getMedia(id).ended })

  const _onPlay = () => update(id, { paused: false, ended: getMedia(id).ended })

  const _onDurationChange = () => update(id, { duration: getMedia(id).duration })

  const checkMediaHasDataToPlay = () => {
    const media = getMedia(id)
    const { currentTime } = media

    const timeRanges = Array.from({ length: media.buffered.length }, (_, index) => {
      const start = media.buffered.start(index)
      const end = media.buffered.end(index)
      return [Math.floor(start), end]
    })

    // Detect whether timeRanges has data to play at current time of media element
    const result = timeRanges.some(timeRange => {
      const [start, end] = timeRange

      return currentTime >= start && currentTime <= end
    })

    return result
  }

  const setLoadingStatus = () => {
    if (timeoutLoadingId) {
      clearTimeout(timeoutLoadingId)
    }
    // Avoid showing loading indicator early on fast stream which can be annoying to user
    // Similar to Youtube's experience
    timeoutLoadingId = setTimeout(() => update(id, { status: MediaStatus.LOADING }), 1000)
  }

  const setCanPlayStatus = () => {
    if (timeoutLoadingId) {
      clearTimeout(timeoutLoadingId)
    }
    update(id, { status: MediaStatus.CAN_PLAY })
  }

  const _onSeeking = () => {
    const media = getMedia(id)
    update(id, {
      seeking: true,
      currentTime: media.currentTime,
      ended: media.ended,
    })
    if (!checkMediaHasDataToPlay()) {
      setLoadingStatus()
    }
  }

  const _onVolumeChange = () => {
    const media = getMedia(id)
    update(id, { muted: media.muted, volume: media.volume })
  }

  const _onCanPlay = () => setCanPlayStatus()
  const _onProgress = () => {
    if (checkMediaHasDataToPlay()) {
      setCanPlayStatus()
    }
    update(id, { buffered: getMedia(id).buffered })
  }

  const _onWaiting = () => {
    if (checkMediaHasDataToPlay()) {
      setCanPlayStatus()
    } else {
      setLoadingStatus()
    }
  }

  const getMediaProps = ({
    onCanPlay,
    onDurationChange,
    onError,
    onPause,
    onPlay,
    onProgress,
    onRateChange,
    onSeeked,
    onSeeking,
    onTimeUpdate,
    onVolumeChange,
    onWaiting,
  }: MediaHTMLAttributes<HTMLVideoElement> = {}) => {
    const mergedEventListeners: MergedEventListeners = {
      onCanPlay: callAll(_onCanPlay, onCanPlay),
      onDurationChange: callAll(_onDurationChange, onDurationChange),
      onError: callAll(_onError, onError),
      onPause: callAll(_onPause, onPause),
      onPlay: callAll(_onPlay, onPlay),
      onProgress: callAll(_onProgress, onProgress),
      onRateChange: callAll(_onRateChange, onRateChange),
      onSeeked: callAll(_onSeeked, onSeeked),
      onSeeking: callAll(_onSeeking, onSeeking),
      onTimeUpdate: callAll(_onTimeUpdate, onTimeUpdate),
      onVolumeChange: callAll(_onVolumeChange, onVolumeChange),
      onWaiting: callAll(_onWaiting, onWaiting),
    }

    return mergedEventListeners
  }

  useEffect(() => {
    return () => {
      remove(id)
    }
  }, [])

  return {
    getMediaProps,
  }
}
