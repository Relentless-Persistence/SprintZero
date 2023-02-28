const roundToNearest = (num: number, nearest: number): number => Math.round(num / nearest) * nearest

export default roundToNearest
