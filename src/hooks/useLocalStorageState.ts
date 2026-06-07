import { useState, useEffect, Dispatch, SetStateAction } from 'react'

type SetState<T> = Dispatch<SetStateAction<T>>

export function useLocalStorageState<T>(key: string, initialValue: T): [T, SetState<T>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const stored = window.localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore storage errors in private mode or quota exceeded.
    }
  }, [key, value])

  return [value, setValue]
}
