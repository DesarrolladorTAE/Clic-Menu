import axios from "axios";

const REFERRAL_API = "https://api.tecnologiasadministrativas.com/api";

export const checkReferralCode = async (codigoRef) => {
  const { data } = await axios.post(`${REFERRAL_API}/check-codigo`, {
    codigo_ref: codigoRef,
  });

  return data;
};