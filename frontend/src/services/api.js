import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor to inject authentication token (kept for backward compatibility)
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: async (email, password) => {
    const response = await API.post("/auth/login", { email, password });
    return response.data;
  },
  register: async (name, email, password) => {
    const response = await API.post("/auth/register", { name, email, password });
    return response.data;
  },
  logout: async () => {
    const response = await API.post("/auth/logout");
    return response.data;
  },
  me: async () => {
    const response = await API.get("/auth/me");
    return response.data;
  },
};

// Document upload & retrieval endpoints
export const documentApi = {
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await API.post("/documents/resume", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  getResume: async () => {
    const response = await API.get("/documents/resume");
    return response.data;
  },
  getResumeStats: async () => {
    const response = await API.get("/documents/resume/stats");
    return response.data;
  },
  getResumeText: async () => {
    const response = await API.get("/documents/resume/text");
    return response.data;
  },
  deleteResume: async () => {
    const response = await API.delete("/documents/resume");
    return response.data;
  },
  uploadJd: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await API.post("/documents/jd", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  uploadJdText: async (text, fileName) => {
    const response = await API.post("/documents/jd", { text, fileName });
    return response.data;
  },
  getJd: async () => {
    const response = await API.get("/documents/jd");
    return response.data;
  },
  getJdText: async () => {
    const response = await API.get("/documents/jd/text");
    return response.data;
  },
  deleteJd: async () => {
    const response = await API.delete("/documents/jd");
    return response.data;
  },
};

// Resume Analysis endpoints
export const analysisApi = {
  analyzeResume: async () => {
    const response = await API.post("/analyze-resume");
    return response.data;
  },
};

// ATS matching endpoints
export const atsApi = {
  scoreMatch: async (jobDescription) => {
    const response = await API.post("/ats-score", { jobDescription });
    return response.data;
  },
  scoreWithSavedJd: async () => {
    const response = await API.post("/ats-score", { useSavedJd: true });
    return response.data;
  },
};

// Mock Interview endpoints
export const interviewApi = {
  generateQuestions: async (topic) => {
    const response = await API.post("/interview/questions", { topic });
    return response.data;
  },
};

// AI Chat endpoints
export const chatApi = {
  sendMessage: async (question) => {
    const response = await API.post("/chat", { question });
    return response.data;
  },
  streamMessage: async (question, onToken, onSources, onError) => {
    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const response = await fetch(`${baseURL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Stream request failed" }));
      throw new Error(error.message || "Stream request failed");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const event = JSON.parse(line.slice(6));
          if (event.type === "token") onToken(event.data);
          else if (event.type === "sources") onSources(event.data);
          else if (event.type === "error") onError(event.data);
        } catch {
          // skip malformed SSE lines
        }
      }
    }
  },
  getHistory: async () => {
    const response = await API.get("/chat/history");
    return response.data;
  },
  clearHistory: async () => {
    const response = await API.delete("/chat/history");
    return response.data;
  },
};

// Search chunks endpoints
export const searchApi = {
  searchChunks: async (question) => {
    const response = await API.post("/search", { question });
    return response.data;
  },
};

export default API;
