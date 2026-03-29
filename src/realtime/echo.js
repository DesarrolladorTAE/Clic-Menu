import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;
Pusher.logToConsole = true;

const echo = new Echo({
  broadcaster: "reverb",
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: Number(import.meta.env.VITE_REVERB_PORT),
  wssPort: Number(import.meta.env.VITE_REVERB_PORT),
  forceTLS: import.meta.env.VITE_REVERB_SCHEME === "https",
  enabledTransports: ["ws", "wss"],
  disableStats: true,

  /** 
   * CONFIGURACIÓN PARA CANALES PRIVADOS 
   * Echo llamará a esta URL automáticamente antes de conectar a un canal privado
   */
  authEndpoint: "https://api.clicmenu.com.mx/api/broadcasting/auth",
  
  authorizer: (channel, options) => {
    return {
      authorize: (socketId, callback) => {
        const token = localStorage.getItem("staff_token");
        
        fetch("https://api.clicmenu.com.mx/api/broadcasting/auth", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channel.name,
          }),
        })
          .then((response) => {
            if (!response.ok) throw new Error("Error en la autorización");
            return response.json();
          })
          .then((data) => callback(false, data))
          .catch((error) => callback(true, error));
      },
    };
  },


});

export default echo;