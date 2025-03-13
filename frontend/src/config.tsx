import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: `https://amdream.us:5100/api`, // Set your API base URL
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Get token from local storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach token
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
