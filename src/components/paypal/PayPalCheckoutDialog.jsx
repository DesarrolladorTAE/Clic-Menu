import {
  Box, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";

import {
  createPayPalCheckout,
  capturePayPalOrder,
} from "../../services/paypal/paypal.service";


export default function PayPalCheckoutDialog({
  open,
  onClose,

  restaurantId,

  planId,
  months,

  paypalClientId,

  onSuccess,
  onError,
}) {


  const initialOptions = {
    clientId: paypalClientId,

    currency: "MXN",

    locale: "es_MX",

    intent: "capture",

    components: "buttons",
  };


  return (
    <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        PaperProps={{
            sx: {
            width: "100%",
            maxWidth: {
                xs: "calc(100% - 24px)",
                sm: 520,
                md: 560,
            },
            m: {
                xs: 1.5,
                sm: 2,
            },
            borderRadius: {
                xs: 2,
                sm: 2.5,
            },
            maxHeight: {
                xs: "calc(100dvh - 24px)",
                sm: "calc(100dvh - 48px)",
            },
            overflow: "hidden",
            },
        }}
    >
      <DialogTitle
        sx={{
            px: {
            xs: 2,
            sm: 3,
            },
            py: {
            xs: 1.5,
            sm: 2,
            },
            borderBottom: "1px solid",
            borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            Completar pago
          </Typography>

          <IconButton
            onClick={onClose}
            edge="end"
            sx={{
                flexShrink: 0,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>


      <DialogContent
        dividers={false}
        sx={{
            px: {
            xs: 2,
            sm: 3,
            },
            py: {
            xs: 2,
            sm: 3,
            },
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            maxHeight: {
            xs: "calc(100dvh - 96px)",
            sm: "calc(100dvh - 120px)",
            },
        }}
      >

        {open && paypalClientId ? (

          <PayPalScriptProvider
            options={initialOptions}
          >
            <Box
                sx={{
                width: "100%",
                minHeight: 120,
                overflowX: "hidden",
                "& iframe": {
                    maxWidth: "100%",
                },
                }}
            >
            
                <PayPalButtons
                    style={{
                        layout: "vertical",
                        shape: "rect",
                        label: "pay",
                    }}

                    createOrder={async () => {
                        const checkout =
                        await createPayPalCheckout(
                            restaurantId,
                            {
                            plan_id: planId,
                            months,
                            }
                        );

                        if (!checkout?.order_id) {
                        throw new Error(
                            "PayPal no regresó order id"
                        );
                        }

                        return checkout.order_id;
                    }}

                    onApprove={async (data) => {
                        try {
                            await capturePayPalOrder(
                                restaurantId,
                                data.orderID
                            );

                            onSuccess?.();

                        } catch (error) {
                            onError?.(
                                error
                            );
                        }
                    }}

                    onError={(error) => {
                        onError?.(
                        error
                        );
                    }}
                />
            </Box>

          </PayPalScriptProvider>

        ) : (
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: 14,
            }}
          >
            Preparando PayPal...
          </Typography>

        )}

      </DialogContent>

    </Dialog>
  );
}