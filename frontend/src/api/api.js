import axios from "axios";

// 1. Prefer explicit env VITE_API_URL. If absent default to the Render hostname (with https).
// Accept values with or without protocol and normalize to include https:// by default.
const rawBase = import.meta.env.VITE_API_URL || "https://baafin.onrender.com";
let BASE_URL = rawBase;
if (!/^https?:\/\//i.test(BASE_URL)) {
  BASE_URL = `https://${BASE_URL}`;
}

// 2. Remove trailing slash to avoid double slashes when building URLs
const API_URL = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  
  // Iska ilaali in sawirada Vercel deegaankeeda maxaliga ah (Local) ay dhibaato ka kulmaan
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  // Haddii API_URL uu madhan yahay (Vercel Production), wuxuu isticmaalayaa daaqada hadda furan URL-keeda
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return API_URL ? `${API_URL}${cleanPath}` : `${origin}${cleanPath}`;
};

const API = axios.create({
  // Tani waxay dammaanad qaadaysaa inuu URL-ku noqdo /api (Relative) marka Vercel la joogo
  baseURL: `${API_URL}/api`
});

export { API_URL, getImageUrl };

// 3. Interceptor-ka si uu Token-ka ugu daro Request kasta
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
}, (error) => {
  return Promise.reject(error);
});

export default API;