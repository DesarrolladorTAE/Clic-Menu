import publicBlogApi from "../publicBlogApi";

const SYSTEM_SLUG = "clic-menu";
const BLOG_SLUG = "blog-clicmenu";
const BLOG_BASE_ROUTE = `/public/v1/${SYSTEM_SLUG}/blogs/${BLOG_SLUG}`;

const normalizeSlug = (value) =>
  encodeURIComponent(String(value ?? "").trim());

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );

export async function getClicMenuBlog() {
  const { data } = await publicBlogApi.get(BLOG_BASE_ROUTE);

  return data?.data ?? null;
}

export async function getClicMenuBlogPosts(params = {}) {
  const { data } = await publicBlogApi.get(
    `${BLOG_BASE_ROUTE}/posts`,
    {
      params: cleanParams(params),
    }
  );

  return data;
}

export async function getClicMenuBlogPost(postSlug) {
  const slug = normalizeSlug(postSlug);

  if (!slug) {
    throw new Error(
      "El slug de la publicación es obligatorio."
    );
  }

  const { data } = await publicBlogApi.get(
    `${BLOG_BASE_ROUTE}/posts/${slug}`
  );

  return data?.data ?? null;
}

export async function getClicMenuBlogCategories(params = {}) {
  const { data } = await publicBlogApi.get(
    `${BLOG_BASE_ROUTE}/categories`,
    {
      params: cleanParams(params),
    }
  );

  return data;
}

export async function getClicMenuBlogCategoryPosts(
  categorySlug,
  params = {}
) {
  const slug = normalizeSlug(categorySlug);

  if (!slug) {
    throw new Error(
      "El slug de la categoría es obligatorio."
    );
  }

  const { data } = await publicBlogApi.get(
    `${BLOG_BASE_ROUTE}/categories/${slug}/posts`,
    {
      params: cleanParams(params),
    }
  );

  return data;
}

export async function getClicMenuBlogTags(params = {}) {
  const { data } = await publicBlogApi.get(
    `${BLOG_BASE_ROUTE}/tags`,
    {
      params: cleanParams(params),
    }
  );

  return data;
}

export async function getClicMenuBlogTagPosts(
  tagSlug,
  params = {}
) {
  const slug = normalizeSlug(tagSlug);

  if (!slug) {
    throw new Error(
      "El slug de la etiqueta es obligatorio."
    );
  }

  const { data } = await publicBlogApi.get(
    `${BLOG_BASE_ROUTE}/tags/${slug}/posts`,
    {
      params: cleanParams(params),
    }
  );

  return data;
}

export function getClicMenuBlogSitemapUrl() {
  const baseUrl = String(
    import.meta.env.VITE_BLOG_API_BASE_URL || ""
  ).replace(/\/+$/, "");

  return `${baseUrl}${BLOG_BASE_ROUTE}/sitemap.xml`;
}