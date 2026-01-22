import { Link } from "react-router-dom";
import logoClicMenu from "../assets/clicmenu-blanco.png";

export default function Home() {
  return (
    <div className="bg-gray-900">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5">
              <span className="sr-only">ClicMenu</span>
              <img src={logoClicMenu} alt="ClicMenu" className="h-8 w-auto" />
            </Link>
          </div>

          <div className="hidden lg:flex lg:gap-x-12">
            <a href="#" className="text-base font-semibold text-white">Plataforma</a>
            <a href="#" className="text-base font-semibold text-white">Funcionalidades</a>
            <a href="#" className="text-base font-semibold text-white">Planes</a>
            <a href="#" className="text-base font-semibold text-white">Empresa</a>
          </div>

          <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-4">
            <Link to="/auth/login" className="text-bs font-semibold text-white">
              Iniciar sesión <span aria-hidden="true">→</span>
            </Link>

            <Link
              to="/auth/register"
              className="rounded-md border border-orange-500 px-4 py-2 text-bs font-semibold text-white hover:bg-orange-500/10 transition"
            >
              Crear cuenta
            </Link>
          </div>
        </nav>
      </header>

      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-8xl">
              Administra tu restaurante desde un solo lugar
            </h1>

            <p className="mt-8 text-lg font-medium text-gray-400 sm:text-xl">
              ClicMenu te permite gestionar menús, sucursales y operaciones
              de tu restaurante de forma rápida, sencilla y centralizada.
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/auth/register"
                className="rounded-md bg-orange-500 px-4 py-2.5 text-bs font-semibold text-white hover:bg-orange-400 transition"
              >
                Comenzar ahora
              </Link>

              <Link to="/auth/login" className="text-bs font-semibold text-white">
                Ya tengo cuenta →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
