// hooks/useLocalStorage.ts
"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        // تلاش برای parse کردن
        try {
          const parsed = JSON.parse(item);
          setStoredValue(parsed);
        } catch {
          // اگه JSON نیست، خود مقدار رو به عنوان string قبول کن
          // و بعد مقدار درست رو ذخیره کن
          setStoredValue(item as T);
          // تعمیر localStorage
          localStorage.setItem(key, JSON.stringify(item));
        }
      } else {
        // اگه مقداری نبود، مقدار اولیه رو ذخیره کن
        localStorage.setItem(key, JSON.stringify(initialValue));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export function useUserId() {
  return useLocalStorage<string>("codenames_userId", "");
}

export function usePlayerName() {
  return useLocalStorage<string>("codenames_playerName", "");
}

export function generateUserId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function generateDefaultName(): string {
  return `Player${Math.floor(Math.random() * 1000)}`;
}
