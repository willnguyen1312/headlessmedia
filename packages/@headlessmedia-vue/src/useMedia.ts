import { onUnmounted } from 'vue'

import { callAll, makeMediaHandlers } from '@headlessmedia/shared'

export interface UseMediaArg {
  id: string
}

type MediaEventHandler = (event: HTMLMediaElement) => void
export type MergedEventListeners = Record<keyof GetMediaPropsArg, ReturnType<typeof callAll>>

interface GetMediaPropsArg {
  canplay?: MediaEventHandler
  durationchange?: MediaEventHandler
  error?: MediaEventHandler
  pause?: MediaEventHandler
  play?: MediaEventHandler
  progress?: MediaEventHandler
  ratechange?: MediaEventHandler
  seeked?: MediaEventHandler
  seeking?: MediaEventHandler
  timeupdate?: MediaEventHandler
  volumechange?: MediaEventHandler
  waiting?: MediaEventHandler
  loadedmetadata?: MediaEventHandler
}

export const useMedia = ({ id }: UseMediaArg) => {
  const mediaHandlers = makeMediaHandlers({ id })

  const getMediaProps = ({
    canplay,
    durationchange,
    error,
    pause,
    play,
    progress,
    ratechange,
    seeked,
    seeking,
    timeupdate,
    volumechange,
    waiting,
    loadedmetadata,
  }: GetMediaPropsArg = {}) => {
    const mergedEventListeners: MergedEventListeners = {
      canplay: callAll(mediaHandlers.handleCanPlay, canplay),
      durationchange: callAll(mediaHandlers.handleDurationChange, durationchange),
      error: callAll(mediaHandlers.handleError, error),
      pause: callAll(mediaHandlers.handlePause, pause),
      play: callAll(mediaHandlers.handlePlay, play),
      progress: callAll(mediaHandlers.handleProgress, progress),
      ratechange: callAll(mediaHandlers.handleRateChange, ratechange),
      seeked: callAll(mediaHandlers.handleSeeked, seeked),
      seeking: callAll(mediaHandlers.handleSeeking, seeking),
      timeupdate: callAll(mediaHandlers.handleTimeUpdate, timeupdate),
      volumechange: callAll(mediaHandlers.handleVolumeChange, volumechange),
      waiting: callAll(mediaHandlers.handleWaiting, waiting),
      loadedmetadata: callAll(mediaHandlers.handleLoadedMetadata, loadedmetadata),
    }

    return mergedEventListeners
  }

  onUnmounted(mediaHandlers.cleanup)

  return {
    getMediaProps,
  }
}
