import React from "react";
import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

import PaginationFooter from "../../../common/PaginationFooter";
import CashierSaleCard from "./CashierSaleCard";

export default function CashierSalesPanel({
  title,
  subtitle,
  mode = "available",
  sales = [],
  actionBusyId = null,
  actionsDisabled = false,
  page,
  totalPages,
  startItem,
  endItem,
  total,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onTake,
  onOpenDetail,
  onOpenCheck,
  onReopenCheck,
  onSplit,
  onMerge,
  onRelease,
}) {
  const isAvailableMode = mode === "available";

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
          px: 2,
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 800,
            color: "text.primary",
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            fontSize: 14,
            color: "text.secondary",
            lineHeight: 1.55,
          }}
        >
          {subtitle}
        </Typography>
      </Box>

      {sales.length === 0 ? (
        <Box
          sx={{
            px: 3,
            py: 6,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            {isAvailableMode
              ? "No hay ventas disponibles"
              : "Todavía no has tomado ventas"}
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: 14,
              color: "text.secondary",
              lineHeight: 1.6,
            }}
          >
            {isAvailableMode
              ? "Cuando un mesero envíe una cuenta a caja y siga pendiente, aparecerá aquí."
              : "Las ventas que tomes desde la cola se moverán a esta sección para continuar con su cobro."}
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              p: 2,
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "repeat(1, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(2, minmax(0, 1fr))",
              },
              alignItems: "stretch",
            }}
          >
            {sales.map((sale) => {
              const saleId = Number(sale?.sale_id || 0);
              const packageKey =
                sale?.package_key || `sale:${saleId}`;

              return (
                <CashierSaleCard
                  key={packageKey}
                  sale={sale}
                  mode={mode}
                  taking={
                    Number(actionBusyId || 0) === saleId
                  }
                  disabled={actionsDisabled}
                  onTake={onTake}
                  onOpenDetail={onOpenDetail}
                  onOpenCheck={onOpenCheck}
                  onReopenCheck={onReopenCheck}
                  onSplit={onSplit}
                  onMerge={onMerge}
                  onRelease={onRelease}
                />
              );
            })}
          </Box>

          <PaginationFooter
            page={page}
            totalPages={totalPages}
            startItem={startItem}
            endItem={endItem}
            total={total}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={onPrev}
            onNext={onNext}
            itemLabel="ventas"
          />
        </>
      )}
    </Paper>
  );
}