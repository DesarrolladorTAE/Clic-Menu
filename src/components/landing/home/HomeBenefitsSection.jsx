import React from "react";

const benefits = [
  {
    title: "Pedidos más rápidos",
    text: "Reduce tiempos de atención y mejora el flujo del restaurante.",
    icon: "📱",
  },
  {
    title: "Control total",
    text: "Administra mesas, ventas y pedidos desde una sola plataforma.",
    icon: "▭",
  },
  {
    title: "Menos errores en cocina",
    text: "Las órdenes llegan claras y organizadas en tiempo real.",
    icon: "◉",
  },
];

export default function HomeBenefitsSection() {
  return (
    <>
      <section className="cm-home-benefits">
        <div className="landing-container">
          <h2 className="landing-title-lg cm-home-benefits-title">
            Mejora la operación de tu restaurante
          </h2>

          <div className="cm-home-benefits-grid">
            {benefits.map((item) => (
              <article className="cm-home-benefit-item" key={item.title}>
                <div className="cm-home-benefit-icon">{item.icon}</div>

                <h3 className="landing-card-title cm-home-benefit-title">
                  {item.title}
                </h3>

                <p className="landing-text cm-home-benefit-text">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .cm-home-benefits {
          width: 100%;
          padding: 82px 0 88px;
          background: var(--landing-white);
        }

        .cm-home-benefits-title {
          max-width: 620px;
          margin: 0 auto 58px;
          text-align: center;
          color: #111111;
        }

        .cm-home-benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 48px;
          align-items: start;
        }

        .cm-home-benefit-item {
          text-align: center;
        }

        .cm-home-benefit-icon {
          width: 108px;
          height: 108px;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--landing-terracotta);
          font-size: 58px;
          line-height: 1;
        }

        .cm-home-benefit-title {
          color: #111111;
        }

        .cm-home-benefit-text {
          max-width: 290px;
          margin: 18px auto 0;
          color: #111111;
          line-height: 1.42;
        }

        @media (max-width: 900px) {
          .cm-home-benefits-grid {
            grid-template-columns: 1fr;
            gap: 46px;
          }
        }

        @media (max-width: 600px) {
          .cm-home-benefits {
            padding: 70px 0;
          }
        }
      `}</style>
    </>
  );
}