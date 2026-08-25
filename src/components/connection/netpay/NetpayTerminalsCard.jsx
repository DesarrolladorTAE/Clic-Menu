import { useState } from "react";
import {
  Box, Card, Chip, FormControlLabel, IconButton, Paper, Stack, Switch, Tooltip, Typography,
} from "@mui/material";

import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import EditIcon from "@mui/icons-material/Edit";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";

import PaginationFooter from "../../common/PaginationFooter";
import usePagination from "../../../hooks/usePagination";
import NetpayTerminalEditModal from "./NetpayTerminalEditModal";

const PAGE_SIZE = 5;

export default function NetpayTerminalsCard({
  terminals = [],
  branches = [],
  savingTerminalId = null,
  onUpdate,
  onToggleStatus,
}) {
  const [editing, setEditing] = useState(null);

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
    items: terminals,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const handleSave = async (payload) => {
    if (!editing) return null;

    const saved = await onUpdate?.(editing, payload);

    if (saved) {
      setEditing(null);
    }

    return saved;
  };

  return (
    <>
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
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
              Terminales NetPay
            </Typography>

            <Typography sx={{ mt: 0.35, fontSize: 13, color: "text.secondary" }}>
              Consulta y administra las terminales registradas para este restaurante.
            </Typography>
          </Box>

          <Chip
            icon={<CreditCardRoundedIcon />}
            label={`${total} terminal${total === 1 ? "" : "es"}`}
            sx={{
              justifyContent: "flex-start",
              fontWeight: 800,
              bgcolor: "#FFF3E0",
              color: "#A75A00",
            }}
          />
        </Box>

        {terminals.length === 0 ? (
          <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
            <CreditCardRoundedIcon
              sx={{
                fontSize: 46,
                color: "primary.main",
                opacity: 0.85,
              }}
            />

            <Typography
              sx={{
                mt: 1.5,
                fontSize: 20,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              No hay terminales registradas
            </Typography>

            <Typography
              sx={{
                mt: 1,
                maxWidth: 560,
                mx: "auto",
                color: "text.secondary",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              Las terminales aparecerán automáticamente cuando un cajero utilice Clic Menu desde una PAX compatible con NetPay.
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                p: 2,
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
                alignItems: "stretch",
              }}
            >
              {paginatedItems.map((terminal) => {
                const terminalId = getTerminalId(terminal);
                const busy = Number(savingTerminalId) === Number(terminalId);
                const active = !!terminal?.is_active;

                return (
                  <Card
                    key={terminalId}
                    sx={{
                      height: "100%",
                      minHeight: 285,
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      boxShadow: "none",
                      backgroundColor: "background.paper",
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Stack spacing={1.75} sx={{ flex: 1 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          spacing={1}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontSize: 17,
                                fontWeight: 800,
                                color: "text.primary",
                                lineHeight: 1.3,
                                wordBreak: "break-word",
                              }}
                            >
                              {terminal?.name || `Terminal NetPay #${terminalId}`}
                            </Typography>
                          </Box>

                          <Chip
                            label={environmentLabel(terminal?.environment)}
                            size="small"
                            color={terminal?.environment === "production" ? "success" : "primary"}
                            variant="outlined"
                            sx={{ flexShrink: 0 }}
                          />
                        </Stack>

                        <InfoLine
                          icon={<StorefrontRoundedIcon />}
                          label="Sucursal"
                          value={terminal?.branch?.name || "No disponible"}
                        />

                        <InfoLine
                          icon={<CheckCircleOutlineRoundedIcon />}
                          label="Disponibilidad"
                          value={availabilityLabel(terminal)}
                          success={active && terminal?.can_use_netpay === true}
                        />

                        <InfoLine
                          icon={<AccessTimeRoundedIcon />}
                          label="Última conexión"
                          value={formatDateTime(terminal?.last_seen_at)}
                        />

                        <Box sx={{ flex: 1 }} />

                        <Box
                          sx={{
                            pt: 1.5,
                            borderTop: "1px solid",
                            borderColor: "divider",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Switch
                                checked={active}
                                onChange={() => onToggleStatus?.(terminal)}
                                disabled={busy}
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
                                {active ? "Activa" : "Inactiva"}
                              </Typography>
                            }
                          />

                          <Tooltip title="Editar">
                            <IconButton
                              onClick={() => setEditing(terminal)}
                              disabled={busy}
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: "secondary.main",
                                color: "#fff",
                                "&:hover": { bgcolor: "secondary.dark" },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Stack>
                    </Box>
                  </Card>
                );
              })}
            </Box>

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
              itemLabel="terminales"
            />
          </>
        )}
      </Paper>

      <NetpayTerminalEditModal
        open={!!editing}
        onClose={() => {
          if (savingTerminalId) return;
          setEditing(null);
        }}
        terminal={editing}
        branches={branches}
        saving={
          !!editing &&
          Number(savingTerminalId) === Number(getTerminalId(editing))
        }
        onSave={handleSave}
      />
    </>
  );
}

function InfoLine({ icon, label, value, success = false }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 1,
          bgcolor: success ? "rgba(46, 175, 46, 0.10)" : "rgba(255, 152, 0, 0.10)",
          color: success ? "success.main" : "primary.main",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          "& svg": { fontSize: 19 },
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
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
            fontWeight: 700,
            color: success ? "success.main" : "text.primary",
            lineHeight: 1.4,
            wordBreak: "break-word",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

function getTerminalId(terminal) {
  return Number(terminal?.netpay_terminal_id ?? terminal?.id ?? 0);
}

function environmentLabel(value) {
  if (value === "sandbox") return "Pruebas";
  if (value === "production") return "Producción";
  return "Sin ambiente";
}

function availabilityLabel(terminal) {
  if (!terminal?.is_active) return "Desactivada";
  if (terminal?.can_use_netpay === true) return "Lista para usar";
  return "No disponible";
}

function formatDateTime(value) {
  if (!value) return "No disponible";

  try {
    return new Date(value).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "No disponible";
  }
}