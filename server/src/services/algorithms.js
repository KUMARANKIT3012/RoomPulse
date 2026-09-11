/**
 * Lower-bound binary search: first sorted item satisfying predicate.
 * Time O(log n), space O(1).
 */
export function binarySearchFirstAtLeast(items, value, selector = (x) => x) {
  let low = 0; let high = items.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (selector(items[mid]) >= value) high = mid; else low = mid + 1;
  }
  return low;
}

/**
 * Greedy room allocation. Rooms must be sorted by capacity before calling.
 * Time O(r log r + b) (sorting plus one availability scan), space O(r).
 */
export function allocateSmallestSuitableRoom(rooms, bookings, capacity, start, end) {
  const sorted = [...rooms].sort((a, b) => a.capacity - b.capacity || a.id - b.id);
  const first = binarySearchFirstAtLeast(sorted, capacity, (room) => room.capacity);
  for (let i = first; i < sorted.length; i += 1) {
    const room = sorted[i];
    const busy = bookings.some((booking) => booking.room_id === room.id &&
      new Date(booking.start_time) < end && new Date(booking.end_time) > start);
    if (!busy) return room;
  }
  return null;
}

/**
 * Classic interval scheduling/activity selection, maximizing non-overlapping
 * activities by earliest finish time. Time O(n log n), space O(n).
 */
export function selectMaxNonConflictingActivities(activities) {
  const sorted = [...activities].sort((a, b) =>
    new Date(a.end_time) - new Date(b.end_time));
  const selected = []; let lastEnd = null;
  for (const activity of sorted) {
    if (!lastEnd || new Date(activity.start_time) >= lastEnd) {
      selected.push(activity); lastEnd = new Date(activity.end_time);
    }
  }
  return selected;
}

/**
 * Binary-search the first timetable item at/after a timestamp.
 * Time O(log n), space O(1). Callers should provide start-time sorted data.
 */
export function findScheduleAtOrAfter(schedules, timestamp) {
  return binarySearchFirstAtLeast(schedules, new Date(timestamp).getTime(),
    (item) => new Date(item.start_time).getTime());
}
