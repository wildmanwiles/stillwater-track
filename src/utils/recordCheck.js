import records from '../data/records.json'

const TIME_EVENTS = new Set([
  '100m', '200m', '400m', '800m', '1500m', '1600m', '3200m', '1 Mile',
  '110m Hurdles', '100m Hurdles', '300m Hurdles', '60m Hurdles',
  '4x100m Relay', '4x200m Relay', '4x400m Relay', '4x800m Relay',
  'Sprint Medley Relay', 'Medley Relay'
])

function parseTime(mark) {
  if (mark.includes(':')) {
    const [min, sec] = mark.split(':')
    return parseFloat(min) * 60 + parseFloat(sec)
  }
  return parseFloat(mark)
}

function parseMeasurement(mark) {
  const match = mark.match(/^(\d+)'([\d.]+)/)
  if (match) return parseFloat(match[1]) * 12 + parseFloat(match[2])
  return 0
}

// Build lookup: { "highSchool|M|100m": { mark, ... }, ... }
const recordLookup = {}
for (const [division, genders] of Object.entries(records)) {
  for (const [genderKey, events] of Object.entries(genders)) {
    const gender = genderKey === 'boys' ? 'M' : 'F'
    for (const rec of events) {
      if (rec.mark === '—') continue
      const key = `${division}|${gender}|${rec.event}`
      recordLookup[key] = rec
    }
  }
}

/**
 * Check if a mark ties or beats a school record.
 * @param {string} event - Event name (e.g. "100m", "Long Jump")
 * @param {string} mark - The mark to check (e.g. "13.19", "16'4\"")
 * @param {string} gender - "M" or "F"
 * @param {number} grade - Athlete grade (7-8 = jrHigh, 9-12 = highSchool)
 * @returns {boolean}
 */
export function isSchoolRecord(event, mark, gender, grade) {
  const division = grade <= 8 ? 'jrHigh' : 'highSchool'
  const rec = recordLookup[`${division}|${gender}|${event}`]
  if (!rec) return false

  const isTime = TIME_EVENTS.has(event)
  if (isTime) {
    return parseTime(mark) <= parseTime(rec.mark)
  } else {
    return parseMeasurement(mark) >= parseMeasurement(rec.mark)
  }
}
