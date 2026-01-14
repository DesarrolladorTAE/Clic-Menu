//Archivo para crear al cliente Axios base

import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL|| "https://api.clicmenu.com.mx/api",
    withCredentials: true,
    headers: {
        Accept: "application/json",
        
    },
});

export default api;