import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to inject authentication token
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
};

// Search chunks endpoints
export const searchApi = {
  searchChunks: async (question) => {
    const response = await API.post("/search", { question });
    return response.data;
  },
};

export default API;
