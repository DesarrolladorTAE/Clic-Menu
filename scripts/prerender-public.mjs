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

const CONTACT_OUTPUT_PATH = path.join(
  DIST_DIR,
  "contacto",
  "index.html"
);

const PLANS_OUTPUT_PATH = path.join(
  DIST_DIR,
  "planes",
  "index.html"
);

const TERMS_OUTPUT_PATH = path.join(
  DIST_DIR,
  "terminos-y-condiciones",
  "index.html"
);

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

const CONTACT_SEO = {
  title: "Contacta Clic Menu | Digitaliza tu Restaurante",

  description:
    "Habla con el equipo de Clic Menu y comienza a digitalizar la operación de tu restaurante con menú QR y herramientas administrativas.",

  keywords:
    "contactar software restaurante, asesoría sistema restaurante, digitalizar restaurante, implementar menú qr",

  url: "https://clicmenu.com.mx/contacto",
};

const PLANS_SEO = {
  title: "Planes Clic Menu | Software para Restaurantes a tu Medida",

  description:
    "Conoce los planes de Clic Menu y elige las herramientas que necesita tu restaurante: menú QR, ventas, inventarios, reportes y más.",

  keywords:
    "planes software restaurante, precio punto de venta restaurante, sistema restaurante mensual, menú digital qr precio",

  url: "https://clicmenu.com.mx/planes",
};

const TERMS_SEO = {
  title: "Términos y Condiciones | Clic Menu",

  description:
    "Consulta los términos, condiciones de uso y políticas aplicables al servicio de Clic Menu.",

  keywords:
    "terminos clic menu, condiciones servicio clic menu",

  url: "https://clicmenu.com.mx/terminos-y-condiciones",
};

function escapeHtmlAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Modifica un atributo concreto de una etiqueta existente.
// Conserva los demás atributos, incluidos data-default-seo.
function replaceTagAttribute(
  html,
  tagName,
  identifierName,
  identifierValue,
  targetName,
  newValue,
  required = true
) {
  const tagRegex = new RegExp(
    `<${tagName}\\b[^>]*>`,
    "gi"
  );

  const identifierRegex = new RegExp(
    `\\b${identifierName}\\s*=\\s*(["'])${escapeRegex(identifierValue)}\\1`,
    "i"
  );

  const targetRegex = new RegExp(
    `\\b${targetName}\\s*=\\s*(["'])(.*?)\\1`,
    "i"
  );

  let matches = 0;

  const updated = html.replace(tagRegex, (tag) => {
    if (!identifierRegex.test(tag)) {
      return tag;
    }

    matches += 1;

    if (!targetRegex.test(tag)) {
      throw new Error(
        `La etiqueta ${tagName} no contiene ${targetName}.`
      );
    }

    return tag.replace(
      targetRegex,
      `${targetName}="${escapeHtmlAttribute(newValue)}"`
    );
  });

  if (required && matches !== 1) {
    throw new Error(
      `Se esperaba una etiqueta ${tagName} identificada por ${identifierValue}. Encontradas: ${matches}.`
    );
  }

  if (!required && matches > 1) {
    throw new Error(
      `Existen etiquetas duplicadas para ${identifierValue}.`
    );
  }

  return updated;
}

function preparePageSeo(template, seo) {
  const titleRegex =
    /(<title\b[^>]*>)[\s\S]*?(<\/title>)/gi;

  const titles = template.match(titleRegex) || [];

  if (titles.length !== 1) {
    throw new Error(
      "La plantilla debe contener exactamente un título SEO."
    );
  }

  let html = template.replace(
    titleRegex,
    (_, opening, closing) => {
      return (
        opening +
        seo.title +
        closing
      );
    }
  );

  // Meta description obligatoria.
  html = replaceTagAttribute(
    html,
    "meta",
    "name",
    "description",
    "content",
    seo.description
  );

  // Canonical obligatoria.
  html = replaceTagAttribute(
    html,
    "link",
    "rel",
    "canonical",
    "href",
    seo.url
  );

  // Keywords y metadatos sociales, cuando existan
  // en la plantilla original.
  const optionalMeta = [
    ["name", "keywords", seo.keywords],
    ["property", "og:title", seo.title],
    ["property", "og:description", seo.description],
    ["property", "og:url", seo.url],
    ["name", "twitter:title", seo.title],
    ["name", "twitter:description", seo.description],
  ];

  for (const [
    identifierName,
    identifierValue,
    value,
  ] of optionalMeta) {
    html = replaceTagAttribute(
      html,
      "meta",
      identifierName,
      identifierValue,
      "content",
      value,
      false
    );
  }

  return html;
}

async function renderPage(page = "home") {
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
        page,
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

  const { content, styles } = await renderPage("home");

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

  await generateContact(template);
  await generatePlans(template);
  await generateTerms(template);
}

