'use client';

import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();
const parsedCache = new Map<string, { raw: string | null; value: unknown }>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', emit);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', emit);
  };
}

export function readStoredJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(key);
  const cached = parsedCache.get(key);
  if (cached && cached.raw === raw) return cached.value as T | null;
  let value: unknown = null;
  if (raw !== null) {
    try {
      value = JSON.parse(raw);
    } catch {
      value = null;
    }
  }
  parsedCache.set(key, { raw, value });
  return value as T | null;
}

export function writeStoredJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
  parsedCache.delete(key);
  emit();
}

export function removeStoredKey(key: string) {
  window.localStorage.removeItem(key);
  parsedCache.delete(key);
  emit();
}

export function useStoredJson<T>(key: string): T | null {
  return useSyncExternalStore(
    subscribe,
    () => readStoredJson<T>(key),
    () => null
  );
}
