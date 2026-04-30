// src/pages/public/public-menu-entry/PublicMenuModals.jsx
// Modales del flujo de envío, productos compuestos, extras y variantes.

import React from "react";

import CompositeProductModal from "../../../components/menu/shared/CompositeProductModal";
import ProductExtrasModal from "../../../components/menu/shared/ProductExtrasModal";
import ProductVariantsModal from "../../../components/menu/shared/ProductVariantsModal";
import PublicSendOrderModal from "../../../components/menu/public/PublicSendOrderModal";

export default function PublicMenuModals({
  cartOrder,
  allowBaseSend,
  pending,
  canAppend,
  themeColor,

  composite,
  compositeModalOpen,
  selectedCompositeProduct,
  onCloseComposite,
  onToggleCompositeIncluded,
  onCompositeVariantChange,
  onConfirmCompositeSelection,

  extrasModalOpen,
  selectedExtrasProduct,
  selectedExtrasVariantId,
  selectedExtrasCompositeDraft,
  selectedExtrasInitialValue,
  selectedExtrasReadOnly,
  selectedExtrasSelectionScope,
  onCloseExtras,
  onConfirmExtras,

  variantsModalOpen,
  selectedVariantsProduct,
  canSelect,
  showSelectBtn,
  onCloseVariants,
  onAddVariant,
}) {
  return (
    <>
      <PublicSendOrderModal
        open={cartOrder.sendOpen}
        sending={cartOrder.sending}
        allowBaseSend={allowBaseSend}
        pending={pending}
        canAppend={canAppend}
        customerName={cartOrder.customerName}
        setCustomerName={cartOrder.setCustomerName}
        partySize={cartOrder.partySize}
        setPartySize={cartOrder.setPartySize}
        adultCount={cartOrder.adultCount}
        setAdultCount={cartOrder.setAdultCount}
        childCount={cartOrder.childCount}
        setChildCount={cartOrder.setChildCount}
        cartCount={cartOrder.cart.length}
        cartTotal={cartOrder.cartTotal}
        sendToast={cartOrder.sendToast}
        onClose={() => cartOrder.setSendOpen(false)}
        onSubmit={cartOrder.submitOrderOrAppend}
      />

      <CompositeProductModal
        open={compositeModalOpen}
        product={selectedCompositeProduct}
        draft={
          selectedCompositeProduct
            ? composite.getOrInitCompositeDraft?.(selectedCompositeProduct) || []
            : []
        }
        onClose={onCloseComposite}
        onToggleIncluded={onToggleCompositeIncluded}
        onVariantChange={onCompositeVariantChange}
        onConfirm={onConfirmCompositeSelection}
        confirmLabel="Agregar compuesto"
      />

      <ProductExtrasModal
        open={extrasModalOpen}
        product={selectedExtrasProduct}
        variantId={selectedExtrasVariantId}
        compositeDraft={selectedExtrasCompositeDraft}
        initialValue={selectedExtrasInitialValue}
        readOnly={selectedExtrasReadOnly}
        themeColor={themeColor}
        onClose={onCloseExtras}
        onConfirm={onConfirmExtras}
        confirmLabel={selectedExtrasReadOnly ? "Listo" : "Guardar extras"}
        selectionScope={selectedExtrasSelectionScope}
      />

      <ProductVariantsModal
        open={variantsModalOpen}
        product={selectedVariantsProduct}
        canSelect={canSelect}
        showSelectBtn={showSelectBtn}
        themeColor={themeColor}
        onClose={onCloseVariants}
        onAddVariant={onAddVariant}
      />
    </>
  );
}