import { useEffect, useMemo, useState } from "react";
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
  InputAdornment,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";

import { useNavigate } from "react-router-dom";

import LandingMenu from "../../../components/landing/menu/LandingMenu";
import LandingFooter from "../../../components/landing/footer/LandingFooter";
import SEO from "../../../components/seo/SEO";

import {
  landingButtonSx,
  landingColors,
  landingTypography,
} from "../../../theme/landingTheme";

import {
  getClicMenuBlog,
  getClicMenuBlogPosts,
} from "../../../services/public/clicMenuBlog.service";

const POSTS_PER_PAGE = 9;

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

function PostCover({ post }) {
  if (post?.cover?.url) {
    return (
      <Box
        component="img"
        src={post.cover.url}
        alt={post.cover.alt_text || post.title}
        loading="lazy"
        sx={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "transform 0.35s ease",
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        background:
          "linear-gradient(145deg, #f8b496 0%, #d65d3b 58%, #9d3521 100%)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -75,
          right: -55,
          width: 190,
          height: 190,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.15)",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: -75,
          left: -55,
          width: 170,
          height: 170,
          borderRadius: "50%",
          bgcolor: "rgba(15,23,42,0.14)",
        }}
      />

      <Stack
        spacing={1}
        alignItems="center"
        sx={{
          position: "relative",
          zIndex: 1,
          color: "#ffffff",
        }}
      >
        <RestaurantRoundedIcon
          sx={{
            fontSize: 58,
          }}
        />

        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 950,
          }}
        >
          Clic Menu
        </Typography>
      </Stack>
    </Box>
  );
}

