import React from "react";
import {
  Box, Button, Card, Chip, MenuItem, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import ExtensionOutlinedIcon from "@mui/icons-material/ExtensionOutlined";

import PaginationFooter from "../../../../../common/PaginationFooter";

export default function SystemBranchAddonsPanel({
  addons = [],
  q,
  status,
  filteredLabel,
  total = 0,
  pagination,
  onChangeQ,
  onChangeStatus,
  onAssign,
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
            alignItems={{ xs: "stretch", md: "flex-start" }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography sx={fieldLabelSx}>Buscar complemento</Typography>

              <TextField
                value={q}
                onChange={(e) => onChangeQ(e.target.value)}
                placeholder="Buscar por nombre o descripción…"
                fullWidth
              />

              <Typography sx={{ mt: 1, fontSize: 12, color: "text.secondary" }}>
                Localiza rápidamente un complemento disponible para esta sucursal.
              </Typography>
            </Box>

            <Box sx={{ width: { xs: "100%", md: 240 } }}>
              <Typography sx={fieldLabelSx}>Estado</Typography>

              <TextField
                select
                value={status}
                onChange={(e) => onChangeStatus(e.target.value)}
                fullWidth
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="current">Activos</MenuItem>
                <MenuItem value="expired">Vencidos</MenuItem>
                <MenuItem value="unassigned">Sin asignar</MenuItem>
                <MenuItem value="unavailable">No disponibles</MenuItem>
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
                {total} complementos encontrados
              </Typography>
            </Stack>

            <Button
              onClick={onAssign}
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 250 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Asignar / renovar
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
            Complementos de la sucursal
          </Typography>
        </Box>

        {addons.length === 0 ? (
          <Box sx={{ px: 3, py: 5, textAlign: "center" }}>
            <ExtensionOutlinedIcon sx={{ fontSize: 42, color: "text.secondary" }} />

            <Typography sx={{ mt: 1, fontSize: 20, fontWeight: 800, color: "text.primary" }}>
              No hay complementos para mostrar
            </Typography>

            <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 14 }}>
              No encontramos complementos que coincidan con los filtros seleccionados.
            </Typography>
          </Box>
        ) : (
          <>
            {isMobile ? (
              <AddonsMobileCards addons={addons} />
            ) : (
              <AddonsDesktopTable addons={addons} />
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
              itemLabel="complementos"
            />
          </>
        )}
      </Paper>
    </Stack>
  );
}

function AddonsDesktopTable({ addons }) {
  return (
    <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
      <Table sx={{ minWidth: 820 }}>
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
            <TableCell>Complemento</TableCell>
            <TableCell>Precio mensual</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Vigencia</TableCell>
            <TableCell align="center">Días restantes</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {addons.map((row) => (
            <TableRow
              key={row.id}
              hover
              sx={{
                "& td": {
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  fontSize: 14,
                  color: "text.primary",
                },
              }}
            >
              <TableCell sx={{ minWidth: 240 }}>
                <Stack spacing={0.5}>
                  <Typography sx={{ fontWeight: 800 }}>{row.name}</Typography>
                  <Typography
                    sx={{
                      maxWidth: 430,
                      fontSize: 12,
                      color: "text.secondary",
                      lineHeight: 1.4,
                    }}
                  >
                    {row.description || "Sin descripción."}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell sx={{ whiteSpace: "nowrap", fontWeight: 700 }}>
                {formatCurrency(row.monthly_price, row.currency)}
              </TableCell>

              <TableCell>
                <AddonStatusChip row={row} />
              </TableCell>

              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {formatValidity(row)}
              </TableCell>

              <TableCell align="center" sx={{ fontWeight: 800 }}>
                {row.state === "current" && row.days_remaining !== null
                  ? row.days_remaining
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function AddonsMobileCards({ addons }) {
  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      {addons.map((row) => (
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
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={mobileTitleSx}>{row.name}</Typography>
                  <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary", lineHeight: 1.45 }}>
                    {row.description || "Sin descripción."}
                  </Typography>
                </Box>

                <AddonStatusChip row={row} />
              </Stack>

              <InfoBlock label="Precio mensual" value={formatCurrency(row.monthly_price, row.currency)} />
              <InfoBlock label="Vigencia" value={formatValidity(row)} />
              <InfoBlock
                label="Días restantes"
                value={row.state === "current" && row.days_remaining !== null ? String(row.days_remaining) : "—"}
              />
            </Stack>
          </Box>
        </Card>
      ))}
    </Stack>
  );
}

function AddonStatusChip({ row }) {
  if (row.state === "current") {
    return <Chip label="Activo" color="success" size="small" sx={{ fontWeight: 800, flexShrink: 0 }} />;
  }

  if (row.state === "expired") {
    return <Chip label="Vencido" color="error" size="small" sx={{ fontWeight: 800, flexShrink: 0 }} />;
  }

  if (row.state === "unavailable") {
    return <Chip label="No disponible" size="small" sx={{ fontWeight: 800, flexShrink: 0 }} />;
  }

  return (
    <Chip
      label="Sin asignar"
      size="small"
      sx={{
        fontWeight: 800,
        flexShrink: 0,
        bgcolor: "#FFF4E5",
        color: "#A65A00",
      }}
    />
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

function formatValidity(row) {
  if (!row.assignment?.starts_at || !row.assignment?.ends_at) return "—";
  return `${formatDate(row.assignment.starts_at)} - ${formatDate(row.assignment.ends_at)}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value, currency = "MXN") {
  const amount = Number(value || 0);

  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currency || "MXN",
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};

const mobileTitleSx = {
  fontSize: 16,
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