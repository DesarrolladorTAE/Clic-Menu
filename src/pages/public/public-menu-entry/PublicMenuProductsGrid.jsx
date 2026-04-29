// Grid de productos del menú público con paginación y acciones de selección.

import React from "react";

import PaginationFooter from "../../../components/common/PaginationFooter";
import MenuProductCard from "../../../components/menu/shared/MenuProductCard";

export default function PublicMenuProductsGrid({
  filteredProducts,
  paginatedProducts,
  categoryNameById,
  canSelect,
  showSelectBtn,
  onAddSimple,
  onAddVariant,
  onOpenComposite,
  onOpenExtras,
  onOpenVariants,
  pagination,
}) {
  return (
    <div style={{ marginTop: 14 }}>
      <style>
        {`
          .menuGrid {
            display: grid;
            gap: 12px;
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
          @media (min-width: 640px) { .menuGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
          @media (min-width: 900px) { .menuGrid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
          @media (min-width: 1200px) { .menuGrid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        `}
      </style>

      <div className="menuGrid">
        {filteredProducts.length > 0 ? (
          paginatedProducts.map((p) => (
            <MenuProductCard
              key={p.id}
              product={p}
              categoryName={
                p.__categoryName ||
                categoryNameById.get(Number(p.category_id)) ||
                "Sin categoría"
              }
              canSelect={canSelect}
              showSelectBtn={showSelectBtn}
              onAddSimple={onAddSimple}
              onAddVariant={onAddVariant}
              onOpenComposite={onOpenComposite}
              onOpenExtras={onOpenExtras}
              onOpenVariants={onOpenVariants}
            />
          ))
        ) : (
          <div
            style={{
              border: "1px solid rgba(0,0,0,0.12)",
              background: "#fff",
              borderRadius: 16,
              padding: 14,
              gridColumn: "1 / -1",
            }}
          >
            <div style={{ fontWeight: 950 }}>Sin resultados</div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>
              Prueba con otro texto o limpia filtros.
            </div>
          </div>
        )}
      </div>

      {filteredProducts.length > 0 ? (
        <div style={{ marginTop: 14 }}>
          <PaginationFooter
            page={pagination.page}
            totalPages={pagination.totalPages}
            startItem={pagination.startItem}
            endItem={pagination.endItem}
            total={pagination.total}
            hasPrev={pagination.hasPrev}
            hasNext={pagination.hasNext}
            onPrev={pagination.prevPage}
            onNext={pagination.nextPage}
            itemLabel="productos"
          />
        </div>
      ) : null}
    </div>
  );
}