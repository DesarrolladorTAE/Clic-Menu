import {
  FormControlLabel, InputAdornment, Paper, Stack, Switch, TextField, Typography,
} from "@mui/material";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

export default function MenuContentFilters({
  search,
  selectedOnly,
  onSearchChange,
  onSelectedOnlyChange,
}) {
  return (
    <Paper
      sx={{
        p: {
          xs: 2,
          sm: 2.5,
        },
        borderRadius: 1,
        backgroundColor:
          "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={2}
        alignItems={{
          xs: "stretch",
          md: "flex-end",
        }}
      >
        <Stack
          spacing={1}
          sx={{
            flex: 1,
            width: "100%",
          }}
        >
          <Typography
            sx={fieldLabelSx}
          >
            Buscar contenido
          </Typography>

          <TextField
            fullWidth
            value={search}
            onChange={(event) =>
              onSearchChange(
                event.target.value
              )
            }
            placeholder="Buscar sección, categoría o producto"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <FormControlLabel
          sx={{
            m: 0,
            minHeight: 44,
          }}
          control={
            <Switch
              checked={
                selectedOnly
              }
              onChange={(
                event
              ) =>
                onSelectedOnlyChange(
                  event.target
                    .checked
                )
              }
              color="primary"
            />
          }
          label={
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Solo seleccionados
            </Typography>
          }
        />
      </Stack>
    </Paper>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
};