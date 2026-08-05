import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import LandingMenu from "../../../components/landing/menu/LandingMenu";
import LandingFooter from "../../../components/landing/footer/LandingFooter";
import SEO from "../../../components/seo/SEO";

import {
  landingButtonSx,
  landingColors,
} from "../../../theme/landingTheme";

import {
  getClicMenuBlogPost,
  getClicMenuBlogPosts,
} from "../../../services/public/clicMenuBlog.service";

const COLORS = {
  ink: "#14213D",
  text: "#334155",
  muted: "#64748B",
  border: "rgba(20, 33, 61, 0.09)",
  surface: "#FFFFFF",
  surfaceSoft: "#FFF9F5",
  orange: landingColors.primary,
  orangeSoft: "#FFF0E7",
};

const CARD_SHADOW =
  "0 20px 60px rgba(20, 33, 61, 0.075)";

const SIDEBAR_SHADOW =
  "0 16px 42px rgba(20, 33, 61, 0.065)";

function formatPublishedDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function unwrapApiData(value) {
  let current = value;

  for (let index = 0; index < 3; index += 1) {
    if (
      current &&
      typeof current === "object" &&
      !Array.isArray(current) &&
      current.data &&
      typeof current.data === "object" &&
      !Array.isArray(current.data) &&
      !current.title &&
      !current.slug
    ) {
      current = current.data;
      continue;
    }

    break;
  }

  return current;
}

function normalizeCollection(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  return [];
}

function getPostAds(post) {
  if (!post || typeof post !== "object") {
    return [];
  }

  const candidates = [
    post.ads,
    post.advertisements,
    post.blog_post_ads,
    post.blogPostAds,
  ];

  for (const candidate of candidates) {
    const items = normalizeCollection(candidate);

    if (items.length > 0) {
      return items;
    }
  }

  return [];
}

function getAdImages(ad) {
  if (!ad || typeof ad !== "object") {
    return [];
  }

  const candidates = [
    ad.images,
    ad.media,
    ad.media_items,
    ad.ad_images,
    ad.blog_post_ad_images,
  ];

  for (const candidate of candidates) {
    const items = normalizeCollection(candidate);

    if (items.length > 0) {
      return items;
    }
  }

  return [];
}

function getMediaUrl(image) {
  const candidates = [
    image?.media?.url,
    image?.media?.public_url,
    image?.media?.original_url,
    image?.media?.src,
    image?.url,
    image?.public_url,
    image?.image_url,
    image?.media_url,
    image?.src,
  ];

  const resolvedUrl = candidates.find(
    (value) =>
      typeof value === "string" &&
      value.trim() !== ""
  );

  return resolvedUrl?.trim() || "";
}

function isDirectImageUrl(value = "") {
  const normalizedValue = String(value)
    .trim()
    .toLowerCase();

  return (
    /^https?:\/\//i.test(normalizedValue) &&
    /\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$/i.test(
      normalizedValue
    )
  );
}

function cleanBlogHtml(html = "") {
  if (!html) {
    return "";
  }

  if (typeof window === "undefined") {
    return html;
  }

  const parser = new DOMParser();

  const documentResult = parser.parseFromString(
    html,
    "text/html"
  );

  /*
   * Eliminar enlaces cuyo único contenido sea
   * la URL pública directa de una imagen.
   */
  documentResult
    .querySelectorAll("a")
    .forEach((anchor) => {
      const href = (
        anchor.getAttribute("href") || ""
      ).trim();

      const text = (
        anchor.textContent || ""
      ).trim();

      const normalizedHref = href.replace(
        /\/$/,
        ""
      );

      const normalizedText = text.replace(
        /\/$/,
        ""
      );

      if (
        isDirectImageUrl(href) &&
        (
          normalizedHref === normalizedText ||
          isDirectImageUrl(text)
        )
      ) {
        anchor.remove();
      }
    });

  /*
   * Eliminar párrafos vacíos, URLs de imágenes
   * y marcadores residuales del editor.
   */
  documentResult
    .querySelectorAll("p, figcaption")
    .forEach((element) => {
      const text = (
        element.textContent || ""
      ).trim();

      const normalizedText =
        text.replace(/\s+/g, " ");

      const hasVisualContent = Boolean(
        element.querySelector(
          "img, picture, video, iframe"
        )
      );

      const isEditorPlaceholder =
        normalizedText === "..." ||
        normalizedText === "…";

      if (
        !hasVisualContent &&
        (
          normalizedText === "" ||
          isDirectImageUrl(normalizedText) ||
          isEditorPlaceholder
        )
      ) {
        element.remove();
      }
    });

  /*
   * Eliminar contenedores vacíos después de
   * retirar URLs o marcadores del editor.
   */
  documentResult
    .querySelectorAll("div, figure")
    .forEach((element) => {
      const text = (
        element.textContent || ""
      ).trim();

      const hasContent = Boolean(
        element.querySelector(
          "img, picture, video, iframe, table, ul, ol"
        )
      );

      if (!text && !hasContent) {
        element.remove();
      }
    });

  return documentResult.body.innerHTML;
}

