
// scripts/prerender-public.mjs
// Genera dist/landing.html desde HomePage.jsx.
// Con --preview prueba localmente la portada y las rutas de la SPA.

import React from "react";
import { renderToString } from "react-dom/server";
import createCache from "@emotion/cache";
import createEmotionServer from "@emotion/server/create-instance";
import { createServer as createViteServer } from "vite";
import { createServer as createHttpServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, "dist");
const TEMPLATE_PATH = path.join(DIST_DIR, "index.html");
const OUTPUT_PATH = path.join(DIST_DIR, "landing.html");

const ROOT_ELEMENT = '<div id="root"></div>';
const MARKER = 'data-public-prerender="home"';

// Datos estructurados de Clic Menu para buscadores.
// Se agregan únicamente a dist/landing.html.
const SOFTWARE_APPLICATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Clic Menu",
  url: "https://clicmenu.com.mx/",
  description: "Plataforma digital para restaurantes con menú QR, punto de venta, comandas, mesas, caja, inventarios y reportes.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  publisher: {
    "@type": "Organization",
    name: "Clic Menu",
    url: "https://clicmenu.com.mx/",
  },
};

async function renderHome() {
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    logLevel: "error",
    optimizeDeps: {
        noDiscovery: true,
        include: [],
    },
  });

  try {
    const module = await vite.ssrLoadModule("/src/seo/PublicPrerenderApp.jsx");
    const PublicPrerenderApp = module.default;

    if (typeof PublicPrerenderApp !== "function") {
      throw new Error("No se pudo cargar la portada original.");
    }

    const cache = createCache({ key: "css" });
    const helmetContext = {};
    const { extractCriticalToChunks, constructStyleTagsFromChunks } =
      createEmotionServer(cache);

    const content = renderToString(
      React.createElement(PublicPrerenderApp, {
        server: true,
        emotionCache: cache,
        helmetContext,
      })
    );

    const chunks = extractCriticalToChunks(content);
    const styles = constructStyleTagsFromChunks(chunks);

    return { content, styles };
  } finally {
    await vite.close();
  }
}

async function generate() {
  const template = await fs.readFile(TEMPLATE_PATH, "utf8");

  if (!template.includes(ROOT_ELEMENT)) {
    throw new Error("No se encontró el contenedor de React en dist/index.html.");
  }

  if (template.includes(MARKER)) {
    throw new Error("La plantilla principal contiene un prerenderizado anterior.");
  }

  const { content, styles } = await renderHome();

  if (!/<h1(?:\s|>)/i.test(content)) {
    throw new Error("La portada original no generó su encabezado H1.");
  }

  if (!content.includes("El control total")) {
    throw new Error("No se encontró el contenido principal de HomePage.");
  }

  if (!content.includes("Soluciones clave")) {
    throw new Error("Falta una sección original de la portada.");
  }

  if (!content.includes("Resolvemos tus dudas")) {
    throw new Error("No se generó la sección de preguntas frecuentes.");
  }

  if (!styles.includes('data-emotion="css')) {
    throw new Error("No se pudieron extraer los estilos de Material UI.");
  }

  
  const root = `<div id="root" ${MARKER}>${content}</div>`;
  const jsonLd = `<script type="application/ld+json">${JSON.stringify(SOFTWARE_APPLICATION_SCHEMA).replace(/</g, "\\u003c")}</script>`;

  const html = template
    .replace(ROOT_ELEMENT, root)
    .replace("</head>", `${styles}\n${jsonLd}\n</head>`);

  if (!html.includes(MARKER)) {
    throw new Error("No fue posible preparar el HTML de la portada.");
  }

  if (!html.includes('"@type":"SoftwareApplication"')) {
    throw new Error("No se pudieron agregar los datos estructurados SEO.");
  }

  const temporaryPath = `${OUTPUT_PATH}.tmp`;
  await fs.writeFile(temporaryPath, html, "utf8");
  await fs.rename(temporaryPath, OUTPUT_PATH);

  console.log("Portada real generada correctamente.");
  console.log("Archivo: dist/landing.html");
  console.log("Estilos de Emotion incluidos.");
  console.log("dist/index.html permanece intacto.");
}

// Servidor de prueba: únicamente localhost, nunca producción.
async function preview() {
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".xml": "application/xml; charset=utf-8",
    ".pdf": "application/pdf",
  };

  await fs.access(OUTPUT_PATH);

  const server = createHttpServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", "http://localhost");
      const pathname = decodeURIComponent(url.pathname);

      if (pathname.includes("\0") || pathname.includes("\\")) {
        response.writeHead(400);
        response.end("Solicitud no válida.");
        return;
      }

      const requested = pathname === "/" ? "/landing.html" : pathname;
      let filePath = path.resolve(DIST_DIR, `.${requested}`);

      if (filePath !== DIST_DIR && !filePath.startsWith(`${DIST_DIR}${path.sep}`)) {
        response.writeHead(403);
        response.end("Acceso denegado.");
        return;
      }

      let stat = await fs.stat(filePath).catch(() => null);

      if (stat?.isDirectory()) {
        filePath = path.join(filePath, "index.html");
        stat = await fs.stat(filePath).catch(() => null);
      }

      if (!stat?.isFile()) {
        filePath = path.join(DIST_DIR, "index.html");
      }

      const contents = await fs.readFile(filePath);
      const type = types[path.extname(filePath).toLowerCase()] || "application/octet-stream";

      response.writeHead(200, {
        "Content-Type": type,
        "Cache-Control": "no-store",
      });
      response.end(contents);
    } catch (error) {
      response.writeHead(500);
      response.end("No se pudo abrir la vista previa.");
      console.error(error);
    }
  });

  server.listen(4174, "127.0.0.1", () => {
    console.log("Vista previa: http://127.0.0.1:4174/");
    console.log("Presiona Ctrl + C para detenerla.");
  });
}

if (process.argv.includes("--preview")) {
  preview().catch((error) => {
    console.error("No se pudo iniciar la vista previa:", error);
    process.exitCode = 1;
  });
} else {
  generate().catch((error) => {
    console.error("No se pudo generar la portada:", error);
    process.exitCode = 1;
  });
}