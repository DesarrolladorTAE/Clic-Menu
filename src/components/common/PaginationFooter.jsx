import React from "react";
import { Button, Stack, Typography } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export default function PaginationFooter({
  page,
  totalPages,
  startItem,
  endItem,
  total,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  itemLabel = "registros",
}) {
  return (
    <Stack
      className="cm-pagination-footer"
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "center" }}
      spacing={1.5}
      sx={{
        px: { xs: 1.25, sm: 2 },
        py: 1.5,
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        borderTop: "1px solid",
        borderColor: "divider",
        backgroundColor: "#fff",
      }}
    >
      <Typography
        sx={{
          fontSize: 13,
          color: "text.secondary",
          textAlign: { xs: "center", sm: "left" },
          lineHeight: 1.45,
          minWidth: 0,
        }}
      >
        Mostrando {startItem} - {endItem} de {total} {itemLabel}
      </Typography>

      <Stack
        className="cm-pagination-controls"
        direction="row"
        spacing={{ xs: 0.5, sm: 1 }}
        justifyContent={{ xs: "center", sm: "flex-end" }}
        alignItems="center"
        sx={{
          width: { xs: "100%", sm: "auto" },
          minWidth: 0,
          maxWidth: "100%",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<NavigateBeforeIcon />}
          onClick={onPrev}
          disabled={!hasPrev}
          sx={{
            minWidth: { xs: 0, sm: 110 },
            flex: { xs: "1 1 0", sm: "0 0 auto" },
            height: 40,
            px: { xs: 0.75, sm: 2 },
            whiteSpace: "nowrap",
            fontSize: { xs: 12, sm: 14 },
            "& .MuiButton-startIcon": {
              mr: { xs: 0.25, sm: 1 },
              ml: 0,
              flexShrink: 0,
            },
            "& .MuiButton-startIcon svg": {
              fontSize: { xs: 18, sm: 20 },
            },
          }}
        >
          Anterior
        </Button>

        <Typography
          sx={{
            minWidth: { xs: 42, sm: 70 },
            px: { xs: 0.25, sm: 0 },
            flexShrink: 0,
            textAlign: "center",
            fontSize: { xs: 12, sm: 13 },
            fontWeight: 700,
            color: "text.primary",
            whiteSpace: "nowrap",
          }}
        >
          {page} / {totalPages}
        </Typography>

        <Button
          variant="outlined"
          endIcon={<NavigateNextIcon />}
          onClick={onNext}
          disabled={!hasNext}
          sx={{
            minWidth: { xs: 0, sm: 110 },
            flex: { xs: "1 1 0", sm: "0 0 auto" },
            height: 40,
            px: { xs: 0.75, sm: 2 },
            whiteSpace: "nowrap",
            fontSize: { xs: 12, sm: 14 },
            "& .MuiButton-endIcon": {
              ml: { xs: 0.25, sm: 1 },
              mr: 0,
              flexShrink: 0,
            },
            "& .MuiButton-endIcon svg": {
              fontSize: { xs: 18, sm: 20 },
            },
          }}
        >
          Siguiente
        </Button>
      </Stack>
    </Stack>
  );
}