export default function BlogPostsPage() {
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loadingBlog, setLoadingBlog] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBlog() {
      setLoadingBlog(true);

      try {
        const result = await getClicMenuBlog();

        if (active) {
          setBlog(result);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError?.response?.data?.message ||
              "No fue posible cargar la información del blog."
          );
        }
      } finally {
        if (active) {
          setLoadingBlog(false);
        }
      }
    }

    loadBlog();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      setLoadingPosts(true);
      setError("");

      try {
        const result = await getClicMenuBlogPosts({
          page,
          per_page: POSTS_PER_PAGE,
          search,
          order: "latest",
        });

        if (!active) {
          return;
        }

        setPosts(
          Array.isArray(result?.data)
            ? result.data
            : []
        );

        setMeta(result?.meta ?? null);
      } catch (requestError) {
        if (!active) {
          return;
        }

        setPosts([]);
        setMeta(null);

        setError(
          requestError?.response?.data?.message ||
            "No fue posible cargar las publicaciones."
        );
      } finally {
        if (active) {
          setLoadingPosts(false);
        }
      }
    }

    loadPosts();

    return () => {
      active = false;
    };
  }, [page, search]);

  const seoKeywords = useMemo(() => {
    const keywords =
      blog?.seo?.keywords;

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
  }, [blog]);

  const title =
    blog?.seo?.title ||
    blog?.name ||
    "Blogs Clic Menu";

  const description =
    blog?.seo?.description ||
    blog?.description ||
    "Ideas, estrategias y tecnología para administrar mejor tu restaurante.";

  const seoImage =
    blog?.open_graph?.image?.url ||
    blog?.cover?.url ||
    undefined;

  const seoUrl =
    blog?.seo?.canonical_url ||
    blog?.open_graph?.url ||
    "https://clicmenu.com.mx/blog";

  const seoRobots = [
    blog?.seo?.robots_index === false
      ? "noindex"
      : "index",
    blog?.seo?.robots_follow === false
      ? "nofollow"
      : "follow",
  ].join(", ");

  const structuredData =
    blog?.structured_data ?? null;

  const totalPosts = Number(meta?.total || 0);

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handlePageChange = (_, nextPage) => {
    setPage(nextPage);

    window.scrollTo({
      top: 430,
      behavior: "smooth",
    });
  };

  const openPost = (postSlug) => {
    navigate(`/blog/${postSlug}`);
  };

  return (
    <>
      <SEO
        replaceDefaultSeo
        title={title}
        description={description}
        keywords={seoKeywords}
        image={seoImage}
        url={seoUrl}
        robots={seoRobots}
        ogType={
          blog?.open_graph?.type ||
          "website"
        }
        ogTitle={
          blog?.open_graph?.title ||
          null
        }
        ogDescription={
          blog?.open_graph?.description ||
          null
        }
        structuredData={
          structuredData
        }
      />

      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          bgcolor: "#f5f8fb",
          overflowX: "hidden",
        }}
      >
        <LandingMenu />

        <Box
          component="section"
          sx={{
            position: "relative",
            overflow: "hidden",
            bgcolor: "#f5f8fb",
            borderBottom:
              "1px solid rgba(15,23,42,0.06)",
            pt: {
              xs: 6,
              sm: 7,
              md: 8,
            },
            pb: {
              xs: 12,
              sm: 13,
              md: 14,
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -180,
              right: -100,
              width: {
                xs: 280,
                md: 470,
              },
              height: {
                xs: 280,
                md: 470,
              },
              borderRadius: "50%",
              bgcolor: "#fde8c5",
              pointerEvents: "none",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              left: -120,
              bottom: -180,
              width: {
                xs: 270,
                md: 440,
              },
              height: {
                xs: 270,
                md: 440,
              },
              borderRadius: "50%",
              bgcolor: "#f1e5e2",
              pointerEvents: "none",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              top: 70,
              left: "13%",
              width: 18,
              height: 18,
              borderRadius: "50%",
              bgcolor: "rgba(211,92,58,0.24)",
              pointerEvents: "none",
            }}
          />

          <Container
            sx={{
              position: "relative",
              zIndex: 1,
            }}
          >
            <Stack
              spacing={2}
              alignItems="center"
              sx={{
                maxWidth: 900,
                mx: "auto",
                textAlign: "center",
              }}
            >
              <Chip
                icon={<AutoStoriesRoundedIcon />}
                label="Blogs Clic Menu"
                sx={{
                  height: 36,
                  px: 0.8,
                  borderRadius: 999,
                  bgcolor: "#fff6f1",
                  color: landingColors.primary,
                  border:
                    "1px solid rgba(211,92,58,0.24)",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              />

              <Typography
                component="h1"
                sx={{
                  ...landingTypography.landingTitleXL,
                  maxWidth: 900,
                  color: "#15191f",
                  fontSize: {
                    xs: "clamp(36px, 10vw, 50px)",
                    sm: "clamp(48px, 8vw, 64px)",
                    md: "clamp(58px, 6vw, 78px)",
                  },
                  lineHeight: 0.98,
                  letterSpacing: "-0.06em",
                }}
              >
                Ideas para vender mejor y operar con control
              </Typography>

              <Typography
                sx={{
                  maxWidth: 760,
                  color: "#334155",
                  fontSize: {
                    xs: 16,
                    md: 19,
                  },
                  lineHeight: 1.65,
                }}
              >
                {loadingBlog
                  ? "Contenido para restaurantes."
                  : description}
              </Typography>
            </Stack>
          </Container>
        </Box>

        <Container
          sx={{
            position: "relative",
            zIndex: 2,
            mt: {
              xs: -6,
              sm: -6.5,
            },
          }}
        >
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              maxWidth: 920,
              mx: "auto",
              p: {
                xs: 1.5,
                sm: 1.8,
              },
              bgcolor: "#ffffff",
              borderRadius: {
                xs: 3,
                md: 4,
              },
              border:
                "1px solid rgba(15,23,42,0.08)",
              boxShadow:
                "0 24px 55px rgba(15,23,42,0.14)",
            }}
          >
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1.2}
            >
              <TextField
                fullWidth
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Buscar artículos, consejos o estrategias"
                inputProps={{
                  maxLength: 150,
                  "aria-label": "Buscar publicaciones",
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon
                        sx={{
                          color: "#94a3b8",
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    minHeight: 54,
                    borderRadius: 2.5,
                    bgcolor: "#f8fafc",

                    "& fieldset": {
                      borderColor: "transparent",
                    },

                    "&:hover fieldset": {
                      borderColor:
                        "rgba(211,92,58,0.25)",
                    },

                    "&.Mui-focused fieldset": {
                      borderColor:
                        landingColors.primary,
                    },
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                startIcon={<SearchRoundedIcon />}
                sx={{
                  ...landingButtonSx.primary,
                  minWidth: {
                    xs: "100%",
                    sm: 150,
                  },
                  minHeight: 54,
                  borderRadius: 2.5,
                  fontWeight: 950,
                }}
              >
                Buscar
              </Button>

              {search && (
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleClearSearch}
                  sx={{
                    minWidth: {
                      xs: "100%",
                      sm: 105,
                    },
                    minHeight: 54,
                    borderRadius: 2.5,
                    color: "#334155",
                    borderColor:
                      "rgba(15,23,42,0.16)",
                    fontWeight: 850,
                    textTransform: "none",
                  }}
                >
                  Limpiar
                </Button>
              )}
            </Stack>
          </Box>
        </Container>

        <Box
          component="section"
          sx={{
            pt: {
              xs: 6,
              md: 8,
            },
            pb: {
              xs: 8,
              md: 11,
            },
          }}
        >
          <Container>
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 4,
                  borderRadius: 2.5,
                }}
              >
                {error}
              </Alert>
            )}

            {loadingPosts ? (
              <Stack
                spacing={2}
                alignItems="center"
                justifyContent="center"
                sx={{
                  minHeight: 360,
                }}
              >
                <CircularProgress />

                <Typography
                  sx={{
                    color: "#64748b",
                    fontWeight: 700,
                  }}
                >
                  Cargando publicaciones...
                </Typography>
              </Stack>
            ) : posts.length === 0 ? (
              <Box
                sx={{
                  maxWidth: 620,
                  mx: "auto",
                  py: 8,
                  px: 3,
                  textAlign: "center",
                  bgcolor: "#ffffff",
                  borderRadius: 4,
                  border:
                    "1px solid rgba(15,23,42,0.08)",
                }}
              >
                <AutoStoriesRoundedIcon
                  sx={{
                    mb: 2,
                    fontSize: 58,
                    color: landingColors.primary,
                  }}
                />

                <Typography
                  component="h2"
                  sx={{
                    color: "#15191f",
                    fontSize: {
                      xs: 25,
                      md: 31,
                    },
                    fontWeight: 950,
                  }}
                >
                  No se encontraron publicaciones
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "#64748b",
                    lineHeight: 1.7,
                  }}
                >
                  Cambia los términos de búsqueda o consulta nuevamente más
                  tarde.
                </Typography>

                {search && (
                  <Button
                    type="button"
                    variant="contained"
                    onClick={handleClearSearch}
                    sx={{
                      ...landingButtonSx.primary,
                      mt: 3,
                    }}
                  >
                    Ver todas
                  </Button>
                )}
              </Box>
            ) : (
              <>
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{
                    xs: "flex-start",
                    sm: "flex-end",
                  }}
                  sx={{
                    mb: {
                      xs: 3,
                      md: 4,
                    },
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: landingColors.primary,
                        fontSize: 11,
                        fontWeight: 950,
                        letterSpacing: "0.13em",
                        textTransform: "uppercase",
                      }}
                    >
                      Contenido para restaurantes
                    </Typography>

                    <Typography
                      component="h2"
                      sx={{
                        mt: 0.5,
                        color: "#15191f",
                        fontSize: {
                          xs: 28,
                          md: 36,
                        },
                        fontWeight: 950,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {search
                        ? `Resultados para “${search}”`
                        : "Últimas publicaciones"}
                    </Typography>
                  </Box>

                  {totalPosts > 0 && (
                    <Typography
                      sx={{
                        color: "#64748b",
                        fontSize: 13,
                        fontWeight: 750,
                      }}
                    >
                      {totalPosts}{" "}
                      {totalPosts === 1
                        ? "publicación"
                        : "publicaciones"}
                    </Typography>
                  )}
                </Stack>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                      lg: "repeat(3, minmax(0, 1fr))",
                    },
                    gap: {
                      xs: 2.5,
                      md: 3.5,
                    },
                    alignItems: "stretch",
                  }}
                >
                  {posts.map((post) => (
                    <Card
                      key={post.slug}
                      variant="outlined"
                      sx={{
                        minWidth: 0,
                        height: "100%",
                        overflow: "hidden",
                        borderRadius: {
                          xs: 3,
                          md: 4,
                        },
                        bgcolor: "#ffffff",
                        borderColor:
                          "rgba(15,23,42,0.10)",
                        boxShadow:
                          "0 8px 24px rgba(15,23,42,0.06)",
                        transition:
                          "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",

                        "&:hover": {
                          transform:
                            "translateY(-7px)",
                          borderColor:
                            "rgba(211,92,58,0.28)",
                          boxShadow:
                            "0 20px 45px rgba(15,23,42,0.14)",
                        },

                        "&:hover img": {
                          transform: "scale(1.04)",
                        },
                      }}
                    >
                      <CardActionArea
                        onClick={() =>
                          openPost(post.slug)
                        }
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "stretch",
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            height: {
                              xs: 230,
                              sm: 245,
                              md: 250,
                            },
                            overflow: "hidden",
                            bgcolor: "#e9eef5",
                          }}
                        >
                          <PostCover post={post} />
                        </Box>

                        <CardContent
                          sx={{
                            width: "100%",
                            minWidth: 0,
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            p: {
                              xs: 2.5,
                              md: 3,
                            },

                            "&:last-child": {
                              pb: {
                                xs: 2.5,
                                md: 3,
                              },
                            },
                          }}
                        >
                          {post.category?.name && (
                            <Chip
                              label={
                                post.category.name
                              }
                              size="small"
                              sx={{
                                mb: 2.2,
                                height: 28,
                                maxWidth: "100%",
                                borderRadius: 1.2,
                                bgcolor:
                                  landingColors.primary,
                                color: "#ffffff",
                                fontSize: 12,
                                fontWeight: 900,

                                "& .MuiChip-label": {
                                  px: 1.4,
                                  overflow: "hidden",
                                  textOverflow:
                                    "ellipsis",
                                },
                              }}
                            />
                          )}

                          <Typography
                            component="h3"
                            sx={{
                              width: "100%",
                              color: "#10203a",
                              fontSize: {
                                xs: 21,
                                md: 23,
                              },
                              fontWeight: 950,
                              lineHeight: 1.22,
                              letterSpacing: "-0.025em",
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient:
                                "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {post.title}
                          </Typography>

                          {post.excerpt && (
                            <Typography
                              sx={{
                                mt: 1.5,
                                width: "100%",
                                color: "#64748b",
                                fontSize: 14,
                                lineHeight: 1.65,
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient:
                                  "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {post.excerpt}
                            </Typography>
                          )}

                          <Box
                            sx={{
                              mt: "auto",
                              width: "100%",
                              pt: 2.5,
                            }}
                          >
                            {post.published_at && (
                              <Stack
                                direction="row"
                                spacing={0.7}
                                alignItems="center"
                                sx={{
                                  mb: 1.4,
                                }}
                              >
                                <CalendarMonthRoundedIcon
                                  sx={{
                                    fontSize: 16,
                                    color: "#94a3b8",
                                  }}
                                />

                                <Typography
                                  sx={{
                                    color: "#64748b",
                                    fontSize: 12,
                                    fontWeight: 700,
                                  }}
                                >
                                  {formatPublishedDate(
                                    post.published_at
                                  )}
                                </Typography>
                              </Stack>
                            )}

                            <Stack
                              direction="row"
                              spacing={0.6}
                              alignItems="center"
                              sx={{
                                color:
                                  landingColors.primary,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: 14,
                                  fontWeight: 950,
                                }}
                              >
                                Leer publicación
                              </Typography>

                              <ArrowForwardRoundedIcon
                                sx={{
                                  fontSize: 19,
                                }}
                              />
                            </Stack>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  ))}
                </Box>

                {Number(meta?.last_page || 1) > 1 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: {
                        xs: 6,
                        md: 8,
                      },
                    }}
                  >
                    <Pagination
                      page={Number(
                        meta?.current_page || page
                      )}
                      count={Number(
                        meta?.last_page || 1
                      )}
                      onChange={handlePageChange}
                      color="primary"
                      shape="rounded"
                      size="large"
                      sx={{
                        "& .MuiPaginationItem-root":
                          {
                            fontWeight: 850,
                          },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Container>
        </Box>

        <Box
          component="section"
          sx={{
            px: {
              xs: 2,
              sm: 3,
            },
            pb: {
              xs: 8,
              md: 11,
            },
          }}
        >
          <Container
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: {
                xs: 3,
                md: 4,
              },
              bgcolor: "#151d27",
              color: "#ffffff",
              px: {
                xs: 3,
                sm: 5,
                md: 7,
              },
              py: {
                xs: 5,
                md: 6,
              },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -110,
                right: -80,
                width: 250,
                height: 250,
                borderRadius: "50%",
                bgcolor: "rgba(211,92,58,0.24)",
              }}
            />

            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              spacing={3}
              alignItems={{
                xs: "flex-start",
                md: "center",
              }}
              justifyContent="space-between"
              sx={{
                position: "relative",
                zIndex: 1,
              }}
            >
              <Box
                sx={{
                  maxWidth: 680,
                }}
              >
                <Typography
                  component="h2"
                  sx={{
                    fontSize: {
                      xs: 29,
                      md: 39,
                    },
                    fontWeight: 950,
                    lineHeight: 1.1,
                    letterSpacing: "-0.04em",
                  }}
                >
                  Lleva el control de tu restaurante con Clic Menu
                </Typography>

                <Typography
                  sx={{
                    mt: 1.4,
                    color:
                      "rgba(255,255,255,0.75)",
                    fontSize: {
                      xs: 15,
                      md: 16,
                    },
                    lineHeight: 1.65,
                  }}
                >
                  Menú QR, punto de venta, comandas, inventarios y reportes en
                  una sola plataforma.
                </Typography>
              </Box>

              <Button
                type="button"
                variant="contained"
                onClick={() =>
                  navigate("/auth/register")
                }
                sx={{
                  ...landingButtonSx.primary,
                  minWidth: {
                    xs: "100%",
                    sm: 220,
                  },
                  minHeight: 48,
                  flexShrink: 0,
                }}
              >
                Probar gratis por 7 días
              </Button>
            </Stack>
          </Container>
        </Box>

        <LandingFooter />
      </Box>
    </>
  );
}