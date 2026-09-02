import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";
import { useStaffAuth } from "../../../../context/StaffAuthContext";

import CashierOnlineOrderPaymentHeroCard from "../../../../components/staff/casher/onlineOrders/paymentPage/CashierOnlineOrderPaymentHeroCard";
import CashierOrderItemsCard from "../../../../components/staff/casher/saleDetailPage/CashierOrderItemsCard";
import CashierSaleSummaryCard from "../../../../components/staff/casher/saleDetailPage/CashierSaleSummaryCard";
import CashierTaxSelectorCard from "../../../../components/staff/casher/saleDetailPage/CashierTaxSelectorCard";
import CashierPaymentFormCard from "../../../../components/staff/casher/saleDetailPage/CashierPaymentFormCard";
import CashierDiscountCard from "../../../../components/staff/casher/saleDetailPage/CashierDiscountCard";
import CashierSaleOptionalActionsBar from "../../../../components/staff/casher/saleDetailPage/CashierSaleOptionalActionsBar";
import CashierPaymentTabs from "../../../../components/staff/casher/saleDetailPage/CashierPaymentTabs";
import CashierSaleToolDialog from "../../../../components/staff/casher/saleDetailPage/CashierSaleToolDialog";
import CashierDiscountAuthorizationDialog from "../../../../components/staff/casher/saleDetailPage/CashierDiscountAuthorizationDialog";
import CashierPostPaymentTicketModal from "../../../../components/staff/casher/ticket/CashierPostPaymentTicketModal";

import {
  buildOnlineOrderCustomerSummary,
  filterOnlinePaymentMethods,
  flattenItemsTree,
  paymentTotalForSale,
  toArray,
} from "./payment/cashierOnlineOrderPayment.utils";

import useCashierOnlineOrderPaymentLoad from "./payment/useCashierOnlineOrderPaymentLoad";
import useCashierOnlineOrderPaymentFlow from "./payment/useCashierOnlineOrderPaymentFlow";
import useCashierOnlineOrderDiscounts from "./payment/useCashierOnlineOrderDiscounts";
import useCashierOnlineOrderTicket from "./payment/useCashierOnlineOrderTicket";

