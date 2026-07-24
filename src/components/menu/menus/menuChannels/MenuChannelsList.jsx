import {
  Box, Card, Chip, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";

import usePagination from "../../../../hooks/usePagination";
import PaginationFooter from "../../../common/PaginationFooter";

const PAGE_SIZE = 5;

export default function MenuChannelsList({
  menu,
  channels = [],
  saving = false,
  onEnabledChange,
  onDefaultChange,
}) {
  const theme = useTheme();

  const useCards =
    useMediaQuery(
      theme.breakpoints.down(
        "md"
      )
    );

  const readOnly =
    !!menu?.is_archived;

  const enabledCount =
    channels.filter(
      (channel) =>
        !!channel
          ?.menu_configuration
          ?.is_enabled
    ).length;

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
    items: channels,
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
              color: "text.primary",
            }}
          >
            Canales disponibles
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 12,
              color: "text.secondary",
            }}
          >
            Habilita el menú y define en qué canales será el predeterminado.
          </Typography>
        </Box>

        <Chip
          label={
            total === 1
              ? "1 canal"
              : `${total} canales`
          }
          color="primary"
          variant="outlined"
          size="small"
        />
      </Box>

      {channels.length === 0 ? (
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
            No hay canales configurados
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: 14,
              color: "text.secondary",
              lineHeight: 1.55,
            }}
          >
            Configura los canales de venta de la sucursal antes de asignarlos
            a este menú.
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
                (channel) => (
                  <ChannelCard
                    key={
                      channel
                        .branch_sales_channel_id
                    }
                    menu={menu}
                    channel={channel}
                    saving={saving}
                    readOnly={readOnly}
                    enabledCount={
                      enabledCount
                    }
                    onEnabledChange={
                      onEnabledChange
                    }
                    onDefaultChange={
                      onDefaultChange
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
                      Canal
                    </TableCell>

                    <TableCell>
                      Disponibilidad
                    </TableCell>

                    <TableCell align="center">
                      Habilitado
                    </TableCell>

                    <TableCell align="center">
                      Predeterminado
                    </TableCell>

                    <TableCell>
                      Menú predeterminado actual
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedItems.map(
                    (channel) => (
                      <ChannelTableRow
                        key={
                          channel
                            .branch_sales_channel_id
                        }
                        menu={menu}
                        channel={
                          channel
                        }
                        saving={
                          saving
                        }
                        readOnly={
                          readOnly
                        }
                        enabledCount={
                          enabledCount
                        }
                        onEnabledChange={
                          onEnabledChange
                        }
                        onDefaultChange={
                          onDefaultChange
                        }
                      />
                    )
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
            itemLabel="canales"
          />
        </>
      )}
    </Paper>
  );
}

function ChannelTableRow({
  menu,
  channel,
  saving,
  readOnly,
  enabledCount,
  onEnabledChange,
  onDefaultChange,
}) {
  const enableControl =
    getEnableControl({
      menu,
      channel,
      saving,
      readOnly,
      enabledCount,
    });

  const defaultControl =
    getDefaultControl({
      menu,
      channel,
      saving,
      readOnly,
    });

  return (
    <TableRow
      hover
      sx={{
        "& td": {
          borderBottom:
            "1px solid",
          borderColor: "divider",
          verticalAlign: "middle",
        },
      }}
    >
      <TableCell
        sx={{
          minWidth: 230,
        }}
      >
        <ChannelIdentity
          channel={channel}
        />
      </TableCell>

      <TableCell
        sx={{
          minWidth: 250,
        }}
      >
        <ChannelAvailability
          channel={channel}
        />
      </TableCell>

      <TableCell align="center">
        <Tooltip
          title={
            enableControl.reason
          }
        >
          <span>
            <Switch
              checked={
                enableControl.checked
              }
              disabled={
                enableControl.disabled
              }
              onChange={(
                event
              ) =>
                onEnabledChange(
                  channel,
                  event.target.checked
                )
              }
              color="primary"
            />
          </span>
        </Tooltip>
      </TableCell>

      <TableCell align="center">
        <Tooltip
          title={
            defaultControl.reason
          }
        >
          <span>
            <Switch
              checked={
                defaultControl.checked
              }
              disabled={
                defaultControl.disabled
              }
              onChange={(
                event
              ) =>
                onDefaultChange(
                  channel,
                  event.target.checked
                )
              }
              color="primary"
            />
          </span>
        </Tooltip>
      </TableCell>

      <TableCell
        sx={{
          minWidth: 260,
        }}
      >
        <CurrentDefaultMenu
          menu={menu}
          channel={channel}
        />
      </TableCell>
    </TableRow>
  );
}

