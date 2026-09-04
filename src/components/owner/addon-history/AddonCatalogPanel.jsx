import { useEffect, useMemo, useState } from "react";
import { Box, Card, Chip, Paper, Stack, Typography } from "@mui/material";

import ExtensionRoundedIcon from "@mui/icons-material/ExtensionRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import PaginationFooter from "../../common/PaginationFooter";

const PAGE_SIZE = 5;
const TERRACOTTA = "#B85C38";

function formatMoney(value, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AddonCatalogPanel({
  mode = "current",
  catalog = [],
  currentAddons = [],
  branches = [],
  selectedBranchId = "",
}) {
  const [page, setPage] = useState(1);

  const selectedBranch = useMemo(() => {
    return branches.find(
      (branch) => String(branch.id) === String(selectedBranchId)
    ) || null;
  }, [branches, selectedBranchId]);

  const currentForBranch = useMemo(() => {
    if (!selectedBranchId) return [];

    return currentAddons.filter(
      (item) => String(item?.branch?.id) === String(selectedBranchId)
    );
  }, [currentAddons, selectedBranchId]);

  const items = useMemo(() => {
    if (mode === "current") {
      return currentForBranch.map((access) => ({
        key: `current-${access.branch_addon_id}`,
        addon: access.addon,
        access,
        isCurrent: true,
      }));
    }

    return catalog.map((addon) => {
      const access =
        currentForBranch.find(
          (item) => String(item?.addon?.id) === String(addon.id)
        ) || null;

      return {
        key: `catalog-${addon.id}`,
        addon,
        access,
        isCurrent: Boolean(access),
      };
    });
  }, [mode, catalog, currentForBranch]);

  const total = items.length;
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const visibleItems = items.slice(startIndex, startIndex + PAGE_SIZE);
  const startItem = total === 0 ? 0 : startIndex + 1;
  const endItem = total === 0 ? 0 : Math.min(startIndex + PAGE_SIZE, total);

  useEffect(() => {
    setPage(1);
  }, [mode, selectedBranchId]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const title =
    mode === "current"
      ? "Mis complementos"
      : "Complementos disponibles";

  const description = selectedBranch
    ? mode === "current"
      ? `Complementos actualmente vigentes en ${selectedBranch.name}.`
      : `Consulta los complementos disponibles para ${selectedBranch.name}.`
    : "Selecciona una sucursal para consultar sus complementos.";

  return (
    <Paper
      sx={{
        p: 0,
        overflow: "hidden",
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: { xs: 17, sm: 19 },
              fontWeight: 900,
              color: "text.primary",
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              mt: 0.45,
              fontSize: 13,
              color: "text.secondary",
              lineHeight: 1.5,
            }}
          >
            {description}
          </Typography>
        </Box>

        {selectedBranch && total > 0 ? (
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 800,
              color: "text.secondary",
              whiteSpace: "nowrap",
            }}
          >
            {total} complemento{total === 1 ? "" : "s"}
          </Typography>
        ) : null}
      </Box>

      {!selectedBranch ? (
        <EmptyState
          title="Selecciona una sucursal"
          message="Selecciona una sucursal para consultar los complementos correspondientes."
        />
      ) : items.length === 0 ? (
        <EmptyState
          title={
            mode === "current"
              ? "Sin complementos vigentes"
              : "Sin complementos disponibles"
          }
          message={
            mode === "current"
              ? `${selectedBranch.name} todavía no tiene complementos vigentes.`
              : "No hay complementos disponibles para mostrar en este momento."
          }
        />
      ) : (
        <>
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2,
              alignItems: "stretch",
            }}
          >
            {visibleItems.map((item) => (
              <AddonCard
                key={item.key}
                item={item}
                mode={mode}
              />
            ))}
          </Box>

          <PaginationFooter
            page={safePage}
            totalPages={totalPages}
            startItem={startItem}
            endItem={endItem}
            total={total}
            hasPrev={safePage > 1}
            hasNext={safePage < totalPages}
            onPrev={() => setPage((prev) => Math.max(prev - 1, 1))}
            onNext={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            itemLabel="complementos"
          />
        </>
      )}
    </Paper>
  );
}

