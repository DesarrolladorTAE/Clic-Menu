// scripts/prerender-blog.mjs
import axios from "axios";
import { loadEnv } from "vite";
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, "dist");
const TEMPLATE_PATH = path.join(
  DIST_DIR,
  "index.html"
);

const env = loadEnv(
  process.env.MODE || "production",
  ROOT_DIR,
  ""
);

const SYSTEM_SLUG = "clic-menu";
const BLOG_SLUG = "blog-clicmenu";

const BLOG_ROUTE =
  `/public/v1/${SYSTEM_SLUG}/blogs/${BLOG_SLUG}`;

const DEFAULT_SITE_URL =
  "https://clicmenu.com.mx";

const DEFAULT_IMAGE =
  `${DEFAULT_SITE_URL}/images/seo/clic-menu-preview.png`;

const SITE_URL = normalizeBaseUrl(
  env.VITE_PUBLIC_SITE_URL ||
    env.VITE_SITE_URL ||
    DEFAULT_SITE_URL
);

const API_BASE_URL = normalizeApiBaseUrl(
  env.VITE_BLOG_API_BASE_URL ||
    "https://api.tecnologiasadministrativas.com/api"
);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

function normalizeBaseUrl(value) {
  return String(value || "")
    .trim()
    .replace(/\/+$/, "");
}

