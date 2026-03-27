import { useEffect } from 'react';
import echo from './echoLaravel';

export default function TestEventPage() {
  useEffect(() => {
    // Escuchar evento TestEvent
    const channel = echo.channel('test-channel')
      .listen('.TestEvent', (e) => {
        console.log('Evento recibido:', e.mensaje);
        alert(`Evento recibido: ${e.mensaje}`);
      });

    // Cleanup al desmontar el componente
    return () => {
      channel.stopListening('.TestEvent');
    };
  }, []);

  return (
    <div>
      <h1>Prueba de Evento Laravel Echo Server</h1>
      <p>Abre la consola para ver el evento cuando lo dispares desde Laravel.</p>
    </div>
  );
}