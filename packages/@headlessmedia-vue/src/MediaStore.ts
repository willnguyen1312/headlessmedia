import { reactive } from '@vue/reactivity'

import { BitrateInfo } from './types'
import { MediaStatus, DEFAULT_AUTO_BITRATE_INDEX } from './constant'

export interface MediaState {
  mediaElement: HTMLMediaElement | null
  currentTime: number
  seeking: boolean
  duration: number
  volume: number
  playbackRate: number
  paused: boolean
  muted: boolean
  ended: boolean
  status: MediaStatus
  rotate: number
  error: string
  buffered: TimeRanges | null

  // Streaming properties
  autoBitrateEnabled: boolean
  bitrateInfos: BitrateInfo[]
  currentBirateIndex: number
}

const initialMediaState: MediaState = {
  mediaElement: null,
  currentTime: 0,
  duration: 0,
  ended: false,
  error: '',
  muted: false,
  paused: true,
  playbackRate: 1,
  rotate: 0,
  seeking: false,
  status: MediaStatus.LOADING,
  volume: 1,
  buffered: null,
  autoBitrateEnabled: true,
  bitrateInfos: [],
  currentBirateIndex: DEFAULT_AUTO_BITRATE_INDEX,
}

export const mediaStore = (() => {
  const channels = reactive(new Map<string, MediaState>())

  const createChannelIfNotAvailable = (channel: string) => {
    if (!channels.has(channel)) {
      channels.set(channel, initialMediaState)
    }
  }

  return {
    getState: (channel: string) => {
      createChannelIfNotAvailable(channel)
      return channels.get(channel)
    },
    remove: (channel: string) => {
      channels.delete(channel)
    },
    update: (channel: string, partialMediaState: Partial<MediaState>) => {
      createChannelIfNotAvailable(channel)
      console.log(partialMediaState)

      channels.set(channel, { ...(channels.get(channel) as MediaState), ...partialMediaState })
    },
  }
})()