function ChannelCard({
  menu,
  channel,
  saving,
  readOnly,
  enabledCount,
  onEnabledChange,
  onDefaultChange,
}) {
  const enableControl =
    getEnableControl({
      menu,
      channel,
      saving,
      readOnly,
      enabledCount,
    });

  const defaultControl =
    getDefaultControl({
      menu,
      channel,
      saving,
      readOnly,
    });

  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 350,
        display: "flex",
        flexDirection: "column",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.75,
          borderBottom:
            "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1.5}
        >
          <ChannelIdentity
            channel={channel}
          />

          {channel.is_usable ? (
            <Chip
              label="Disponible"
              color="success"
              size="small"
            />
          ) : (
            <Chip
              icon={
                <BlockOutlinedIcon />
              }
              label="Bloqueado"
              color="warning"
              variant="outlined"
              size="small"
            />
          )}
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
          spacing={1.75}
          sx={{
            height: "100%",
          }}
        >
          {!channel.is_usable ? (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                border: "1px solid",
                borderColor:
                  "warning.light",
                bgcolor:
                  "rgba(237, 108, 2, 0.06)",
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  color: "warning.dark",
                  fontWeight: 700,
                  lineHeight: 1.5,
                }}
              >
                {channel.blocked_reason ||
                  "El canal no puede utilizarse con su configuración actual."}
              </Typography>
            </Box>
          ) : null}

          <SettingRow
            label="Habilitado"
            helper="Permite que este menú participe en el canal."
            checked={
              enableControl.checked
            }
            disabled={
              enableControl.disabled
            }
            reason={
              enableControl.reason
            }
            onChange={(
              checked
            ) =>
              onEnabledChange(
                channel,
                checked
              )
            }
          />

          <SettingRow
            label="Predeterminado"
            helper="Este menú se usará inicialmente en el canal."
            checked={
              defaultControl.checked
            }
            disabled={
              defaultControl.disabled
            }
            reason={
              defaultControl.reason
            }
            onChange={(
              checked
            ) =>
              onDefaultChange(
                channel,
                checked
              )
            }
          />

          <Box
            sx={{
              mt: "auto",
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
              Menú predeterminado actual
            </Typography>

            <CurrentDefaultMenu
              menu={menu}
              channel={channel}
            />
          </Box>
        </Stack>
      </Box>
    </Card>
  );
}

function ChannelIdentity({
  channel,
}) {
  const name =
    channel
      ?.sales_channel
      ?.name ||
    "Canal sin nombre";

  const code =
    channel
      ?.sales_channel
      ?.code ||
    "SIN_CÓDIGO";

  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="flex-start"
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 1,
          display: "grid",
          placeItems: "center",
          bgcolor:
            "rgba(255, 152, 0, 0.12)",
          color: "primary.main",
          flexShrink: 0,
        }}
      >
        <CampaignOutlinedIcon fontSize="small" />
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.35,
            wordBreak: "break-word",
          }}
        >
          {name}
        </Typography>

        <Typography
          sx={{
            mt: 0.35,
            fontSize: 12,
            color: "text.secondary",
            wordBreak: "break-word",
          }}
        >
          {code}
        </Typography>
      </Box>
    </Stack>
  );
}

function ChannelAvailability({
  channel,
}) {
  if (channel.is_usable) {
    return (
      <Stack
        direction="row"
        spacing={0.75}
        alignItems="center"
      >
        <CheckCircleOutlineOutlinedIcon
          sx={{
            fontSize: 18,
            color: "success.main",
          }}
        />

        <Typography
          sx={{
            fontSize: 13,
            color: "success.main",
            fontWeight: 800,
          }}
        >
          Disponible
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={0.75}>
      <Chip
        icon={
          <BlockOutlinedIcon />
        }
        label="Bloqueado"
        size="small"
        color="warning"
        variant="outlined"
        sx={{
          width: "fit-content",
        }}
      />

      <Typography
        sx={{
          maxWidth: 330,
          fontSize: 12,
          color: "warning.dark",
          lineHeight: 1.45,
          whiteSpace: "normal",
        }}
      >
        {channel.blocked_reason ||
          "El canal no puede utilizarse con su configuración actual."}
      </Typography>
    </Stack>
  );
}

function SettingRow({
  label,
  helper,
  checked,
  disabled,
  reason,
  onChange,
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={1.5}
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            mt: 0.35,
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.45,
          }}
        >
          {reason || helper}
        </Typography>
      </Box>

      <Tooltip title={reason}>
        <span>
          <Switch
            checked={checked}
            disabled={disabled}
            onChange={(
              event
            ) =>
              onChange(
                event.target.checked
              )
            }
            color="primary"
          />
        </span>
      </Tooltip>
    </Stack>
  );
}

