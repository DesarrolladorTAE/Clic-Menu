import {
  Box,
  Button,
  Card,
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

import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import PaginationFooter from "../../common/PaginationFooter";

export default function BranchQrListPanel({
  items = [],
  total = 0,
  page = 1,
  totalPages = 1,
  startItem = 0,
  endItem = 0,
  hasPrev = false,
  hasNext = false,
  onPrev,
  onNext,
  onCopy,
  onToggleActive,
  onDelete,
  onOpen,
  typeLabelMap = {},
  busy = false,
  canManageQr = false,
  manageQrBlockReason = null,
  selectedBranchId = "",
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
          Lista de QRs
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
            Selecciona una sucursal
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
              fontSize: 14,
            }}
          >
            Primero elige una sucursal para visualizar y administrar sus códigos QR.
          </Typography>
        </Box>
      ) : total === 0 ? (
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
            No hay QRs registrados
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
              fontSize: 14,
            }}
          >
            Crea tu primer QR físico, web o delivery para esta sucursal.
          </Typography>
        </Box>
      ) : (
        <>
          {isMobile ? (
            <Stack spacing={1.5} sx={{ p: 2 }}>
              {items.map((qr) => {
                const channelName = qr?.sales_channel?.name || "—";
                const tableName = qr?.table?.name || "General";
                const toggleDisabled = busy || !canManageQr;

                return (
                  <Card
                    key={qr.id}
                    sx={{
                      borderRadius: 1,
                      boxShadow: "none",
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: "#fff",
                      minHeight: 260,
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
                              {qr.name}
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.5,
                                fontSize: 13,
                                color: "text.secondary",
                              }}
                            >
                              {typeLabelMap[qr.type] || qr.type}
                            </Typography>
                          </Box>

                          <Typography
                            sx={{
                              px: 1.25,
                              py: 0.5,
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 800,
                              bgcolor: qr.is_active ? "#EAF8EE" : "#FFF0EE",
                              color: qr.is_active ? "#0A7A2F" : "#A10000",
                              border: "1px solid",
                              borderColor: qr.is_active ? "#B8E2C3" : "#F6C2B8",
                            }}
                          >
                            {qr.is_active ? "Activo" : "Inactivo"}
                          </Typography>
                        </Stack>

                        <InfoRow label="Canal" value={channelName} />
                        <InfoRow label="Mesa" value={tableName} />
                        <InfoRow label="URL" value={qr.public_url} long />

                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Switch
                              checked={!!qr.is_active}
                              onChange={() => onToggleActive(qr)}
                              disabled={toggleDisabled}
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
                              {qr.is_active ? "Activo" : "Inactivo"}
                            </Typography>
                          }
                        />

                        {!canManageQr ? (
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "#8A5A00",
                              fontWeight: 800,
                              lineHeight: 1.45,
                            }}
                          >
                            {manageQrBlockReason ||
                              "QR desactivado para esta sucursal."}
                          </Typography>
                        ) : null}

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Tooltip title="Copiar URL">
                            <IconButton
                              onClick={() => onCopy(qr.public_url)}
                              sx={iconNeutralSx}
                            >
                              <ContentCopyOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Abrir">
                            <IconButton
                              onClick={() => onOpen(qr.public_url)}
                              sx={iconPrimarySx}
                            >
                              <OpenInNewOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Eliminar">
                            <IconButton
                              onClick={() => onDelete(qr)}
                              disabled={busy}
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
          ) : (
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
                    <TableCell>Nombre</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Canal</TableCell>
                    <TableCell>Mesa</TableCell>
                    <TableCell>URL</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {items.map((qr) => {
                    const channelName = qr?.sales_channel?.name || "—";
                    const tableName = qr?.table?.name || "General";
                    const toggleDisabled = busy || !canManageQr;

                    return (
                      <TableRow
                        key={qr.id}
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
                          <Typography sx={{ fontWeight: 800 }}>
                            {qr.name}
                          </Typography>
                        </TableCell>

                        <TableCell>{typeLabelMap[qr.type] || qr.type}</TableCell>
                        <TableCell>{channelName}</TableCell>
                        <TableCell>{tableName}</TableCell>

                        <TableCell
                          sx={{
                            whiteSpace: "normal !important",
                            minWidth: 280,
                            wordBreak: "break-all",
                          }}
                        >
                          {qr.public_url}
                        </TableCell>

                        <TableCell align="center">
                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Switch
                                checked={!!qr.is_active}
                                onChange={() => onToggleActive(qr)}
                                disabled={toggleDisabled}
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
                                {qr.is_active ? "Activo" : "Inactivo"}
                              </Typography>
                            }
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                            alignItems="center"
                            flexWrap="nowrap"
                          >
                            <Tooltip title="Copiar URL">
                              <IconButton
                                onClick={() => onCopy(qr.public_url)}
                                sx={iconNeutralSx}
                              >
                                <ContentCopyOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Abrir">
                              <IconButton
                                onClick={() => onOpen(qr.public_url)}
                                sx={iconPrimarySx}
                              >
                                <OpenInNewOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar">
                              <IconButton
                                onClick={() => onDelete(qr)}
                                disabled={busy}
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
            itemLabel="QRs"
          />
        </>
      )}
    </Paper>
  );
}

function InfoRow({ label, value, long = false }) {
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
          wordBreak: long ? "break-all" : "break-word",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

const iconNeutralSx = {
  width: 40,
  height: 40,
  bgcolor: "#fff",
  color: "text.primary",
  borderRadius: 1.5,
  border: "1px solid",
  borderColor: "divider",
  "&:hover": {
    bgcolor: "#f7f7f7",
  },
};

const iconPrimarySx = {
  width: 40,
  height: 40,
  bgcolor: "#EAF1FF",
  color: "primary.main",
  borderRadius: 1.5,
  border: "1px solid",
  borderColor: "#CFCFFF",
  "&:hover": {
    bgcolor: "#E1E9FF",
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