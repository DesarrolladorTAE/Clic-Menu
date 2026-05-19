import api from "../api";

export async function getClicmenuTerms() {
  const { data } = await api.get("/legal/clicmenu/terms");
  return data?.data ?? data;
}