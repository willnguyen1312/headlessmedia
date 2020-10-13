import { Track } from './types'

import { MediaStatus } from './constant'

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
  shakaPlayer: any
  adaptiveStreamEnable: boolean
  tracks: Track[]
  currentTrackId: number
}

type Subcriber = (mediaState: MediaState) => void

export const makeInitialMediaState = (): MediaState => ({
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
  adaptiveStreamEnable: true,
  tracks: [],
  currentTrackId: -1,
  shakaPlayer: null,
})

export const mediaStore = (() => {
  const channels = new Map<string, { state: MediaState; listeners: Set<Subcriber> }>()

  const createChannelIfNotAvailable = (channel: string) => {
    if (!channels.has(channel)) {
      channels.set(channel, {
        state: makeInitialMediaState(),
        listeners: new Set(),
      })
    }
  }

  return {
    subscribe: (channel: string, listener: Subcriber) => {
      // Create the channel if not yet created
      createChannelIfNotAvailable(channel)

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
      createChannelIfNotAvailable(channel)
      const currentState = Object.assign(channels.get(channel)?.state, partialMediaState)
      channels.get(channel)?.listeners.forEach(channelListener => {
        channelListener(currentState)
      })
    },
    getState: (channel: string) => {
      createChannelIfNotAvailable(channel)
      return channels.get(channel)?.state
    },
    remove: (channel: string) => {
      channels.delete(channel)
    },
  }
})()
