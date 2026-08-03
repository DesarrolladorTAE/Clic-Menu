// src/components/staff/casher/shared/CashierDialogShell.jsx
import React from "react";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";

import PageContainer from "../../../common/PageContainer";

export default function CashierDialogShell({ open, title, description, icon = null, busy = false, maxWidth = "md", onClose, children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      fullScreen={isMobile}
      maxWidth={maxWidth}
      slotProps={{
        paper: {
          sx: {
            m: { xs: 0, sm: 2 },
            width: { xs: "100%", sm: "calc(100% - 32px)" },
            height: { xs: "100dvh", sm: "auto" },
            maxHeight: { xs: "100dvh", sm: "calc(100dvh - 32px)" },
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
            backgroundColor: "background.paper",
          },
        },
      }}
    >
      <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: 2, bgcolor: "#111111", color: "#fff" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Stack direction="row" alignItems="flex-start" spacing={1.5}>
            {icon ? (
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  borderRadius: 1,
                  bgcolor: "rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
              >
                {icon}
              </Box>
            ) : null}

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 20, sm: 24 },
                  lineHeight: 1.2,
                  color: "#fff",
                  wordBreak: "break-word",
                }}
              >
                {title}
              </Typography>

              {description ? (
                <Typography sx={{ mt: 0.5, fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.82)" }}>
                  {description}
                </Typography>
              ) : null}
            </Box>
          </Stack>

          <IconButton
            onClick={onClose}
            disabled={busy}
            aria-label="Cerrar"
            sx={{
              color: "#fff",
              flexShrink: 0,
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          bgcolor: "background.default",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <PageContainer
          maxWidth={1100}
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3 },
            pb: { xs: "max(16px, env(safe-area-inset-bottom))", sm: 3 },
          }}
        >
          {children}
        </PageContainer>
      </DialogContent>
    </Dialog>
  );
}
