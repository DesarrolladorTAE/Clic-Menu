import React from "react";

const footerLinks = [
  { label: "Inicio", href: "/" },
  { label: "Planes", href: "/planes" },
  { label: "Sobre nosotros", href: "/sobre-nosotros" },
  { label: "Contactos", href: "/contacto" },
  { label: "Términos y condiciones", href: "/terminos-y-condiciones" },
];

const socialLinks = [
  "Facebook",
  "WhatsApp",
  "Instagram",
  "Twitter",
  "YouTube",
  "Pinterest",
];

export default function LandingFooter() {
  return (
    <>
      <footer className="cm-landing-footer">
        <div className="cm-landing-footer-wave" />

        <div className="landing-container cm-landing-footer-inner">
          <div className="cm-landing-footer-brand">
            <div className="cm-landing-footer-logo">
              Logo
            </div>

            <p className="landing-text cm-landing-footer-description">
              Clic Menu es una plataforma digital para restaurantes que ayuda a
              controlar pedidos, mesas, cocina, ventas y operación desde un solo
              lugar.
            </p>
          </div>

          <div className="cm-landing-footer-column">
            <h3 className="landing-card-title cm-landing-footer-title">
              Enlaces
            </h3>

            <nav className="cm-landing-footer-links">
              {footerLinks.map((item) => (
                <a href={item.href} key={item.label}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="cm-landing-footer-column">
            <h3 className="landing-card-title cm-landing-footer-title">
              Síguenos
            </h3>

            <div className="cm-landing-footer-links">
              {socialLinks.map((item) => (
                <a href="#" key={item}>
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div className="cm-landing-footer-column">
            <h3 className="landing-card-title cm-landing-footer-title">
              Contacto
            </h3>

            <div className="cm-landing-footer-contact">
              <p>
                <strong>Email</strong>
                <span>contacto@telorecargo.com</span>
              </p>

              <p>
                <strong>Teléfono</strong>
                <span>+52 (744) 218 8925</span>
              </p>

              <p>
                <strong>Ubicación</strong>
                <span>
                  Carretera Cayaco Puerto Marques Oficina 106 A, El Coloso,
                  39810, Acapulco de Juárez, Gro.
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="landing-container cm-landing-footer-bottom">
          <p>
            Clic Menu desarrollado por <strong>TAE</strong>.
          </p>
        </div>
      </footer>

      <style>{`
        .cm-landing-footer {
          position: relative;
          padding: 96px 0 28px;
          overflow: hidden;
          background: var(--landing-dark);
          color: var(--landing-white);
        }

        .cm-landing-footer-wave {
          position: absolute;
          top: -1px;
          left: 0;
          width: 100%;
          height: 72px;
          background: var(--landing-white);
          border-radius: 0 0 50% 50%;
        }

        .cm-landing-footer-inner {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.4fr 0.8fr 0.8fr 1.2fr;
          gap: 42px;
        }

        .cm-landing-footer-logo {
          width: 150px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          border: 1px solid var(--landing-dark-border);
          border-radius: 18px;
          color: rgba(255, 255, 255, 0.68);
          font-weight: 800;
        }

        .cm-landing-footer-description {
          max-width: 340px;
          color: rgba(255, 255, 255, 0.72);
        }

        .cm-landing-footer-title {
          margin-bottom: 18px;
          color: var(--landing-white);
        }

        .cm-landing-footer-links {
          display: grid;
          gap: 11px;
        }

        .cm-landing-footer-links a {
          width: fit-content;
          color: rgba(255, 255, 255, 0.7);
          font-size: 15px;
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .cm-landing-footer-links a:hover {
          color: var(--landing-yellow);
          transform: translateX(3px);
        }

        .cm-landing-footer-contact {
          display: grid;
          gap: 16px;
        }

        .cm-landing-footer-contact p {
          margin: 0;
          display: grid;
          gap: 5px;
        }

        .cm-landing-footer-contact strong {
          color: var(--landing-white);
          font-size: 14px;
        }

        .cm-landing-footer-contact span {
          color: rgba(255, 255, 255, 0.7);
          font-size: 15px;
          line-height: 1.45;
        }

        .cm-landing-footer-bottom {
          position: relative;
          z-index: 1;
          margin-top: 58px;
          padding-top: 22px;
          border-top: 1px solid var(--landing-dark-border);
          text-align: center;
        }

        .cm-landing-footer-bottom p {
          margin: 0;
          color: rgba(255, 255, 255, 0.62);
          font-size: 14px;
        }

        .cm-landing-footer-bottom strong {
          color: var(--landing-yellow);
        }

        @media (max-width: 900px) {
          .cm-landing-footer-inner {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .cm-landing-footer {
            padding-top: 82px;
          }

          .cm-landing-footer-inner {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .cm-landing-footer-description {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
}