import { useEffect, useRef, useState } from 'react';

// Shape of the messages broadcast by backend/worker/stub_pipeline.py over
// the /ws/pcap socket (see routers/websocket.py's ConnectionManager.broadcast
// call sites).
export interface PcapJobEvent {
  job_id: string;
  capture_id: string;
  stage: string;
  progress: number;
}

export function usePcapWebSocket(url: string) {
  const [jobs, setJobs] = useState<Record<string, PcapJobEvent>>({});
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!url || typeof window === 'undefined') return;

    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    function connect() {
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        if (!cancelled) setIsConnected(true);
      };

      socket.onclose = () => {
        if (cancelled) return;
        setIsConnected(false);
        // The backend worker/websocket route may not be up yet on first
        // load, or the connection can drop - keep retrying.
        reconnectTimer = setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        socket.close();
      };

      socket.onmessage = (event) => {
        try {
          const data: PcapJobEvent = JSON.parse(event.data);
          if (!data || !data.job_id) return;
          setJobs((prev) => ({ ...prev, [data.job_id]: data }));
        } catch {
          // Ignore malformed messages rather than crashing the UI.
        }
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [url]);

  return { jobs, isConnected };
}
