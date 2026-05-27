import React from "react";
import { useNavigate } from "react-router-dom";

import "../../../styles/landing.css";

import HomeBenefitsSection from "../../../components/landing/home/HomeBenefitsSection";
import HomeFeaturesSection from "../../../components/landing/home/HomeFeaturesSection";
import HomeFaqSection from "../../../components/landing/home/HomeFaqSection";

import LandingFooter from "../../../components/landing/footer/LandingFooter";

export default function HomePage() {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate("/auth/register");
  };

  return (
    <>
      <main className="landing-page cm-home-page">
        {/* Navbar externo después */}

        <section className="cm-home-hero">
          <div className="cm-home-hero-inner">
            <div className="cm-home-hero-text">
              <h1 className="landing-title-xl cm-home-hero-title">
                Todo tu restaurante conectado en una sola plataforma
              </h1>

              <p className="landing-text-lg cm-home-hero-subtitle">
                Controla pedidos, mesas, cocina y ventas en tiempo real desde
                cualquier dispositivo.
              </p>

              <button
                type="button"
                onClick={handleRegister}
                className="landing-btn landing-btn-primary cm-home-hero-button"
              >
                Empezar ahora
              </button>
            </div>
          </div>
        </section>

        <HomeBenefitsSection />
        <HomeFeaturesSection />
        <HomeFaqSection />
        <LandingFooter />
        

      </main>

      <style>{`
        .cm-home-page {
          min-height: 100vh;
          background: var(--landing-white);
        }

        .cm-home-hero {
          width: 100%;
          min-height: 92vh;
          background: var(--landing-white);
        }

        .cm-home-hero-inner {
          width: min(100% - 96px, var(--landing-max-width));
          min-height: 92vh;
          margin: 0 auto;
          display: flex;
          align-items: center;
        }

        .cm-home-hero-text {
          max-width: 560px;
          padding-top: 40px;
        }

        .cm-home-hero-title {
          max-width: 540px;
          color: #4a4845;
        }

        .cm-home-hero-subtitle {
          max-width: 500px;
          margin-top: 26px;
          color: #191919;
        }

        .cm-home-hero-button {
          min-width: 240px;
          height: 48px;
          margin-top: 36px;
          padding-inline: 34px;
          text-transform: uppercase;
        }

        @media (max-width: 900px) {
          .cm-home-hero-inner {
            width: min(100% - 48px, var(--landing-max-width));
          }

          .cm-home-hero-text {
            max-width: 520px;
          }
        }

        @media (max-width: 600px) {
          .cm-home-hero,
          .cm-home-hero-inner {
            min-height: 760px;
          }

          .cm-home-hero-inner {
            width: min(100% - 32px, var(--landing-max-width));
          }

          .cm-home-hero-button {
            width: 100%;
            min-width: 0;
          }
        }
      `}</style>
    </>
  );
}