function BlogAdCarousel({
  ad,
  adIndex = 0,
}) {
  const slides = useMemo(() => {
    const adImages = getAdImages(ad);

    if (adImages.length === 0) {
      return [];
    }

    return [...adImages]
      .sort(
        (first, second) =>
          Number(first?.sort_order ?? 0) -
          Number(second?.sort_order ?? 0)
      )
      .map((image, imageIndex) => ({
        id:
          image?.id ||
          `${ad.id}-${imageIndex}`,
        image,
        imageUrl: getMediaUrl(image),
      }))
      .filter(
        (slide) =>
          typeof slide.imageUrl ===
            "string" &&
          slide.imageUrl.trim() !== ""
      );
  }, [ad]);

  const [slideIndex, setSlideIndex] =
    useState(0);

  useEffect(() => {
    setSlideIndex(0);
  }, [ad?.id, slides.length]);

  /*
   * Cada anuncio administra su propio carrusel.
   * El segundo anuncio se muestra debajo del
   * primero, no como una diapositiva del mismo.
   */
  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    /*
     * Se agrega un pequeño desfase para evitar
     * que todos los anuncios cambien al mismo tiempo.
     */
    const intervalTime =
      4500 + adIndex * 350;

    const timer = window.setInterval(() => {
      setSlideIndex((current) => {
        return (
          (current + 1) %
          slides.length
        );
      });
    }, intervalTime);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    adIndex,
    slides.length,
  ]);

  if (!ad) {
    return null;
  }

  const hasSlides =
    slides.length > 0;

  const safeIndex = hasSlides
    ? Math.min(
        slideIndex,
        slides.length - 1
      )
    : 0;

  const currentSlide = hasSlides
    ? slides[safeIndex]
    : null;

  return (
    <Card
      component="aside"
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderColor: COLORS.border,
        boxShadow: SIDEBAR_SHADOW,
        overflow: "hidden",
        bgcolor: COLORS.surface,

        "@keyframes blogAdFade": {
          from: {
            opacity: 0.35,
            transform: "scale(1.015)",
          },

          to: {
            opacity: 1,
            transform: "scale(1)",
          },
        },
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 2,
            md: 2.5,
          },

          "&:last-child": {
            pb: {
              xs: 2,
              md: 2.5,
            },
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            mb: 1.75,
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 3,
              borderRadius: 999,
              bgcolor: COLORS.orange,
            }}
          />

          <Typography
            sx={{
              color: COLORS.muted,
              fontSize: 11,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.09em",
            }}
          >
            Anuncio
          </Typography>
        </Stack>

        {hasSlides && currentSlide && (
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 3,
              bgcolor: "#F1F5F9",
            }}
          >
            <Box
              key={currentSlide.id}
              component="img"
              src={currentSlide.imageUrl}
              alt={
                currentSlide.image?.media
                  ?.alt_text ||
                ad.title ||
                "Anuncio"
              }
              loading="lazy"
              sx={{
                display: "block",
                width: "100%",
                aspectRatio: {
                  xs: "16 / 10",
                  lg: "4 / 3",
                },
                objectFit: "cover",
                animation:
                  "blogAdFade 480ms ease",
              }}
            />

            <Box
              sx={{
                position: "absolute",
                inset: "auto 0 0 0",
                height: "28%",
                pointerEvents: "none",
                background:
                  "linear-gradient(180deg, transparent, rgba(20, 33, 61, 0.18))",
              }}
            />
          </Box>
        )}

        <Typography
          component="h2"
          sx={{
            mt: 2,
            color: COLORS.ink,
            fontSize: {
              xs: 20,
              md: 22,
            },
            fontWeight: 950,
            lineHeight: 1.2,
            letterSpacing: "-0.025em",
          }}
        >
          {ad.title}
        </Typography>

        {ad.description && (
          <Typography
            sx={{
              mt: 1,
              color: COLORS.muted,
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            {ad.description}
          </Typography>
        )}

        {ad.link_url && (
          <Button
            component="a"
            href={ad.link_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            variant="contained"
            endIcon={
              <OpenInNewRoundedIcon />
            }
            sx={{
              ...landingButtonSx.primary,
              mt: 2.25,
              minHeight: 43,
              px: 2.25,
              borderRadius: 2.5,
              boxShadow:
                "0 10px 24px rgba(214, 82, 44, 0.20)",
            }}
          >
            {ad.link_text ||
              "Conocer más"}
          </Button>
        )}

        {slides.length > 1 && (
          <Stack
            direction="row"
            spacing={0.75}
            justifyContent="center"
            alignItems="center"
            sx={{
              mt: 2.25,
            }}
          >
            {slides.map(
              (slide, index) => (
                <Box
                  key={slide.id}
                  sx={{
                    width:
                      index === safeIndex
                        ? 24
                        : 7,
                    height: 7,
                    borderRadius: 999,
                    transition:
                      "width 220ms ease, background-color 220ms ease",
                    bgcolor:
                      index === safeIndex
                        ? COLORS.orange
                        : "rgba(20, 33, 61, 0.18)",
                  }}
                />
              )
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function BlogAdsList({
  ads = [],
}) {
  const visibleAds = useMemo(() => {
    const normalizedAds =
      normalizeCollection(ads);

    /*
     * No existe límite máximo. Se muestran todos
     * los anuncios activos que entregue la API.
     */
    return [...normalizedAds]
      .filter((ad) => {
        if (!ad) {
          return false;
        }

        const normalizedStatus = String(
          ad.status || "active"
        ).toLowerCase();

        if (normalizedStatus === "inactive") {
          return false;
        }

        /*
         * Las imágenes son opcionales. Un anuncio activo
         * puede mostrarse únicamente con título, texto y botón.
         */
        return true;
      })
      .sort(
        (first, second) =>
          Number(first?.sort_order ?? 0) -
            Number(second?.sort_order ?? 0) ||
          Number(first?.id ?? 0) -
            Number(second?.id ?? 0)
      );
  }, [ads]);

  if (visibleAds.length === 0) {
    return null;
  }

  return (
    <Stack spacing={3}>
      {visibleAds.map(
        (ad, index) => (
          <BlogAdCarousel
            key={ad.id || `${ad.title}-${index}`}
            ad={ad}
            adIndex={index}
          />
        )
      )}
    </Stack>
  );
}

function RecentPostsCard({
  posts = [],
  onPostClick,
}) {
  if (
    !Array.isArray(posts) ||
    posts.length === 0
  ) {
    return null;
  }

  return (
    <Card
      component="aside"
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderColor: COLORS.border,
        boxShadow: SIDEBAR_SHADOW,
        bgcolor: COLORS.surface,
        overflow: "hidden",
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 2,
            md: 2.5,
          },

          "&:last-child": {
            pb: {
              xs: 2,
              md: 2.5,
            },
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{
            mb: 1,
          }}
        >
          <Box
            sx={{
              width: 4,
              height: 25,
              borderRadius: 999,
              bgcolor: COLORS.orange,
            }}
          />

          <Typography
            component="h2"
            sx={{
              color: COLORS.ink,
              fontSize: {
                xs: 19,
                md: 21,
              },
              fontWeight: 950,
              letterSpacing: "-0.02em",
            }}
          >
            Publicaciones recientes
          </Typography>
        </Stack>

        <Stack>
          {posts.map(
            (recentPost, index) => {
              const coverUrl =
                recentPost.cover?.url ||
                "";

              return (
                <Box
                  key={
                    recentPost.id ||
                    recentPost.slug
                  }
                >
                  {index > 0 && (
                    <Divider
                      sx={{
                        borderColor:
                          COLORS.border,
                      }}
                    />
                  )}

                  <CardActionArea
                    onClick={() =>
                      onPostClick(
                        recentPost.slug
                      )
                    }
                    sx={{
                      py: 2,
                      px: 0.5,
                      borderRadius: 2.5,
                      transition:
                        "background-color 180ms ease",

                      "&:hover": {
                        bgcolor:
                          COLORS.orangeSoft,
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                    >
                      {coverUrl ? (
                        <Box
                          component="img"
                          src={coverUrl}
                          alt={
                            recentPost.cover
                              ?.alt_text ||
                            recentPost.title
                          }
                          loading="lazy"
                          sx={{
                            width: 82,
                            height: 64,
                            flexShrink: 0,
                            objectFit: "cover",
                            borderRadius: 2,
                            bgcolor: "#F1F5F9",
                            border:
                              "1px solid rgba(20, 33, 61, 0.07)",
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 82,
                            height: 64,
                            flexShrink: 0,
                            borderRadius: 2,
                            background: `
                              linear-gradient(
                                135deg,
                                #FFF0E7 0%,
                                #FFD7C4 100%
                              )
                            `,
                          }}
                        />
                      )}

                      <Box
                        sx={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            color:
                              COLORS.ink,
                            fontSize: 14,
                            fontWeight: 900,
                            lineHeight: 1.35,
                            display:
                              "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient:
                              "vertical",
                            overflow:
                              "hidden",
                          }}
                        >
                          {recentPost.title}
                        </Typography>

                        {recentPost.published_at && (
                          <Typography
                            sx={{
                              mt: 0.65,
                              color:
                                COLORS.muted,
                              fontSize: 12,
                              lineHeight: 1.4,
                            }}
                          >
                            {formatPublishedDate(
                              recentPost.published_at
                            )}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </CardActionArea>
                </Box>
              );
            }
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function BlogPostDetailPage() {
  const navigate = useNavigate();

  const { postSlug } = useParams();

  const theme = useTheme();

  const isDesktop = useMediaQuery(
    theme.breakpoints.up("lg")
  );

  const [post, setPost] =
    useState(null);

  const [
    recentPosts,
    setRecentPosts,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    async function loadPost() {
      setLoading(true);
      setError("");

      try {
        const postResult =
          await getClicMenuBlogPost(
            postSlug
          );

        if (!active) {
          return;
        }

        const normalizedPost =
          unwrapApiData(postResult);

        setPost(normalizedPost);

        try {
          const postsResult =
            await getClicMenuBlogPosts({
              order: "latest",
              per_page: 5,
              page: 1,
            });

          if (!active) {
            return;
          }

          const postsList =
            Array.isArray(
              postsResult?.data
            )
              ? postsResult.data
              : Array.isArray(
                    postsResult
                  )
                ? postsResult
                : [];

          setRecentPosts(
            postsList
              .filter(
                (item) =>
                  item?.slug &&
                  item.slug !==
                    postSlug
              )
              .slice(0, 4)
          );
        } catch {
          if (active) {
            setRecentPosts([]);
          }
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        setPost(null);
        setRecentPosts([]);

        setError(
          requestError?.response
            ?.status === 404
            ? "La publicación solicitada no está disponible."
            : requestError?.response
                ?.data?.message ||
                "No fue posible cargar la publicación."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (postSlug) {
      loadPost();
    } else {
      setLoading(false);

      setError(
        "La publicación solicitada no es válida."
      );
    }

    return () => {
      active = false;
    };
  }, [postSlug]);

  const seoKeywords = useMemo(() => {
    const keywords =
      post?.seo?.keywords;

    if (Array.isArray(keywords)) {
      return keywords
        .filter(
          (keyword) =>
            typeof keyword === "string" &&
            keyword.trim() !== ""
        )
        .map((keyword) => keyword.trim())
        .join(", ");
    }

    return typeof keywords === "string"
      ? keywords.trim()
      : "";
  }, [post]);

  const structuredData = useMemo(() => {
    return post?.structured_data ?? null;
  }, [post]);

  const cleanedContent = useMemo(() => {
    return cleanBlogHtml(
      post?.content || ""
    );
  }, [post?.content]);

  const postAds = useMemo(() => {
    return getPostAds(post);
  }, [post]);

  const coverCaption = useMemo(() => {
    const caption = String(
      post?.cover?.caption || ""
    ).trim();

    if (
      !caption ||
      isDirectImageUrl(caption)
    ) {
      return "";
    }

    return caption;
  }, [post?.cover?.caption]);

  const handleCategoryClick = () => {
    if (post?.category?.slug) {
      navigate(
        `/blog/categorias/${post.category.slug}`
      );
    }
  };

  const handleTagClick = (
    tagSlug
  ) => {
    navigate(
      `/blog/etiquetas/${tagSlug}`
    );
  };

  const handleRecentPostClick = (
    slug
  ) => {
    if (!slug) {
      return;
    }

    navigate(`/blog/${slug}`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {post && (
        <SEO
          replaceDefaultSeo
          title={
            post.seo?.title ||
            post.title ||
            "Blog Clic Menu"
          }
          description={
            post.seo?.description ||
            post.excerpt ||
            ""
          }
          keywords={seoKeywords}
          image={
            post.open_graph?.image?.url ||
            post.cover?.url ||
            undefined
          }
          url={
            post.seo?.canonical_url ||
            post.open_graph?.url ||
            post.url ||
            `https://clicmenu.com.mx/blog/${post.slug}`
          }
          robots={[
            post.seo?.robots_index === false
              ? "noindex"
              : "index",
            post.seo?.robots_follow === false
              ? "nofollow"
              : "follow",
          ].join(", ")}
          ogType={
            post.open_graph?.type ||
            "article"
          }
          ogTitle={
            post.open_graph?.title ||
            null
          }
          ogDescription={
            post.open_graph?.description ||
            null
          }
          structuredData={
            structuredData
          }
          publishedTime={
            post.published_at ||
            null
          }
          modifiedTime={
            post.updated_at ||
            null
          }
          section={
            post.category?.name ||
            null
          }
          tags={
            Array.isArray(post.tags)
              ? post.tags
                  .map((tag) => tag?.name)
                  .filter(Boolean)
              : []
          }
        />
      )}

      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          bgcolor: "#FFFDFC",
          overflowX: "hidden",
        }}
      >
        <LandingMenu />

        {loading ? (
          <Box
            sx={{
              minHeight:
                "calc(100dvh - 76px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `
                linear-gradient(
                  180deg,
                  #FFF9F5 0%,
                  #FFFFFF 100%
                )
              `,
            }}
          >
            <CircularProgress
              sx={{
                color: COLORS.orange,
              }}
            />
          </Box>
        ) : error ? (
          <Container
            maxWidth="md"
            sx={{
              py: {
                xs: 6,
                md: 10,
              },
            }}
          >
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 3,
              }}
            >
              {error}
            </Alert>

            <Button
              type="button"
              variant="contained"
              onClick={() =>
                navigate("/blog")
              }
              sx={
                landingButtonSx.primary
              }
            >
              Volver al blog
            </Button>
          </Container>
        ) : (
          <>
            <Box
              component="header"
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                minHeight: {
                  xs: "auto",
                  md: "calc(100dvh - 76px)",
                },
                overflow: "hidden",
                borderBottom:
                  "1px solid rgba(214, 82, 44, 0.10)",

                background: `
                  radial-gradient(
                    circle at 7% 18%,
                    rgba(255, 255, 255, 0.94) 0,
                    rgba(255, 255, 255, 0.94) 90px,
                    transparent 91px
                  ),
                  radial-gradient(
                    circle at 92% 12%,
                    rgba(255, 199, 168, 0.35) 0,
                    rgba(255, 199, 168, 0.35) 180px,
                    transparent 181px
                  ),
                  linear-gradient(
                    135deg,
                    #FFFDFB 0%,
                    #FFF7F2 48%,
                    #FFEADD 100%
                  )
                `,

                py: {
                  xs: 3,
                  sm: 4,
                  md: 3.5,
                },

                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: {
                    xs: -90,
                    md: "40%",
                  },
                  bottom: {
                    xs: -130,
                    md: -210,
                  },
                  width: {
                    xs: 260,
                    md: 430,
                  },
                  height: {
                    xs: 260,
                    md: 430,
                  },
                  borderRadius: "50%",
                  bgcolor:
                    "rgba(214, 82, 44, 0.05)",
                  pointerEvents: "none",
                },

                "&::after": {
                  content: '""',
                  position: "absolute",
                  right: {
                    xs: 12,
                    md: 32,
                  },
                  top: {
                    xs: 18,
                    md: 30,
                  },
                  width: {
                    xs: 72,
                    md: 112,
                  },
                  height: {
                    xs: 72,
                    md: 112,
                  },
                  opacity: 0.18,
                  pointerEvents: "none",
                  backgroundImage: `
                    radial-gradient(
                      ${COLORS.orange} 2px,
                      transparent 2px
                    )
                  `,
                  backgroundSize: "16px 16px",
                },
              }}
            >
              <Container
                maxWidth="xl"
                sx={{
                  position: "relative",
                  zIndex: 1,
                  width: "100%",
                }}
              >
                <Button
                  type="button"
                  startIcon={
                    <ArrowBackRoundedIcon />
                  }
                  onClick={() =>
                    navigate("/blog")
                  }
                  sx={{
                    mb: {
                      xs: 2.5,
                      md: 2.5,
                    },
                    px: 0,
                    minHeight: 34,
                    color: COLORS.ink,
                    textTransform: "none",
                    fontSize: 14,
                    fontWeight: 900,

                    "&:hover": {
                      bgcolor: "transparent",
                      color: COLORS.orange,
                    },
                  }}
                >
                  Regresar al blog
                </Button>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "minmax(0, 1fr)",
                      md: post.cover?.url
                        ? "minmax(0, 1fr) minmax(0, 1.15fr)"
                        : "minmax(0, 1fr)",
                    },
                    gap: {
                      xs: 3,
                      sm: 4,
                      md: 5,
                      lg: 6,
                    },
                    alignItems: "center",
                  }}
                >
                  <Stack
                    spacing={{
                      xs: 1.75,
                      md: 2,
                    }}
                    alignItems="flex-start"
                    sx={{
                      minWidth: 0,
                      maxWidth: {
                        xs: "100%",
                        md: 650,
                      },
                    }}
                  >
                    {post.category
                      ?.name && (
                      <Chip
                        label={
                          post.category.name
                        }
                        onClick={
                          handleCategoryClick
                        }
                        sx={{
                          height: 33,
                          px: 0.5,
                          bgcolor:
                            "rgba(255, 255, 255, 0.92)",
                          color:
                            COLORS.orange,
                          border:
                            "1px solid rgba(214, 82, 44, 0.14)",
                          boxShadow:
                            "0 8px 24px rgba(20, 33, 61, 0.05)",
                          fontSize: 12,
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                      />
                    )}

                    <Typography
                      component="h1"
                      sx={{
                        maxWidth: 650,
                        color: COLORS.ink,
                        fontSize: {
                          xs: "clamp(32px, 9vw, 44px)",
                          sm: "clamp(38px, 6vw, 50px)",
                          md: "clamp(42px, 3.8vw, 56px)",
                          lg: "clamp(46px, 3.5vw, 60px)",
                        },
                        fontWeight: 950,
                        lineHeight: {
                          xs: 1.05,
                          md: 1.02,
                        },
                        letterSpacing:
                          "-0.045em",
                        overflowWrap:
                          "break-word",
                      }}
                    >
                      {post.title}
                    </Typography>

                    {post.excerpt && (
                      <Typography
                        sx={{
                          maxWidth: 620,
                          color: COLORS.text,
                          fontSize: {
                            xs: 15,
                            sm: 16,
                            md: 17,
                          },
                          lineHeight: 1.65,
                        }}
                      >
                        {post.excerpt}
                      </Typography>
                    )}

                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      spacing={{
                        xs: 0.75,
                        sm: 1.25,
                      }}
                      alignItems={{
                        xs: "flex-start",
                        sm: "center",
                      }}
                      sx={{
                        pt: 0.25,
                      }}
                    >
                      {post.author
                        ?.name && (
                        <Box
                          sx={{
                            px: 1.4,
                            py: 0.65,
                            borderRadius: 999,
                            bgcolor:
                              "rgba(255, 255, 255, 0.82)",
                            border:
                              "1px solid rgba(20, 33, 61, 0.07)",
                          }}
                        >
                          <Typography
                            sx={{
                              color:
                                COLORS.ink,
                              fontSize: 13,
                              fontWeight: 900,
                            }}
                          >
                            {
                              post.author
                                .name
                            }
                          </Typography>
                        </Box>
                      )}

                      {post.published_at && (
                        <Typography
                          sx={{
                            color:
                              COLORS.muted,
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {formatPublishedDate(
                            post.published_at
                          )}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>

                  {post.cover?.url && (
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        minWidth: 0,
                        maxWidth: 780,
                        justifySelf: {
                          xs: "stretch",
                          md: "end",
                        },

                        "&::before": {
                          content: '""',
                          position: "absolute",
                          inset: {
                            xs: "8px -6px -8px 6px",
                            md: "12px -12px -12px 12px",
                          },
                          borderRadius: {
                            xs: 3,
                            md: 4,
                          },
                          bgcolor:
                            "rgba(214, 82, 44, 0.11)",
                          transform:
                            "rotate(0.8deg)",
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={post.cover.url}
                        alt={
                          post.cover
                            .alt_text ||
                          post.title
                        }
                        loading="eager"
                        sx={{
                          position: "relative",
                          display: "block",
                          width: "100%",
                          height: "auto",
                          maxHeight: {
                            xs: "none",
                            md: "calc(100dvh - 205px)",
                          },
                          objectFit: "contain",
                          objectPosition:
                            "center",
                          borderRadius: {
                            xs: 3,
                            md: 4,
                          },
                          bgcolor: "#FFFAF7",
                          border:
                            "1px solid rgba(255, 255, 255, 0.90)",
                          boxShadow:
                            "0 24px 60px rgba(20, 33, 61, 0.14)",
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Container>
            </Box>

            <Box
              component="section"
              sx={{
                py: {
                  xs: 4,
                  md: 7,
                },

                background: `
                  radial-gradient(
                    circle at 4% 8%,
                    rgba(255, 221, 202, 0.28),
                    transparent 280px
                  ),
                  linear-gradient(
                    180deg,
                    #FFFDFC 0%,
                    #F8FAFC 440px,
                    #F8FAFC 100%
                  )
                `,
              }}
            >
              <Container maxWidth="xl">
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      lg: "minmax(0, 2fr) minmax(330px, 1fr)",
                    },
                    gap: {
                      xs: 3,
                      lg: 4,
                    },
                    alignItems: "start",
                  }}
                >
                  <Card
                    component="article"
                    variant="outlined"
                    sx={{
                      minWidth: 0,
                      borderRadius: 4,
                      borderColor:
                        COLORS.border,
                      boxShadow:
                        CARD_SHADOW,
                      bgcolor:
                        "rgba(255, 255, 255, 0.98)",
                      overflow: "hidden",
                    }}
                  >
                    {post.cover?.url && (
                      <Box
                        component="figure"
                        sx={{
                          m: 0,
                          p: {
                            xs: 2,
                            md: 3,
                          },
                          pb: 0,
                        }}
                      >
                        <Box
                          component="img"
                          src={post.cover.url}
                          alt={
                            post.cover
                              .alt_text ||
                            post.title
                          }
                          loading="eager"
                          sx={{
                            display: "block",
                            width: "100%",
                            height: "auto",
                            maxHeight: {
                              xs: 340,
                              sm: 470,
                              md: 590,
                            },
                            objectFit:
                              "contain",
                            borderRadius: 3,
                            bgcolor:
                              "#FFFAF7",
                            boxShadow:
                              "0 18px 45px rgba(20, 33, 61, 0.09)",
                          }}
                        />

                        {coverCaption && (
                          <Typography
                            component="figcaption"
                            sx={{
                              mt: 1.25,
                              color:
                                COLORS.muted,
                              fontSize: 12,
                              lineHeight: 1.5,
                              textAlign:
                                "center",
                            }}
                          >
                            {coverCaption}
                          </Typography>
                        )}
                      </Box>
                    )}

                    <CardContent
                      sx={{
                        p: {
                          xs: 2.5,
                          sm: 3.5,
                          md: 5,
                        },

                        "&:last-child": {
                          pb: {
                            xs: 2.5,
                            sm: 3.5,
                            md: 5,
                          },
                        },
                      }}
                    >
                      <Box
                        className="blog-post-content"
                        dangerouslySetInnerHTML={{
                          __html:
                            cleanedContent,
                        }}
                        sx={{
                          color: COLORS.text,
                          fontSize: {
                            xs: 16,
                            md: 17,
                          },
                          lineHeight: 1.82,
                          overflowWrap:
                            "anywhere",

                          "& > *:first-of-type":
                            {
                              mt: 0,
                            },

                          "& > *:last-child": {
                            mb: 0,
                          },

                          /*
                           * Mantener los tamaños, fuentes,
                           * colores y alineaciones definidos
                           * desde el editor.
                           */
                          "& h1, & h2, & h3, & h4, & h5, & h6":
                            {
                              mt: {
                                xs: 4,
                                md: 5,
                              },
                              mb: 1.5,
                            },

                          "& p": {
                            my: 2,
                          },

                          "& a": {
                            color:
                              COLORS.orange,
                            fontWeight: 800,
                            overflowWrap:
                              "anywhere",
                            textUnderlineOffset:
                              "3px",
                          },

                          "& img": {
                            display: "block",
                            maxWidth: "100%",
                            height: "auto",
                            mx: "auto",
                            my: 3.5,
                            borderRadius: 3,
                            boxShadow:
                              "0 16px 38px rgba(20, 33, 61, 0.10)",
                          },

                          "& figure": {
                            m: 0,
                            my: 3.5,
                          },

                          "& figcaption": {
                            mt: 1,
                            color:
                              COLORS.muted,
                            fontSize: 13,
                            textAlign:
                              "center",
                          },

                          "& blockquote": {
                            m: 0,
                            my: 3.5,
                            px: {
                              xs: 2.5,
                              md: 3,
                            },
                            py: {
                              xs: 2,
                              md: 2.5,
                            },
                            borderLeft: `5px solid ${COLORS.orange}`,
                            borderRadius:
                              "0 16px 16px 0",
                            bgcolor:
                              COLORS.orangeSoft,

                            "& p": {
                              m: 0,
                            },
                          },

                          "& ul, & ol": {
                            pl: {
                              xs: 2.5,
                              md: 4,
                            },
                            my: 2.5,
                          },

                          "& li": {
                            mb: 0.9,
                            pl: 0.5,

                            "&::marker": {
                              color:
                                COLORS.orange,
                              fontWeight: 900,
                            },
                          },

                          /*
                           * Compatibilidad con clases
                           * generadas por editores Quill.
                           */
                          "& .ql-align-center": {
                            textAlign:
                              "center",
                          },

                          "& .ql-align-right": {
                            textAlign:
                              "right",
                          },

                          "& .ql-align-justify": {
                            textAlign:
                              "justify",
                          },

                          "& .ql-size-small": {
                            fontSize:
                              "0.75em",
                          },

                          "& .ql-size-large": {
                            fontSize:
                              "1.5em",
                          },

                          "& .ql-size-huge": {
                            fontSize:
                              "2.5em",
                          },

                          "& .ql-font-serif": {
                            fontFamily:
                              "Georgia, 'Times New Roman', serif",
                          },

                          "& .ql-font-monospace":
                            {
                              fontFamily:
                                "'Courier New', monospace",
                            },

                          "& pre": {
                            maxWidth: "100%",
                            overflowX: "auto",
                            p: 2.5,
                            borderRadius: 3,
                            bgcolor:
                              COLORS.ink,
                            color: "#F8FAFC",
                            fontSize: 14,
                          },

                          "& code": {
                            overflowWrap:
                              "anywhere",
                          },

                          "& table": {
                            width: "100%",
                            borderCollapse:
                              "collapse",
                            display: "block",
                            overflowX: "auto",
                            my: 3,
                            borderRadius: 2,
                          },

                          "& th, & td": {
                            border:
                              "1px solid rgba(20, 33, 61, 0.12)",
                            px: 1.5,
                            py: 1,
                            textAlign: "left",
                            whiteSpace:
                              "nowrap",
                          },

                          "& th": {
                            bgcolor:
                              COLORS.surfaceSoft,
                            fontWeight: 900,
                          },

                          "& hr": {
                            my: 4,
                            border: 0,
                            borderTop:
                              "1px solid rgba(20, 33, 61, 0.10)",
                          },
                        }}
                      />

                      {Array.isArray(
                        post.tags
                      ) &&
                        post.tags.length >
                          0 && (
                          <>
                            <Divider
                              sx={{
                                my: {
                                  xs: 4,
                                  md: 5,
                                },
                                borderColor:
                                  COLORS.border,
                              }}
                            />

                            <Stack
                              direction="row"
                              spacing={1}
                              useFlexGap
                              flexWrap="wrap"
                              alignItems="center"
                            >
                              <Typography
                                sx={{
                                  color:
                                    COLORS.ink,
                                  fontSize: 14,
                                  fontWeight: 900,
                                }}
                              >
                                Etiquetas:
                              </Typography>

                              {post.tags.map(
                                (tag) => (
                                  <Chip
                                    key={
                                      tag.slug
                                    }
                                    label={
                                      tag.name
                                    }
                                    size="small"
                                    onClick={() =>
                                      handleTagClick(
                                        tag.slug
                                      )
                                    }
                                    sx={{
                                      cursor:
                                        "pointer",
                                      bgcolor:
                                        COLORS.orangeSoft,
                                      color:
                                        COLORS.orange,
                                      border:
                                        "1px solid rgba(214, 82, 44, 0.12)",
                                      fontWeight: 800,

                                      "&:hover": {
                                        bgcolor:
                                          "#FFE3D5",
                                      },
                                    }}
                                  />
                                )
                              )}
                            </Stack>
                          </>
                        )}

                      <Box
                        sx={{
                          mt: {
                            xs: 5,
                            md: 7,
                          },
                          pt: {
                            xs: 4,
                            md: 5,
                          },
                          borderTop:
                            "1px solid rgba(20, 33, 61, 0.09)",
                          textAlign:
                            "center",
                        }}
                      >
                        <Button
                          type="button"
                          variant="contained"
                          onClick={() =>
                            navigate(
                              "/blog"
                            )
                          }
                          sx={{
                            ...landingButtonSx.primary,
                            minHeight: 46,
                            px: 3,
                            borderRadius: 2.5,
                            boxShadow:
                              "0 12px 28px rgba(214, 82, 44, 0.20)",
                          }}
                        >
                          Ver todas las
                          publicaciones
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>

                  {isDesktop && (
                    <Stack
                      spacing={3}
                      sx={{
                        position: "sticky",
                        top: 100,
                      }}
                    >
                      <BlogAdsList
                        ads={postAds}
                      />

                      <RecentPostsCard
                        posts={
                          recentPosts
                        }
                        onPostClick={
                          handleRecentPostClick
                        }
                      />
                    </Stack>
                  )}
                </Box>

                {!isDesktop && (
                  <Stack
                    spacing={3}
                    sx={{
                      mt: 3,
                    }}
                  >
                    <RecentPostsCard
                      posts={recentPosts}
                      onPostClick={
                        handleRecentPostClick
                      }
                    />

                    <BlogAdsList
                      ads={postAds}
                    />
                  </Stack>
                )}
              </Container>
            </Box>
          </>
        )}

        <LandingFooter />
      </Box>
    </>
  );
}
