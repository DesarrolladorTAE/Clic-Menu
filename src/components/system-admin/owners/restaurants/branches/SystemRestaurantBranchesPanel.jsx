import React from "react";
import {
  Box, Button, Card, Chip, MenuItem, Paper, Stack, Switch, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip,
  Typography, IconButton, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

import PaginationFooter from "../../../../common/PaginationFooter";

export default function SystemRestaurantBranchesPanel({
  branches = [],
  busyId = null,
  q,
  status,
  filteredLabel,
  total = 0,
  pagination,
  onChangeQ,
  onChangeStatus,
  onCreate,
  onEdit,
  onDelete,
  onToggleStatus,
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
              <Typography sx={fieldLabelSx}>Buscar sucursal</Typography>

              <TextField
                value={q}
                onChange={(e) => onChangeQ(e.target.value)}
                placeholder="Buscar por nombre, dirección o teléfono…"
                fullWidth
              />

              <Typography sx={{ mt: 1, fontSize: 12, color: "text.secondary" }}>
                Localiza rápidamente una sucursal por sus datos principales.
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
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="active">Activas</MenuItem>
                <MenuItem value="inactive">Inactivas</MenuItem>
                <MenuItem value="suspended_by_plan">Suspendidas por plan</MenuItem>
              </TextField>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Stack spacing={0.5}>
              <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 700 }}>
                Mostrando: {filteredLabel}
              </Typography>

              <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 700 }}>
                {total} sucursales encontradas
              </Typography>
            </Stack>

            <Button
              onClick={onCreate}
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 210 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Crear sucursal
            </Button>
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
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
            Sucursales del restaurante
          </Typography>
        </Box>

        {branches.length === 0 ? (
          <Box sx={{ px: 3, py: 5, textAlign: "center" }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
              No hay sucursales registradas
            </Typography>

            <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 14 }}>
              Crea la primera sucursal para este restaurante.
            </Typography>
          </Box>
        ) : (
          <>
            {isMobile ? (
              <BranchesMobileCards
                branches={branches}
                busyId={busyId}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
              />
            ) : (
              <BranchesDesktopTable
                branches={branches}
                busyId={busyId}
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
              onPrev={pagination.prevPage}
              onNext={pagination.nextPage}
              itemLabel="sucursales"
            />
          </>
        )}
      </Paper>
    </Stack>
  );
}

function BranchesDesktopTable({
  branches,
  busyId,
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
            <TableCell>Sucursal</TableCell>
            <TableCell>Dirección</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Horario</TableCell>
            <TableCell>Logo</TableCell>
            <TableCell align="center">Activa</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {branches.map((row) => {
            const active = row.status === "active";
            const disabled = Number(busyId) === Number(row.id);
            const logo = row.activeLogo || row.active_logo || null;

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
                    <Typography sx={{ fontWeight: 800 }}>{row.name}</Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      ID: {row.id}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>{row.address || "—"}</TableCell>
                <TableCell>{row.phone || "—"}</TableCell>
                <TableCell>
                  {formatHour(row.open_time)} - {formatHour(row.close_time)}
                </TableCell>

                <TableCell>
                  {logo ? (
                    <Chip
                      icon={<ImageOutlinedIcon />}
                      label="Con logo"
                      color="success"
                      size="small"
                      sx={{ fontWeight: 800 }}
                    />
                  ) : (
                    <Chip
                      icon={<ImageOutlinedIcon />}
                      label="Sin logo"
                      size="small"
                      sx={{ fontWeight: 800 }}
                    />
                  )}
                </TableCell>

                <TableCell align="center">
                  <Switch
                    checked={active}
                    disabled={disabled || row.status === "suspended_by_plan"}
                    onChange={() => onToggleStatus(row)}
                    color="primary"
                  />
                </TableCell>

                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="Editar">
                      <IconButton disabled={disabled} onClick={() => onEdit(row)} sx={iconEditSx}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Eliminar">
                      <IconButton disabled={disabled} onClick={() => onDelete(row)} sx={iconDeleteSx}>
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

function BranchesMobileCards({
  branches,
  busyId,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      {branches.map((row) => {
        const active = row.status === "active";
        const disabled = Number(busyId) === Number(row.id);
        const logo = row.activeLogo || row.active_logo || null;

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
                    <Typography sx={mobileTitleSx}>{row.name}</Typography>
                    <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
                      ID: {row.id}
                    </Typography>
                  </Box>

                  <Chip
                    label={active ? "Activa" : row.status === "suspended_by_plan" ? "Suspendida" : "Inactiva"}
                    color={active ? "success" : "default"}
                    size="small"
                    sx={{ fontWeight: 800, flexShrink: 0 }}
                  />
                </Stack>

                <InfoBlock label="Dirección" value={row.address || "—"} />
                <InfoBlock label="Teléfono" value={row.phone || "—"} />
                <InfoBlock
                  label="Horario"
                  value={`${formatHour(row.open_time)} - ${formatHour(row.close_time)}`}
                />

                <Box>
                  <Typography sx={mobileLabelSx}>Logo</Typography>
                  <Chip
                    icon={<ImageOutlinedIcon />}
                    label={logo ? "Con logo" : "Sin logo"}
                    color={logo ? "success" : "default"}
                    size="small"
                    sx={{ mt: 0.5, fontWeight: 800, width: "fit-content" }}
                  />
                </Box>

                <Box>
                  <Typography sx={mobileLabelSx}>Estado</Typography>
                  <Switch
                    checked={active}
                    disabled={disabled || row.status === "suspended_by_plan"}
                    onChange={() => onToggleStatus(row)}
                    color="primary"
                  />
                </Box>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Tooltip title="Editar">
                    <IconButton disabled={disabled} onClick={() => onEdit(row)} sx={iconEditSx}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Eliminar">
                    <IconButton disabled={disabled} onClick={() => onDelete(row)} sx={iconDeleteSx}>
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

function InfoBlock({ label, value }) {
  return (
    <Box>
      <Typography sx={mobileLabelSx}>{label}</Typography>
      <Typography sx={mobileValueSx}>{value}</Typography>
    </Box>
  );
}

function formatHour(value) {
  if (!value) return "—";
  return String(value).slice(0, 5);
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};

const mobileTitleSx = {
  fontSize: 15,
  fontWeight: 800,
  color: "text.primary",
  lineHeight: 1.3,
  wordBreak: "break-word",
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
