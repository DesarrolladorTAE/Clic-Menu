import React from "react";

const features = [
  {
    title: "Administra tu catálogo de productos",
    text: "Organiza categorías, precios, imágenes y productos desde una plataforma fácil de usar.",
  },
  {
    title: "Optimiza cocina y caja",
    text: "Mantén un flujo más organizado entre cocina, caja y personal operativo.",
  },
  {
    title: "Controla pedidos y mesas",
    text: "Gestiona órdenes, mesas y flujo operativo en tiempo real desde cualquier dispositivo.",
  },
  {
    title: "Consulta reportes y estadísticas",
    text: "Visualiza ventas, movimientos y rendimiento de tu restaurante en segundos.",
  },
];

export default function HomeFeaturesSection() {
  return (
    <>
      <section className="cm-home-features">
        <div className="landing-container">
          <header className="landing-section-header cm-home-features-header">
            <h2 className="landing-title-lg">
              Todo lo que puedes hacer con Clic Menu
            </h2>

            <p className="landing-text">
              Herramientas pensadas para ayudarte a controlar tu restaurante de
              forma clara, moderna y organizada.
            </p>
          </header>

          <div className="cm-home-features-grid">
            {features.map((item) => (
              <article className="cm-home-feature-card" key={item.title}>
                <div className="cm-home-feature-image">
                  <span>Imagen</span>
                </div>

                <div className="cm-home-feature-content">
                  <h3 className="landing-card-title cm-home-feature-title">
                    {item.title}
                  </h3>

                  <p className="landing-text cm-home-feature-text">
                    {item.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .cm-home-features {
          width: 100%;
          padding: 96px 0;
          background: var(--landing-white);
        }

        .cm-home-features-header {
          margin-bottom: 56px;
        }

        .cm-home-features-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 28px;
        }

        .cm-home-feature-card {
          display: grid;
          grid-template-columns: 190px 1fr;
          align-items: center;
          min-height: 230px;
          overflow: hidden;
          border: 1px solid var(--landing-border);
          border-radius: 34px;
          background: var(--landing-bg);
          box-shadow: var(--landing-shadow);
        }

        .cm-home-feature-image {
          height: 100%;
          min-height: 230px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--landing-orange-soft);
          color: rgba(17, 17, 17, 0.5);
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .cm-home-feature-content {
          padding: 34px;
        }

        .cm-home-feature-title {
          color: var(--landing-title);
        }

        .cm-home-feature-text {
          max-width: 360px;
          margin-top: 16px;
          color: #5f5a55;
        }

        @media (max-width: 900px) {
          .cm-home-features-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .cm-home-features {
            padding: 72px 0;
          }

          .cm-home-feature-card {
            grid-template-columns: 1fr;
          }

          .cm-home-feature-image {
            min-height: 180px;
          }

          .cm-home-feature-content {
            padding: 28px;
          }
        }
      `}</style>
    </>
  );
}