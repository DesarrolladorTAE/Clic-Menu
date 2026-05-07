import React from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export default function CashierSaleToolDialog({
  open,
  title,
  subtitle,
  icon = null,
  onClose,
  children,
  maxWidth = "md",
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      fullScreen={fullScreen}
      slotProps={{
        paper: {
          sx: {
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
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            {icon ? (
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 1,
                  bgcolor: "rgba(255, 152, 0, 0.16)",
                  color: "#FF9800",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  mt: 0.15,
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

              {subtitle ? (
                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.82)",
                    lineHeight: 1.45,
                  }}
                >
                  {subtitle}
                </Typography>
              ) : null}
            </Box>
          </Stack>

          <IconButton
            onClick={onClose}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              flexShrink: 0,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.16)",
              },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "background.default",
        }}
      >
        <Box
          sx={{
            minHeight: { xs: "auto", sm: 560 },
            "& > .MuiCard-root": {
              borderRadius: 1,
              boxShadow: "none",
            },
          }}
        >
          {children}
        </Box>
      </DialogContent>
    </Dialog>
  );
}