export default function CashierOnlineOrderPaymentPage() {
  const nav = useNavigate();
  const { onlineOrderId } = useParams();
  const { clearStaff } = useStaffAuth() || {};

  const [activeTool, setActiveTool] = useState(null);
  const [paymentTab, setPaymentTab] = useState("payment");

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "info",
    title: "",
    message: "",
  });

  const showAlert = ({ severity = "info", title, message }) => {
    if (!message) return;

    const resolvedTitle =
      title ||
      (severity === "success"
        ? "Listo"
        : severity === "warning"
        ? "Aviso"
        : severity === "error"
        ? "Error"
        : "Información");

    setAlertState({
      open: true,
      severity,
      title: resolvedTitle,
      message,
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((previous) => ({ ...previous, open: false }));
  };

  const page = useCashierOnlineOrderPaymentLoad({
    onlineOrderId,
    nav,
    clearStaff,
    showAlert,
  });

  const {
    loading,
    onlineOrder,
    selectedCheck,
    sale,
    setSale,
    cashSession,
    itemsTree,
    paymentMethods,
    taxOptions,
    taxOptionCode,
    setTaxOptionCode,
    tip,
    setTip,
    payments,
    setPayments,
    preview,
    setPreview,
    selectedSaleId,
    selectedCheckId,
    paymentInProgressRef,
    paymentCompletedRef,
    goToMyOrders,
    stopLiveRefresh,
    syncSinglePaymentAmount,
    refreshOnlineOrderSnapshot,
  } = page;

  const ticket = useCashierOnlineOrderTicket({
    selectedSaleId,
    showAlert,
  });

  const {
    settlement,
    postPaymentOpen,
    postPaymentTicket,
    postPaymentTicketWarning,
    postPaymentTicketErrorCode,
    postPaymentTicketErrorMessage,
    postPaymentPrintConfig,
    postPaymentSale,
    postPaymentOrder,
    ticketBusy,
    voucherReprintAvailable,
    handleViewTicket,
    handlePrintTicket,
    handleThermalPrintTicket,
    handleReprintNetpayVoucher,
    handleDownloadTicket,
    handleSendTicketWhatsapp,
    openNormalPaymentResult,
    openNetpayPaymentResult,
    closePostPayment,
  } = ticket;

  const actions = useMemo(() => toArray(onlineOrder?.actions), [onlineOrder]);
  const canPreparePayment = actions.includes("prepare_payment");
  const canPay = actions.includes("pay");
  const paymentAvailable = canPreparePayment || canPay;

  const paymentFlow = useCashierOnlineOrderPaymentFlow({
    onlineOrder,
    selectedCheck,
    selectedSaleId,
    selectedCheckId,
    sale,
    setSale,
    paymentMethods,
    taxOptionCode,
    tip,
    setTip,
    payments,
    setPayments,
    preview,
    setPreview,
    paymentAvailable,
    refreshOnlineOrderSnapshot,
    syncSinglePaymentAmount,
    paymentInProgressRef,
    paymentCompletedRef,
    stopLiveRefresh,
    setActiveTool,
    showAlert,
    openNormalPaymentResult,
    openNetpayPaymentResult,
  });

  const {
    paymentType,
    isNetpayPayment,
    netpayBridgeAvailable,
    netpayTerminal,
    previewing,
    paying,
    netpayPending,
    netpayStatus,
    netpayLocked,
    financialLocked,
    handleTipChange,
    handleNetpayModeChange,
    handlePaymentChange,
    handlePreview,
    handlePay,
  } = paymentFlow;

  const discounts = useCashierOnlineOrderDiscounts({
    selectedSaleId,
    sale,
    setSale,
    tip,
    setPayments,
    setPreview,
    refreshOnlineOrderSnapshot,
    baseCanManageDiscounts: actions.includes("discount"),
    financialLocked,
    postPaymentOpen,
    setActiveTool,
    showAlert,
  });

  const {
    canManageDiscounts,
    discountSummary,
    discountBusy,
    globalDiscountForm,
    itemDiscountDrafts,

    discountAuthorizationOpen,
    discountAuthorizationPolicy,
    discountAuthorizationMessage,
    discountAuthorizers,
    discountAuthorizationForm,
    loadingDiscountAuthorizers,
    authorizingDiscount,
    discountAuthorizationError,

    handleGlobalFormChange,
    handleAddItemDiscountDraft,
    handleRemoveItemDiscountDraft,
    handleItemDiscountDraftChange,
    handleOpenDiscounts,
    handleApplyGlobalDiscount,
    handleRemoveGlobalDiscount,
    handleApplyItemDraft,
    handleRemoveItemDiscount,

    handleDiscountAuthorizationFormChange,
    handleCloseDiscountAuthorization,
    handleSubmitDiscountAuthorization,
  } = discounts;

  const onlinePaymentMethods = useMemo(
    () => filterOnlinePaymentMethods(onlineOrder, paymentMethods),
    [onlineOrder, paymentMethods]
  );

  const paymentMethodLocked =
    (["cash", "transfer"].includes(paymentType) && onlinePaymentMethods.length === 1) ||
    netpayLocked;

  const itemsFlat = useMemo(() => flattenItemsTree(itemsTree), [itemsTree]);

  const selectedTaxOption = useMemo(() => {
    return taxOptions.find(
      (row) => String(row?.code) === String(taxOptionCode)
    ) || null;
  }, [taxOptions, taxOptionCode]);

  const paymentInitialAmount = useMemo(
    () => paymentTotalForSale(sale, tip),
    [sale, tip]
  );

  const customerSummary = useMemo(
    () => buildOnlineOrderCustomerSummary(onlineOrder),
    [onlineOrder]
  );

  useEffect(() => {
    if (activeTool === "discounts" && !canManageDiscounts) setActiveTool(null);
  }, [activeTool, canManageDiscounts]);

  const handleReturnToMyOrders = () => {
    paymentCompletedRef.current = true;
    closePostPayment();
    goToMyOrders({ replace: true });
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando información del cobro…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  if (!onlineOrder || !sale || !selectedCheck) {
    return (
      <PageContainer>
        <Box sx={{ minHeight: "58vh", display: "grid", placeItems: "center" }}>
          <Stack
            spacing={2}
            alignItems="center"
            sx={{ width: "100%", maxWidth: 520, textAlign: "center" }}
          >
            <Typography sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 800 }}>
              Cobro no disponible
            </Typography>

            <Typography sx={{ fontSize: 14, color: "text.secondary", lineHeight: 1.6 }}>
              Este pedido ya no está disponible para registrar el cobro desde esta pantalla.
            </Typography>

            <Button
              variant="contained"
              onClick={() => goToMyOrders({ replace: true })}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Volver a Mis pedidos
            </Button>
          </Stack>
        </Box>

        <AppAlert
          open={alertState.open}
          onClose={closeAlert}
          severity={alertState.severity}
          title={alertState.title}
          message={alertState.message}
          autoHideDuration={3000}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth={1300}>
      <Stack spacing={3}>
        <CashierOnlineOrderPaymentHeroCard
          order={onlineOrder}
          sale={sale}
          check={selectedCheck}
          cashSession={cashSession}
          paymentMethodsCount={onlinePaymentMethods.length}
          onBack={() => goToMyOrders()}
        />

        <Box sx={{ display: { xs: "block", md: "none" } }}>
          <CashierPaymentTabs value={paymentTab} onChange={setPaymentTab} />
        </Box>

        <Box
          sx={{
            display: {
              xs: paymentTab === "tools" ? "block" : "none",
              md: "block",
            },
          }}
        >
          <CashierSaleOptionalActionsBar
            discountSummary={discountSummary || { sale }}
            disabled={financialLocked || postPaymentOpen}
            adjustmentsDisabled
            customerDisabled
            discountsDisabled={!actions.includes("discount") || discountBusy || financialLocked}
            showAdjustments={false}
            showCustomer={false}
            showDiscounts
            onOpenDiscounts={handleOpenDiscounts}
          />
        </Box>

        <Box
          sx={{
            display: {
              xs: paymentTab === "payment" ? "block" : "none",
              md: "block",
            },
          }}
        >
          <Stack spacing={3}>
            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  xl: "1.15fr 0.85fr",
                },
                alignItems: "stretch",
              }}
            >
              <Box sx={{ minWidth: 0, height: "100%" }}>
                <CashierOrderItemsCard
                  itemsTree={itemsTree}
                  itemsSummary={onlineOrder?.products_summary || null}
                  selectedCheck={selectedCheck}
                />
              </Box>

              <Stack spacing={3} sx={{ minWidth: 0, height: "100%" }}>
                <CashierSaleSummaryCard
                  sale={sale}
                  check={selectedCheck}
                  liveTip={Number(tip || 0)}
                  preview={preview}
                  previewMode={isNetpayPayment ? "netpay" : "normal"}
                  selectedTaxOption={selectedTaxOption}
                />

                <CashierTaxSelectorCard
                  taxOptions={taxOptions}
                  value={taxOptionCode}
                  onChange={(nextValue) => {
                    if (financialLocked) return;

                    setTaxOptionCode(nextValue);
                    setPreview(null);
                  }}
                  disabled={!paymentAvailable || financialLocked || postPaymentOpen}
                />
              </Stack>
            </Box>

            <CashierPaymentFormCard
              methods={onlinePaymentMethods}
              initialAmount={paymentInitialAmount}
              preview={preview}
              previewMode={isNetpayPayment ? "netpay" : "normal"}
              tip={tip}
              onTipChange={handleTipChange}
              payments={payments}
              onPaymentChange={handlePaymentChange}
              onPreview={handlePreview}
              previewing={previewing}
              paying={paying}
              hasPreview={Boolean(preview)}
              onPay={handlePay}
              disabled={!paymentAvailable || postPaymentOpen || netpayPending}
              maxPayments={1}
              showAddPayment={false}
              showRemovePayment={false}
              paymentMethodLocked={paymentMethodLocked}
              netpayAvailable={paymentType === "terminal" && netpayBridgeAvailable}
              netpayMode={isNetpayPayment}
              onNetpayModeChange={
                paymentType === "terminal"
                  ? handleNetpayModeChange
                  : undefined
              }
              netpayBusy={isNetpayPayment && (previewing || paying)}
              netpayStatus={netpayStatus?.status || ""}
              netpayTerminal={netpayTerminal}
              netpayRecoveryRequired={netpayPending}
              amountLocked={isNetpayPayment}
              hideManualCardFields={isNetpayPayment}
              description="Registra el método de pago correspondiente a este Pedido en línea."
              helperText={
                isNetpayPayment
                  ? netpayPending
                    ? "Existe una operación NetPay pendiente. Debe resolverse antes de iniciar otro cobro."
                    : "Este Pedido en línea se procesará en la terminal PAX. La referencia y los últimos 4 serán obtenidos directamente de NetPay."
                  : paymentType === "terminal"
                  ? "Este Pedido en línea se pagará con tarjeta. Puedes registrar el cobro con una terminal externa o activar NetPay para procesarlo en la terminal PAX."
                  : "Este Pedido en línea permite un solo método de pago y fue definido al realizar el pedido."
              }
            />
          </Stack>
        </Box>
      </Stack>

      <CashierSaleToolDialog
        open={activeTool === "discounts" && canManageDiscounts}
        onClose={() => setActiveTool(null)}
        title="Descuentos"
        subtitle="Aplica descuentos sobre los productos del pedido antes de preparar definitivamente el cobro."
        icon={<LocalOfferRoundedIcon />}
        maxWidth="lg"
      >
        <CashierDiscountCard
          sale={sale}
          orderCheckId={selectedCheckId}
          itemsFlat={itemsFlat}
          summary={discountSummary}
          globalForm={globalDiscountForm}
          onGlobalFormChange={handleGlobalFormChange}
          itemDiscountDrafts={itemDiscountDrafts}
          onAddItemDiscountDraft={handleAddItemDiscountDraft}
          onRemoveItemDiscountDraft={handleRemoveItemDiscountDraft}
          onItemDiscountDraftChange={handleItemDiscountDraftChange}
          onApplyGlobal={handleApplyGlobalDiscount}
          onRemoveGlobal={handleRemoveGlobalDiscount}
          onApplyItemDraft={handleApplyItemDraft}
          onRemoveItem={handleRemoveItemDiscount}
          busy={discountBusy}
          disabled={!canManageDiscounts || financialLocked || postPaymentOpen}
        />
      </CashierSaleToolDialog>

      <CashierDiscountAuthorizationDialog
        open={discountAuthorizationOpen}
        onClose={handleCloseDiscountAuthorization}
        onSubmit={handleSubmitDiscountAuthorization}
        authorizers={discountAuthorizers}
        form={discountAuthorizationForm}
        onFormChange={handleDiscountAuthorizationFormChange}
        loading={loadingDiscountAuthorizers}
        busy={authorizingDiscount}
        error={discountAuthorizationError}
        message={discountAuthorizationMessage}
        policy={discountAuthorizationPolicy}
      />

      <CashierPostPaymentTicketModal
        open={postPaymentOpen}
        onContinue={handleReturnToMyOrders}
        onViewTicket={handleViewTicket}
        onPrintTicket={handlePrintTicket}
        onThermalPrintTicket={handleThermalPrintTicket}
        onReprintNetpayVoucher={handleReprintNetpayVoucher}
        onDownloadTicket={handleDownloadTicket}
        onSendWhatsapp={handleSendTicketWhatsapp}
        showWhatsapp={false}
        busyView={ticketBusy.view}
        busyPrint={ticketBusy.print}
        busyThermalPrint={ticketBusy.thermalPrint}
        busyVoucherReprint={ticketBusy.voucherReprint}
        busyDownload={ticketBusy.download}
        busyWhatsapp={ticketBusy.whatsapp}
        voucherReprintAvailable={voucherReprintAvailable}
        printConfig={postPaymentPrintConfig}
        customerSummary={customerSummary}
        ticket={postPaymentTicket}
        sale={postPaymentSale || sale}
        order={postPaymentOrder}
        table={null}
        settlement={settlement}
        ticketWarning={postPaymentTicketWarning}
        ticketErrorCode={postPaymentTicketErrorCode}
        ticketErrorMessage={postPaymentTicketErrorMessage}
      />

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={3000}
      />
    </PageContainer>
  );
}