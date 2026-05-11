import React from "react";
import {
  Box, Button, Card, Chip, IconButton, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Tooltip, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import PaginationFooter from "../../common/PaginationFooter";

export default function SystemOwnersListPanel({
  owners = [],
  busyId = null,
  pagination,
  onManage,
  onEdit,
  onDelete,
  onToggleStatus,
  onPrev,
  onNext,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Paper
      sx={{
        p: 0,
        overflow: "hidden",
        borderRadius: 0,
        backgroundColor: "background.paper",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "#fff",
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
          Cuentas de propietarios
        </Typography>
      </Box>

      {owners.length === 0 ? (
        <Box sx={{ px: 3, py: 5, textAlign: "center" }}>
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
            No hay propietarios registrados
          </Typography>

          <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 14 }}>
            Crea tu primer propietario para comenzar a gestionar el sistema.
          </Typography>
        </Box>
      ) : (
        <>
          {isMobile ? (
            <OwnersMobileCards
              owners={owners}
              busyId={busyId}
              onManage={onManage}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ) : (
            <OwnersDesktopTable
              owners={owners}
              busyId={busyId}
              onManage={onManage}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          )}

          <PaginationFooter
            page={pagination.page}
            totalPages={pagination.totalPages}
            startItem={pagination.startItem}
            endItem={pagination.endItem}
            total={pagination.total}
            hasPrev={pagination.hasPrev}
            hasNext={pagination.hasNext}
            onPrev={onPrev}
            onNext={onNext}
            itemLabel="propietarios"
          />
        </>
      )}
    </Paper>
  );
}

function OwnersDesktopTable({
  owners,
  busyId,
  onManage,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  return (
    <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
      <Table sx={{ minWidth: 980 }}>
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
            <TableCell>Nombre</TableCell>
            <TableCell>Correo</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell align="center">Activo</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {owners.map((row) => {
            const active = row.status === "active";
            const disabled = Number(busyId) === Number(row.id);

            return (
              <TableRow
                key={row.id}
                hover
                sx={{
                  "& td": {
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    fontSize: 14,
                    color: "text.primary",
                    whiteSpace: "nowrap",
                  },
                }}
              >
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography sx={{ fontWeight: 800 }}>
                      {row.full_name || row.name}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      ID: {row.id}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>{row.email || "—"}</TableCell>
                <TableCell>{row.phone || "—"}</TableCell>

                <TableCell align="center">
                  <Switch
                    checked={active}
                    disabled={disabled}
                    onChange={() => onToggleStatus(row)}
                    color="primary"
                  />
                </TableCell>

                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      onClick={() => onManage(row)}
                      variant="contained"
                      color="secondary"
                      startIcon={<ManageAccountsRoundedIcon />}
                      sx={{
                        height: 36,
                        minWidth: 170,
                        borderRadius: 2,
                        fontSize: 12,
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Administrar cuenta
                    </Button>

                    <Tooltip title="Editar">
                      <IconButton
                        disabled={disabled}
                        onClick={() => onEdit(row)}
                        sx={iconEditSx}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Desactivar">
                      <IconButton
                        disabled={disabled || !active}
                        onClick={() => onDelete(row)}
                        sx={iconDeleteSx}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function OwnersMobileCards({
  owners,
  busyId,
  onManage,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      {owners.map((row) => {
        const active = row.status === "active";
        const disabled = Number(busyId) === Number(row.id);

        return (
          <Card
            key={row.id}
            sx={{
              borderRadius: 1,
              boxShadow: "none",
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "#fff",
            }}
          >
            <Box sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "text.primary",
                        lineHeight: 1.3,
                        wordBreak: "break-word",
                      }}
                    >
                      {row.full_name || row.name}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: 13,
                        color: "text.secondary",
                        wordBreak: "break-word",
                      }}
                    >
                      ID: {row.id}
                    </Typography>
                  </Box>

                  <Chip
                    label={active ? "Activo" : "Inactivo"}
                    color={active ? "success" : "default"}
                    size="small"
                    sx={{ fontWeight: 800, flexShrink: 0 }}
                  />
                </Stack>

                <Box>
                  <Typography sx={mobileLabelSx}>Correo</Typography>
                  <Typography sx={mobileValueSx}>{row.email || "—"}</Typography>
                </Box>

                <Box>
                  <Typography sx={mobileLabelSx}>Teléfono</Typography>
                  <Typography sx={mobileValueSx}>{row.phone || "—"}</Typography>
                </Box>

                <Box>
                  <Typography sx={mobileLabelSx}>Estado</Typography>

                  <Switch
                    checked={active}
                    disabled={disabled}
                    onChange={() => onToggleStatus(row)}
                    color="primary"
                  />
                </Box>

                <Stack direction="row" spacing={1} justifyContent="space-between">
                  <Button
                    onClick={() => onManage(row)}
                    variant="contained"
                    color="secondary"
                    startIcon={<ManageAccountsRoundedIcon />}
                    sx={{
                      flex: 1,
                      height: 40,
                      borderRadius: 2,
                      fontSize: 12,
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Administrar
                  </Button>

                  <Tooltip title="Editar">
                    <IconButton
                      disabled={disabled}
                      onClick={() => onEdit(row)}
                      sx={iconEditSx}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Desactivar">
                    <IconButton
                      disabled={disabled || !active}
                      onClick={() => onDelete(row)}
                      sx={iconDeleteSx}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Box>
          </Card>
        );
      })}
    </Stack>
  );
}

const mobileLabelSx = {
  fontSize: 11,
  fontWeight: 800,
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: 0.3,
};

const mobileValueSx = {
  mt: 0.25,
  fontSize: 14,
  color: "text.primary",
  wordBreak: "break-word",
};

const iconEditSx = {
  width: 40,
  height: 40,
  bgcolor: "#E3C24A",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "#C9AA39",
  },
};

const iconDeleteSx = {
  width: 40,
  height: 40,
  bgcolor: "error.main",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "error.dark",
  },
};