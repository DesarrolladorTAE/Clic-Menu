import { useEffect, useState } from "react";
import echo from "./echo";

export default function TestEventPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const addLog = (msg, data = null) => {
      console.log(msg, data ?? "");
      setLogs((prev) => [
        { id: Date.now() + Math.random(), msg, data },
        ...prev,
      ]);
    };

    addLog("Montando listeners...");

    if (echo?.connector?.pusher?.connection) {
      echo.connector.pusher.connection.bind("state_change", (states) => {
        addLog("Cambio de estado del socket", states);
      });

      echo.connector.pusher.connection.bind("connected", () => {
        addLog("Socket conectado");
      });

      echo.connector.pusher.connection.bind("error", (err) => {
        addLog("Error de socket", err);
      });
    }

    const kitchenChannel = echo.channel("branch.10.kitchen");
    const tablesChannel = echo.channel("branch.10.tables");

    kitchenChannel.listen(".kitchen.kds.updated", (e) => {
      addLog("Evento cocina recibido", e);
    });

    tablesChannel.listen(".table.grid.updated", (e) => {
      addLog("Evento mesas recibido", e);
    });

    return () => {
      echo.leave("branch.10.kitchen");
      echo.leave("branch.10.tables");
    };
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Prueba Realtime</h1>
      <p>Escuchando branch.10.kitchen y branch.10.tables</p>

      <div style={{ marginTop: 20 }}>
        {logs.length === 0 ? (
          <p>Sin eventos todavía...</p>
        ) : (
          logs.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <strong>{item.msg}</strong>
              {item.data && (
                <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
                  {JSON.stringify(item.data, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}