//Punto de acceso para registro 

import api from "./api";

export const registerUser =async (payload) => {
    const {data} = await api.post("/register", payload);
    return data;
};

export async function login(payload) {
  // payload = { email, password }
  const { data } = await api.post("/login", payload);
  return data; // { message, user }
}

export async function me() {
  const { data } = await api.get("/me");
  return data; // { user }
}

export async function logout() {
  const { data } = await api.post("/logout");
  return data; // { message }
}