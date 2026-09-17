"use client";

import { useState } from "react";

const SESSION_KEY = "bioscope_session_id";

function getOrCreateSessionId(): string {
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = window.crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useSessionId(): string {
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return "";

    try {
      return getOrCreateSessionId();
    } catch (error) {
      console.error("Unable to initialize feedback session:", error);
      return "";
    }
  });

  return sessionId;
}
