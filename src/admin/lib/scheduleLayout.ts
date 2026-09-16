export interface TimedItem {
  id: string
  /** Minutes since midnight. */
  start: number
  end: number
}

export interface Lane {
  lane: number
  lanes: number
}

/**
 * Side-by-side placement for overlapping items in one column. Items that overlap
 * (directly or through a chain) share a cluster; each gets the first free lane.
 */
export function assignLanes(items: TimedItem[]): Map<string, Lane> {
  const sorted = [...items].sort((a, b) => a.start - b.start || a.end - b.end)
  const result = new Map<string, Lane>()
  let cluster: { id: string; lane: number }[] = []
  let laneEnds: number[] = []
  let clusterEnd = -Infinity

  const flush = () => {
    for (const item of cluster) result.set(item.id, { lane: item.lane, lanes: laneEnds.length })
    cluster = []
    laneEnds = []
  }

  for (const item of sorted) {
    if (item.start >= clusterEnd) flush()
    let lane = laneEnds.findIndex((end) => end <= item.start)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(item.end)
    } else {
      laneEnds[lane] = item.end
    }
    cluster.push({ id: item.id, lane })
    clusterEnd = cluster.length === 1 ? item.end : Math.max(clusterEnd, item.end)
  }
  flush()

  return result
}

export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

export function parseClock(hhmm: string): number {
  const [hours, minutes] = hhmm.split(':').map(Number)
  return hours * 60 + minutes
}

/** Whole-hour window that covers working hours and every item of the day. */
export function gridBounds(open: number, close: number, items: TimedItem[]): { start: number; end: number } {
  const start = Math.min(open, ...items.map((item) => item.start))
  const end = Math.max(close, ...items.map((item) => item.end))
  return { start: Math.floor(start / 60) * 60, end: Math.min(24 * 60, Math.ceil(end / 60) * 60) }
}

export function snapMinutes(minutes: number, step = 15): number {
  return Math.round(minutes / step) * step
}
