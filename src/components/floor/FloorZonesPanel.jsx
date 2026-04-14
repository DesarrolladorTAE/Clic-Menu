import { Box, Button, Card, Chip, Paper, Stack, Typography } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export default function FloorZonesPanel({
  zones = [],
  tablesByZone = {},
  isZoneAssignmentEnabled = false,
  onAssignWaiter,
  onEditZone,
  onDeleteZone,
}) {
  return (
    <Paper
      sx={{
        p: 0,
        overflow: "hidden",
        borderRadius: 0,
        backgroundColor: "background.paper",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          Zonas del salón
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            fontWeight: 700,
          }}
        >
          {zones.length} resultado(s)
        </Typography>
      </Box>

      {zones.length === 0 ? (
        <Box
          sx={{
            px: 3,
            py: 5,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            No hay zonas registradas
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
              fontSize: 14,
            }}
          >
            Crea tu primera zona para comenzar a organizar el salón.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {zones.map((zone) => {
              const zoneTables = tablesByZone[String(zone.id)] || [];
              const missingZoneWaiter =
                isZoneAssignmentEnabled &&
                (zone?.assigned_waiter_id === null ||
                  typeof zone?.assigned_waiter_id === "undefined");

              return (
                <Card
                  key={zone.id}
                  sx={{
                    borderRadius: 1,
                    boxShadow: "none",
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "#fff",
                    height: "100%",
                  }}
                >
                  <Box sx={{ p: 2 }}>
                    <Stack spacing={1.5} sx={{ height: "100%" }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={1}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: 15,
                              fontWeight: 800,
                              color: "text.primary",
                              lineHeight: 1.3,
                              wordBreak: "break-word",
                            }}
                          >
                            {zone.name}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.5,
                              fontSize: 13,
                              color: "text.secondary",
                            }}
                          >
                            {zoneTables.length} mesa(s) en esta zona
                          </Typography>
                        </Box>

                        {missingZoneWaiter ? (
                          <Chip
                            label="Sin mesero"
                            size="small"
                            sx={{
                              fontWeight: 800,
                              bgcolor: "#FFF3E0",
                              color: "#A75A00",
                            }}
                          />
                        ) : (
                          <Chip
                            label="Activa"
                            size="small"
                            color="success"
                          />
                        )}
                      </Stack>

                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "text.secondary",
                          lineHeight: 1.5,
                          minHeight: 40,
                        }}
                      >
                        {isZoneAssignmentEnabled
                          ? "Puedes asignar un mesero a esta zona para distribuir la atención."
                          : "Esta zona ya puede utilizarse para organizar las mesas del salón."}
                      </Typography>

                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                        sx={{ mt: "auto" }}
                      >
                        {isZoneAssignmentEnabled ? (
                          <Button
                            onClick={() => onAssignWaiter(zone)}
                            variant="outlined"
                            startIcon={<PersonOutlineOutlinedIcon />}
                            sx={{
                              flex: 1,
                              minWidth: 140,
                              height: 40,
                              borderRadius: 2,
                              fontWeight: 800,
                            }}
                          >
                            Asignar mesero
                          </Button>
                        ) : null}

                        <Button
                          onClick={() => onEditZone(zone)}
                          variant="outlined"
                          startIcon={<EditOutlinedIcon />}
                          sx={{
                            flex: 1,
                            minWidth: 110,
                            height: 40,
                            borderRadius: 2,
                            fontWeight: 800,
                          }}
                        >
                          Editar
                        </Button>

                        <Button
                          onClick={() => onDeleteZone(zone)}
                          variant="outlined"
                          startIcon={<DeleteOutlineIcon />}
                          color="error"
                          sx={{
                            flex: 1,
                            minWidth: 110,
                            height: 40,
                            borderRadius: 2,
                            fontWeight: 800,
                          }}
                        >
                          Eliminar
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                </Card>
              );
            })}
          </Box>
        </Box>
      )}
    </Paper>
  );
}
