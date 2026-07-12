import {
  Box,
  Button,
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
import { useEffect, useMemo, useState } from "react";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import PaginationFooter from "../../../common/PaginationFooter";

import {
  buildPromotionTargetKey,
  formatPromotionCurrency,
} from "./promotionForm.helpers";

const ITEMS_PER_PAGE = 5;

function getUnavailableChannels({
  productId,
  variantId = null,
  selectedChannelIds,
  channels,
  channelProductsByChannel,
}) {
  return selectedChannelIds
    .map((channelId) => {
      const channel = channels.find(
        (item) =>
          Number(
            item.branch_sales_channel_id
          ) === Number(channelId)
      );

      const channelData =
        channelProductsByChannel?.[
          String(channelId)
        ];

      if (!channelData?.loaded) {
        return null;
      }

      const rows = Array.isArray(
        channelData?.rows
      )
        ? channelData.rows
        : [];

      const exact = rows.find(
        (row) =>
          Number(row.product_id) ===
            Number(productId) &&
          Number(
            row.product_variant_id || 0
          ) === Number(variantId || 0)
      );

      const general = rows.find(
        (row) =>
          Number(row.product_id) ===
            Number(productId) &&
          !row.product_variant_id
      );

      const record = exact || general;

      if (!record || record.is_active === false) {
        return (
          channel?.name ||
          `Canal ${channelId}`
        );
      }

      return null;
    })
    .filter(Boolean);
}

export default function PromotionProductsStep({
  products,
  targets,
  channels,
  selectedChannelIds,
  variantsByProduct,
  loadingVariantIds,
  channelProductsByChannel,
  loading = false,
  onLoadVariants,
  onToggleProduct,
  onToggleVariant,
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState("all");
  const [page, setPage] = useState(1);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map(
            (product) =>
              product.category_name
          )
          .filter(Boolean)
      )
    ).sort((a, b) =>
      a.localeCompare(b, "es", {
        sensitivity: "base",
      })
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = String(
      search || ""
    )
      .trim()
      .toLocaleLowerCase("es-MX");

    return products.filter((product) => {
      const matchesCategory =
        category === "all" ||
        product.category_name === category;

      const matchesSearch =
        normalizedSearch === "" ||
        [
          product.name,
          product.category_name,
          product.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("es-MX")
          .includes(normalizedSearch);

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [products, search, category]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length /
        ITEMS_PER_PAGE
    )
  );

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start =
      (page - 1) * ITEMS_PER_PAGE;

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

  const selectedTargetKeys = useMemo(
    () =>
      new Set(
        targets.map(
          (target) => target.target_key
        )
      ),
    [targets]
  );

  return (
    <Paper
      sx={{
        p: 0,
        overflow: "hidden",
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
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
              Selecciona el producto completo o una
              variante específica. Los productos deben
              estar disponibles en todos los canales
              seleccionados.
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
                setSearch(event.target.value)
              }
              placeholder="Buscar producto..."
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
            Cargando productos disponibles…
          </Typography>
        </Stack>
      ) : paginatedProducts.length === 0 ? (
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
            No se encontraron productos
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Ajusta la búsqueda o la categoría
            seleccionada.
          </Typography>
        </Box>
      ) : (
        <Box>
          {paginatedProducts.map(
            (product, index) => {
              const productKey =
                buildPromotionTargetKey(
                  product.id
                );

              const productSelected =
                selectedTargetKeys.has(
                  productKey
                );

              const unavailableChannels =
                getUnavailableChannels({
                  productId: product.id,
                  selectedChannelIds,
                  channels,
                  channelProductsByChannel,
                });

              const productAvailable =
                selectedChannelIds.length >
                  0 &&
                unavailableChannels.length ===
                  0;

              const variants =
                variantsByProduct?.[
                  String(product.id)
                ];

              const variantsLoaded =
                Array.isArray(variants);

              const loadingVariants =
                loadingVariantIds.has(
                  String(product.id)
                );

              return (
                <Box
                  key={product.id}
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderBottom:
                      index ===
                      paginatedProducts.length -
                        1
                        ? "none"
                        : "1px solid",
                    borderColor: "divider",
                    backgroundColor:
                      productSelected
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
                      <Box sx={{ minWidth: 0 }}>
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
                            {product.name}
                          </Typography>

                          <Chip
                            label={
                              product.category_name ||
                              "Sin categoría"
                            }
                            size="small"
                            variant="outlined"
                          />
                        </Stack>

                        <Typography
                          sx={{
                            mt: 0.5,
                            fontSize: 13,
                            color:
                              "text.secondary",
                          }}
                        >
                          Precio de referencia:{" "}
                          {formatPromotionCurrency(
                            product.base_price
                          )}
                        </Typography>
                      </Box>

                      <Chip
                        label={
                          productAvailable
                            ? "Disponible"
                            : selectedChannelIds.length ===
                                0
                              ? "Selecciona canales"
                              : `No disponible en ${unavailableChannels.join(
                                  ", "
                                )}`
                        }
                        size="small"
                        color={
                          productAvailable
                            ? "success"
                            : "warning"
                        }
                        variant={
                          productAvailable
                            ? "filled"
                            : "outlined"
                        }
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
                            !productAvailable
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
                              productAvailable
                                ? "text.primary"
                                : "text.secondary",
                          }}
                        >
                          Seleccionar producto completo
                        </Typography>
                      }
                    />

                    {product.has_variants ? (
                      <Box>
                        <Button
                          type="button"
                          variant="outlined"
                          disabled={
                            loadingVariants
                          }
                          onClick={() =>
                            onLoadVariants(
                              product
                            )
                          }
                        >
                          {loadingVariants
                            ? "Cargando variantes…"
                            : variantsLoaded
                              ? "Volver a consultar variantes"
                              : "Ver variantes"}
                        </Button>
                      </Box>
                    ) : null}

                    {variantsLoaded ? (
                      variants.length === 0 ? (
                        <Typography
                          sx={{
                            fontSize: 13,
                            color:
                              "text.secondary",
                          }}
                        >
                          Este producto no tiene variantes
                          disponibles.
                        </Typography>
                      ) : (
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 1,
                            border:
                              "1px solid",
                            borderColor:
                              "divider",
                            backgroundColor:
                              "background.default",
                          }}
                        >
                          <Stack spacing={1}>
                            {variants.map(
                              (variant) => {
                                const variantKey =
                                  buildPromotionTargetKey(
                                    product.id,
                                    variant.id
                                  );

                                const selected =
                                  selectedTargetKeys.has(
                                    variantKey
                                  );

                                const unavailableVariantChannels =
                                  getUnavailableChannels(
                                    {
                                      productId:
                                        product.id,
                                      variantId:
                                        variant.id,
                                      selectedChannelIds,
                                      channels,
                                      channelProductsByChannel,
                                    }
                                  );

                                const available =
                                  selectedChannelIds.length >
                                    0 &&
                                  unavailableVariantChannels.length ===
                                    0;

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
                                            !available
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

                                          <Typography
                                            sx={{
                                              mt: 0.25,
                                              fontSize: 12,
                                              color:
                                                "text.secondary",
                                            }}
                                          >
                                            {available
                                              ? formatPromotionCurrency(
                                                  variant.price
                                                )
                                              : `No disponible en ${unavailableVariantChannels.join(
                                                  ", "
                                                )}`}
                                          </Typography>
                                        </Box>
                                      }
                                    />
                                  </Box>
                                );
                              }
                            )}
                          </Stack>
                        </Box>
                      )
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
        total={filteredProducts.length}
        hasPrev={page > 1}
        hasNext={page < totalPages}
        onPrev={() =>
          setPage((current) =>
            Math.max(1, current - 1)
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
