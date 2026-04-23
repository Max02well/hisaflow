const sessions = new Map() // phone → { step, data, expiresAt }

export const sessionService = {
  get: (phone) => {
    const s = sessions.get(phone)
    if (!s || Date.now() > s.expiresAt) return null
    return s
  },
  set: (phone, data) => sessions.set(phone, {
    ...data,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 min TTL
  }),
  clear: (phone) => sessions.delete(phone),
}