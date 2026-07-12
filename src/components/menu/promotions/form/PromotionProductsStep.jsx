import {
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import PaginationFooter from "../../../common/PaginationFooter";

import {
  buildPromotionTargetKey,
  formatPromotionCurrency,
} from "./promotionForm.helpers";

const ITEMS_PER_PAGE = 5;

function getCategoryName(product) {
  return (
    product?.category?.name ||
    product?.category_name ||
    "Sin categoría"
  );
}

function formatPriceRange(item) {
  const minimumPrice =
    item?.price_min ??
    item?.base_price ??
    item?.price ??
    null;

  const maximumPrice =
    item?.price_max ??
    item?.base_price ??
    item?.price ??
    null;

  if (
    item?.has_different_prices &&
    Number.isFinite(Number(minimumPrice)) &&
    Number.isFinite(Number(maximumPrice)) &&
    Number(minimumPrice) !==
      Number(maximumPrice)
  ) {
    return `${formatPromotionCurrency(
      minimumPrice
    )} a ${formatPromotionCurrency(
      maximumPrice
    )}`;
  }

  return formatPromotionCurrency(
    minimumPrice
  );
}

export default function PromotionProductsStep({
  products = [],
  targets = [],
  selectedChannelIds = [],
  loading = false,
  onToggleProduct,
  onToggleVariant,
}) {
  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("all");

  const [page, setPage] =
    useState(1);

  const safeProducts = useMemo(
    () =>
      Array.isArray(products)
        ? products
        : [],
    [products]
  );

  const normalizedSelectedChannelIds =
    useMemo(() => {
      return Array.from(
        new Set(
          (
            Array.isArray(
              selectedChannelIds
            )
              ? selectedChannelIds
              : []
          )
            .map((id) => Number(id))
            .filter(
              (id) =>
                Number.isInteger(id) &&
                id > 0
            )
        )
      );
    }, [selectedChannelIds]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        safeProducts
          .map(getCategoryName)
          .filter(Boolean)
      )
    ).sort((a, b) =>
      a.localeCompare(b, "es", {
        sensitivity: "base",
      })
    );
  }, [safeProducts]);

  const filteredProducts =
    useMemo(() => {
      const normalizedSearch = String(
        search || ""
      )
        .trim()
        .toLocaleLowerCase("es-MX");

      return safeProducts.filter(
        (product) => {
          const categoryName =
            getCategoryName(product);

          const matchesCategory =
            category === "all" ||
            categoryName === category;

          const matchesSearch =
            normalizedSearch === "" ||
            [
              product?.name,
              product?.display_name,
              categoryName,
              product?.description,
            ]
              .filter(Boolean)
              .join(" ")
              .toLocaleLowerCase(
                "es-MX"
              )
              .includes(
                normalizedSearch
              );

          return (
            matchesCategory &&
            matchesSearch
          );
        }
      );
    }, [
      safeProducts,
      search,
      category,
    ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length /
        ITEMS_PER_PAGE
    )
  );

  useEffect(() => {
    setPage(1);
  }, [
    search,
    category,
    safeProducts,
  ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedProducts =
    useMemo(() => {
      const start =
        (page - 1) *
        ITEMS_PER_PAGE;

      return filteredProducts.slice(
        start,
        start + ITEMS_PER_PAGE
      );
    }, [filteredProducts, page]);

  const startItem =
    filteredProducts.length === 0
      ? 0
      : (page - 1) *
          ITEMS_PER_PAGE +
        1;

  const endItem = Math.min(
    page * ITEMS_PER_PAGE,
    filteredProducts.length
  );

  const selectedTargetKeys =
    useMemo(() => {
      return new Set(
        (
          Array.isArray(targets)
            ? targets
            : []
        ).map(
          (target) =>
            target.target_key
        )
      );
    }, [targets]);

  const hasSelectedChannels =
    normalizedSelectedChannelIds.length >
    0;

  const emptyTitle =
    !hasSelectedChannels
      ? "Selecciona los canales de venta"
      : safeProducts.length === 0
        ? "No hay productos vendibles"
        : "No se encontraron productos";

  const emptyMessage =
    !hasSelectedChannels
      ? "Selecciona al menos un canal de venta para consultar los productos y variantes disponibles."
      : safeProducts.length === 0
        ? "No existen productos habilitados en todos los canales seleccionados."
        : "Ajusta la búsqueda o la categoría seleccionada.";

  return (
    <Paper
      sx={{
        p: 0,
        overflow: "hidden",
        borderRadius: 1,
        backgroundColor:
          "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Box
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography
              sx={{
                fontSize: {
                  xs: 18,
                  sm: 20,
                },
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Productos participantes
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Puedes seleccionar el producto base,
              una o varias variantes, o ambos.
              Solo se muestran productos y variantes
              vendibles en todos los canales seleccionados.
            </Typography>
          </Box>

          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={2}
          >
            <TextField
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Buscar producto..."
              disabled={
                loading ||
                !hasSelectedChannels
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon
                      fontSize="small"
                      sx={{
                        color:
                          "text.secondary",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              disabled={
                loading ||
                !hasSelectedChannels
              }
              SelectProps={{
                IconComponent:
                  KeyboardArrowDownIcon,
              }}
              sx={{
                width: {
                  xs: "100%",
                  md: 260,
                },
                flexShrink: 0,
              }}
            >
              <MenuItem value="all">
                Todas las categorías
              </MenuItem>

              {categories.map(
                (categoryName) => (
                  <MenuItem
                    key={categoryName}
                    value={categoryName}
                  >
                    {categoryName}
                  </MenuItem>
                )
              )}
            </TextField>
          </Stack>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              sm: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 800,
                color:
                  targets.length > 0
                    ? "primary.main"
                    : "text.secondary",
              }}
            >
              {targets.length === 1
                ? "1 participante seleccionado"
                : `${targets.length} participantes seleccionados`}
            </Typography>

            {hasSelectedChannels ? (
              <Chip
                size="small"
                variant="outlined"
                label={
                  normalizedSelectedChannelIds.length ===
                  1
                    ? "1 canal seleccionado"
                    : `${normalizedSelectedChannelIds.length} canales seleccionados`
                }
              />
            ) : null}
          </Stack>
        </Stack>
      </Box>

      {loading ? (
        <Stack
          spacing={1.5}
          alignItems="center"
          sx={{ py: 5 }}
        >
          <CircularProgress />

          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Consultando productos y
            variantes vendibles…
          </Typography>
        </Stack>
      ) : paginatedProducts.length ===
        0 ? (
        <Box
          sx={{
            px: 3,
            py: 6,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            {emptyTitle}
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            {emptyMessage}
          </Typography>
        </Box>
      ) : (
        <Box>
          {paginatedProducts.map(
            (product, index) => {
              const productKey =
                product?.target_key ||
                buildPromotionTargetKey(
                  product.id
                );

              const productSelected =
                selectedTargetKeys.has(
                  productKey
                );

              const variants =
                Array.isArray(
                  product?.variants
                )
                  ? product.variants
                  : [];

              const hasVariants =
                product?.has_variants ===
                  true &&
                variants.length > 0;

              const hasSelectedVariant =
                variants.some((variant) => {
                  const variantKey =
                    variant?.target_key ||
                    buildPromotionTargetKey(
                      product.id,
                      variant.id
                    );

                  return selectedTargetKeys.has(
                    variantKey
                  );
                });

              return (
                <Box
                  key={product.id}
                  sx={{
                    p: {
                      xs: 2,
                      sm: 2.5,
                    },
                    borderBottom:
                      index ===
                      paginatedProducts.length -
                        1
                        ? "none"
                        : "1px solid",
                    borderColor:
                      "divider",
                    backgroundColor:
                      productSelected ||
                      hasSelectedVariant
                        ? "rgba(255, 152, 0, 0.04)"
                        : "transparent",
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      justifyContent="space-between"
                      alignItems={{
                        xs: "flex-start",
                        sm: "center",
                      }}
                      spacing={1.5}
                    >
                      <Box
                        sx={{
                          minWidth: 0,
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          flexWrap="wrap"
                        >
                          <Typography
                            sx={{
                              fontSize: 16,
                              fontWeight: 800,
                              color:
                                "text.primary",
                            }}
                          >
                            {product.display_name ||
                              product.name}
                          </Typography>

                          <Chip
                            label={getCategoryName(
                              product
                            )}
                            size="small"
                            variant="outlined"
                          />

                          {hasVariants ? (
                            <Chip
                              label={
                                variants.length ===
                                1
                                  ? "1 variante"
                                  : `${variants.length} variantes`
                              }
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          ) : null}
                        </Stack>

                        {product.description ? (
                          <Typography
                            sx={{
                              mt: 0.5,
                              fontSize: 13,
                              color:
                                "text.secondary",
                            }}
                          >
                            {
                              product.description
                            }
                          </Typography>
                        ) : null}

                        <Typography
                          sx={{
                            mt: 0.5,
                            fontSize: 13,
                            color:
                              "text.secondary",
                          }}
                        >
                          Precio de referencia:{" "}
                          {formatPriceRange(
                            product
                          )}
                        </Typography>
                      </Box>

                      <Chip
                        label="Disponible"
                        size="small"
                        color="success"
                      />
                    </Stack>

                    <FormControlLabel
                      sx={{ m: 0 }}
                      control={
                        <Checkbox
                          checked={
                            productSelected
                          }
                          disabled={
                            !hasSelectedChannels
                          }
                          onChange={(event) =>
                            onToggleProduct(
                              product,
                              event.target
                                .checked
                            )
                          }
                          color="primary"
                        />
                      }
                      label={
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 700,
                            color:
                              hasSelectedChannels
                                ? "text.primary"
                                : "text.secondary",
                          }}
                        >
                          Seleccionar producto base
                        </Typography>
                      }
                    />

                    {hasVariants ? (
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor:
                            "divider",
                          backgroundColor:
                            "background.default",
                        }}
                      >
                        <Typography
                          sx={{
                            mb: 1,
                            fontSize: 13,
                            fontWeight: 800,
                            color:
                              "text.secondary",
                          }}
                        >
                          Variantes disponibles
                        </Typography>

                        <Stack spacing={1}>
                          {variants.map(
                            (variant) => {
                              const variantKey =
                                variant?.target_key ||
                                buildPromotionTargetKey(
                                  product.id,
                                  variant.id
                                );

                              const selected =
                                selectedTargetKeys.has(
                                  variantKey
                                );

                              return (
                                <Box
                                  key={
                                    variant.id
                                  }
                                  sx={{
                                    p: 1.25,
                                    borderRadius: 1,
                                    border:
                                      "1px solid",
                                    borderColor:
                                      selected
                                        ? "primary.main"
                                        : "divider",
                                    backgroundColor:
                                      selected
                                        ? "rgba(255, 152, 0, 0.06)"
                                        : "background.paper",
                                  }}
                                >
                                  <FormControlLabel
                                    sx={{
                                      m: 0,
                                      width:
                                        "100%",
                                    }}
                                    control={
                                      <Checkbox
                                        checked={
                                          selected
                                        }
                                        disabled={
                                          !hasSelectedChannels
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          onToggleVariant(
                                            product,
                                            variant,
                                            event
                                              .target
                                              .checked
                                          )
                                        }
                                      />
                                    }
                                    label={
                                      <Stack
                                        direction={{
                                          xs: "column",
                                          sm: "row",
                                        }}
                                        spacing={{
                                          xs: 0.25,
                                          sm: 1,
                                        }}
                                        justifyContent="space-between"
                                        alignItems={{
                                          xs: "flex-start",
                                          sm: "center",
                                        }}
                                        sx={{
                                          width:
                                            "100%",
                                        }}
                                      >
                                        <Box>
                                          <Typography
                                            sx={{
                                              fontSize: 14,
                                              fontWeight: 800,
                                              color:
                                                "text.primary",
                                            }}
                                          >
                                            {
                                              variant.name
                                            }
                                          </Typography>

                                          {variant?.is_default ? (
                                            <Typography
                                              sx={{
                                                mt: 0.25,
                                                fontSize: 12,
                                                color:
                                                  "text.secondary",
                                              }}
                                            >
                                              Variante
                                              predeterminada
                                            </Typography>
                                          ) : null}
                                        </Box>

                                        <Typography
                                          sx={{
                                            fontSize: 13,
                                            fontWeight: 800,
                                            color:
                                              "text.primary",
                                          }}
                                        >
                                          {formatPriceRange(
                                            variant
                                          )}
                                        </Typography>
                                      </Stack>
                                    }
                                  />
                                </Box>
                              );
                            }
                          )}
                        </Stack>
                      </Box>
                    ) : null}
                  </Stack>
                </Box>
              );
            }
          )}
        </Box>
      )}

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        total={
          filteredProducts.length
        }
        hasPrev={page > 1}
        hasNext={page < totalPages}
        onPrev={() =>
          setPage((current) =>
            Math.max(
              1,
              current - 1
            )
          )
        }
        onNext={() =>
          setPage((current) =>
            Math.min(
              totalPages,
              current + 1
            )
          )
        }
        itemLabel="productos"
      />
    </Paper>
  );
}