async function generateContact(template) {
  const { content, styles } = await renderPage("contact");

  if (!/<h1(?:\s|>)/i.test(content)) {
    throw new Error(
      "La página de Contacto no generó su H1."
    );
  }

  if (
    !content.includes(
      "Estamos listos para ayudarte a digitalizar tu operación"
    )
  ) {
    throw new Error(
      "No se encontró el contenido principal de Contacto."
    );
  }

  if (!content.includes("Contactar por WhatsApp")) {
    throw new Error(
      "No se generó la sección de contacto por WhatsApp."
    );
  }

  if (!styles.includes('data-emotion="css')) {
    throw new Error(
      "No se pudieron extraer los estilos de Contacto."
    );
  }

  const contactTemplate = preparePageSeo(
    template,
    CONTACT_SEO
  );

  const root =
    `<div id="root" data-public-prerender="contact">${content}</div>`;

  const html = contactTemplate
    .replace(ROOT_ELEMENT, root)
    .replace("</head>", `${styles}\n</head>`);

  if (
    !html.includes(
      'data-public-prerender="contact"'
    )
  ) {
    throw new Error(
      "No fue posible preparar el HTML de Contacto."
    );
  }

  if (
    !html.includes(
      'https://clicmenu.com.mx/contacto'
    )
  ) {
    throw new Error(
      "La página de Contacto no contiene su URL canónica."
    );
  }

  const directory = path.dirname(CONTACT_OUTPUT_PATH);

  await fs.mkdir(directory, {
    recursive: true,
  });

  const temporaryPath = `${CONTACT_OUTPUT_PATH}.tmp`;

  await fs.writeFile(
    temporaryPath,
    html,
    "utf8"
  );

  await fs.rename(
    temporaryPath,
    CONTACT_OUTPUT_PATH
  );

  console.log("Página de Contacto generada correctamente.");
  console.log("Archivo: dist/contacto/index.html");
  console.log("SEO y estilos incluidos.");
}

async function generatePlans(template) {
  const { content, styles } = await renderPage("plans");

  const h1Count = (content.match(/<h1(?:\s|>)/gi) || []).length;

  if (h1Count !== 1) {
    throw new Error(`La página de Planes debe tener un H1. Encontrados: ${h1Count}.`);
  }

  if (!content.includes("Elige cómo quieres operar tu restaurante")) {
    throw new Error("No se encontró el encabezado principal de Planes.");
  }

  if (!content.includes("Tenemos opciones para empezar fácil")) {
    throw new Error("No se encontró el contenido informativo de Planes.");
  }

  if (!content.includes("Cargando planes...")) {
    throw new Error("El prerenderizado de Planes no conserva el estado de carga." );
  }

  if (!styles.includes('data-emotion="css')) {
    throw new Error( "No se pudieron extraer los estilos de Material UI.");
  }

  const plansTemplate = preparePageSeo(
    template,
    PLANS_SEO
  );

  const marker = 'data-public-prerender="plans"';

  const root = `<div id="root" ${marker}>${content}</div>`;

  const html = plansTemplate
    .replace(ROOT_ELEMENT, root)
    .replace("</head>", `${styles}\n</head>`);

  if (!html.includes(marker)) {
    throw new Error("No fue posible agregar el marcador de Planes.");
  }

  if ( !html.includes('href="https://clicmenu.com.mx/planes"')) {
    throw new Error("La página de Planes no contiene su canonical correcta.");
  }

  await fs.mkdir(
    path.dirname(PLANS_OUTPUT_PATH),
    {
      recursive: true,
    }
  );

  const temporaryPath = `${PLANS_OUTPUT_PATH}.tmp`;

  await fs.writeFile(
    temporaryPath,
    html,
    "utf8"
  );

  await fs.rename(
    temporaryPath,
    PLANS_OUTPUT_PATH
  );

  console.log("Página de Planes generada correctamente.");
  console.log("Archivo: dist/planes/index.html");
  console.log("Contenido informativo y H1 incluidos.");
  console.log("Precios dinámicos conservados.");
}

async function generateTerms(template) {
  const { content, styles } = await renderPage("terms");

  /*
   * Validar que exista exactamente un H1.
   */
  const h1Count =(content.match(/<h1(?:\s|>)/gi) || []).length;
 
  if (h1Count !== 1) {
    throw new Error(`La página de Términos debe tener un H1. Encontrados: ${h1Count}.`);
  }

  /*
   * Verificar el contenido informativo.
   */
  if (!content.includes("Términos y Condiciones")) {
    throw new Error("No se encontró el encabezado de Términos y Condiciones.");
  }

  if (!content.includes("Consulta las condiciones de uso de Clic Menu")
  ) {
    throw new Error("No se encontró la descripción de Términos y Condiciones.");
  }

  /*
   * El documento legal seguirá cargándose desde Laravel.
   * No almacenamos una versión del documento durante el build.
   */
  if (!content.includes("Cargando términos y condiciones...")) {
    throw new Error("El prerenderizado no conserva el estado de carga del documento.");
  }

  /*
   * Validar estilos de Material UI.
   */
  if (!styles.includes('data-emotion="css')) {
    throw new Error( "No se pudieron extraer los estilos de Términos y Condiciones.");
  }

  /*
   * Preparar metadatos propios de esta página.
   */
  const termsTemplate = preparePageSeo(
    template,
    TERMS_SEO
  );

  const marker ='data-public-prerender="terms"';

  const root =`<div id="root" ${marker}>${content}</div>`;

  const html = termsTemplate
    .replace(ROOT_ELEMENT, root)
    .replace("</head>", `${styles}\n</head>`);

  /*
   * Validar el resultado.
   */
  if (!html.includes(marker)) {
    throw new Error("No fue posible agregar el marcador de Términos.");
  }

  if (!html.includes('href="https://clicmenu.com.mx/terminos-y-condiciones"')) {
    throw new Error("La página de Términos no contiene su canonical correcta.");
  }

  /*
   * Crear directorio de salida.
   */
  await fs.mkdir(
    path.dirname(TERMS_OUTPUT_PATH),
    {
      recursive: true,
    }
  );

  /*
   * Guardar el HTML.
   */
  const temporaryPath = `${TERMS_OUTPUT_PATH}.tmp`;

  await fs.writeFile(
    temporaryPath,
    html,
    "utf8"
  );

  await fs.rename(
    temporaryPath,
    TERMS_OUTPUT_PATH
  );

  console.log("Página de Términos y Condiciones generada correctamente.");

  console.log("Archivo: dist/terminos-y-condiciones/index.html");

  console.log( "Contenido informativo y H1 incluidos.");

  console.log( "Documento legal dinámico conservado.");
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