import {
  Box, Card, Checkbox, Chip, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
  Typography, useMediaQuery,
} from "@mui/material";

import {
  useMemo,
  useState,
} from "react";

import { useTheme } from "@mui/material/styles";

import ViewAgendaOutlinedIcon from "@mui/icons-material/ViewAgendaOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";

import usePagination from "../../../../hooks/usePagination";
import PaginationFooter from "../../../common/PaginationFooter";

import MenuHierarchyRow from "./MenuHierarchyRow";

import {
  filterHierarchy,
  getMoveAvailability,
  getScheduleCount,
  sortHierarchyItems,
} from "./menuContent.helpers";

const PAGE_SIZE = 5;

export default function MenuHierarchyEditor({
  sections,
  search,
  selectedOnly,
  readOnly,
  onToggle,
  onMove,
  onSchedule,
}) {
  const theme = useTheme();

  const useCards = useMediaQuery(
    theme.breakpoints.down("md")
  );

  const [expandedSections, setExpandedSections] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});

  const normalizedSearch = String(search || "").trim();

  /*
  |--------------------------------------------------------------------------
  | Durante una búsqueda se despliega automáticamente la jerarquía
  |--------------------------------------------------------------------------
  |
  | De esta manera, un resultado no queda escondido dentro de una sección
  | o categoría que el usuario haya contraído previamente.
  */
  const forceExpanded = normalizedSearch !== "";

  const isSectionExpanded = (sectionId) => {
    if (forceExpanded) return true;

    const key = String(sectionId);

    return expandedSections[key] !== false;
  };

  const categoryExpansionKey = (
    sectionId,
    categoryId
  ) => {
    return `${sectionId}:${categoryId}`;
  };

  const isCategoryExpanded = (
    sectionId,
    categoryId
  ) => {
    if (forceExpanded) return true;

    const key = categoryExpansionKey(
      sectionId,
      categoryId
    );

    return expandedCategories[key] !== false;
  };

  const toggleSectionExpanded = (sectionId) => {
    const key = String(sectionId);

    setExpandedSections((current) => ({
      ...current,
      [key]: current[key] === false,
    }));
  };

  const toggleCategoryExpanded = (
    sectionId,
    categoryId
  ) => {
    const key = categoryExpansionKey(
      sectionId,
      categoryId
    );

    setExpandedCategories((current) => ({
      ...current,
      [key]: current[key] === false,
    }));
  };

  const filteredSections = useMemo(
    () =>
      filterHierarchy(
        sections,
        search,
        selectedOnly
      ),
    [
      sections,
      search,
      selectedOnly,
    ]
  );

  const {
    page,
    nextPage,
    prevPage,
    total,
    totalPages,
    startItem,
    endItem,
    hasPrev,
    hasNext,
    paginatedItems,
  } = usePagination({
    items: sortHierarchyItems(
      filteredSections
    ),
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  return (
    <Paper sx={containerSx}>
      <Box
        sx={{
          px: 2,
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            Estructura del menú
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 12,
              color: "text.secondary",
            }}
          >
            Organiza el contenido respetando la jerarquía sección,
            categoría y producto.
          </Typography>
        </Box>

        <Chip
          label={
            total === 1
              ? "1 sección"
              : `${total} secciones`
          }
          color="primary"
          variant="outlined"
          size="small"
        />
      </Box>

      {paginatedItems.length === 0 ? (
        <Box
          sx={{
            px: 3,
            py: 5,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            No hay contenido para mostrar
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: 14,
              color: "text.secondary",
            }}
          >
            Cambia la búsqueda o el filtro de selección.
          </Typography>
        </Box>
      ) : (
        <>
          {useCards ? (
            <Stack
              spacing={1.5}
              sx={{ p: 2 }}
            >
              {paginatedItems.map((section) => {
                const originalSection =
                  sections.find(
                    (item) =>
                      Number(item.id) ===
                      Number(section.id)
                  ) || section;

                const sectionExpanded =
                  isSectionExpanded(section.id);

                return (
                  <SectionCard
                    key={section.id}
                    section={section}
                    originalSection={originalSection}
                    allSections={sections}
                    readOnly={readOnly}
                    expanded={sectionExpanded}
                    forceExpanded={forceExpanded}
                    isCategoryExpanded={isCategoryExpanded}
                    onToggleExpanded={() =>
                      toggleSectionExpanded(section.id)
                    }
                    onToggleCategoryExpanded={
                      toggleCategoryExpanded
                    }
                    onToggle={onToggle}
                    onMove={onMove}
                    onSchedule={onSchedule}
                  />
                );
              })}
            </Stack>
          ) : (
            <TableContainer
              sx={{
                width: "100%",
                overflowX: "auto",
              }}
            >
              <Table
                sx={{
                  minWidth: 1050,
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      "& th": {
                        backgroundColor: "primary.main",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: 13,
                        borderBottom: "none",
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    <TableCell>
                      Elemento
                    </TableCell>

                    <TableCell>
                      Disponibilidad
                    </TableCell>

                    <TableCell align="center">
                      Orden
                    </TableCell>

                    <TableCell>
                      Horario
                    </TableCell>

                    <TableCell align="right">
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedItems.map((section) => {
                    const originalSection =
                      sections.find(
                        (item) =>
                          Number(item.id) ===
                          Number(section.id)
                      ) || section;

                    const sectionMove =
                      getMoveAvailability(
                        sections,
                        section.id
                      );

                    const sectionExpanded =
                      isSectionExpanded(section.id);

                    const rows = [
                      <MenuHierarchyRow
                        key={`section-${section.id}`}
                        node={section}
                        type="section"
                        level={0}
                        readOnly={readOnly}
                        canExpand={
                          Array.isArray(section.categories) &&
                          section.categories.length > 0
                        }
                        expanded={sectionExpanded}
                        onExpandToggle={() =>
                          toggleSectionExpanded(section.id)
                        }
                        {...sectionMove}
                        onToggle={(checked) =>
                          onToggle(
                            {
                              type: "section",
                              sectionId: section.id,
                            },
                            checked
                          )
                        }
                        onMove={(direction) =>
                          onMove(
                            {
                              type: "section",
                              sectionId: section.id,
                            },
                            direction
                          )
                        }
                        onSchedule={() =>
                          onSchedule({
                            type: "section",
                            sectionId: section.id,
                          })
                        }
                      />,
                    ];

                    if (!sectionExpanded) {
                      return rows;
                    }

                    sortHierarchyItems(
                      section.categories || []
                    ).forEach((category) => {
                      const originalCategory =
                        (
                          originalSection.categories || []
                        ).find(
                          (item) =>
                            Number(item.id) ===
                            Number(category.id)
                        ) || category;

                      const categoryMove =
                        getMoveAvailability(
                          originalSection.categories || [],
                          category.id
                        );

                      const categoryExpanded =
                        isCategoryExpanded(
                          section.id,
                          category.id
                        );

                      rows.push(
                        <MenuHierarchyRow
                          key={`category-${category.id}`}
                          node={category}
                          type="category"
                          level={1}
                          readOnly={readOnly}
                          canExpand={
                            Array.isArray(category.products) &&
                            category.products.length > 0
                          }
                          expanded={categoryExpanded}
                          onExpandToggle={() =>
                            toggleCategoryExpanded(
                              section.id,
                              category.id
                            )
                          }
                          {...categoryMove}
                          onToggle={(checked) =>
                            onToggle(
                              {
                                type: "category",
                                sectionId: section.id,
                                categoryId: category.id,
                              },
                              checked
                            )
                          }
                          onMove={(direction) =>
                            onMove(
                              {
                                type: "category",
                                sectionId: section.id,
                                categoryId: category.id,
                              },
                              direction
                            )
                          }
                          onSchedule={() =>
                            onSchedule({
                              type: "category",
                              sectionId: section.id,
                              categoryId: category.id,
                            })
                          }
                        />
                      );

                      if (!categoryExpanded) {
                        return;
                      }

                      sortHierarchyItems(
                        category.products || []
                      ).forEach((product) => {
                        const productMove =
                          getMoveAvailability(
                            originalCategory.products || [],
                            product.id
                          );

                        rows.push(
                          <MenuHierarchyRow
                            key={`product-${product.id}`}
                            node={product}
                            type="product"
                            level={2}
                            readOnly={readOnly}
                            canExpand={false}
                            expanded={false}
                            {...productMove}
                            onToggle={(checked) =>
                              onToggle(
                                {
                                  type: "product",
                                  sectionId: section.id,
                                  categoryId: category.id,
                                  productId: product.id,
                                },
                                checked
                              )
                            }
                            onMove={(direction) =>
                              onMove(
                                {
                                  type: "product",
                                  sectionId: section.id,
                                  categoryId: category.id,
                                  productId: product.id,
                                },
                                direction
                              )
                            }
                            onSchedule={() =>
                              onSchedule({
                                type: "product",
                                sectionId: section.id,
                                categoryId: category.id,
                                productId: product.id,
                              })
                            }
                          />
                        );
                      });
                    });

                    return rows;
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <PaginationFooter
            page={page}
            totalPages={totalPages}
            startItem={startItem}
            endItem={endItem}
            total={total}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={prevPage}
            onNext={nextPage}
            itemLabel="secciones"
          />
        </>
      )}
    </Paper>
  );
}

function SectionCard({
  section,
  originalSection,
  allSections,
  readOnly,
  expanded,
  forceExpanded,
  isCategoryExpanded,
  onToggleExpanded,
  onToggleCategoryExpanded,
  onToggle,
  onMove,
  onSchedule,
}) {
  const move = getMoveAvailability(
    allSections,
    section.id
  );

  return (
    <Card
      sx={{
        width: "100%",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <MobileNode
        node={section}
        type="section"
        level={0}
        readOnly={readOnly}
        canExpand={
          Array.isArray(section.categories) &&
          section.categories.length > 0
        }
        expanded={expanded}
        onExpandToggle={
          forceExpanded
            ? undefined
            : onToggleExpanded
        }
        {...move}
        onToggle={(checked) =>
          onToggle(
            {
              type: "section",
              sectionId: section.id,
            },
            checked
          )
        }
        onMove={(direction) =>
          onMove(
            {
              type: "section",
              sectionId: section.id,
            },
            direction
          )
        }
        onSchedule={() =>
          onSchedule({
            type: "section",
            sectionId: section.id,
          })
        }
      />

      {expanded
        ? sortHierarchyItems(
            section.categories || []
          ).map((category) => {
            const originalCategory =
              (
                originalSection.categories || []
              ).find(
                (item) =>
                  Number(item.id) ===
                  Number(category.id)
              ) || category;

            const categoryMove =
              getMoveAvailability(
                originalSection.categories || [],
                category.id
              );

            const categoryExpanded =
              isCategoryExpanded(
                section.id,
                category.id
              );

            return (
              <Box
                key={category.id}
                sx={{
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <MobileNode
                  node={category}
                  type="category"
                  level={1}
                  readOnly={readOnly}
                  canExpand={
                    Array.isArray(category.products) &&
                    category.products.length > 0
                  }
                  expanded={categoryExpanded}
                  onExpandToggle={
                    forceExpanded
                      ? undefined
                      : () =>
                          onToggleCategoryExpanded(
                            section.id,
                            category.id
                          )
                  }
                  {...categoryMove}
                  onToggle={(checked) =>
                    onToggle(
                      {
                        type: "category",
                        sectionId: section.id,
                        categoryId: category.id,
                      },
                      checked
                    )
                  }
                  onMove={(direction) =>
                    onMove(
                      {
                        type: "category",
                        sectionId: section.id,
                        categoryId: category.id,
                      },
                      direction
                    )
                  }
                  onSchedule={() =>
                    onSchedule({
                      type: "category",
                      sectionId: section.id,
                      categoryId: category.id,
                    })
                  }
                />

                {categoryExpanded
                  ? sortHierarchyItems(
                      category.products || []
                    ).map((product) => {
                      const productMove =
                        getMoveAvailability(
                          originalCategory.products || [],
                          product.id
                        );

                      return (
                        <MobileNode
                          key={product.id}
                          node={product}
                          type="product"
                          level={2}
                          readOnly={readOnly}
                          canExpand={false}
                          expanded={false}
                          {...productMove}
                          onToggle={(checked) =>
                            onToggle(
                              {
                                type: "product",
                                sectionId: section.id,
                                categoryId: category.id,
                                productId: product.id,
                              },
                              checked
                            )
                          }
                          onMove={(direction) =>
                            onMove(
                              {
                                type: "product",
                                sectionId: section.id,
                                categoryId: category.id,
                                productId: product.id,
                              },
                              direction
                            )
                          }
                          onSchedule={() =>
                            onSchedule({
                              type: "product",
                              sectionId: section.id,
                              categoryId: category.id,
                              productId: product.id,
                            })
                          }
                        />
                      );
                    })
                  : null}
              </Box>
            );
          })
        : null}
    </Card>
  );
}

function MobileNode({
  node,
  type,
  level,
  readOnly,
  canExpand = false,
  expanded = false,
  onExpandToggle,
  canMoveUp,
  canMoveDown,
  onToggle,
  onMove,
  onSchedule,
}) {
  const blocked =
    node.is_selectable === false &&
    !node.is_selected;

  const ownSchedules =
    getScheduleCount(
      node.schedules
    );

  const effectiveSchedules =
    getScheduleCount(
      node.effective_schedule
    );

  const Icon =
    type === "section"
      ? ViewAgendaOutlinedIcon
      : type === "category"
        ? CategoryOutlinedIcon
        : RestaurantMenuOutlinedIcon;

  const expandLabel =
    type === "section"
      ? expanded
        ? "Ocultar categorías"
        : "Mostrar categorías"
      : expanded
        ? "Ocultar productos"
        : "Mostrar productos";

  return (
    <Box
      sx={{
        p: 1.5,
        pl: 1.5 + level * 1.25,
        bgcolor:
          level === 0
            ? "background.paper"
            : "background.default",
      }}
    >
      <Stack spacing={1.25}>
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="flex-start"
        >
          {canExpand ? (
            <Tooltip title={expandLabel}>
              <IconButton
                type="button"
                size="small"
                onClick={onExpandToggle}
                disabled={
                  typeof onExpandToggle !== "function"
                }
                aria-expanded={expanded}
                aria-label={expandLabel}
                sx={{
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  mt: 0.35,
                  color: "text.secondary",
                }}
              >
                {expanded ? (
                  <KeyboardArrowDownRoundedIcon />
                ) : (
                  <KeyboardArrowRightRoundedIcon />
                )}
              </IconButton>
            </Tooltip>
          ) : (
            <Box
              sx={{
                width: 32,
                height: 32,
                flexShrink: 0,
              }}
            />
          )}

          <Tooltip
            title={
              blocked
                ? node.selection_block_reason || ""
                : ""
            }
          >
            <span>
              <Checkbox
                checked={!!node.is_selected}
                disabled={
                  readOnly ||
                  blocked
                }
                onChange={(event) =>
                  onToggle(
                    event.target.checked
                  )
                }
              />
            </span>
          </Tooltip>

          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255, 152, 0, 0.12)",
              color: "primary.main",
              flexShrink: 0,
              mt: 0.5,
            }}
          >
            <Icon fontSize="small" />
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontSize:
                  type === "section"
                    ? 16
                    : 14,
                fontWeight:
                  type === "product"
                    ? 700
                    : 800,
                color: "text.primary",
                lineHeight: 1.4,
                wordBreak: "break-word",
              }}
            >
              {node.display_name || node.name}
            </Typography>

            {node.description ? (
              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: 12,
                  color: "text.secondary",
                  lineHeight: 1.45,
                }}
              >
                {node.description}
              </Typography>
            ) : null}
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          alignItems="center"
        >
          {blocked ? (
            <Chip
              icon={<BlockOutlinedIcon />}
              label="No disponible"
              size="small"
              color="warning"
              variant="outlined"
            />
          ) : node.is_selected ? (
            <Chip
              label="Seleccionado"
              size="small"
              color="success"
            />
          ) : (
            <Chip
              label="Disponible"
              size="small"
              variant="outlined"
            />
          )}

          {node.is_selected ? (
            <Chip
              label={
                ownSchedules > 0
                  ? `${ownSchedules} horario(s)`
                  : effectiveSchedules > 0
                    ? "Hereda horario"
                    : "Sin horario"
              }
              size="small"
              variant="outlined"
            />
          ) : null}
        </Stack>

        {node.is_selected ? (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
            >
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "text.secondary",
                }}
              >
                Orden{" "}
                {Number(
                  node.selected_sort_order || 0
                ) + 1}
              </Typography>

              {!readOnly ? (
                <>
                  <IconButton
                    size="small"
                    disabled={!canMoveUp}
                    onClick={() =>
                      onMove("up")
                    }
                  >
                    <KeyboardArrowUpOutlinedIcon />
                  </IconButton>

                  <IconButton
                    size="small"
                    disabled={!canMoveDown}
                    onClick={() =>
                      onMove("down")
                    }
                  >
                    <KeyboardArrowDownOutlinedIcon />
                  </IconButton>
                </>
              ) : null}
            </Stack>

            <Tooltip
              title={
                readOnly
                  ? "Consultar horario"
                  : "Configurar horario"
              }
            >
              <IconButton
                onClick={onSchedule}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <AccessTimeOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}

const containerSx = {
  p: 0,
  overflow: "hidden",
  borderRadius: 1,
  backgroundColor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
};