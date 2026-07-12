import { Box, Typography } from "@mui/material";

export function PromotionFieldBlock({
  label,
  input,
  help,
  error,
}) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 800,
          color: "text.primary",
          mb: 1,
        }}
      >
        {label}
      </Typography>

      {input}

      {help ? (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.45,
          }}
        >
          {help}
        </Typography>
      ) : null}

      {error ? (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: 12,
            color: "error.main",
            fontWeight: 700,
            lineHeight: 1.45,
          }}
        >
          {error}
        </Typography>
      ) : null}
    </Box>
  );
}

export function PromotionSectionTitle({
  children,
}) {
  return (
    <Typography
      sx={{
        fontSize: 15,
        fontWeight: 800,
        color: "primary.main",
        pt: 0.5,
      }}
    >
      {children}
    </Typography>
  );
}
