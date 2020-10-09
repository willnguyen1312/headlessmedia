import { onUnmounted } from 'vue'

import { callAll } from '@headlessmedia/shared'

import { MediaStatus } from '../constant'
import { mediaStore } from '../MediaStore'

const noop = () => {}

type MediaContextInternalEvents =
  | 'seeking'
  | 'seeked'
  | 'ratechange'
  | 'volumechange'
  | 'canplay'
  | 'waiting'
  | 'pause'
  | 'play'
  | 'timeupdate'
  | 'progress'
  | 'durationchange'
  | 'loadedmetadata'
  | 'error'

export interface UseMediaArg {
  id: string
}

export type MergedEventListeners = Record<MediaContextInternalEvents, ReturnType<typeof callAll>>

export const useMedia = ({ id }: UseMediaArg) => {
  let timeoutLoadingId: NodeJS.Timeout
  const { update, remove, getState } = mediaStore
  const getMedia = () => getState(id)?.mediaElement

  const _onLoadedMetadata = (event: Event) => {
    const mediaElement = event.target as HTMLMediaElement
    update(id, { mediaElement })
  }

  const _onSeeked = () => update(id, { seeking: false })

  const _onError = () => update(id, { status: MediaStatus.ERROR })

  const _onTimeUpdate = () => update(id, { currentTime: getMedia()?.currentTime })

  const _onRateChange = () => update(id, { playbackRate: getMedia()?.playbackRate })

  const _onPause = () => update(id, { paused: true, ended: getMedia()?.ended })

  const _onPlay = () => update(id, { paused: false, ended: getMedia()?.ended })

  const _onDurationChange = () => update(id, { duration: getMedia()?.duration })

  const checkMediaHasDataToPlay = () => {
    const media = getMedia()
    if (media) {
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

    return false
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
    update(id, {
      seeking: true,
      currentTime: getMedia()?.currentTime,
      ended: getMedia()?.ended,
    })

    if (!checkMediaHasDataToPlay()) {
      setLoadingStatus()
    }
  }

  const _onVolumeChange = () => update(id, { muted: getMedia()?.muted, volume: getMedia()?.volume })

  const _onCanPlay = () => setCanPlayStatus()
  const _onProgress = () => {
    if (checkMediaHasDataToPlay()) {
      setCanPlayStatus()
    }
    update(id, { buffered: getMedia()?.buffered })
  }

  const _onWaiting = () => {
    if (checkMediaHasDataToPlay()) {
      setCanPlayStatus()
    } else {
      setLoadingStatus()
    }
  }

  const getMediaProps = ({
    canplay = noop,
    durationchange = noop,
    error = noop,
    pause = noop,
    play = noop,
    progress = noop,
    ratechange = noop,
    seeked = noop,
    seeking = noop,
    timeupdate = noop,
    volumechange = noop,
    waiting = noop,
    loadedmetadata = noop,
  } = {}) => {
    const mergedEventListeners: MergedEventListeners = {
      canplay: callAll(_onCanPlay, canplay),
      durationchange: callAll(_onDurationChange, durationchange),
      error: callAll(_onError, error),
      pause: callAll(_onPause, pause),
      play: callAll(_onPlay, play),
      progress: callAll(_onProgress, progress),
      ratechange: callAll(_onRateChange, ratechange),
      seeked: callAll(_onSeeked, seeked),
      seeking: callAll(_onSeeking, seeking),
      timeupdate: callAll(_onTimeUpdate, timeupdate),
      volumechange: callAll(_onVolumeChange, volumechange),
      waiting: callAll(_onWaiting, waiting),
      loadedmetadata: callAll(_onLoadedMetadata, loadedmetadata),
    }

    return mergedEventListeners
  }

  onUnmounted(() => {
    remove(id)
  })

  return {
    getMediaProps,
  }
}
