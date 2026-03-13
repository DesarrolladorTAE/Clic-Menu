import React, { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

import { getComponentCandidates } from "../../services/products/catalog/productComponents.service";
import usePagination from "../../hooks/usePagination";
import PaginationFooter from "../common/PaginationFooter";

function apiErrorToMessage(e, fallback) {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors
      ? Object.values(e.response.data.errors).flat().join("\n")
      : "") ||
    fallback
  );
}

const PAGE_SIZE = 5;

export default function CandidatePicker({
  restaurantId,
  productId,
  branchId,
  excludeIds = [],
  onPick,
}) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState([]);

  const params = useMemo(() => {
    return {
      branch_id: branchId,
      q: q.trim() || undefined,
      exclude_ids: excludeIds?.length ? excludeIds : undefined,
    };
  }, [branchId, q, excludeIds]);

  useEffect(() => {
    if (!err) return;
    const timer = setTimeout(() => setErr(""), 5000);
    return () => clearTimeout(timer);
  }, [err]);

  const load = async () => {
    setErr("");
    setLoading(true);

    try {
      const res = await getComponentCandidates(restaurantId, productId, params);
      setData(res?.data || []);
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudo cargar candidatos"));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!branchId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  const {
    page,
    nextPage,
    prevPage,
    total,
    totalPages,
    startItem,
    endItem,
    hasPrev,
    hasNext,
    paginatedItems,
  } = usePagination({
    items: data,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <TextField
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar producto vendible..."
          />

          <Button
            onClick={load}
            disabled={loading}
            variant="outlined"
            startIcon={<SearchIcon />}
            sx={{
              minWidth: { xs: "100%", sm: 140 },
              height: 44,
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            {loading ? "Buscando…" : "Buscar"}
          </Button>
        </Stack>

        {err ? (
          <Alert
            severity="error"
            sx={{
              mt: 2,
              borderRadius: 1,
              alignItems: "flex-start",
              whiteSpace: "pre-line",
            }}
          >
            <Typography variant="body2">{err}</Typography>
          </Alert>
        ) : null}
      </Box>

      <Box
        sx={{
          p: 2,
          maxHeight: 420,
          overflowY: "auto",
          display: "grid",
          gap: 1.5,
        }}
      >
        {!paginatedItems.length ? (
          <Typography
            sx={{
              fontSize: 14,
              color: "text.secondary",
              textAlign: "center",
              py: 3,
            }}
          >
            {loading ? "Cargando candidatos…" : "No hay candidatos disponibles."}
          </Typography>
        ) : (
          paginatedItems.map((p) => (
            <Card
              key={p.id}
              sx={{
                borderRadius: 1,
                boxShadow: "none",
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "#fff",
              }}
            >
              <Box sx={{ p: 2 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1.5}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "text.primary",
                      }}
                    >
                      {p.name}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                      sx={{ mt: 1 }}
                    >
                      <Chip
                        size="small"
                        label={
                          p.has_variants
                            ? `Variantes: ${p.variants_count || 0}`
                            : "Sin variantes"
                        }
                        sx={{ fontWeight: 800 }}
                      />
                    </Stack>
                  </Box>

                  <Button
                    onClick={() => onPick(p)}
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                      minWidth: { xs: "100%", sm: 140 },
                      height: 40,
                      borderRadius: 2,
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    Agregar
                  </Button>
                </Stack>
              </Box>
            </Card>
          ))
        )}
      </Box>

      <PaginationFooter
        page={page}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        total={total}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={prevPage}
        onNext={nextPage}
        itemLabel="candidatos"
      />

      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          backgroundColor: "#fff",
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.5,
          }}
        >
          Solo aparecen productos <strong>activos</strong> y <strong>vendibles</strong> en esta sucursal.
        </Typography>
      </Box>
    </Box>
  );
}