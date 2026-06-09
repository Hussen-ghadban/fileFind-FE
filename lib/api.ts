import axios from "axios";
import { useAuthExpired } from "@/components/auth-expired-dialog";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthExpired.getState().trigger();
    }
    return Promise.reject(error);
  }
);

// Auth
export const signup = (email: string, password: string) =>
  api.post("/auth/signup", { email, password });

export const login = (email: string, password: string) =>
  api.post("/auth/login", { email, password });

// Files
export const uploadFile = (file: File, folderId?: string, onProgress?: (pct: number) => void) => {
  const formData = new FormData()
  formData.append("file", file)
  return api.post(`/files/upload${folderId ? `?folder_id=${folderId}` : ""}`, formData, {
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.round((e.loaded * 100) / e.total))
    },
  })
}

export const listFiles = () => api.get("/files/");
export const deleteFile = (fileId: string) => api.delete(`/files/${fileId}`);
export const downloadFile = (fileId: string) => api.get(`/files/${fileId}/download`);
export const moveFile = (fileId: string, folderId: string | null) =>
  api.put(`/files/${fileId}/move${folderId ? `?folder_id=${folderId}` : ""}`);
export const previewFile = (fileId: string) => api.get(`/files/${fileId}/preview`);

// Folders
export const listFolders = () => api.get("/folders/");
export const createFolder = (name: string) => api.post("/folders/", { name });
export const deleteFolder = (folderId: string) => api.delete(`/folders/${folderId}`);
export const listFolderFiles = (folderId: string) => api.get(`/folders/${folderId}/files`);

// Search
export const searchFiles = (query: string) => api.post("/search/", { query });