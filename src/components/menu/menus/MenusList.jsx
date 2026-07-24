import {
  Box, Button, Card, Chip, CircularProgress, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, useMediaQuery,
} from "@mui/material";

import { useState } from "react";
import { useTheme } from "@mui/material/styles";

import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import usePagination from "../../../hooks/usePagination";
import PaginationFooter from "../../common/PaginationFooter";

const PAGE_SIZE = 5;

export default function MenusList({
  menus = [],
  loading = false,
  busyMenuId = null,
  onContent,
  onChannels,
  onEdit,
  onAction,
}) {
  const theme = useTheme();

  const useCards = useMediaQuery(
    theme.breakpoints.down("md")
  );

  const [actionAnchor, setActionAnchor] =
    useState(null);

  const [selectedMenu, setSelectedMenu] =
    useState(null);

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
    items: menus,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const openActions = (
    event,
    menu
  ) => {
    setActionAnchor(
      event.currentTarget
    );

    setSelectedMenu(menu);
  };

  const closeActions = () => {
    setActionAnchor(null);
    setSelectedMenu(null);
  };

  const runMenuAction = (
    action
  ) => {
    const menu = selectedMenu;

    closeActions();

    if (!menu) return;

    if (action === "edit") {
      onEdit(menu);
      return;
    }

    onAction(action, menu);
  };

  if (loading) {
    return (
      <Paper sx={listContainerSx}>
        <Box
          sx={{
            minHeight: 260,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack
            spacing={1.5}
            alignItems="center"
          >
            <CircularProgress />

            <Typography
              sx={{
                fontSize: 14,
                color:
                  "text.secondary",
              }}
            >
              Cargando menús…
            </Typography>
          </Stack>
        </Box>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={listContainerSx}>
        <Box
          sx={{
            px: 2,
            py: 1.75,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent:
              "space-between",
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
                color:
                  "text.primary",
              }}
            >
              Menús registrados
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 12,
                color:
                  "text.secondary",
              }}
            >
              Administra el contenido, los canales y el estado de cada menú.
            </Typography>
          </Box>

          <Chip
            label={
              total === 1
                ? "1 menú"
                : `${total} menús`
            }
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>

        {menus.length === 0 ? (
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
                color:
                  "text.primary",
              }}
            >
              No hay menús para mostrar
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: 14,
                color:
                  "text.secondary",
                lineHeight: 1.55,
              }}
            >
              Crea un menú o cambia los filtros seleccionados.
            </Typography>
          </Box>
        ) : (
          <>
            {useCards ? (
              <Box
                sx={{
                  p: 2,
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 1.5,
                  alignItems: "stretch",
                }}
              >
                {paginatedItems.map(
                  (menu) => (
                    <MenuCard
                      key={menu.id}
                      menu={menu}
                      busy={
                        String(
                          busyMenuId
                        ) ===
                        String(menu.id)
                      }
                      onContent={
                        onContent
                      }
                      onChannels={
                        onChannels
                      }
                      onOpenActions={
                        openActions
                      }
                    />
                  )
                )}
              </Box>
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
                          backgroundColor:
                            "primary.main",
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: 13,
                          borderBottom:
                            "none",
                          whiteSpace:
                            "nowrap",
                        },
                      }}
                    >
                      <TableCell>
                        Menú
                      </TableCell>

                      <TableCell>
                        Estado
                      </TableCell>

                      <TableCell>
                        Contenido
                      </TableCell>

                      <TableCell>
                        Canales
                      </TableCell>

                      <TableCell align="right">
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedItems.map(
                      (menu) => {
                        const busy =
                          String(
                            busyMenuId
                          ) ===
                          String(menu.id);

                        return (
                          <TableRow
                            key={menu.id}
                            hover
                            sx={{
                              "& td": {
                                borderBottom:
                                  "1px solid",
                                borderColor:
                                  "divider",
                                verticalAlign:
                                  "top",
                              },
                            }}
                          >
                            <TableCell
                              sx={{
                                minWidth: 250,
                              }}
                            >
                              <Stack spacing={1}>
                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: 15,
                                      fontWeight: 800,
                                      color:
                                        "text.primary",
                                    }}
                                  >
                                    {menu.name}
                                  </Typography>

                                  <Typography
                                    sx={{
                                      mt: 0.4,
                                      maxWidth: 310,
                                      fontSize: 13,
                                      color:
                                        "text.secondary",
                                      lineHeight: 1.45,
                                      whiteSpace:
                                        "normal",
                                      wordBreak:
                                        "break-word",
                                    }}
                                  >
                                    {menu.description ||
                                      "Sin descripción registrada."}
                                  </Typography>
                                </Box>

                                <MenuRestrictionChip
                                  menu={menu}
                                />
                              </Stack>
                            </TableCell>

                            <TableCell>
                              <MenuStatusChip
                                menu={menu}
                              />
                            </TableCell>

                            <TableCell>
                              <ContentSummary
                                menu={menu}
                              />
                            </TableCell>

                            <TableCell>
                              <ChannelSummary
                                menu={menu}
                              />
                            </TableCell>

                            <TableCell
                              align="right"
                              sx={{
                                minWidth: 310,
                              }}
                            >
                              <MenuButtons
                                menu={menu}
                                busy={busy}
                                compact={false}
                                onContent={
                                  onContent
                                }
                                onChannels={
                                  onChannels
                                }
                                onOpenActions={
                                  openActions
                                }
                              />
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <PaginationFooter
              page={page}
              totalPages={
                totalPages
              }
              startItem={
                startItem
              }
              endItem={endItem}
              total={total}
              hasPrev={hasPrev}
              hasNext={hasNext}
              onPrev={prevPage}
              onNext={nextPage}
              itemLabel="menús"
            />
          </>
        )}
      </Paper>

      <Menu
        anchorEl={actionAnchor}
        open={Boolean(actionAnchor)}
        onClose={closeActions}
        slotProps={{
          paper: {
            sx: {
              minWidth: 210,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: 4,
            },
          },
        }}
      >
        {selectedMenu
          ?.administration
          ?.can_edit ? (
          <MenuItem
            onClick={() =>
              runMenuAction("edit")
            }
          >
            <ListItemIcon>
              <EditOutlinedIcon fontSize="small" />
            </ListItemIcon>

            <ListItemText>
              Editar
            </ListItemText>
          </MenuItem>
        ) : null}

        {selectedMenu?.is_draft ? (
          <MenuItem
            onClick={() =>
              runMenuAction(
                "activate"
              )
            }
          >
            <ListItemIcon>
              <CheckCircleOutlineOutlinedIcon fontSize="small" />
            </ListItemIcon>

            <ListItemText>
              Activar
            </ListItemText>
          </MenuItem>
        ) : null}

        {!selectedMenu?.is_archived ? (
          <MenuItem
            onClick={() =>
              runMenuAction(
                "archive"
              )
            }
          >
            <ListItemIcon>
              <ArchiveOutlinedIcon fontSize="small" />
            </ListItemIcon>

            <ListItemText>
              Archivar
            </ListItemText>
          </MenuItem>
        ) : null}
      </Menu>
    </>
  );
}

