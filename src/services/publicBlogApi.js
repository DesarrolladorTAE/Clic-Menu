// src/services/publicBlogApi.js

import axios from "axios";

const publicBlogApi = axios.create({
  baseURL: import.meta.env.VITE_BLOG_API_BASE_URL,
  withCredentials: false,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

export default publicBlogApi;