import {
  Box, Button, Card, Chip, CircularProgress, FormControlLabel, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PaginationFooter from "../../common/PaginationFooter";

function productStatusLabel(status) {
  if (status === "active") return "Activo";
  if (status === "inactive") return "Inactivo";

  return status || "—";
}

function policyTimeLabel(policy, defaultMinutes) {
  if (!policy?.is_reusable) return "No aplica";

  if (policy.reuse_minutes !== null && policy.reuse_minutes !== undefined) {
    return `${policy.reuse_minutes} minuto(s)`;
  }

  return `General · ${defaultMinutes} minuto(s)`;
}

export default function PreparedItemProductsPanel({
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
  onConfigure,
  isSaving,
  selectedBranchId,
  defaultMinutes = 15,
  loading = false,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
            Productos
          </Typography>

          <Typography
            sx={{
              mt: 0.25,
              fontSize: 12,
              color: "text.secondary",
            }}
          >
            Define cuáles pueden volver a ofrecerse después de su preparación.
          </Typography>
        </Box>

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

      {loading ? (
        <Box
          sx={{
            minHeight: 260,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack spacing={1.5} alignItems="center">
            <CircularProgress color="primary" size={32} />

            <Typography
              sx={{
                fontSize: 13,
                color: "text.secondary",
              }}
            >
              Cargando configuración...
            </Typography>
          </Stack>
        </Box>
      ) : !selectedBranchId ? (
        <EmptyState
          title="Selecciona una sucursal"
          text="Primero elige una sucursal para consultar sus productos."
        />
      ) : total === 0 ? (
        <EmptyState
          title="No hay productos para mostrar"
          text="Ajusta los filtros para consultar otros productos."
        />
      ) : (
        <>
          {isMobile ? (
            <Box
              sx={{
                p: 2,
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 1.5,
                alignItems: "stretch",
              }}
            >
              {rows.map((row) => {
                const product = row.product;
                const reusable = !!row.policy?.is_reusable;
                const busy = isSaving(product.id);

                return (
                  <Card
                    key={product.id}
                    sx={{
                      width: "100%",
                      minHeight: 305,
                      height: "100%",
                      borderRadius: 1,
                      boxShadow: "none",
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: "background.paper",
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Stack spacing={1.5} sx={{ flex: 1 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          spacing={1}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontSize: 16,
                                fontWeight: 800,
                                color: "text.primary",
                                lineHeight: 1.3,
                                wordBreak: "break-word",
                              }}
                            >
                              {product.name}
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.5,
                                fontSize: 12,
                                color: "text.secondary",
                              }}
                            >
                              {product.category?.name || "Sin categoría"}
                            </Typography>
                          </Box>

                          <Chip
                            size="small"
                            label={productStatusLabel(product.status)}
                            color={
                              product.status === "active"
                                ? "success"
                                : "default"
                            }
                            variant={
                              product.status === "active"
                                ? "filled"
                                : "outlined"
                            }
                          />
                        </Stack>

                        <InfoRow
                          label="Reutilización"
                          value={reusable ? "Permitida" : "No permitida"}
                        />

                        <InfoRow
                          label="Tiempo"
                          value={policyTimeLabel(
                            row.policy,
                            defaultMinutes
                          )}
                        />

                        <InfoRow
                          label="Descripción"
                          value={product.description || "Sin descripción"}
                        />

                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Switch
                              checked={reusable}
                              disabled={busy}
                              onChange={() => onToggle(row)}
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
                              {reusable
                                ? "Permitir reutilización"
                                : "No reutilizable"}
                            </Typography>
                          }
                        />
                      </Stack>

                      <Button
                        variant="outlined"
                        startIcon={<EditOutlinedIcon />}
                        onClick={() => onConfigure(row)}
                        disabled={busy}
                        fullWidth
                        sx={{
                          mt: 2,
                          fontWeight: 800,
                        }}
                      >
                        Configurar tiempo
                      </Button>
                    </Box>
                  </Card>
                );
              })}
            </Box>
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
                    <TableCell>Estado</TableCell>
                    <TableCell align="center">Reutilizable</TableCell>
                    <TableCell>Tiempo</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((row) => {
                    const product = row.product;
                    const reusable = !!row.policy?.is_reusable;
                    const busy = isSaving(product.id);

                    return (
                      <TableRow
                        key={product.id}
                        hover
                        sx={{
                          "& td": {
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            fontSize: 14,
                            color: "text.primary",
                            verticalAlign: "middle",
                          },
                        }}
                      >
                        <TableCell>
                          <Stack spacing={0.4}>
                            <Typography sx={{ fontWeight: 800 }}>
                              {product.name}
                            </Typography>

                            {row.policy ? (
                              <Typography
                                sx={{
                                  fontSize: 11.5,
                                  color: "text.secondary",
                                  fontWeight: 700,
                                }}
                              >
                                Configuración guardada
                              </Typography>
                            ) : (
                              <Typography
                                sx={{
                                  fontSize: 11.5,
                                  color: "text.secondary",
                                }}
                              >
                                Sin configuración particular
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>

                        <TableCell>
                          {product.category?.name || "Sin categoría"}
                        </TableCell>

                        <TableCell>
                          {productStatusLabel(product.status)}
                        </TableCell>

                        <TableCell align="center">
                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Switch
                                checked={reusable}
                                disabled={busy}
                                onChange={() => onToggle(row)}
                                color="primary"
                              />
                            }
                            label={
                              <Typography
                                sx={{
                                  minWidth: 22,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "text.primary",
                                }}
                              >
                                {reusable ? "Sí" : "No"}
                              </Typography>
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: reusable ? 700 : 500,
                              color: reusable
                                ? "text.primary"
                                : "text.secondary",
                            }}
                          >
                            {policyTimeLabel(
                              row.policy,
                              defaultMinutes
                            )}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditOutlinedIcon />}
                            disabled={busy}
                            onClick={() => onConfigure(row)}
                            sx={{ fontWeight: 800 }}
                          >
                            Configurar
                          </Button>
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