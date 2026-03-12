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
    >
      <Alert onClose={onClose} severity={severity}>
        <Box>
          {title ? (
            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
              {title}
            </Typography>
          ) : null}

          <Typography variant="body2">{message}</Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
}