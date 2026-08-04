import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import LandingMenu from "../../../components/landing/menu/LandingMenu";
import LandingFooter from "../../../components/landing/footer/LandingFooter";
import SEO from "../../../components/seo/SEO";

import {
  landingButtonSx,
  landingColors,
} from "../../../theme/landingTheme";

import {
  getClicMenuBlogPost,
} from "../../../services/public/clicMenuBlog.service";

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

function BlogPostAd({ ad }) {
  if (
    !ad ||
    !Array.isArray(ad.images) ||
    ad.images.length !== 3
  ) {
    return null;
  }

  return (
    <Card
      component="aside"
      variant="outlined"
      sx={{
        my: {
          xs: 4,
          md: 6,
        },
        borderRadius: 3,
        borderColor: "rgba(15, 23, 42, 0.10)",
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, minmax(0, 1fr))",
          },
        }}
      >
        {ad.images.map((image) => (
          <Box
            key={image.id}
            component="img"
            src={image.media?.url}
            alt={
              image.media?.alt_text ||
              ad.title ||
              "Anuncio"
            }
            loading="lazy"
            sx={{
              width: "100%",
              height: {
                xs: 180,
                sm: 160,
                md: 190,
              },
              objectFit: "cover",
              bgcolor: "#f1f5f9",
            }}
          />
        ))}
      </Box>

      <CardContent
        sx={{
          p: {
            xs: 2.5,
            md: 3,
          },
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
          alignItems={{
            xs: "stretch",
            sm: "center",
          }}
          justifyContent="space-between"
        >
          <Box>
            <Typography
              component="h2"
              sx={{
                color: "#0f172a",
                fontSize: {
                  xs: 20,
                  md: 22,
                },
                fontWeight: 900,
                lineHeight: 1.25,
              }}
            >
              {ad.title}
            </Typography>

            {ad.description && (
              <Typography
                sx={{
                  mt: 0.75,
                  color: "#64748b",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {ad.description}
              </Typography>
            )}
          </Box>

          <Button
            component="a"
            href={ad.link_url}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            sx={{
              ...landingButtonSx.primary,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {ad.link_text || "Conocer más"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function BlogPostDetailPage() {
  const navigate = useNavigate();
  const { postSlug } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPost() {
      setLoading(true);
      setError("");

      try {
        const result = await getClicMenuBlogPost(
          postSlug
        );

        if (active) {
          setPost(result);
        }
      } catch (requestError) {
        if (active) {
          setPost(null);

          setError(
            requestError?.response?.status === 404
              ? "La publicación solicitada no está disponible."
              : requestError?.response?.data?.message ||
                  "No fue posible cargar la publicación."
          );
        }
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
    const keywords = post?.seo?.keywords;

    return Array.isArray(keywords)
      ? keywords.join(", ")
      : "";
  }, [post]);

  const structuredData = useMemo(() => {
    if (!post?.structured_data) {
      return null;
    }

    return JSON.stringify(post.structured_data);
  }, [post]);

  const handleCategoryClick = () => {
    if (post?.category?.slug) {
      navigate(
        `/blog/categorias/${post.category.slug}`
      );
    }
  };

  const handleTagClick = (tagSlug) => {
    navigate(`/blog/etiquetas/${tagSlug}`);
  };

  return (
    <>
      {post && (
        <>
          <SEO
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
            url={
              post.seo?.canonical_url ||
              post.url ||
              `https://clicmenu.com.mx/blog/${post.slug}`
            }
          />

          {structuredData && (
            <Helmet>
              <script type="application/ld+json">
                {structuredData}
              </script>
            </Helmet>
          )}
        </>
      )}

      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          bgcolor: landingColors.white,
          overflowX: "hidden",
        }}
      >
        <LandingMenu />

        {loading ? (
          <Box
            sx={{
              minHeight: "calc(100vh - 76px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Container
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
              }}
            >
              {error}
            </Alert>

            <Button
              type="button"
              variant="contained"
              onClick={() => navigate("/blog")}
              sx={landingButtonSx.primary}
            >
              Volver al blog
            </Button>
          </Container>
        ) : (
          <>
            <Box
              component="header"
              sx={{
                bgcolor: landingColors.orangeSoft,
                borderBottom:
                  "1px solid rgba(15, 23, 42, 0.08)",
                py: {
                  xs: 5,
                  md: 8,
                },
              }}
            >
              <Container maxWidth="md">
                <Stack
                  spacing={2}
                  alignItems="center"
                  sx={{
                    textAlign: "center",
                  }}
                >
                  {post.category?.name && (
                    <Chip
                      label={post.category.name}
                      onClick={handleCategoryClick}
                      sx={{
                        bgcolor: landingColors.white,
                        color: landingColors.primary,
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    />
                  )}

                  <Typography
                    component="h1"
                    sx={{
                      maxWidth: 900,
                      color: "#0f172a",
                      fontSize: {
                        xs: "clamp(30px, 8vw, 42px)",
                        md: "clamp(42px, 5vw, 58px)",
                      },
                      fontWeight: 950,
                      lineHeight: 1.08,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {post.title}
                  </Typography>

                  {post.excerpt && (
                    <Typography
                      sx={{
                        maxWidth: 760,
                        color: "#475569",
                        fontSize: {
                          xs: 16,
                          md: 18,
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
                      xs: 0.5,
                      sm: 1.5,
                    }}
                    alignItems="center"
                  >
                    {post.author?.name && (
                      <Typography
                        sx={{
                          color: "#334155",
                          fontSize: 14,
                          fontWeight: 800,
                        }}
                      >
                        {post.author.name}
                      </Typography>
                    )}

                    {post.published_at && (
                      <Typography
                        sx={{
                          color: "#64748b",
                          fontSize: 14,
                        }}
                      >
                        {formatPublishedDate(
                          post.published_at
                        )}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </Container>
            </Box>

            <Box
              component="article"
              sx={{
                py: {
                  xs: 4,
                  md: 7,
                },
              }}
            >
              <Container maxWidth="md">
                {post.cover?.url && (
                  <Box
                    component="figure"
                    sx={{
                      m: 0,
                      mb: {
                        xs: 4,
                        md: 6,
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={post.cover.url}
                      alt={
                        post.cover.alt_text ||
                        post.title
                      }
                      loading="eager"
                      sx={{
                        display: "block",
                        width: "100%",
                        maxHeight: 560,
                        objectFit: "cover",
                        borderRadius: 3,
                        bgcolor: "#f1f5f9",
                      }}
                    />

                    {post.cover.title && (
                      <Typography
                        component="figcaption"
                        sx={{
                          mt: 1,
                          color: "#64748b",
                          fontSize: 12,
                          textAlign: "center",
                        }}
                      >
                        {post.cover.title}
                      </Typography>
                    )}
                  </Box>
                )}

                <Box
                  className="blog-post-content"
                  dangerouslySetInnerHTML={{
                    __html: post.content || "",
                  }}
                  sx={{
                    color: "#334155",
                    fontSize: {
                      xs: 16,
                      md: 17,
                    },
                    lineHeight: 1.8,

                    "& > *:first-of-type": {
                      mt: 0,
                    },

                    "& h1, & h2, & h3, & h4, & h5, & h6":
                      {
                        color: "#0f172a",
                        fontWeight: 900,
                        lineHeight: 1.25,
                        letterSpacing: "-0.025em",
                        mt: 4,
                        mb: 1.5,
                      },

                    "& h2": {
                      fontSize: {
                        xs: 26,
                        md: 32,
                      },
                    },

                    "& h3": {
                      fontSize: {
                        xs: 22,
                        md: 26,
                      },
                    },

                    "& p": {
                      my: 2,
                    },

                    "& a": {
                      color: landingColors.primary,
                      fontWeight: 800,
                      overflowWrap: "anywhere",
                    },

                    "& img": {
                      display: "block",
                      maxWidth: "100%",
                      height: "auto",
                      mx: "auto",
                      my: 3,
                      borderRadius: 2,
                    },

                    "& figure": {
                      m: 0,
                      my: 3,
                    },

                    "& figcaption": {
                      mt: 1,
                      color: "#64748b",
                      fontSize: 13,
                      textAlign: "center",
                    },

                    "& blockquote": {
                      m: 0,
                      my: 3,
                      px: 2.5,
                      py: 1,
                      borderLeft: `4px solid ${landingColors.primary}`,
                      bgcolor: landingColors.orangeSoft,
                      color: "#475569",
                    },

                    "& ul, & ol": {
                      pl: {
                        xs: 2.5,
                        md: 4,
                      },
                    },

                    "& li": {
                      mb: 0.75,
                    },

                    "& pre": {
                      maxWidth: "100%",
                      overflowX: "auto",
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "#0f172a",
                      color: "#f8fafc",
                      fontSize: 14,
                    },

                    "& code": {
                      overflowWrap: "anywhere",
                    },

                    "& table": {
                      width: "100%",
                      borderCollapse: "collapse",
                      display: "block",
                      overflowX: "auto",
                      my: 3,
                    },

                    "& th, & td": {
                      border:
                        "1px solid rgba(15, 23, 42, 0.15)",
                      px: 1.5,
                      py: 1,
                      textAlign: "left",
                      whiteSpace: "nowrap",
                    },

                    "& th": {
                      bgcolor: "#f8fafc",
                      color: "#0f172a",
                      fontWeight: 900,
                    },

                    "& hr": {
                      my: 4,
                      border: 0,
                      borderTop:
                        "1px solid rgba(15, 23, 42, 0.12)",
                    },
                  }}
                />

                {Array.isArray(post.ads) &&
                  post.ads.map((ad) => (
                    <BlogPostAd
                      key={ad.id}
                      ad={ad}
                    />
                  ))}

                {Array.isArray(post.tags) &&
                  post.tags.length > 0 && (
                    <>
                      <Divider
                        sx={{
                          my: {
                            xs: 4,
                            md: 5,
                          },
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
                            color: "#0f172a",
                            fontSize: 14,
                            fontWeight: 900,
                          }}
                        >
                          Etiquetas:
                        </Typography>

                        {post.tags.map((tag) => (
                          <Chip
                            key={tag.slug}
                            label={tag.name}
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              handleTagClick(tag.slug)
                            }
                            sx={{
                              cursor: "pointer",
                              fontWeight: 700,
                            }}
                          />
                        ))}
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
                      "1px solid rgba(15, 23, 42, 0.10)",
                    textAlign: "center",
                  }}
                >
                  <Button
                    type="button"
                    variant="contained"
                    onClick={() => navigate("/blog")}
                    sx={landingButtonSx.primary}
                  >
                    Ver todas las publicaciones
                  </Button>
                </Box>
              </Container>
            </Box>
          </>
        )}

        <LandingFooter />
      </Box>
    </>
  );
}