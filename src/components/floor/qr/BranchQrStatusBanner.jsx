import { Box, Paper, Typography } from "@mui/material";

const toneMap = {
  warning: {
    bg: "#FFF7E8",
    bd: "#F3D48B",
    fg: "#8A5A00",
  },
  error: {
    bg: "#FFF0EE",
    bd: "#F6C2B8",
    fg: "#A10000",
  },
  info: {
    bg: "#EEF2FF",
    bd: "#CFCFFF",
    fg: "#2D2D7A",
  },
  ok: {
    bg: "#EAF8EE",
    bd: "#B8E2C3",
    fg: "#0A7A2F",
  },
};

export default function BranchQrStatusBanner({
  tone = "info",
  title,
  body,
}) {
  const c = toneMap[tone] || toneMap.info;

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 1,
        border: "1px solid",
        borderColor: c.bd,
        backgroundColor: c.bg,
        boxShadow: "none",
      }}
    >
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 900,
          color: c.fg,
        }}
      >
        {title}
      </Typography>

      {body ? (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: 13,
            color: c.fg,
            lineHeight: 1.5,
            whiteSpace: "pre-line",
            fontWeight: 700,
          }}
        >
          {body}
        </Typography>
      ) : null}
    </Paper>
  );
}