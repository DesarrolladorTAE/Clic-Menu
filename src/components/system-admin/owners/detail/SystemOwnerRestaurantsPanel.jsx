import React from "react";
import {
  Box, Button, Card, Chip, MenuItem, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Tooltip, IconButton, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import PaginationFooter from "../../../common/PaginationFooter";

export default function SystemOwnerRestaurantsPanel({
  restaurants = [],
  busyId = null,
  q,
  status,
  filteredLabel,
  total = 0,
  pagination,
  onChangeQ,
  onChangeStatus,
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
    <Stack spacing={3}>
      <Paper
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 1,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "flex-end" }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography sx={fieldLabelSx}>Buscar restaurante</Typography>

              <TextField
                value={q}
                onChange={(e) => onChangeQ(e.target.value)}
                placeholder="Buscar por nombre, correo o teléfono…"
                fullWidth
              />

              <Typography
                sx={{
                  mt: 1,
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                Localiza rápidamente un restaurante por datos principales.
              </Typography>
            </Box>

            <Box sx={{ width: { xs: "100%", md: 240 } }}>
              <Typography sx={fieldLabelSx}>Estatus</Typography>

              <TextField
                select
                value={status}
                onChange={(e) => onChangeStatus(e.target.value)}
                fullWidth
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="active">Activos</MenuItem>
                <MenuItem value="inactive">Inactivos</MenuItem>
                <MenuItem value="suspended">Suspendidos</MenuItem>
              </TextField>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Typography
              sx={{ fontSize: 13, color: "text.secondary", fontWeight: 700 }}
            >
              Mostrando: {filteredLabel}
            </Typography>

            <Typography
              sx={{ fontSize: 13, color: "text.secondary", fontWeight: 700 }}
            >
              {total} restaurantes encontrados
            </Typography>
          </Stack>
        </Stack>
      </Paper>

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
          <Typography
            sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}
          >
            Restaurantes del propietario
          </Typography>
        </Box>

        {restaurants.length === 0 ? (
          <Box sx={{ px: 3, py: 5, textAlign: "center" }}>
            <Typography
              sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}
            >
              No hay restaurantes registrados
            </Typography>

            <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 14 }}>
              Crea el primer restaurante de este propietario para continuar.
            </Typography>
          </Box>
        ) : (
          <>
            {isMobile ? (
              <RestaurantsMobileCards
                restaurants={restaurants}
                busyId={busyId}
                onManage={onManage}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
              />
            ) : (
              <RestaurantsDesktopTable
                restaurants={restaurants}
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
              itemLabel="restaurantes"
            />
          </>
        )}
      </Paper>
    </Stack>
  );
}

function RestaurantsDesktopTable({
  restaurants,
  busyId,
  onManage,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  return (
    <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
      <Table sx={{ minWidth: 1100 }}>
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
            <TableCell>Restaurante</TableCell>
            <TableCell>Contacto</TableCell>
            <TableCell>Sucursales</TableCell>
            <TableCell>Suscripción</TableCell>
            <TableCell align="center">Activo</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {restaurants.map((row) => {
            const active = row.status === "active";
            const disabled = Number(busyId) === Number(row.id);
            const plan = row?.active_subscription?.plan;

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
                      {row.trade_name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "text.secondary",
                        whiteSpace: "normal",
                      }}
                    >
                      {row.description || "Sin descripción"} · ID: {row.id}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack spacing={0.4}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                      {row.contact_email || "Sin correo"}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {row.contact_phone || "Sin teléfono"}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Chip
                    label={`${Number(row.branches_count || 0)} sucursal(es)`}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      bgcolor: "#EEF2FF",
                      color: "#3F3A52",
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={plan?.name || "Sin suscripción"}
                    color={plan?.name ? "success" : "default"}
                    size="small"
                    sx={{ fontWeight: 800 }}
                  />
                </TableCell>

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
                      startIcon={<StorefrontRoundedIcon />}
                      sx={{
                        height: 36,
                        minWidth: 180,
                        borderRadius: 2,
                        fontSize: 12,
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Administrar restaurante
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

                    <Tooltip title="Eliminar">
                      <IconButton
                        disabled={disabled}
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

function RestaurantsMobileCards({
  restaurants,
  busyId,
  onManage,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      {restaurants.map((row) => {
        const active = row.status === "active";
        const disabled = Number(busyId) === Number(row.id);
        const plan = row?.active_subscription?.plan;

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
                      {row.trade_name}
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
                  <Typography sx={mobileLabelSx}>Descripción</Typography>
                  <Typography sx={mobileValueSx}>
                    {row.description || "Sin descripción"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={mobileLabelSx}>Correo</Typography>
                  <Typography sx={mobileValueSx}>
                    {row.contact_email || "—"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={mobileLabelSx}>Teléfono</Typography>
                  <Typography sx={mobileValueSx}>
                    {row.contact_phone || "—"}
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={mobileLabelSx}>Sucursales</Typography>
                  <Typography sx={mobileValueSx}>
                    {Number(row.branches_count || 0)} sucursal(es)
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={mobileLabelSx}>Suscripción</Typography>
                  <Chip
                    label={plan?.name || "Sin suscripción"}
                    color={plan?.name ? "success" : "default"}
                    size="small"
                    sx={{ mt: 0.5, fontWeight: 800 }}
                  />
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
                    startIcon={<StorefrontRoundedIcon />}
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

                  <Tooltip title="Eliminar">
                    <IconButton
                      disabled={disabled}
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

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};

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