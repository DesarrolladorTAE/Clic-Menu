// Card 2: Datos principales de sucursal
import React from "react";
import { Badge } from "../../../pages/public/publicMenu.ui";

function isValidColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(color || ""));
}

function formatHours(openTime, closeTime) {
  if (!openTime && !closeTime) return "";
  if (openTime && closeTime) return `${openTime} - ${closeTime}`;
  return openTime || closeTime || "";
}

export default function PublicMenuIdentityCard({
  publicMenu,
  title,
  subtitle,
  badges = [],
  extraInfo = null,
}) {
  const themeColor = isValidColor(publicMenu?.theme_color)
    ? publicMenu.theme_color
    : "#FF7A00";

  const branch = publicMenu?.branch || {};
  const logoUrl = publicMenu?.logo_url || "";

  const branchName = branch?.name || title || "Restaurante";
  const address = branch?.address || "";
  const phone = branch?.phone || "";
  const hours = formatHours(branch?.open_time, branch?.close_time);

  return (
    <section
      className="cm-identity-card"
      style={{
        border: "1px solid rgba(47,42,61,0.10)",
        borderTop: `5px solid ${themeColor}`,
        background: "#FFFFFF",
        borderRadius: 14,
        padding: "16px clamp(14px, 3vw, 28px)",
        boxShadow: "0 14px 34px rgba(47,42,61,0.07)",
        overflow: "hidden",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        className="cm-identity-layout"
        style={{
          display: "grid",
          gridTemplateColumns: logoUrl ? "96px minmax(0, 1fr)" : "1fr",
          gap: 18,
          alignItems: "center",
          minWidth: 0,
        }}
      >
        {logoUrl ? (
          <div
            className="cm-identity-logo"
            style={{
              width: 84,
              height: 84,
              borderRadius: 22,
              background: "#FFFFFF",
              border: "1px solid rgba(47,42,61,0.08)",
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              boxShadow: "0 10px 24px rgba(47,42,61,0.08)",
              justifySelf: "center",
            }}
          >
            <img
              src={logoUrl}
              alt={`Logo ${branchName}`}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: 8,
                boxSizing: "border-box",
                display: "block",
              }}
            />
          </div>
        ) : null}

        <div
          style={{
            minWidth: 0,
            display: "grid",
            gap: 8,
            width: "100%",
          }}
        >
          <div
            className="cm-identity-title"
            style={{
              fontSize: "clamp(22px, 4vw, 30px)",
              fontWeight: 950,
              color: "#2F2A3D",
              lineHeight: 1.08,
              letterSpacing: "-0.035em",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {branchName}
          </div>

          {title || subtitle ? (
            <div
              className="cm-identity-subtitle"
              style={{
                fontSize: 13,
                color: "#5F5A6B",
                fontWeight: 850,
                lineHeight: 1.38,
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {title}
              {subtitle ? " · " : ""}
              {subtitle}
            </div>
          ) : null}

          {address ? (
            <div
              className="cm-identity-address"
              style={{
                fontSize: 13,
                color: "#5F5A6B",
                fontWeight: 750,
                lineHeight: 1.42,
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              📍 {address}
            </div>
          ) : null}

          {(phone || hours) ? (
            <div
              className="cm-identity-chips"
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
                minWidth: 0,
              }}
            >
              {phone ? <InfoChip text={`📞 ${phone}`} /> : null}
              {hours ? <InfoChip text={`🕒 ${hours}`} /> : null}
            </div>
          ) : null}

          {badges?.length ? (
            <div
              className="cm-identity-badges"
              style={{
                marginTop: 3,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
                minWidth: 0,
              }}
            >
              {badges.map((b, idx) => (
                <span
                  key={`${b?.label || idx}-${idx}`}
                  className="cm-identity-badge-wrap"
                >
                  <Badge tone={b?.tone || "default"} title={b?.title}>
                    {b?.label}
                  </Badge>
                </span>
              ))}
            </div>
          ) : null}

          {extraInfo ? (
            <div
              className="cm-identity-extra"
              style={{
                fontSize: 12,
                color: "#6E6A7A",
                fontWeight: 750,
                lineHeight: 1.4,
                overflowWrap: "anywhere",
              }}
            >
              {extraInfo}
            </div>
          ) : null}
        </div>
      </div>

      <style>
        {`
          @media (max-width: 640px) {
            .cm-identity-card {
              padding: 14px 12px !important;
              border-radius: 12px !important;
              overflow: hidden !important;
            }

            .cm-identity-layout {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
              align-items: start !important;
            }

            .cm-identity-logo {
              width: 72px !important;
              height: 72px !important;
              border-radius: 18px !important;
              justify-self: start !important;
            }

            .cm-identity-title {
              font-size: 24px !important;
              line-height: 1.08 !important;
            }

            .cm-identity-subtitle {
              font-size: 13px !important;
              line-height: 1.35 !important;
            }

            .cm-identity-address {
              font-size: 12.5px !important;
              line-height: 1.42 !important;
            }

            .cm-identity-chips {
              display: grid !important;
              grid-template-columns: 1fr !important;
              gap: 7px !important;
              align-items: stretch !important;
            }

            .cm-identity-badges {
              display: flex !important;
              flex-wrap: wrap !important;
              gap: 7px !important;
              align-items: center !important;
            }

            .cm-identity-badge-wrap {
              display: inline-flex !important;
              max-width: 100%;
              min-width: 0;
            }

            .cm-identity-badge-wrap > span {
              max-width: 100%;
              white-space: normal !important;
              text-align: center;
            }
          }

          @media (max-width: 380px) {
            .cm-identity-card {
              padding: 14px !important;
            }

            .cm-identity-title {
              font-size: 22px !important;
            }

            .cm-identity-subtitle {
              font-size: 12.5px !important;
            }

            .cm-identity-chips {
              display: grid !important;
              grid-template-columns: 1fr !important;
              align-items: stretch !important;
            }

            .cm-identity-badges {
              display: flex !important;
              flex-wrap: wrap !important;
              align-items: center !important;
            }
          }
        `}
      </style>
    </section>
  );
}

function InfoChip({ text }) {
  return (
    <span
      className="cm-identity-info-chip"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 10px",
        borderRadius: 999,
        background: "#FBF8F8",
        border: "1px solid rgba(47,42,61,0.08)",
        color: "#3F3A52",
        fontSize: 12,
        fontWeight: 850,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      {text}

      <style>
        {`
          @media (max-width: 380px) {
            .cm-identity-info-chip {
              width: 100% !important;
              white-space: normal !important;
              line-height: 1.25 !important;
            }
          }
        `}
      </style>
    </span>
  );
}