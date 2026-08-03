import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Container,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import LandingMenu from "../../../components/landing/menu/LandingMenu";
import LandingFooter from "../../../components/landing/footer/LandingFooter";
import SEO from "../../../components/seo/SEO";

import {
  landingButtonSx,
  landingColors,
  landingTypography,
} from "../../../theme/landingTheme";

import {
  getClicMenuBlogCategoryPosts,
  getClicMenuBlogTagPosts,
} from "../../../services/public/clicMenuBlog.service";

const POSTS_PER_PAGE = 9;

function formatPublishedDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function BlogFilteredPostsPage({ type }) {
  const navigate = useNavigate();
  const { categorySlug, tagSlug } = useParams();

  const slug = type === "category" ? categorySlug : tagSlug;
  const isCategory = type === "category";

  const [posts, setPosts] = useState([]);
  const [filterData, setFilterData] = useState(null);
  const [meta, setMeta] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      setLoading(true);
      setError("");

      try {
        const params = {
          page,
          per_page: POSTS_PER_PAGE,
          search,
          order: "latest",
        };

        const result = isCategory
          ? await getClicMenuBlogCategoryPosts(slug, params)
          : await getClicMenuBlogTagPosts(slug, params);

        if (!active) return;

        setPosts(Array.isArray(result?.data) ? result.data : []);
        setMeta(result?.meta ?? null);
        setFilterData(
          isCategory
            ? result?.category ?? null
            : result?.tag ?? null
        );
      } catch (requestError) {
        if (!active) return;

        setPosts([]);
        setMeta(null);
        setFilterData(null);

        setError(
          requestError?.response?.status === 404
            ? `${isCategory ? "La categoría" : "La etiqueta"} solicitada no está disponible.`
            : requestError?.response?.data?.message ||
                "No fue posible cargar las publicaciones."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    if (slug) {
      loadPosts();
    } else {
      setLoading(false);
      setError("El filtro solicitado no es válido.");
    }

    return () => {
      active = false;
    };
  }, [isCategory, page, search, slug]);

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
      top: 0,
      behavior: "smooth",
    });
  };

  const pageTitle =
    filterData?.name ||
    (isCategory ? "Categoría" : "Etiqueta");

  const pageDescription = isCategory
    ? filterData?.description ||
      `Publicaciones de la categoría ${pageTitle}.`
    : `Publicaciones relacionadas con la etiqueta ${pageTitle}.`;

  return (
    <>
      <SEO
        title={`${pageTitle} | Blog Clic Menu`}
        description={pageDescription}
        keywords={`${pageTitle}, restaurantes, Clic Menu`}
        url={`https://clicmenu.com.mx/blog/${
          isCategory ? "categorias" : "etiquetas"
        }/${slug}`}
      />

      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          bgcolor: landingColors.white,
          overflowX: "hidden",
        }}
      >
        <LandingMenu />

        <Box
          component="header"
          sx={{
            bgcolor: landingColors.orangeSoft,
            borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
            py: {
              xs: 5,
              md: 7,
            },
          }}
        >
          <Container>
            <Stack
              spacing={2}
              alignItems="center"
              sx={{
                maxWidth: 800,
                mx: "auto",
                textAlign: "center",
              }}
            >
              <Typography
                component="span"
                sx={{
                  color: landingColors.primary,
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {isCategory ? "Categoría" : "Etiqueta"}
              </Typography>

              <Typography
                component="h1"
                sx={{
                  ...landingTypography.landingTitleXL,
                  color: "#0f172a",
                  fontSize: {
                    xs: "clamp(30px, 8vw, 42px)",
                    md: "clamp(40px, 5vw, 54px)",
                  },
                  lineHeight: 1.08,
                  letterSpacing: "-0.04em",
                }}
              >
                {pageTitle}
              </Typography>

              <Typography
                sx={{
                  maxWidth: 680,
                  color: "#475569",
                  fontSize: {
                    xs: 15,
                    md: 17,
                  },
                  lineHeight: 1.65,
                }}
              >
                {pageDescription}
              </Typography>

              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate("/blog")}
                sx={{
                  fontWeight: 900,
                  textTransform: "none",
                }}
              >
                Volver al blog
              </Button>
            </Stack>
          </Container>
        </Box>

        <Box
          component="section"
          sx={{
            py: {
              xs: 5,
              md: 8,
            },
          }}
        >
          <Container>
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                display: "flex",
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                gap: 1.5,
                maxWidth: 760,
                mx: "auto",
                mb: {
                  xs: 4,
                  md: 6,
                },
              }}
            >
              <TextField
                fullWidth
                size="small"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Buscar publicaciones"
                inputProps={{
                  maxLength: 150,
                  "aria-label": "Buscar publicaciones",
                }}
              />

              <Button
                type="submit"
                variant="contained"
                sx={{
                  ...landingButtonSx.primary,
                  minWidth: {
                    sm: 130,
                  },
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
                      sm: 110,
                    },
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                  }}
                >
                  Limpiar
                </Button>
              )}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box
                sx={{
                  minHeight: 280,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress />
              </Box>
            ) : posts.length === 0 ? (
              <Box
                sx={{
                  py: 8,
                  textAlign: "center",
                }}
              >
                <Typography
                  component="h2"
                  sx={{
                    color: "#0f172a",
                    fontSize: 24,
                    fontWeight: 900,
                  }}
                >
                  No se encontraron publicaciones
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "#64748b",
                  }}
                >
                  No hay contenido disponible para este filtro.
                </Typography>
              </Box>
            ) : (
              <>
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
                      md: 3,
                    },
                  }}
                >
                  {posts.map((post) => (
                    <Card
                      key={post.slug}
                      variant="outlined"
                      sx={{
                        height: "100%",
                        borderRadius: 3,
                        borderColor: "rgba(15, 23, 42, 0.10)",
                        boxShadow: "none",
                        overflow: "hidden",
                      }}
                    >
                      <CardActionArea
                        onClick={() =>
                          navigate(`/blogs/${post.slug}`)
                        }
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "stretch",
                        }}
                      >
                        {post.cover?.url ? (
                          <Box
                            component="img"
                            src={post.cover.url}
                            alt={
                              post.cover.alt_text ||
                              post.title
                            }
                            loading="lazy"
                            sx={{
                              width: "100%",
                              aspectRatio: "16 / 9",
                              objectFit: "cover",
                              bgcolor: "#f1f5f9",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: "100%",
                              aspectRatio: "16 / 9",
                              bgcolor: landingColors.orangeSoft,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: landingColors.primary,
                              fontWeight: 900,
                            }}
                          >
                            Clic Menu
                          </Box>
                        )}

                        <CardContent
                          sx={{
                            width: "100%",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            p: 2.5,
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#64748b",
                              fontSize: 12,
                              mb: 1.25,
                            }}
                          >
                            {formatPublishedDate(
                              post.published_at
                            )}
                          </Typography>

                          <Typography
                            component="h2"
                            sx={{
                              color: "#0f172a",
                              fontSize: 20,
                              fontWeight: 900,
                              lineHeight: 1.25,
                              letterSpacing: "-0.02em",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {post.title}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 1.25,
                              color: "#64748b",
                              fontSize: 14,
                              lineHeight: 1.65,
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {post.excerpt ||
                              "Consulta esta publicación del blog de Clic Menu."}
                          </Typography>

                          <Typography
                            sx={{
                              mt: "auto",
                              pt: 2.5,
                              color: landingColors.primary,
                              fontSize: 14,
                              fontWeight: 900,
                            }}
                          >
                            Leer publicación
                          </Typography>
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
                        xs: 5,
                        md: 7,
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
                    />
                  </Box>
                )}
              </>
            )}
          </Container>
        </Box>

        <LandingFooter />
      </Box>
    </>
  );
}