export function getAccessLevel() {
  try {
    const auth = JSON.parse(localStorage.getItem('scs-auth'))
    if (auth && (auth.level === 'coach' || auth.level === 'member')) return auth.level
    return null
  } catch {
    return null
  }
}

export function isCoach() {
  return getAccessLevel() === 'coach'
}

export function isMember() {
  return getAccessLevel() === 'member'
}

export function isLoggedIn() {
  return getAccessLevel() !== null
}
