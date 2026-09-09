import React from "react";
import { Alert, Snackbar, Typography, Box } from "@mui/material";

export default function AppAlert({
  open,
  onClose,
  severity = "error",
  title,
  message,
  autoHideDuration = 4000,
  anchorOrigin = { vertical: "top", horizontal: "right" },
}) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      sx={{
        top: { xs: 16, sm: 24 },
        left: { xs: 16, sm: "auto" },
        right: { xs: 16, sm: 24 },
        maxWidth: { xs: "calc(100vw - 32px)", sm: 440 },
        width: { xs: "auto", sm: "100%" },
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        sx={{
          width: "100%",
          boxSizing: "border-box",
          alignItems: "flex-start",
          "& .MuiAlert-message": { minWidth: 0, flex: 1 },
        }}
      >
        <Box sx={{ minWidth: 0, width: "100%" }}>
          {title ? (
            <Typography sx={{ fontWeight: 800, mb: 0.5, overflowWrap: "anywhere" }}>
              {title}
            </Typography>
          ) : null}

          <Typography
            variant="body2"
            sx={{ lineHeight: 1.45, overflowWrap: "anywhere", wordBreak: "break-word" }}
          >
            {message}
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
}