import { useEffect, useMemo, useState } from "react";
import {
  Box, Dialog, DialogContent, DialogTitle, IconButton, Stack, Tab, Tabs, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";

import AppAlert from "../../common/AppAlert";
import SystemOwnerAccountTab from "./tabs/SystemOwnerAccountTab";
import SystemOwnerTaxProfileTab from "./tabs/SystemOwnerTaxProfileTab";

export default function SystemOwnerUpsertModal({
  open,
  editing,
  onClose,
  onSave,
  onTaxProfileSaved,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isEdit = !!editing?.id;

  const [tab, setTab] = useState("account");
  const [busy, setBusy] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const title = useMemo(
    () => (isEdit ? "Editar propietario" : "Nuevo propietario"),
    [isEdit]
  );

  useEffect(() => {
    if (!open) return;

    setTab("account");
    setBusy(false);
    setAlertState({
      open: false,
      severity: "error",
      title: "",
      message: "",
    });
  }, [open, editing?.id]);

  const showError = (message) => {
    setAlertState({
      open: true,
      severity: "error",
      title: "No se pudo completar la operación",
      message: message || "Intenta nuevamente.",
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  if (!open) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={busy ? undefined : onClose}
        fullScreen={isMobile}
        fullWidth={false}
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "100%", sm: 720 },
              height: { xs: "100%", sm: "auto" },
              maxHeight: { xs: "100%", sm: "90vh" },
              borderRadius: { xs: 0, sm: 1 },
              overflow: "hidden",
              backgroundColor: "background.paper",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            bgcolor: "#111111",
            color: "#fff",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 20, sm: 24 },
                  lineHeight: 1.2,
                  color: "#fff",
                }}
              >
                {title}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  lineHeight: 1.45,
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                {isEdit
                  ? "Administra la información de la cuenta y sus datos fiscales."
                  : "Crea una nueva cuenta de propietario."}
              </Typography>
            </Box>

            <IconButton
              onClick={onClose}
              disabled={busy}
              aria-label="Cerrar"
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.08)",
                borderRadius: 1,
                flexShrink: 0,
                "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: "background.default",
            overflowY: "auto",
          }}
        >
          {isEdit ? (
            <Box
              sx={{
                mb: 2.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
                overflow: "hidden",
              }}
            >
              <Tabs
                value={tab}
                onChange={(_, value) => setTab(value)}
                variant="fullWidth"
                textColor="inherit"
                slotProps={{
                  indicator: {
                    sx: {
                      height: 3,
                      bgcolor: "primary.main",
                    },
                  },
                }}
                sx={{
                  minHeight: 56,
                  "& .MuiTab-root": {
                    minHeight: 56,
                    px: { xs: 1, sm: 2 },
                    fontSize: { xs: 13, sm: 15 },
                    fontWeight: 800,
                    textTransform: "none",
                    color: "text.secondary",
                    transition: "background-color 0.18s ease, color 0.18s ease",
                  },
                  "& .MuiTab-root.Mui-selected": {
                    color: "primary.main",
                    bgcolor: "rgba(255,152,0,0.045)",
                  },
                  "& .MuiTab-root:hover": {
                    bgcolor: "rgba(255,152,0,0.06)",
                  },
                }}
              >
                <Tab
                  value="account"
                  label="Datos de la cuenta"
                  disabled={busy}
                  disableRipple
                />

                <Tab
                  value="tax"
                  label="Datos fiscales"
                  disabled={busy}
                  disableRipple
                />
              </Tabs>
            </Box>
          ) : null}

          <Box sx={{ display: tab === "account" || !isEdit ? "block" : "none" }}>
            <SystemOwnerAccountTab
              editing={editing}
              onClose={onClose}
              onSave={onSave}
              onSaved={onClose}
              onError={showError}
              onBusyChange={setBusy}
            />
          </Box>

          {isEdit ? (
            <Box sx={{ display: tab === "tax" ? "block" : "none" }}>
              <SystemOwnerTaxProfileTab
                ownerId={editing?.id}
                active={tab === "tax"}
                onClose={onClose}
                onBusyChange={setBusy}
                onError={showError}
                onSaved={(res) => {
                  onTaxProfileSaved?.(res);
                  onClose?.();
                }}
              />
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={3000}
      />
    </>
  );
}