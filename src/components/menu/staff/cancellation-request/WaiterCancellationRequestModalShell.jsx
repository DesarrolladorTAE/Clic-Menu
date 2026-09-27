import React from "react";
import {
  Card, CardContent, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export default function WaiterCancellationRequestModalShell({
  open,
  title,
  subtitle,
  closeDisabled = false,
  onClose,
  children,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClose = () => {
    if (closeDisabled) {
      return;
    }

    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      disableEscapeKeyDown
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            height: { xs: "100dvh", sm: "min(700px, calc(100dvh - 48px))" },
            maxHeight: { xs: "100dvh", sm: "calc(100dvh - 48px)" },
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
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
          borderBottom: "3px solid",
          borderColor: "primary.main",
          flexShrink: 0,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
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

            <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
              {subtitle}
            </Typography>
          </Stack>

          <IconButton
            type="button"
            onClick={handleClose}
            disabled={closeDisabled}
            aria-label="Cerrar"
            sx={{
              flexShrink: 0,
              width: 44,
              height: 44,
              mt: -0.25,
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.16)",
              },
              "&.Mui-disabled": {
                color: "rgba(255,255,255,0.35)",
                bgcolor: "rgba(255,255,255,0.05)",
              },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 1.5, sm: 2.5 },
          bgcolor: "background.default",
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        <Card
          sx={{
            height: "100%",
            minHeight: "100%",
            borderRadius: 0,
            bgcolor: "background.paper",
            boxShadow: "none",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardContent
            sx={{
              flex: 1,
              minHeight: 0,
              p: { xs: 1.5, sm: 2.5 },
              display: "flex",
              flexDirection: "column",
              "&:last-child": { pb: { xs: 1.5, sm: 2.5 } },
            }}
          >
            {children}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}