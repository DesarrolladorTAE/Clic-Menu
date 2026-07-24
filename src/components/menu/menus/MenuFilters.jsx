import {
  InputAdornment, MenuItem, Paper, Stack, TextField, Typography,
} from "@mui/material";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const STATUS_OPTIONS = [
  {
    value: "all",
    label: "Todos",
  },
  {
    value: "draft",
    label: "Borrador",
  },
  {
    value: "active",
    label: "Activo",
  },
  {
    value: "archived",
    label: "Archivado",
  },
];

export default function MenuFilters({
  search,
  status,
  total,
  onSearchChange,
  onStatusChange,
}) {
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
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
        >
          <Stack
            spacing={1}
            sx={{
              flex: 1,
              width: "100%",
            }}
          >
            <Typography sx={fieldLabelSx}>
              Buscar menú
            </Typography>

            <TextField
              fullWidth
              value={search}
              onChange={(event) =>
                onSearchChange(
                  event.target.value
                )
              }
              placeholder="Buscar por nombre"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon
                      fontSize="small"
                    />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <Stack
            spacing={1}
            sx={{
              width: {
                xs: "100%",
                md: 280,
              },
            }}
          >
            <Typography sx={fieldLabelSx}>
              Estado
            </Typography>

            <TextField
              select
              fullWidth
              value={status}
              onChange={(event) =>
                onStatusChange(
                  event.target.value
                )
              }
              SelectProps={{
                IconComponent:
                  KeyboardArrowDownIcon,
              }}
            >
              {STATUS_OPTIONS.map(
                (option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </MenuItem>
                )
              )}
            </TextField>
          </Stack>
        </Stack>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
          }}
        >
          {total === 1
            ? "1 menú encontrado."
            : `${total} menús encontrados.`}
        </Typography>
      </Stack>
    </Paper>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
};