import { Box, Stack, Typography } from "@mui/material";

export function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ flex: 1, width: "100%", minWidth: 0 }}>
      <Typography sx={fieldLabelSx}>{label}</Typography>

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
    </Box>
  );
}

export function InfoPill({ icon, text }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        width: "100%",
        px: 1.25,
        py: 1,
        borderRadius: 1,
        bgcolor: "#F8FAFC",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          color: "primary.main",
          display: "flex",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: 13,
          color: "text.primary",
          wordBreak: "break-word",
        }}
      >
        {text}
      </Typography>
    </Stack>
  );
}

export const containerSx = {
  width: "100%",
  borderRadius: 1,
  backgroundColor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
};

export const resultCardSx = {
  width: "100%",
  borderRadius: 1,
  boxShadow: "none",
  border: "1px solid",
  borderColor: "divider",
};

export const noticeSx = {
  p: 1.5,
  borderRadius: 1,
  bgcolor: "#F8FAFC",
  border: "1px solid",
  borderColor: "divider",
};

export const titleSx = {
  fontWeight: 800,
  fontSize: { xs: 18, sm: 20 },
  color: "text.primary",
};

export const subtitleSx = {
  mt: 0.5,
  fontSize: 13,
  color: "text.secondary",
  lineHeight: 1.5,
};

export const optionNameSx = {
  mt: 0.5,
  fontSize: { xs: 16, sm: 18 },
  fontWeight: 800,
  color: "text.primary",
  wordBreak: "break-word",
};

export const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};

export const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.primary",
};

export const emptyHelpSx = {
  fontSize: 12,
  color: "text.secondary",
};

export const resultTitleSx = {
  fontSize: 15,
  fontWeight: 800,
  color: "text.primary",
};

export const resultTextSx = {
  fontSize: 14,
  color: "text.primary",
  lineHeight: 1.6,
};

export const sectionMiniTitleSx = {
  fontSize: 13,
  fontWeight: 800,
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: 0.4,
};

export const reqTitleSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
};

export const reqTextSx = {
  fontSize: 13,
  color: "text.secondary",
};