import { Paper, Stack, Typography } from "@mui/material";

const variantMap = {
  warning: {
    bg: "#FFF7E8",
    border: "#F3D48B",
    title: "#8A5A00",
    text: "#8A5A00",
  },
  info: {
    bg: "#EEF2FF",
    border: "#CFCFFF",
    title: "#2D2D7A",
    text: "#2D2D7A",
  },
  error: {
    bg: "#FFF0EE",
    border: "#F6C2B8",
    title: "#A10000",
    text: "#A10000",
  },
};

export default function PlansNoticeCard({
  title,
  message,
  variant = "warning",
  noticeCode,
  noticeMeta,
}) {
  const palette = variantMap[variant] || variantMap.warning;

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 1,
        backgroundColor: palette.bg,
        border: "1px solid",
        borderColor: palette.border,
        boxShadow: "none",
      }}
    >
      <Stack spacing={1}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 900,
            color: palette.title,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            color: palette.text,
            lineHeight: 1.55,
          }}
        >
          {message}
        </Typography>

        {noticeCode === "BRANCH_LIMIT_REACHED" && noticeMeta ? (
          <Typography
            sx={{
              fontSize: 12,
              color: palette.text,
              lineHeight: 1.45,
              fontWeight: 800,
            }}
          >
            Límite actual: {noticeMeta.max_branches} · Activas:{" "}
            {noticeMeta.active_branches}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}