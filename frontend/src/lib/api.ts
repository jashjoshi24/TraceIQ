import { useAuthStore } from "@/store/authStore";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/pcap";

// Every PCAP/dashboard REST call needs the same access token the auth
// backend (port 8001) issued - it's the same TraceIQ session, just checked
// statelessly by this backend instead of re-querying the users table.
function authHeaders(): HeadersInit {
  const token = useAuthStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const fetcher = async (url: string) => {
  const res = await fetch(`${API_BASE_URL}${url}`, { headers: authHeaders() });
  if (res.status === 401) {
    useAuthStore.getState().clearAuth();
    throw new Error("Session expired. Please log in again.");
  }
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
};

export interface CaptureRecord {
  id: string;
  filename: string;
  original_filename: string;
  size_bytes: number;
  sha256_hash: string;
  format: string;
  status: string;
  packet_count: number | null;
  capture_duration_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProcessingJobRecord {
  id: string;
  capture_id: string;
  current_stage: string;
  progress_percent: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
}

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return body?.detail || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Uploads a single PCAP/PCAPNG file to the backend, reporting progress along
 * the way. Uses XMLHttpRequest instead of fetch() because fetch has no
 * built-in way to observe upload progress.
 */
export function uploadPcapFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ capture_id: string; job_id: string; message: string }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/api/pcap/uploads`);
    const token = useAuthStore.getState().accessToken;
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let body: any = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // Non-JSON response body; fall through to status-based handling below.
      }
      if (xhr.status === 401) {
        useAuthStore.getState().clearAuth();
        reject(new Error("Session expired. Please log in again."));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body);
      } else {
        reject(new Error(body?.detail || `Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error while uploading. Is the backend running?"));

    xhr.send(formData);
  });
}

export async function getUploads(): Promise<{ data: CaptureRecord[] }> {
  const res = await fetch(`${API_BASE_URL}/api/pcap/uploads`, { headers: authHeaders() });
  if (res.status === 401) {
    useAuthStore.getState().clearAuth();
    throw new Error("Session expired. Please log in again.");
  }
  if (!res.ok) throw new Error(await parseErrorMessage(res, "Failed to fetch uploads."));
  return res.json();
}

export async function getUploadDetail(captureId: string): Promise<CaptureRecord> {
  const res = await fetch(`${API_BASE_URL}/api/pcap/uploads/${captureId}`, { headers: authHeaders() });
  if (res.status === 401) {
    useAuthStore.getState().clearAuth();
    throw new Error("Session expired. Please log in again.");
  }
  if (!res.ok) throw new Error(await parseErrorMessage(res, "Failed to fetch capture details."));
  return res.json();
}

export async function getQueue(): Promise<{ data: ProcessingJobRecord[] }> {
  const res = await fetch(`${API_BASE_URL}/api/pcap/queue`, { headers: authHeaders() });
  if (res.status === 401) {
    useAuthStore.getState().clearAuth();
    throw new Error("Session expired. Please log in again.");
  }
  if (!res.ok) throw new Error(await parseErrorMessage(res, "Failed to fetch processing queue."));
  return res.json();
}
