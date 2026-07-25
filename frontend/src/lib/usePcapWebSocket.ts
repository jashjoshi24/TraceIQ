import { useEffect, useState } from 'react';

export interface PcapJobEvent {
  id: string;
  stage: string;
  status: string;
  progress_percent: number;
}

export function usePcapWebSocket(url: string) {
  const [jobs, setJobs] = useState<Record<string, PcapJobEvent>>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // In a real implementation, this would connect to the WebSocket URL
    // and update the jobs state when receiving messages.
    // For now, this is just a stub.
    setIsConnected(true);
    
    return () => {
      setIsConnected(false);
    };
  }, [url]);

  return { jobs, isConnected };
}
