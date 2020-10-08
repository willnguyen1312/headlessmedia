import { SyntheticEvent } from 'react'

import { callAll } from './utils'
import { MediaStatus } from './constants'

export type MediaEventListener = (
  event: SyntheticEvent<HTMLVideoElement | HTMLAudioElement, Event>
) => void

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
  | 'onLoadedMetadata'

export type MergedEventListeners = Record<MediaContextInternalEvents, ReturnType<typeof callAll>>

export interface BitrateInfo {
  bitrate: number
  width: number
  height: number
}

// Consumable props
export interface MediaContextProps {
  // Streaming properties
  autoBitrateEnabled: boolean
  bitrateInfos: BitrateInfo[]
  currentBirateIndex: number
  setCurrentBirateIndex: (currentBirateIndex: number) => void

  // Media element
  mediaElement: HTMLMediaElement | null

  // Media properties
  currentTime: number
  seeking: boolean
  duration: number
  volume: number
  playbackRate: number
  paused: boolean
  muted: boolean
  ended: boolean
  buffered: TimeRanges | null
  status: MediaStatus
  rotate: number

  // Media control util methods
  setCurrentTime: (currentTime: number) => void
  setPlaybackRate: (playbackRate: number) => void
  setVolume: (volume: number) => void
  setPaused: (paused: boolean) => void
  setMuted: (muted: boolean) => void
  setRotate: (rotate: number) => void
}

// Media context extends consumable props and includes internal properties
export interface MediaContextType {
  _mediaRef: React.Ref<HTMLMediaElement>
  mediaElement: HTMLMediaElement | null

  // Event Listeners
  _onLoadedMetadata: MediaEventListener
  _onSeeking: MediaEventListener
  _onSeeked: MediaEventListener
  _onRateChange: MediaEventListener
  _onVolumeChange: MediaEventListener
  _onCanPlay: MediaEventListener
  _onWaiting: MediaEventListener
  _onPause: MediaEventListener
  _onPlay: MediaEventListener
  _onTimeUpdate: MediaEventListener
  _onProgress: MediaEventListener
  _onDurationChange: MediaEventListener
  _onError: MediaEventListener

  // Media control util methods
  setCurrentTime: (currentTime: number) => void
  setPlaybackRate: (playbackRate: number) => void
  setVolume: (volume: number) => void
  setPaused: (paused: boolean) => void
  setMuted: (muted: boolean) => void
  setRotate: (rotate: number) => void
  setCurrentBirateIndex: (currentBirateIndex: number) => void
}

export interface MediaContextConsumerProps {
  render: (mediaContext: MediaContextProps) => React.ReactNode
}
