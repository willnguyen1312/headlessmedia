import { useEffect, useRef, useReducer } from 'preact/hooks'
import { callAll, makeMediaHandlers, MediaHandlersArg } from '@headlessmedia/shared'

type MediaEventHandler = (event: React.SyntheticEvent<HTMLMediaElement, Event>) => void
type MergedEventListeners = Record<keyof GetMediaPropsArg, ReturnType<typeof callAll>>

interface GetMediaPropsArg {
  onCanPlay?: MediaEventHandler
  onDurationChange?: MediaEventHandler
  onError?: MediaEventHandler
  onPause?: MediaEventHandler
  onPlay?: MediaEventHandler
  onProgress?: MediaEventHandler
  onRateChange?: MediaEventHandler
  onSeeked?: MediaEventHandler
  onSeeking?: MediaEventHandler
  onTimeUpdate?: MediaEventHandler
  onVolumeChange?: MediaEventHandler
  onWaiting?: MediaEventHandler
  onLoadedMetadata?: MediaEventHandler
}

export const useMedia = ({ id, mediaSource }: MediaHandlersArg) => {
  const [s, forceUpdate] = useReducer((s: number) => s + 1, 0)
  const mediaHandlersRef = useRef<ReturnType<typeof makeMediaHandlers>>()
  const shakaRef = useRef<any>()

  useEffect(() => {
    const loadShaka = async () => {
      const { default: loadedShaka } = await import('shaka-player')
      shakaRef.current = loadedShaka
      const mediaHandlers = makeMediaHandlers({ id, mediaSource, shaka: shakaRef.current })
      mediaHandlersRef.current = mediaHandlers
      forceUpdate(s + 1)
    }

    if (mediaSource) {
      if (!shakaRef.current) {
        loadShaka()
      } else {
        const mediaHandlers = makeMediaHandlers({ id, mediaSource, shaka: shakaRef.current })
        mediaHandlersRef.current = mediaHandlers
        forceUpdate(s + 1)
      }
    }
  }, [mediaSource])

  useEffect(() => {
    return () => {
      if (mediaHandlersRef.current) {
        mediaHandlersRef.current.cleanup()
      }
    }
  }, [])

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
    onLoadedMetadata,
  }: GetMediaPropsArg = {}) => {
    if (!mediaHandlersRef.current) {
      return
    }
    const mediaHandlers = mediaHandlersRef.current
    const mergedEventListeners: MergedEventListeners = {
      onCanPlay: callAll(mediaHandlers.handleCanPlay, onCanPlay),
      onDurationChange: callAll(mediaHandlers.handleDurationChange, onDurationChange),
      onError: callAll(mediaHandlers.handleError, onError),
      onPause: callAll(mediaHandlers.handlePause, onPause),
      onPlay: callAll(mediaHandlers.handlePlay, onPlay),
      onProgress: callAll(mediaHandlers.handleProgress, onProgress),
      onRateChange: callAll(mediaHandlers.handleRateChange, onRateChange),
      onSeeked: callAll(mediaHandlers.handleSeeked, onSeeked),
      onSeeking: callAll(mediaHandlers.handleSeeking, onSeeking),
      onTimeUpdate: callAll(mediaHandlers.handleTimeUpdate, onTimeUpdate),
      onVolumeChange: callAll(mediaHandlers.handleVolumeChange, onVolumeChange),
      onWaiting: callAll(mediaHandlers.handleWaiting, onWaiting),
      onLoadedMetadata: callAll(mediaHandlers.handleLoadedMetadata, onLoadedMetadata),
    }
    return mergedEventListeners
  }

  return {
    getMediaProps,
  }
}
