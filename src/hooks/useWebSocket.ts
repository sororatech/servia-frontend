"use client";

import { useEffect, useRef, useState } from "react";

const WS_OPEN = 1;
const WS_CLOSED = 3;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 2000;

type UseWebSocketOptions = {
  enabled?: boolean;
  protocols?: string[];
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
  const { enabled = true, protocols } = options;
  const protocolsKey = protocols?.join("\0") ?? "";
  const protocolsRef = useRef(protocols);
  protocolsRef.current = protocols;
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

    let unmounted = false;
    let intentionalClose = false;
    let reconnectAttempts = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (unmounted) {
        return;
      }

      const activeProtocols = protocolsRef.current;
      const socket = activeProtocols?.length
        ? new WebSocket(url, activeProtocols)
        : new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        if (unmounted) {
          return;
        }
        reconnectAttempts = 0;
        setReadyState(WS_OPEN);
        setError(null);
      };

      socket.onmessage = (event) => {
        if (unmounted) {
          return;
        }
        try {
          const parsedMessage = JSON.parse(event.data) as TMessage;
          setLastMessage(parsedMessage);
        } catch {
          setError("Received an unreadable websocket message.");
        }
      };

      socket.onerror = () => {
        // Error details arrive via onclose; avoid flashing a message while reconnecting.
      };

      socket.onclose = (event) => {
        if (unmounted) {
          return;
        }

        setReadyState(WS_CLOSED);
        socketRef.current = null;

        if (intentionalClose) {
          return;
        }

        if (event.code === 4003) {
          setError(
            "Live interview stream rejected authentication. Please log in again and reopen this page.",
          );
          return;
        }

        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts += 1;
          reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
          return;
        }

        if (event.code === 1006) {
          setError(
            "Unable to connect to the live interview stream. Check that the backend is running on port 8000.",
          );
          return;
        }

        if (!event.wasClean) {
          setError(`Live interview stream disconnected (code ${event.code}).`);
        }
      };
    };

    connect();

    return () => {
      unmounted = true;
      intentionalClose = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [enabled, url, protocolsKey]);

  return {
    lastMessage,
    readyState,
    error,
    sendMessage,
  };
}