function AddonCard({ item, mode }) {
  const addon = item?.addon || {};
  const access = item?.access || null;
  const isCurrent = item?.isCurrent === true;

  return (
    <Card
      sx={{
        width: "100%",
        minHeight: 270,
        height: "100%",
        borderRadius: 1,
        border: "1px solid",
        borderColor: TERRACOTTA,
        boxShadow: "none",
        backgroundColor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Stack
        spacing={2}
        sx={{
          p: { xs: 2, sm: 2.25 },
          height: "100%",
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="flex-start"
            sx={{ minWidth: 0 }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 1,
                display: "grid",
                placeItems: "center",
                bgcolor: TERRACOTTA,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {isCurrent ? (
                <CheckCircleRoundedIcon sx={{ fontSize: 24 }} />
              ) : (
                <ExtensionRoundedIcon sx={{ fontSize: 24 }} />
              )}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 17,
                  fontWeight: 900,
                  color: "text.primary",
                  lineHeight: 1.25,
                  wordBreak: "break-word",
                }}
              >
                {addon.name || "Complemento"}
              </Typography>

              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                Contratación por sucursal
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={isCurrent ? "Vigente" : "Disponible"}
            size="small"
            variant={isCurrent ? "filled" : "outlined"}
            sx={{
              flexShrink: 0,
              fontWeight: 800,
              ...(isCurrent
                ? {
                    bgcolor: TERRACOTTA,
                    color: "#fff",
                    "& .MuiChip-label": { color: "#fff" },
                  }
                : {
                    color: TERRACOTTA,
                    borderColor: TERRACOTTA,
                    bgcolor: "transparent",
                  }),
            }}
          />
        </Stack>

        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.6,
            flex: 1,
          }}
        >
          {addon.description || "Complemento disponible para esta sucursal."}
        </Typography>

        <Box
          sx={{
            pt: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
            },
            gap: 1.5,
          }}
        >
          <DetailItem
            label="Precio mensual"
            value={`${formatMoney(addon.monthly_price, addon.currency)} / mes`}
            strong
          />

          {isCurrent ? (
            <DetailItem
              label="Días restantes"
              value={`${Number(access?.days_remaining || 0)} día${
                Number(access?.days_remaining || 0) === 1 ? "" : "s"
              }`}
            />
          ) : (
            <DetailItem
              label="Estado"
              value="Disponible para contratar"
            />
          )}

          {isCurrent ? (
            <>
              <DetailItem
                label="Inicio"
                value={formatDate(access?.starts_at)}
              />

              <DetailItem
                label="Vigencia hasta"
                value={formatDate(access?.ends_at)}
              />
            </>
          ) : null}
        </Box>

        {mode === "available" && isCurrent ? (
          <Box
            sx={{
              px: 1.25,
              py: 0.9,
              borderRadius: 1,
              bgcolor: "rgba(184, 92, 56, 0.08)",
              borderLeft: "3px solid",
              borderLeftColor: TERRACOTTA,
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                color: TERRACOTTA,
                fontWeight: 800,
                lineHeight: 1.4,
              }}
            >
              Este complemento ya está vigente en la sucursal seleccionada.
            </Typography>
          </Box>
        ) : null}
      </Stack>
    </Card>
  );
}

function EmptyState({ title, message }) {
  return (
    <Box
      sx={{
        px: 3,
        py: { xs: 4, sm: 5 },
        textAlign: "center",
      }}
    >
      <ExtensionRoundedIcon
        sx={{
          fontSize: 40,
          color: "text.disabled",
        }}
      />

      <Typography
        sx={{
          mt: 1,
          fontSize: 19,
          fontWeight: 900,
          color: "text.primary",
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 0.75,
          fontSize: 14,
          color: "text.secondary",
          lineHeight: 1.5,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
}

function DetailItem({ label, value, strong = false }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 900,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.35,
          fontSize: strong ? 15 : 13,
          fontWeight: strong ? 900 : 800,
          color: "text.primary",
          lineHeight: 1.35,
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}