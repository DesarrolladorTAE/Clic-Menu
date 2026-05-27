import React from "react";

const faqs = [
  {
    question: "¿Clic Menu funciona para restaurantes pequeños?",
    answer:
      "Sí, Clic Menu se adapta tanto a negocios pequeños como a restaurantes con mayor operación.",
  },
  {
    question: "¿Necesito instalar equipos especiales?",
    answer:
      "No. Puedes utilizar Clic Menu desde computadora, tablet o celular.",
  },
  {
    question: "¿Puedo administrar mi menú fácilmente?",
    answer:
      "Sí, podrás agregar productos, categorías, precios e imágenes desde tu panel administrativo.",
  },
  {
    question: "¿El sistema incluye cocina y caja?",
    answer:
      "Sí, dependiendo del plan podrás gestionar cocina, pedidos, caja y flujo operativo.",
  },
];

export default function HomeFaqSection() {
  return (
    <>
      <section className="cm-home-faq">
        <div className="landing-container">
          <header className="landing-section-header cm-home-faq-header">
            <span className="landing-eyebrow">Preguntas frecuentes</span>

            <h2 className="landing-title-lg">
              Resolvemos tus dudas antes de empezar
            </h2>
          </header>

          <div className="cm-home-faq-list">
            {faqs.map((item) => (
              <article className="cm-home-faq-card" key={item.question}>
                <h3 className="landing-card-title cm-home-faq-question">
                  {item.question}
                </h3>

                <p className="landing-text cm-home-faq-answer">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .cm-home-faq {
          width: 100%;
          padding: 96px 0;
          background: var(--landing-white);
        }

        .cm-home-faq-header {
          margin-bottom: 48px;
        }

        .cm-home-faq-list {
          display: grid;
          gap: 18px;
          max-width: 920px;
          margin: 0 auto;
        }

        .cm-home-faq-card {
          padding: 30px 34px;
          border: 1px solid var(--landing-border);
          border-radius: 28px;
          --landing-bg: #fff9f0;
          box-shadow: var(--landing-shadow-soft);
        }

        .cm-home-faq-question {
          color: var(--landing-title);
        }

        .cm-home-faq-answer {
          margin-top: 12px;
          color: var(--landing-muted);
        }

        @media (max-width: 600px) {
          .cm-home-faq {
            padding: 72px 0;
          }

          .cm-home-faq-card {
            padding: 26px 24px;
            border-radius: 24px;
          }
        }
      `}</style>
    </>
  );
}