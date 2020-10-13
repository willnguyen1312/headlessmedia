export interface TrackInfo {
  id: number
  bandwidth: number
  width: number
  height: number
}

export interface Track {
  height: number
  width: number
  bandwidth: number
  id: number
  active: boolean
}
