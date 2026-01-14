import { useState } from "react";
import { registerUser } from "../../services/auth.service"; //funcion registerUser otro archivo

export default function Register() {

  //Definir constantes
  const [form, setForm] = useState({
    name: "",
    last_name_paternal: "",
    last_name_maternal: "",
    phone: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false); //Desactivar boton (1)
  const [msg, setMsg] = useState(""); //Mensaje (1)

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();

    //Limpia las variable mensaje
    setMsg("");
    //Activar modo "Cargando"
    setLoading(true);

    try {
      const data = await registerUser(form); //Manda el form a Laravel: POST/api/register
      setMsg(data?.message || "Registro OK"); // Lee mensaje que Laravel devuelve
    } catch (err) {
      // mensaje bonito
      const r = err?.response?.data;
      const apiMsg =
        r?.message ||
        (r?.errors ? JSON.stringify(r.errors) : null) ||
        "Error al registrar";
      setMsg(apiMsg);
    } finally {
      setLoading(false); //Cierra ciclo de carga
    }
  };

  //Dibuja el formulario en pantalla
  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h2>Registro</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input 
         name="name" 
         placeholder="Nombre" 
         value={form.name} 
         onChange={onChange} 
        />
        
        <input
          name="last_name_paternal"
          placeholder="Apellido paterno"
          value={form.last_name_paternal}
          onChange={onChange}
        />
        <input
          name="last_name_maternal"
          placeholder="Apellido materno (opcional)"
          value={form.last_name_maternal}
          onChange={onChange}
        />
        <input 
          name="phone" 
          placeholder="Teléfono" 
          value={form.phone} 
          onChange={onChange} />
        <input 
            name="email" 
            placeholder="Email"
            value={form.email} 
            onChange={onChange} />

        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={onChange}
        />
        <input
          name="password_confirmation"
          type="password"
          placeholder="Confirmar contraseña"
          value={form.password_confirmation}
          onChange={onChange}
        />

        <button disabled={loading} type="submit">
            {loading ? "Registrando..." : "Registrar"}
        </button>

      </form>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}