function CurrentDefaultMenu({
  menu,
  channel,
}) {
  const isDefault =
    !!channel
      ?.menu_configuration
      ?.is_default;

  const previousDefaultId =
    channel?.default_menu_id
      ? Number(
          channel.default_menu_id
        )
      : null;

  const currentMenuId =
    menu?.id
      ? Number(menu.id)
      : null;

  const replacingAnother =
    isDefault &&
    previousDefaultId &&
    previousDefaultId !==
      currentMenuId;

  if (replacingAnother) {
    return (
      <Stack spacing={0.5}>
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
        >
          <SwapHorizOutlinedIcon
            sx={{
              fontSize: 18,
              color: "warning.main",
            }}
          />

          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 800,
              color: "warning.dark",
            }}
          >
            Se reemplazará al guardar
          </Typography>
        </Stack>

        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.45,
          }}
        >
          Actual:{" "}
          {channel
            ?.default_menu
            ?.name ||
            "Otro menú"}
        </Typography>
      </Stack>
    );
  }

  if (isDefault) {
    return (
      <Stack
        direction="row"
        spacing={0.75}
        alignItems="center"
      >
        <StarOutlinedIcon
          sx={{
            fontSize: 18,
            color: "primary.main",
          }}
        />

        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 800,
            color: "primary.main",
          }}
        >
          Este menú
        </Typography>
      </Stack>
    );
  }

  if (
    channel?.default_menu
  ) {
    return (
      <Stack spacing={0.35}>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          {channel.default_menu.name}
        </Typography>

        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          Estado:{" "}
          {getStatusLabel(
            channel.default_menu.status
          )}
        </Typography>
      </Stack>
    );
  }

  return (
    <Typography
      sx={{
        fontSize: 13,
        color: "text.secondary",
      }}
    >
      Sin menú predeterminado
    </Typography>
  );
}

function getEnableControl({
  menu,
  channel,
  saving,
  readOnly,
  enabledCount,
}) {
  const checked =
    !!channel
      ?.menu_configuration
      ?.is_enabled;

  let reason = "";

  if (saving) {
    reason =
      "Se están guardando los cambios.";
  } else if (readOnly) {
    reason =
      "Un menú archivado es de solo lectura.";
  } else if (
    checked &&
    menu?.is_active &&
    enabledCount <= 1
  ) {
    reason =
      "Un menú activo debe permanecer habilitado en al menos un canal.";
  } else if (
    !checked &&
    !channel
      ?.menu_configuration
      ?.can_enable
  ) {
    reason =
      channel?.blocked_reason ||
      "Este canal no puede habilitarse.";
  }

  return {
    checked,
    reason,
    disabled: !!reason,
  };
}

function getDefaultControl({
  menu,
  channel,
  saving,
  readOnly,
}) {
  const checked =
    !!channel
      ?.menu_configuration
      ?.is_default;

  const enabled =
    !!channel
      ?.menu_configuration
      ?.is_enabled;

  let reason = "";

  if (saving) {
    reason =
      "Se están guardando los cambios.";
  } else if (readOnly) {
    reason =
      "Un menú archivado es de solo lectura.";
  } else if (!checked) {
    if (!menu?.is_active) {
      reason =
        "Solo un menú activo puede definirse como predeterminado.";
    } else if (!enabled) {
      reason =
        "Primero habilita el menú en este canal.";
    } else if (
      !channel?.is_usable
    ) {
      reason =
        channel?.blocked_reason ||
        "Este canal no está disponible.";
    }
  }

  return {
    checked,
    reason,
    disabled: !!reason,
  };
}

function getStatusLabel(
  status
) {
  return {
    draft: "Borrador",
    active: "Activo",
    archived: "Archivado",
  }[status] || "Desconocido";
}

const containerSx = {
  p: 0,
  overflow: "hidden",
  borderRadius: 1,
  backgroundColor:
    "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
};