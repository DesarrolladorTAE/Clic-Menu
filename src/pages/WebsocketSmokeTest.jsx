import { useEffect, useState } from 'react';
import echo from '../realtime/echo';

export default function WebsocketSmokeTest() {
  const [status, setStatus] = useState('Conectando...');
  const [events, setEvents] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const pusher = echo.connector.pusher;

    const onConnected = () => {
      setStatus('Conectado al WebSocket');
    };

    const onError = (error) => {
      console.error('Error de WebSocket:', error);
      setStatus('Error de conexión');
    };

    pusher.connection.bind('connected', onConnected);
    pusher.connection.bind('error', onError);

    const channel = echo.channel('smoke-test');

    channel.listen('.smoke.ping', (event) => {
      console.log('Evento recibido:', event);
      setEvents((prev) => [event, ...prev]);
    });

    return () => {
      pusher.connection.unbind('connected', onConnected);
      pusher.connection.unbind('error', onError);
      echo.leave('smoke-test');
    };
  }, []);

  const fireEvent = async () => {
    try {
      setSending(true);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/ws-test/fire`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      });

      const data = await response.json();
      console.log('Evento enviado:', data);
    } catch (error) {
      console.error('Error enviando evento:', error);
      alert('No se pudo disparar el evento');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Prueba mínima WebSocket</h1>

      <p>
        <strong>Estado:</strong> {status}
      </p>

      <button onClick={fireEvent} disabled={sending}>
        {sending ? 'Enviando...' : 'Disparar evento'}
      </button>

      <div style={{ marginTop: '24px' }}>
        <h2>Eventos recibidos</h2>

        {events.length === 0 ? (
          <p>No ha llegado ningún evento todavía.</p>
        ) : (
          <ul>
            {events.map((item, index) => (
              <li key={index}>
                {item.message} | {item.server_time} | #{item.rand}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}