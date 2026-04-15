import {
  Box,
  Card,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PaginationFooter from "../common/PaginationFooter";

export default function CatalogProductsPanel({
  rows = [],
  total = 0,
  page = 1,
  totalPages = 1,
  startItem = 0,
  endItem = 0,
  hasPrev = false,
  hasNext = false,
  onPrev,
  onNext,
  onToggle,
  isSaving,
  selectedBranchId,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Productos del catálogo
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            fontWeight: 700,
          }}
        >
          {total} resultado(s)
        </Typography>
      </Box>

      {!selectedBranchId ? (
        <EmptyState
          title="Selecciona una sucursal"
          text="Primero elige una sucursal para visualizar su catálogo."
        />
      ) : total === 0 ? (
        <EmptyState
          title="No hay productos para mostrar"
          text="Ajusta tus filtros o revisa si la sucursal ya tiene productos disponibles."
        />
      ) : (
        <>
          {isMobile ? (
            <Stack spacing={1.5} sx={{ p: 2 }}>
              {rows.map((r) => {
                const p = r.product;
                const enabled = !!r.effective?.is_enabled;
                const busy = isSaving(p.id);
                const disabledByProductStatus = p?.status !== "active";

                return (
                  <Card
                    key={p.id}
                    sx={{
                      borderRadius: 1,
                      boxShadow: "none",
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: "#fff",
                      minHeight: 220,
                    }}
                  >
                    <Box sx={{ p: 2 }}>
                      <Stack spacing={1.5}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          spacing={1}
                        >
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
                              {p.name}
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.5,
                                fontSize: 12,
                                color: "text.secondary",
                                fontWeight: 700,
                              }}
                            >
                              {enabled ? "Enabled" : "Disabled"}
                            </Typography>
                          </Box>

                          {busy ? (
                            <Typography
                              sx={{
                                fontSize: 12,
                                color: "text.secondary",
                                fontWeight: 700,
                              }}
                            >
                              Guardando...
                            </Typography>
                          ) : null}
                        </Stack>

                        <InfoRow
                          label="Categoría"
                          value={p.category?.name || "—"}
                        />
                        <InfoRow label="Estado base" value={p.status} />
                        <InfoRow
                          label="Descripción"
                          value={p.description || "Sin descripción"}
                        />

                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Switch
                              checked={enabled}
                              disabled={busy || disabledByProductStatus}
                              onChange={() => onToggle(r)}
                              color="primary"
                            />
                          }
                          label={
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "text.primary",
                              }}
                            >
                              {enabled ? "Usar en sucursal" : "No usar en sucursal"}
                            </Typography>
                          }
                        />

                        {disabledByProductStatus ? (
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "text.secondary",
                              lineHeight: 1.45,
                            }}
                          >
                            Producto inactivo: actívalo primero en Administrar productos.
                          </Typography>
                        ) : null}
                      </Stack>
                    </Box>
                  </Card>
                );
              })}
            </Stack>
          ) : (
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
                    <TableCell>Producto</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Estado base</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell align="center">Usar</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((r) => {
                    const p = r.product;
                    const enabled = !!r.effective?.is_enabled;
                    const busy = isSaving(p.id);
                    const disabledByProductStatus = p?.status !== "active";

                    return (
                      <TableRow
                        key={p.id}
                        hover
                        sx={{
                          opacity: disabledByProductStatus ? 0.6 : 1,
                          "& td": {
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            fontSize: 14,
                            color: "text.primary",
                            verticalAlign: "top",
                          },
                        }}
                      >
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography sx={{ fontWeight: 800 }}>
                              {p.name}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: 12,
                                color: enabled ? "#0A7A2F" : "text.secondary",
                                fontWeight: 800,
                              }}
                            >
                              {enabled ? "Enabled" : "Disabled"}
                            </Typography>

                            {busy ? (
                              <Typography
                                sx={{
                                  fontSize: 12,
                                  color: "text.secondary",
                                  fontWeight: 700,
                                }}
                              >
                                Guardando...
                              </Typography>
                            ) : null}
                          </Stack>
                        </TableCell>

                        <TableCell>{p.category?.name || "—"}</TableCell>
                        <TableCell>{p.status}</TableCell>

                        <TableCell
                          sx={{
                            maxWidth: 320,
                            whiteSpace: "normal !important",
                            wordBreak: "break-word",
                          }}
                        >
                          {p.description || "Sin descripción"}
                        </TableCell>

                        <TableCell align="center">
                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Switch
                                checked={enabled}
                                disabled={busy || disabledByProductStatus}
                                onChange={() => onToggle(r)}
                                color="primary"
                              />
                            }
                            label={
                              <Typography
                                sx={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "text.primary",
                                }}
                              >
                                {enabled ? "Sí" : "No"}
                              </Typography>
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
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
            onPrev={onPrev}
            onNext={onNext}
            itemLabel="productos"
          />
        </>
      )}

      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.5,
          }}
        >
          Nota: Si un producto está{" "}
          <Typography
            component="span"
            sx={{ fontSize: 12, fontWeight: 800, color: "text.primary" }}
          >
            Inactivo
          </Typography>
          , primero actívalo en Administrar productos.
        </Typography>
      </Box>
    </Paper>
  );
}

function EmptyState({ title, text }) {
  return (
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
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 1,
          color: "text.secondary",
          fontSize: 14,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 800,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.25,
          fontSize: 14,
          color: "text.primary",
          lineHeight: 1.45,
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
