import { BitrateInfo } from './types'
import { DEFAULT_AUTO_BITRATE_INDEX, MediaStatus } from './constants'

export interface MediaState {
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

type Subcriber = (mediaState: MediaState) => void

const initialMediaState: MediaState = {
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

export const pubsubs = (() => {
  const channels = new Map<string, { state: MediaState; listeners: Set<Subcriber> }>()

  return {
    subscribe: (channel: string, listener: Subcriber) => {
      // Create the channel if not yet created
      if (!channels.has(channel)) {
        channels.set(channel, { state: initialMediaState, listeners: new Set() })
      }

      // Add the listener to queue
      channels.get(channel)?.listeners.add(listener)

      // Provide handle back for removal of channel
      return {
        unsubscribe: () => {
          channels.get(channel)?.listeners.delete(listener)
        },
      }
    },
    update: (channel: string, partialMediaState: Partial<MediaState>) => {
      const currentState = Object.assign(channels.get(channel)?.state, partialMediaState)
      channels.get(channel)?.listeners.forEach(channelListener => {
        channelListener(currentState)
      })
    },
    getState: (channel: string) => channels.get(channel)?.state,
  }
})()
