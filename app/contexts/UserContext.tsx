// context/UserContext.tsx
"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import {
  useLocalStorage,
  generateUserId,
  generateDefaultName,
} from "@/hooks/useLocalStorage";

interface UserContextType {
  userId: string;
  playerName: string;
  setPlayerName: (name: string) => void;
  isLoaded: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [storedUserId, setStoredUserId] = useLocalStorage<string>(
    "codenames_userId",
    "",
  );
  const [storedName, setStoredName] = useLocalStorage<string>(
    "codenames_playerName",
    "",
  );
  const [userId, setUserId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // راه‌اندازی userId
    let currentUserId = storedUserId;
    if (!currentUserId) {
      currentUserId = generateUserId();
      setStoredUserId(currentUserId);
    }
    setUserId(currentUserId);

    // راه‌اندازی نام کاربر
    let currentName = storedName;
    if (!currentName) {
      currentName = generateDefaultName();
      setStoredName(currentName);
    }
    setPlayerName(currentName);

    setIsLoaded(true);
  }, [storedUserId, storedName, setStoredUserId, setStoredName]);

  const handleSetPlayerName = (name: string) => {
    setPlayerName(name);
    setStoredName(name);
  };

  const value: UserContextType = {
    userId,
    playerName,
    setPlayerName: handleSetPlayerName,
    isLoaded,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}