function normalizeApiBaseUrl(value) {
  const baseUrl = normalizeBaseUrl(value);

  if (baseUrl.endsWith("/api")) {
    return baseUrl;
  }

  return `${baseUrl}/api`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeJsonForHtml(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function normalizeKeywords(value) {
  if (Array.isArray(value)) {
    return value
      .filter(
        (item) =>
          typeof item === "string" &&
          item.trim() !== ""
      )
      .map((item) => item.trim())
      .join(", ");
  }

  return typeof value === "string"
    ? value.trim()
    : "";
}

function unwrapEntity(payload) {
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    payload.data &&
    typeof payload.data === "object" &&
    !Array.isArray(payload.data)
  ) {
    return payload.data;
  }

  return payload;
}

function unwrapItems(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  return [];
}

function resolveLastPage(payload) {
  const candidates = [
    payload?.meta?.last_page,
    payload?.last_page,
    payload?.data?.meta?.last_page,
    payload?.data?.last_page,
  ];

  const value = candidates.find(
    (candidate) =>
      Number.isFinite(Number(candidate)) &&
      Number(candidate) > 0
  );

  return Number(value || 1);
}

async function getJson(
  route,
  params = {}
) {
  const response = await api.get(route, {
    params,
  });

  return response.data;
}

async function getAllPages(
  route,
  extraParams = {}
) {
  const records = [];

  let page = 1;
  let lastPage = 1;

  do {
    const payload = await getJson(route, {
      ...extraParams,
      page,
      per_page: 50,
    });

    records.push(
      ...unwrapItems(payload)
    );

    lastPage =
      resolveLastPage(payload);

    page += 1;
  } while (page <= lastPage);

  return records;
}

function deduplicateBySlug(items) {
  const seen = new Set();

  return items.filter((item) => {
    const slug = String(
      item?.slug || ""
    ).trim();

    if (!slug || seen.has(slug)) {
      return false;
    }

    seen.add(slug);

    return true;
  });
}

function assertSafeSlug(
  value,
  label
) {
  const slug = String(
    value || ""
  ).trim();

  if (
    !slug ||
    !/^[a-z0-9][a-z0-9_-]*$/i.test(
      slug
    )
  ) {
    throw new Error(
      `${label} inválido para prerenderizado: ${slug}`
    );
  }

  return slug;
}

function removeExistingSeo(html) {
  let result = html;

  /*
   * Eliminar el título existente.
   */
  result = result.replace(
    /<title\b[^>]*>[\s\S]*?<\/title>\s*/gi,
    ""
  );

  /*
   * Metadatos que serán sustituidos
   * por los específicos de cada ruta.
   */
  const metaKeys = [
    "description",
    "keywords",
    "robots",

    "og:type",
    "og:title",
    "og:description",
    "og:image",
    "og:image:secure_url",
    "og:image:width",
    "og:image:height",
    "og:image:alt",
    "og:url",
    "og:site_name",

    "article:published_time",
    "article:modified_time",
    "article:section",
    "article:tag",

    "twitter:card",
    "twitter:title",
    "twitter:description",
    "twitter:image",

    "theme-color",
    "author",
  ]
    .map((item) =>
      item.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      )
    )
    .join("|");

  result = result.replace(
    new RegExp(
      `<meta\\b(?=[^>]*(?:name|property)=["'](?:${metaKeys})["'])[^>]*\\/?>\\s*`,
      "gi"
    ),
    ""
  );

  /*
   * Eliminar canonical existente.
   */
  result = result.replace(
    /<link\b(?=[^>]*rel=["']canonical["'])[^>]*\/?>\s*/gi,
    ""
  );

  /*
   * Eliminar JSON-LD generado anteriormente
   * por este mismo script.
   */
  result = result.replace(
    /<script\b(?=[^>]*data-blog-structured-data=["']true["'])[^>]*>[\s\S]*?<\/script>\s*/gi,
    ""
  );

  return result;
}

function normalizeMeta(
  entity,
  kind
) {
  const seo =
    entity?.seo || {};

  const openGraph =
    entity?.open_graph || {};

  const fallbackTitle =
    entity?.title ||
    entity?.name ||
    "Blog Clic Menu";

  const rawTitle =
    seo.title ||
    fallbackTitle;

  const title = String(
    rawTitle
  ).includes("Clic Menu")
    ? String(rawTitle)
    : `${rawTitle} | Clic Menu`;

  const description =
    seo.description ||
    entity?.excerpt ||
    entity?.description ||
    "Contenido relacionado con restaurantes, menús digitales, ventas y administración gastronómica.";

  const canonicalUrl =
    seo.canonical_url ||
    openGraph.url ||
    entity?.url ||
    (
      kind === "blog"
        ? `${SITE_URL}/blog`
        : SITE_URL
    );

  const imageObject =
    openGraph.image ||
    entity?.cover ||
    {};

  const imageUrl =
    imageObject?.url ||
    DEFAULT_IMAGE;

  const ogTitle =
    openGraph.title ||
    title;

  const ogDescription =
    openGraph.description ||
    description;

  const robots = [
    seo.robots_index === false
      ? "noindex"
      : "index",

    seo.robots_follow === false
      ? "nofollow"
      : "follow",
  ].join(", ");

  return {
    title,
    description,

    keywords: normalizeKeywords(
      seo.keywords
    ),

    canonicalUrl,

    imageUrl,

    imageWidth:
      Number(
        imageObject?.width
      ) || null,

    imageHeight:
      Number(
        imageObject?.height
      ) || null,

    imageAlt:
      imageObject?.alt_text ||
      openGraph.title ||
      entity?.title ||
      entity?.name ||
      "Clic Menu",

    ogType:
      openGraph.type ||
      (
        kind === "post"
          ? "article"
          : "website"
      ),

    ogTitle,
    ogDescription,
    robots,

    publishedTime:
      entity?.published_at ||
      null,

    modifiedTime:
      entity?.updated_at ||
      null,

    section:
      entity?.category?.name ||
      null,

    tags: Array.isArray(
      entity?.tags
    )
      ? entity.tags
          .map((tag) =>
            typeof tag === "string"
              ? tag
              : tag?.name
          )
          .filter(Boolean)
      : [],

    structuredData:
      entity?.structured_data ||
      null,
  };
}

function createSeoMarkup(meta) {
  const lines = [
    `    <title>${escapeHtml(
      meta.title
    )}</title>`,

    "",

    `    <meta name="description" content="${escapeHtml(
      meta.description
    )}" />`,
  ];

  if (meta.keywords) {
    lines.push(
      `    <meta name="keywords" content="${escapeHtml(
        meta.keywords
      )}" />`
    );
  }

  lines.push(
    `    <meta name="robots" content="${escapeHtml(
      meta.robots
    )}" />`,

    `    <link rel="canonical" href="${escapeHtml(
      meta.canonicalUrl
    )}" />`,

    "",

    `    <meta property="og:type" content="${escapeHtml(
      meta.ogType
    )}" />`,

    `    <meta property="og:title" content="${escapeHtml(
      meta.ogTitle
    )}" />`,

    `    <meta property="og:description" content="${escapeHtml(
      meta.ogDescription
    )}" />`,

    `    <meta property="og:image" content="${escapeHtml(
      meta.imageUrl
    )}" />`,

    `    <meta property="og:image:secure_url" content="${escapeHtml(
      meta.imageUrl
    )}" />`,

    `    <meta property="og:image:alt" content="${escapeHtml(
      meta.imageAlt
    )}" />`
  );

  if (meta.imageWidth) {
    lines.push(
      `    <meta property="og:image:width" content="${meta.imageWidth}" />`
    );
  }

  if (meta.imageHeight) {
    lines.push(
      `    <meta property="og:image:height" content="${meta.imageHeight}" />`
    );
  }

  lines.push(
    `    <meta property="og:url" content="${escapeHtml(
      meta.canonicalUrl
    )}" />`,

    `    <meta property="og:site_name" content="Clic Menu" />`
  );

  if (
    meta.ogType === "article" &&
    meta.publishedTime
  ) {
    lines.push(
      `    <meta property="article:published_time" content="${escapeHtml(
        meta.publishedTime
      )}" />`
    );
  }

  if (
    meta.ogType === "article" &&
    meta.modifiedTime
  ) {
    lines.push(
      `    <meta property="article:modified_time" content="${escapeHtml(
        meta.modifiedTime
      )}" />`
    );
  }

  if (
    meta.ogType === "article" &&
    meta.section
  ) {
    lines.push(
      `    <meta property="article:section" content="${escapeHtml(
        meta.section
      )}" />`
    );
  }

  if (
    meta.ogType === "article" &&
    Array.isArray(meta.tags)
  ) {
    for (const tag of meta.tags) {
      lines.push(
        `    <meta property="article:tag" content="${escapeHtml(
          tag
        )}" />`
      );
    }
  }

  lines.push(
    "",

    `    <meta name="twitter:card" content="summary_large_image" />`,

    `    <meta name="twitter:title" content="${escapeHtml(
      meta.ogTitle
    )}" />`,

    `    <meta name="twitter:description" content="${escapeHtml(
      meta.ogDescription
    )}" />`,

    `    <meta name="twitter:image" content="${escapeHtml(
      meta.imageUrl
    )}" />`,

    "",

    `    <meta name="theme-color" content="#C95A3B" />`,

    `    <meta name="author" content="Clic Menu" />`
  );

  if (meta.structuredData) {
    lines.push(
      "",

      `    <script type="application/ld+json" data-blog-structured-data="true">${escapeJsonForHtml(
        meta.structuredData
      )}</script>`
    );
  }

  return lines.join("\n");
}

function injectSeo(
  template,
  meta
) {
  const cleanTemplate =
    removeExistingSeo(
      template
    );

  const markup =
    createSeoMarkup(meta);

  if (
    !/<\/head>/i.test(
      cleanTemplate
    )
  ) {
    throw new Error(
      "No se encontró </head> en dist/index.html."
    );
  }

  return cleanTemplate.replace(
    /<\/head>/i,
    `${markup}\n  </head>`
  );
}

async function writeRouteHtml(
  routePath,
  html
) {
  const segments = routePath
    .split("/")
    .filter(Boolean)
    .map((segment) =>
      assertSafeSlug(
        segment,
        "Segmento de ruta"
      )
    );

  const outputDir = path.join(
    DIST_DIR,
    ...segments
  );

  await fs.mkdir(
    outputDir,
    {
      recursive: true,
    }
  );

  const outputPath =
    path.join(
      outputDir,
      "index.html"
    );

  await fs.writeFile(
    outputPath,
    html,
    "utf8"
  );

  return outputPath;
}

async function mapWithConcurrency(
  items,
  limit,
  callback
) {
  const results = [];

  let cursor = 0;

  async function worker() {
    while (
      cursor < items.length
    ) {
      const currentIndex =
        cursor;

      cursor += 1;

      results[currentIndex] =
        await callback(
          items[currentIndex],
          currentIndex
        );
    }
  }

  const workers =
    Array.from(
      {
        length: Math.min(
          limit,
          items.length
        ),
      },
      () => worker()
    );

  await Promise.all(workers);

  return results;
}

function buildFilteredPageEntity(
  item,
  type
) {
  const label =
    type === "category"
      ? "categoría"
      : "etiqueta";

  const routeSegment =
    type === "category"
      ? "categorias"
      : "etiquetas";

  const name =
    item?.name ||
    item?.title ||
    item?.slug;

  const canonicalUrl =
    item?.url ||
    `${SITE_URL}/blog/${routeSegment}/${item.slug}`;

  return {
    ...item,

    name,

    url: canonicalUrl,

    seo: {
      ...(item?.seo || {}),

      title:
        item?.seo?.title ||
        `${name} | Blog Clic Menu`,

      description:
        item?.seo?.description ||
        `Publicaciones de la ${label} ${name}.`,

      canonical_url:
        item?.seo?.canonical_url ||
        canonicalUrl,
    },

    open_graph: {
      ...(item?.open_graph || {}),

      type:
        item?.open_graph?.type ||
        "website",

      title:
        item?.open_graph?.title ||
        `${name} | Blog Clic Menu`,

      description:
        item?.open_graph
          ?.description ||
        `Publicaciones de la ${label} ${name}.`,

      url:
        item?.open_graph?.url ||
        canonicalUrl,

      image:
        item?.open_graph?.image ||
        {
          url: DEFAULT_IMAGE,
        },
    },
  };
}

async function main() {
  /*
   * Leer el index generado por Vite.
   */
  const template =
    await fs.readFile(
      TEMPLATE_PATH,
      "utf8"
    );

  console.log(
    `API del blog: ${API_BASE_URL}${BLOG_ROUTE}`
  );

  /*
   * Prerenderizar página principal
   * del blog.
   */
  const blogPayload =
    await getJson(
      BLOG_ROUTE
    );

  const blog =
    unwrapEntity(
      blogPayload
    );

  if (!blog) {
    throw new Error(
      "La API no devolvió la información del blog."
    );
  }

  const generatedFiles = [];

  const blogHtml =
    injectSeo(
      template,
      normalizeMeta(
        blog,
        "blog"
      )
    );

  generatedFiles.push(
    await writeRouteHtml(
      "/blog",
      blogHtml
    )
  );

  /*
   * Obtener todas las publicaciones.
   */
  const postSummaries =
    deduplicateBySlug(
      await getAllPages(
        `${BLOG_ROUTE}/posts`,
        {
          order: "latest",
        }
      )
    );

  /*
   * Prerenderizar cada publicación.
   */
  await mapWithConcurrency(
    postSummaries,
    5,
    async (postSummary) => {
      const slug =
        assertSafeSlug(
          postSummary.slug,
          "Slug de publicación"
        );

      const postPayload =
        await getJson(
          `${BLOG_ROUTE}/posts/${encodeURIComponent(
            slug
          )}`
        );

      const post =
        unwrapEntity(
          postPayload
        );

      if (!post) {
        throw new Error(
          `No fue posible obtener la publicación ${slug}.`
        );
      }

      const postHtml =
        injectSeo(
          template,
          normalizeMeta(
            post,
            "post"
          )
        );

      generatedFiles.push(
        await writeRouteHtml(
          `/blog/${slug}`,
          postHtml
        )
      );
    }
  );

  /*
   * Prerenderizar categorías.
   * Si la API no entrega categorías,
   * no se interrumpe el build completo.
   */
  try {
    const categories =
      deduplicateBySlug(
        await getAllPages(
          `${BLOG_ROUTE}/categories`
        )
      );

    for (
      const category of categories
    ) {
      const slug =
        assertSafeSlug(
          category.slug,
          "Slug de categoría"
        );

      const pageEntity =
        buildFilteredPageEntity(
          category,
          "category"
        );

      generatedFiles.push(
        await writeRouteHtml(
          `/blog/categorias/${slug}`,

          injectSeo(
            template,
            normalizeMeta(
              pageEntity,
              "category"
            )
          )
        )
      );
    }
  } catch (error) {
    console.warn(
      "No se prerenderizaron las categorías:",
      error?.message ||
        error
    );
  }

  /*
   * Prerenderizar etiquetas.
   * Si la API no entrega etiquetas,
   * no se interrumpe el build completo.
   */
  try {
    const tags =
      deduplicateBySlug(
        await getAllPages(
          `${BLOG_ROUTE}/tags`
        )
      );

    for (
      const tag of tags
    ) {
      const slug =
        assertSafeSlug(
          tag.slug,
          "Slug de etiqueta"
        );

      const pageEntity =
        buildFilteredPageEntity(
          tag,
          "tag"
        );

      generatedFiles.push(
        await writeRouteHtml(
          `/blog/etiquetas/${slug}`,

          injectSeo(
            template,
            normalizeMeta(
              pageEntity,
              "tag"
            )
          )
        )
      );
    }
  } catch (error) {
    console.warn(
      "No se prerenderizaron las etiquetas:",
      error?.message ||
        error
    );
  }

  console.log("");

  console.log(
    "Prerenderizado del blog completado."
  );

  console.log(
    `Archivos generados: ${generatedFiles.length}`
  );

  generatedFiles.forEach(
    (filePath) => {
      console.log(
        `- ${path.relative(
          ROOT_DIR,
          filePath
        )}`
      );
    }
  );
}

main().catch((error) => {
  console.error("");

  console.error(
    "Falló el prerenderizado del blog."
  );

  console.error(
    error?.response?.data ||
      error?.message ||
      error
  );

  process.exitCode = 1;
});