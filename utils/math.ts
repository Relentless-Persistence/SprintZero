export const avg = (...vals: number[]): number => vals.reduce((a, b) => a + b, 0) / vals.length
