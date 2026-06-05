import {
  Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography,
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
    >
      <DialogTitle>
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
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>


      <DialogContent>

        {open && paypalClientId ? (

          <PayPalScriptProvider
            options={initialOptions}
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