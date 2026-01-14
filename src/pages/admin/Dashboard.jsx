import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 16 }}>
      <h2>Dashboard (protegido)</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>

      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}