function MenuCard({
  menu,
  busy,
  onContent,
  onChannels,
  onOpenActions,
}) {
  return (
    <Card
      sx={{
        borderRadius: 1,
        backgroundColor:
          "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        height: "100%",
        minHeight: 410,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1.5}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 17,
                fontWeight: 800,
                color:
                  "text.primary",
                lineHeight: 1.35,
                wordBreak:
                  "break-word",
              }}
            >
              {menu.name}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 12,
                color:
                  "text.secondary",
                lineHeight: 1.45,
                display:
                  "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient:
                  "vertical",
                overflow: "hidden",
                minHeight: 34,
              }}
            >
              {menu.description ||
                "Sin descripción registrada."}
            </Typography>
          </Box>

          <MenuStatusChip
            menu={menu}
          />
        </Stack>
      </Box>

      <Box
        sx={{
          p: 2,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack
          spacing={1.5}
          sx={{ height: "100%" }}
        >
          <SummaryBox
            label="Contenido"
          >
            <ContentSummary
              menu={menu}
            />
          </SummaryBox>

          <SummaryBox label="Canales">
            <ChannelSummary
              menu={menu}
            />
          </SummaryBox>

          <Box
            sx={{
              minHeight: 30,
            }}
          >
            <MenuRestrictionChip
              menu={menu}
            />
          </Box>

          <MenuButtons
            menu={menu}
            busy={busy}
            compact
            onContent={onContent}
            onChannels={onChannels}
            onOpenActions={
              onOpenActions
            }
          />
        </Stack>
      </Box>
    </Card>
  );
}

function SummaryBox({
  label,
  children,
}) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        bgcolor:
          "background.default",
      }}
    >
      <Typography
        sx={{
          mb: 0.75,
          fontSize: 11,
          fontWeight: 800,
          color: "text.secondary",
          textTransform:
            "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Typography>

      {children}
    </Box>
  );
}

function ContentSummary({
  menu,
}) {
  const summary =
    menu?.content_summary || {};

  const sections =
    Number(
      summary.sections_count || 0
    );

  const categories =
    Number(
      summary.categories_count || 0
    );

  const products =
    Number(
      summary.products_count || 0
    );

  return (
    <Stack spacing={0.5}>
      <Typography
        sx={summaryTextSx}
      >
        {sections}{" "}
        {sections === 1
          ? "sección"
          : "secciones"}
      </Typography>

      <Typography
        sx={summaryTextSx}
      >
        {categories}{" "}
        {categories === 1
          ? "categoría"
          : "categorías"}
      </Typography>

      <Typography
        sx={summaryTextSx}
      >
        {products}{" "}
        {products === 1
          ? "producto"
          : "productos"}
      </Typography>

      {summary.hierarchy_is_valid ===
      false ? (
        <Stack
          direction="row"
          spacing={0.6}
          alignItems="center"
        >
          <WarningAmberOutlinedIcon
            sx={{
              fontSize: 16,
              color:
                "warning.main",
            }}
          />

          <Typography
            sx={{
              fontSize: 12,
              color:
                "warning.dark",
              fontWeight: 700,
            }}
          >
            Contenido con errores
          </Typography>
        </Stack>
      ) : null}
    </Stack>
  );
}

