import { cookies } from 'next/headers'
import { resortDb } from './db/resort-db'
import { Profile, UserRole } from './types'

const SESSION_COOKIE_NAME = 'rora_session_user'

export async function getCurrentUser(): Promise<Profile | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
    if (!sessionCookie?.value) {
      // Default to admin or receptionist in dev
      const profiles = await resortDb.getProfiles()
      return profiles.find((p) => p.role === 'admin') || profiles[0] || null
    }

    const payload = JSON.parse(sessionCookie.value) as { id?: string; email?: string }
    if (payload?.id) {
      const user = await resortDb.getProfileById(payload.id)
      if (user) return user
    }
    if (payload?.email) {
      const user = await resortDb.getProfileByEmail(payload.email)
      if (user) return user
    }

    const profiles = await resortDb.getProfiles()
    return profiles[0] || null
  } catch {
    return null
  }
}

export async function setSessionUser(user: Profile): Promise<void> {
  const cookieStore = await cookies()
  const payload = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  }
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export function hasRole(user: Profile | null, allowedRoles: UserRole[]): boolean {
  if (!user) return false
  return allowedRoles.includes(user.role)
}
