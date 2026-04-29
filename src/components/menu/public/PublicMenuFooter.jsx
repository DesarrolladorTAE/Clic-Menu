//Card 5: Pie de pagina, redes sociales
import React from "react";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import InstagramIcon from "@mui/icons-material/Instagram";
import MusicNoteRoundedIcon from "@mui/icons-material/MusicNoteRounded";

function isValidColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(color || ""));
}

export default function PublicMenuFooter({ publicMenu, restaurantName }) {
  const themeColor = isValidColor(publicMenu?.theme_color)
    ? publicMenu.theme_color
    : "#111111";

  const branch = publicMenu?.branch || {};
  const logoUrl = publicMenu?.logo_url || "";

  const displayRestaurantName =
    restaurantName || publicMenu?.restaurant?.trade_name || "Restaurante";

  const branchName = branch?.name || "Sucursal";

  const links = [
    {
      key: "facebook",
      label: "Facebook",
      icon: <FacebookRoundedIcon />,
      url: publicMenu?.social_links?.facebook,
    },
    {
      key: "instagram",
      label: "Instagram",
      icon: <InstagramIcon />,
      url: publicMenu?.social_links?.instagram,
    },
    {
      key: "tiktok",
      label: "TikTok",
      icon: <MusicNoteRoundedIcon />,
      url: publicMenu?.social_links?.tiktok,
    },
  ].filter((item) => !!String(item.url || "").trim());

  const hasLinks = links.length > 0;

  return (
    <footer
      style={{
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
        marginTop: 0,
        background: themeColor,
        color: "#FFFFFF",
        padding: "34px 16px 30px",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "grid",
          justifyItems: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            fontSize: "clamp(19px, 4vw, 28px)",
            fontWeight: 950,
            letterSpacing: "0.02em",
            lineHeight: 1.1,
          }}
        >
          {hasLinks ? "¿Ya nos sigues?" : "Gracias por visitarnos"}
        </div>

        {hasLinks ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            {links.map((item) => (
              <a
                key={item.key}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                title={item.label}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.20)",
                  color: "#FFFFFF",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  boxShadow: "0 12px 26px rgba(0,0,0,0.22)",
                  transition: "transform 180ms ease, background 180ms ease",
                }}
              >
                {React.cloneElement(item.icon, {
                  sx: { fontSize: 27 },
                })}
              </a>
            ))}
          </div>
        ) : null}

        <p
          style={{
            maxWidth: 720,
            margin: 0,
            color: "rgba(255,255,255,0.78)",
            fontSize: 13,
            lineHeight: 1.55,
            fontWeight: 650,
          }}
        >
          Gracias por tomarte el tiempo de revisar nuestro menú. Esperamos que
          encuentres algo que se te antoje y disfrutes tu experiencia con
          nosotros.
        </p>

        {logoUrl ? (
          <div
            style={{
              width: 74,
              height: 74,
              borderRadius: 20,
              background: "#FFFFFF",
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              boxShadow: "0 16px 34px rgba(0,0,0,0.24)",
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
            color: "rgba(255,255,255,0.88)",
            fontSize: 13,
            fontWeight: 800,
            lineHeight: 1.35,
          }}
        >
          {displayRestaurantName} <span style={{ opacity: 0.55 }}>|</span>{" "}
          {branchName}
        </div>
      </div>
    </footer>
  );
}