import { useMemo } from "react";
import {
  Box,
  Card,
  Chip,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import EditIcon from "@mui/icons-material/Edit";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import usePagination from "../../../hooks/usePagination";
import PaginationFooter from "../../../components/common/PaginationFooter";

const PAGE_SIZE = 5;

export default function WarehousesListPanel({
  inventoryMode,
  branchName,
  warehouses,
  onEdit,
  onToggleStatus,
  onToggleDefault,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const panelTitle = useMemo(() => {
    if (inventoryMode === "global") return "Lista de almacenes globales";
    return branchName
      ? `Lista de almacenes de ${branchName}`
      : "Lista de almacenes";
  }, [inventoryMode, branchName]);

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
    items: warehouses,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  return (
    <Paper
      sx={{
        p: 0,
        overflow: "hidden",
        borderRadius: 0,
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
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          {panelTitle}
        </Typography>
      </Box>

      {warehouses.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {isMobile ? (
            <Stack spacing={1.5} sx={{ p: 2 }}>
              {paginatedItems.map((row) => (
                <Card
                  key={row.id}
                  sx={{
                    borderRadius: 1,
                    boxShadow: "none",
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "#fff",
                    minHeight: 280,
                    display: "flex",
                  }}
                >
                  <Box sx={{ p: 2, width: "100%" }}>
                    <Stack spacing={1.5} sx={{ height: "100%" }}>
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
                            {row.name}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.5,
                              fontSize: 13,
                              color: "text.secondary",
                              wordBreak: "break-word",
                            }}
                          >
                            {row.code || "Sin clave"}
                          </Typography>
                        </Box>

                        {row.branch?.name ? (
                          <Chip label={row.branch.name} size="small" />
                        ) : null}
                      </Stack>

                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip
                          label={row.scope === "global" ? "Global" : "Sucursal"}
                          size="small"
                        />
                        <Chip
                          label={row.status === "active" ? "Activo" : "Inactivo"}
                          size="small"
                          sx={
                            row.status === "active"
                              ? activeChipSx
                              : inactiveChipSx
                          }
                        />
                        {row.is_default ? (
                          <Chip label="Default" size="small" sx={defaultChipSx} />
                        ) : null}
                      </Stack>

                      <Box>
                        <Typography sx={mobileLabelSx}>Notas</Typography>
                        <Typography sx={mobileValueSx}>
                          {row.notes?.trim() || "Sin notas registradas"}
                        </Typography>
                      </Box>

                      <Stack spacing={1}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography sx={switchLabelSx}>Activo</Typography>
                          <Switch
                            checked={row.status === "active"}
                            onChange={() => onToggleStatus(row)}
                            color="primary"
                          />
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography sx={switchLabelSx}>Default</Typography>
                          <Switch
                            checked={!!row.is_default}
                            onChange={() => onToggleDefault(row)}
                            color="primary"
                          />
                        </Box>
                      </Stack>

                      <Box sx={{ flexGrow: 1 }} />

                      <Stack
                        direction="row"
                        justifyContent="flex-end"
                        alignItems="center"
                        spacing={1}
                      >
                        <Tooltip title="Editar">
                          <IconButton onClick={() => onEdit(row)} sx={iconEditSx}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Box>
                </Card>
              ))}
            </Stack>
          ) : (
            <TableContainer
              sx={{
                width: "100%",
                overflowX: "hidden",
              }}
            >
              <Table
                sx={{
                  width: "100%",
                  tableLayout: "fixed",
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
                        py: 1.75,
                      },
                    }}
                  >
                    <TableCell sx={{ width: "28%" }}>Nombre</TableCell>
                    <TableCell sx={{ width: "12%" }}>Clave</TableCell>
                    <TableCell sx={{ width: "18%" }}>Activo</TableCell>
                    <TableCell sx={{ width: "18%" }}>Default</TableCell>
                    <TableCell sx={{ width: "16%" }}>Notas</TableCell>
                    <TableCell align="right" sx={{ width: "8%" }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedItems.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        "& td": {
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          fontSize: 14,
                          color: "text.primary",
                          verticalAlign: "top",
                          py: 2,
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 800,
                            lineHeight: 1.35,
                            wordBreak: "break-word",
                          }}
                        >
                          {row.name}
                        </Typography>
                      </TableCell>

                      <TableCell
                        sx={{
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          color: "text.secondary",
                        }}
                      >
                        {row.code || "—"}
                      </TableCell>

                      <TableCell>
                        <FormControlLabel
                          sx={{
                            m: 0,
                            alignItems: "center",
                            "& .MuiFormControlLabel-label": {
                              lineHeight: 1.2,
                            },
                          }}
                          control={
                            <Switch
                              checked={row.status === "active"}
                              onChange={() => onToggleStatus(row)}
                              color="primary"
                            />
                          }
                          label={
                            <Typography sx={switchLabelSx}>
                              {row.status === "active" ? "Activo" : "Inactivo"}
                            </Typography>
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <FormControlLabel
                          sx={{
                            m: 0,
                            alignItems: "center",
                            "& .MuiFormControlLabel-label": {
                              lineHeight: 1.2,
                            },
                          }}
                          control={
                            <Switch
                              checked={!!row.is_default}
                              onChange={() => onToggleDefault(row)}
                              color="primary"
                            />
                          }
                          label={
                            <Typography sx={switchLabelSx}>
                              {row.is_default ? "Default" : "No default"}
                            </Typography>
                          }
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          lineHeight: 1.5,
                        }}
                      >
                        {row.notes?.trim() || "—"}
                      </TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                          alignItems="center"
                          flexWrap="nowrap"
                        >
                          <Tooltip title="Editar">
                            <IconButton onClick={() => onEdit(row)} sx={iconEditSx}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
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
            itemLabel="almacenes"
          />
        </>
      )}
    </Paper>
  );
}

function EmptyState() {
  return (
    <Box
      sx={{
        px: 3,
        py: 5,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          mx: "auto",
          mb: 2,
          borderRadius: 999,
          bgcolor: "rgba(255, 152, 0, 0.12)",
          color: "primary.main",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Inventory2OutlinedIcon sx={{ fontSize: 34 }} />
      </Box>

      <Typography
        sx={{
          fontSize: 20,
          fontWeight: 800,
          color: "text.primary",
        }}
      >
        No hay almacenes registrados
      </Typography>

      <Typography
        sx={{
          mt: 1,
          color: "text.secondary",
          fontSize: 14,
          maxWidth: 560,
          mx: "auto",
        }}
      >
        Crea tu primer almacén o asegúrate de tener definidos los almacenes base
        del contexto actual.
      </Typography>
    </Box>
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

const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
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

const defaultChipSx = {
  fontWeight: 800,
  bgcolor: "#FFF3E0",
  color: "#A75A00",
};

const activeChipSx = {
  fontWeight: 800,
  bgcolor: "rgba(46, 175, 46, 0.14)",
  color: "success.main",
};

const inactiveChipSx = {
  fontWeight: 800,
  bgcolor: "rgba(242, 100, 42, 0.12)",
  color: "error.main",
};