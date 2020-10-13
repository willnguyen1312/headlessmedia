import { onUnmounted, ref, watchEffect } from 'vue'

import { callAll, makeMediaHandlers } from '@headlessmedia/shared'

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

export const useMedia = ({ id, mediaSource }: any) => {
  let mediaHandlers = ref<any>(null)
  let getMediaProps = ref<any>(() => {})
  let shaka: any

  const loadShaka = async (mediaSourceValue: string) => {
    const { default: loadedShaka } = await import('shaka-player')
    shaka = loadedShaka
    mediaHandlers.value = makeMediaHandlers({ id, mediaSource: mediaSourceValue, shaka })
  }

  watchEffect(() => {
    if (mediaHandlers.value) {
      getMediaProps.value = ({
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
        if (!mediaHandlers.value) {
          return
        }

        const mergedEventListeners: MergedEventListeners = {
          canplay: callAll(mediaHandlers.value.handleCanPlay, canplay),
          durationchange: callAll(mediaHandlers.value.handleDurationChange, durationchange),
          error: callAll(mediaHandlers.value.handleError, error),
          pause: callAll(mediaHandlers.value.handlePause, pause),
          play: callAll(mediaHandlers.value.handlePlay, play),
          progress: callAll(mediaHandlers.value.handleProgress, progress),
          ratechange: callAll(mediaHandlers.value.handleRateChange, ratechange),
          seeked: callAll(mediaHandlers.value.handleSeeked, seeked),
          seeking: callAll(mediaHandlers.value.handleSeeking, seeking),
          timeupdate: callAll(mediaHandlers.value.handleTimeUpdate, timeupdate),
          volumechange: callAll(mediaHandlers.value.handleVolumeChange, volumechange),
          waiting: callAll(mediaHandlers.value.handleWaiting, waiting),
          loadedmetadata: callAll(mediaHandlers.value.handleLoadedMetadata, loadedmetadata),
        }

        return mergedEventListeners
      }
    }
  })

  watchEffect(() => {
    if (mediaSource) {
      loadShaka(mediaSource.value)
    } else {
      const mediaHandlers = makeMediaHandlers({ id })

      const _getMediaProps = ({
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

      getMediaProps.value = _getMediaProps
    }
  })

  onUnmounted(() => {
    if (mediaHandlers.value) {
      mediaHandlers.value.cleanup()
    }
  })

  return {
    getMediaProps,
  }
}
