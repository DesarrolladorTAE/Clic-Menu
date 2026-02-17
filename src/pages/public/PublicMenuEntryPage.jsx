import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { resolveMenuToken } from "../../services/menu/publicMenu.service";

export default function PublicMenuEntryPage() {
  console.log("Componente Público Cargado");
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [ctx, setCtx] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await resolveMenuToken(token);
        setCtx(res?.data ?? res);
      } catch (e) {
        setErr({ 
            st: e?.response?.status, 
            msg: e?.response?.data?.message || "Error al leer QR" 
        });
      } finally { setLoading(false); }
    })();
  }, [token]);

  if (loading) return <div style={{ padding: 20 }}>Cargando menú...</div>;

  if (err) return (
    <div style={{ padding: 20, color: 'red' }}>
        <h2>Error {err.st}</h2>
        <p>{err.msg}</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1>{ctx?.restaurant?.trade_name}</h1>
      <p>Bienvenido a la sucursal: <strong>{ctx?.branch?.name}</strong></p>
      {ctx?.table && <p>Mesa: <strong>{ctx.table.name}</strong></p>}
      <hr />
      <p>Próximamente: Renderizado del Menú (Submódulo 4)</p>
    </div>
  );
}