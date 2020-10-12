import { useEffect } from 'react'
import { callAll, makeMediaHandlers } from '@headlessmedia/shared'

export interface UseMediaArg {
  id: string
}

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

export const useMedia = ({ id }: UseMediaArg) => {
  const mediaHandlers = makeMediaHandlers({ id })

  useEffect(() => {
    return mediaHandlers.cleanup
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
