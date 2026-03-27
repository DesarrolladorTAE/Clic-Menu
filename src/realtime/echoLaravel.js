import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',      // siempre 'pusher' para Redis+EchoServer
  key: 'anyKey',               // no importa para Redis
  wsHost: import.meta.env.VITE_SOCKET_URL.replace('https://', ''),
  wsPort: Number(import.meta.env.VITE_SOCKET_PORT ?? 6001),
  forceTLS: false,             // si usas https y wss, podrías poner true
  disableStats: true,
  enabledTransports: ['ws', 'wss'],
});

export default echo;