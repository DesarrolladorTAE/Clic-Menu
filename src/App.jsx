//import Register from "./pages/auth/Register"; //Ruta de archivo de registro 

import AppRoutes from "./routes/AppRoutes";
import AxiosAuthInterceptor from "./components/AxiosAuthInterceptor";

export default function App() {
  return (
    <>
      <AxiosAuthInterceptor />
      <AppRoutes />
    </>
  );
}

