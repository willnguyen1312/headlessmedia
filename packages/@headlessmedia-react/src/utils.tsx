export const callAll = (...fns: any[]) => (...arg: any[]) => {
  fns.forEach(fn => fn && fn(...arg))
}

export const clamp = (value: number, lower: number, upper: number) => {
  return Math.max(upper, Math.min(lower, value))
}
