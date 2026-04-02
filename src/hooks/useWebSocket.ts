"use client";

import { useEffect, useRef, useState } from "react";

const WS_OPEN = 1;
const WS_CLOSED = 3;

type UseWebSocketOptions = {
  enabled?: boolean;
};

type UseWebSocketResult<TMessage> = {
  lastMessage: TMessage | null;
  readyState: number;
  error: string | null;
  sendMessage: (payload: unknown) => boolean;
};

export default function useWebSocket<TMessage = unknown>(
  url: string | null,
  options: UseWebSocketOptions = {},
): UseWebSocketResult<TMessage> {
  const { enabled = true } = options;
  const socketRef = useRef<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<TMessage | null>(null);
  const [readyState, setReadyState] = useState<number>(WS_CLOSED);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = (payload: unknown) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WS_OPEN) {
      return false;
    }

    socket.send(JSON.stringify(payload));
    return true;
  };

  useEffect(() => {
    if (!enabled || !url) {
      return;
    }

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setReadyState(WS_OPEN);
      setError(null);
    };

    socket.onmessage = (event) => {
      try {
        const parsedMessage = JSON.parse(event.data) as TMessage;
        setLastMessage(parsedMessage);
      } catch {
        setError("Received an unreadable websocket message.");
      }
    };

    socket.onerror = () => {
      setError("Unable to connect to the live interview stream.");
    };

    socket.onclose = (event) => {
      setReadyState(WS_CLOSED);
      if (!event.wasClean) {
        if (event.code === 4003) {
          setError("Live interview stream rejected authentication. Check the frontend auth token.");
          return;
        }
        setError(`Live interview stream disconnected (code ${event.code}).`);
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [enabled, url]);

  return {
    lastMessage,
    readyState,
    error,
    sendMessage,
  };
}
