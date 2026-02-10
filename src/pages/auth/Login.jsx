// src/pages/auth/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);

    try {
      const res = await login(email, password);

      //nav("/app", { replace: true });

      const roleName = res?.user?.role?.name?.toLowerCase();
      const roleId = String(res?.user?.role_id);

      //Propietario: Redirecciona  a pagina "Mis restaurantes"
      const isOwner = roleName === "propietario" || roleId === "2";
      nav(isOwner ? "/owner/restaurants" : "/app", { replace: true });


    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        "No se pudo iniciar sesión. Revisa credenciales.";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h2>Login</h2>

      {err && (
        <div style={{ background: "#ffe5e5", padding: 10, marginBottom: 10 }}>
          {err}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Email</label>
          <input
            style={{ width: "100%", padding: 10 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Password</label>
          <input
            style={{ width: "100%", padding: 10 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        <button disabled={busy} style={{ width: "100%", padding: 10 }}>
          {busy ? "Entrando..." : "Entrar"}
        </button>
         
        <button
          type="button"
          onClick={() => nav("/auth/register")}
          style={{
            width: "100%",
            padding: 10,
            marginTop: 10,
            background: "transparent",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Crear cuenta
        </button>

      </form>
    </div>
  );
}
