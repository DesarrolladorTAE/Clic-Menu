import {
  Box, InputAdornment, MenuItem, Paper, Stack, TextField, Typography,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const STATUS_OPTIONS = [
  {
    value: "all",
    label: "Todas",
  },
  {
    value: "active",
    label: "Activas",
  },
  {
    value: "inactive",
    label: "Inactivas",
  },
];

export default function PromotionFilters({
  search,
  status,
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
      <Stack spacing={1.75}>
        <Box>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            Buscar y filtrar
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Localiza promociones por nombre, descripción,
            canal o estado.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
        >
          <TextField
            value={search}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder="Buscar promoción..."
            inputProps={{
              "aria-label": "Buscar promoción",
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon
                    fontSize="small"
                    sx={{ color: "text.secondary" }}
                  />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value)
            }
            SelectProps={{
              IconComponent: KeyboardArrowDownIcon,
            }}
            sx={{
              width: {
                xs: "100%",
                md: 220,
              },
              flexShrink: 0,
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>
    </Paper>
  );
}
