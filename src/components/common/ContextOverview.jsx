// src/components/common/ContextOverview.jsx

import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

export default function ContextOverview({
  title = "Contexto actual",
  items = [],
  description = "",
}) {
  if (!items.length) return null;

  const columns = {
    xs: "1fr",
    sm: `repeat(${Math.min(items.length, 2)}, minmax(0, 1fr))`,
    md: `repeat(${Math.min(items.length, 3)}, minmax(0, 1fr))`,
    lg: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))`,
  };

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Stack spacing={2}>
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: columns,
            gridAutoRows: "1fr",
            gap: 1.5,
            width: "100%",
          }}
        >
          {items.map((item, index) => (
            <ContextMiniCard
              key={item.key ?? index}
              icon={item.icon}
              title={item.title}
              value={item.value}
              chipLabel={item.chipLabel}
              chipColor={item.chipColor}
            />
          ))}
        </Box>

        {description ? (
          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
              lineHeight: 1.6,
            }}
          >
            {description}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}

function ContextMiniCard({
  icon,
  title,
  value,
  chipLabel,
  chipColor = "default",
}) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minWidth: 0,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.75,
        backgroundColor: "background.default",
      }}
    >
      <Stack spacing={1} height="100%">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255, 152, 0, 0.12)",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              color: "text.primary",
              overflowWrap: "anywhere",
            }}
          >
            {title}
          </Typography>
        </Stack>

        <Typography
          sx={{
            fontSize: 14,
            color: "text.primary",
            lineHeight: 1.45,
            minHeight: {
              xs: "auto",
              md: 42,
            },
            overflowWrap: "anywhere",
          }}
        >
          {value}
        </Typography>

        {chipLabel ? (
          <Box sx={{ mt: "auto" }}>
            <Chip
              label={chipLabel}
              size="small"
              color={chipColor}
              variant={chipColor === "default" ? "outlined" : "filled"}
            />
          </Box>
        ) : null}
      </Stack>
    </Box>
  );
}