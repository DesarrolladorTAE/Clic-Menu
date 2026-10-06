import { Box, Card, CardContent, Typography } from "@mui/material";

export default function ModifierCatalogSelectionCard({
  title = "",
  description = "",
  children,
}) {
  const fields = Array.isArray(children)
    ? children.filter(Boolean)
    : children
      ? [children]
      : [];

  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        borderRadius: 1,
        borderColor: "divider",
        boxShadow: "none",
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
        {(title || description) && (
          <Box sx={{ mb: 2 }}>
            {title && (
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, lineHeight: 1.3 }}
              >
                {title}
              </Typography>
            )}

            {description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: title ? 0.5 : 0, lineHeight: 1.45 }}
              >
                {description}
              </Typography>
            )}
          </Box>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              fields.length > 1
                ? { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }
                : "1fr",
            gap: 2,
            width: "100%",
          }}
        >
          {fields.map((field, index) => (
            <Box key={field?.key ?? index} sx={{ minWidth: 0, width: "100%" }}>
              {field}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}