function ChannelSummary({
  menu,
}) {
  const configuration =
    menu?.channel_configuration ||
    {};

  const enabled =
    Number(
      configuration
        .enabled_channels_count || 0
    );

  const defaults =
    Number(
      configuration
        .default_channels_count || 0
    );

  if (enabled === 0) {
    return (
      <Typography
        sx={{
          fontSize: 13,
          color: "text.secondary",
        }}
      >
        Sin canales configurados
      </Typography>
    );
  }

  return (
    <Stack spacing={0.5}>
      <Typography sx={summaryTextSx}>
        {enabled}{" "}
        {enabled === 1
          ? "canal habilitado"
          : "canales habilitados"}
      </Typography>

      <Typography sx={summaryTextSx}>
        {defaults === 0
          ? "Sin predeterminados"
          : defaults === 1
          ? "1 canal predeterminado"
          : `${defaults} canales predeterminados`}
      </Typography>
    </Stack>
  );
}

function MenuStatusChip({
  menu,
}) {
  const status =
    menu?.status || "draft";

  const config = {
    draft: {
      label:
        menu?.status_label ||
        "Borrador",
      color: "warning",
    },

    active: {
      label:
        menu?.status_label ||
        "Activo",
      color: "success",
    },

    archived: {
      label:
        menu?.status_label ||
        "Archivado",
      color: "default",
    },
  }[status] || {
    label:
      menu?.status_label ||
      "Desconocido",
    color: "default",
  };

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      variant={
        config.color === "default"
          ? "outlined"
          : "filled"
      }
      sx={{
        flexShrink: 0,
        fontWeight: 800,
      }}
    />
  );
}

function MenuRestrictionChip({
  menu,
}) {
  if (menu?.is_archived) {
    return (
      <Chip
        icon={<LockOutlinedIcon />}
        label="Solo lectura"
        size="small"
        variant="outlined"
      />
    );
  }

  if (
    menu?.administration
      ?.can_archive === false
  ) {
    return (
      <Tooltip title="Este menú tiene órdenes abiertas, canales habilitados o está definido como predeterminado.">
        <Chip
          icon={
            <WarningAmberOutlinedIcon />
          }
          label="Restricciones para archivar"
          size="small"
          color="warning"
          variant="outlined"
        />
      </Tooltip>
    );
  }

  return null;
}

function MenuButtons({
  menu,
  busy,
  compact,
  onContent,
  onChannels,
  onOpenActions,
}) {
  const hasSecondaryActions =
    menu?.administration
      ?.can_edit ||
    menu?.is_draft ||
    !menu?.is_archived;

  return (
    <Stack
      direction={
        compact
          ? "column"
          : "row"
      }
      spacing={1}
      justifyContent="flex-end"
      alignItems={
        compact
          ? "stretch"
          : "center"
      }
      sx={{
        mt: compact ? "auto" : 0,
      }}
    >
      <Button
        type="button"
        variant="outlined"
        startIcon={
          <AccountTreeOutlinedIcon />
        }
        onClick={() =>
          onContent(menu)
        }
        disabled={busy}
        sx={{
          width: compact
            ? "100%"
            : "auto",
        }}
      >
        Contenido
      </Button>

      <Button
        type="button"
        variant="outlined"
        startIcon={
          <CampaignOutlinedIcon />
        }
        onClick={() =>
          onChannels(menu)
        }
        disabled={busy}
        sx={{
          width: compact
            ? "100%"
            : "auto",
        }}
      >
        Canales
      </Button>

      {hasSecondaryActions ? (
        <Tooltip title="Más acciones">
          <span>
            <IconButton
              type="button"
              onClick={(event) =>
                onOpenActions(
                  event,
                  menu
                )
              }
              disabled={busy}
              sx={{
                alignSelf: compact
                  ? "flex-end"
                  : "center",
                border: "1px solid",
                borderColor:
                  "divider",
              }}
            >
              <MoreVertOutlinedIcon />
            </IconButton>
          </span>
        </Tooltip>
      ) : null}
    </Stack>
  );
}

const listContainerSx = {
  p: 0,
  overflow: "hidden",
  borderRadius: 1,
  backgroundColor:
    "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
};

const summaryTextSx = {
  fontSize: 13,
  color: "text.primary",
  lineHeight: 1.45,
};