import {
  Box, Button, CircularProgress, Paper, Stack, Typography,
} from "@mui/material";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";

import MenuChannelsHeader from "../../../../components/menu/menus/menuChannels/MenuChannelsHeader";
import MenuChannelsInstructionsCard from "../../../../components/menu/menus/menuChannels/MenuChannelsInstructionsCard";
import MenuChannelsSummaryCards from "../../../../components/menu/menus/menuChannels/MenuChannelsSummaryCards";
import MenuChannelsList from "../../../../components/menu/menus/menuChannels/MenuChannelsList";
import MenuDefaultConfirmDialog from "../../../../components/menu/menus/menuChannels/MenuDefaultConfirmDialog";

import {
  buildMenuChannelsPayload,
  getBackendMessage,
  getMenuChannelsSummary,
  normalizeMenuChannels,
  updateChannelDefault,
  updateChannelEnabled,
} from "../../../../components/menu/menus/menuChannels/menuChannels.helpers";

import {
  getMenuChannels,
  syncMenuChannels,
} from "../../../../services/menu/menus/menuChannels/menuChannels.service";

export default function MenuChannelsPage() {
  const {
    restaurantId,
    menuId,
  } = useParams();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [searchParams] =
    useSearchParams();

  const restaurantName =
    location.state
      ?.restaurantName ||
    "RESTAURANTE";

  const branchId =
    searchParams.get(
      "branchId"
    ) ||
    location.state?.branchId ||
    "";

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [menu, setMenu] =
    useState(null);

  const [channels, setChannels] =
    useState([]);

  const [
    replacementChannel,
    setReplacementChannel,
  ] = useState(null);

  const [
    alertState,
    setAlertState,
  ] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const initialPayloadRef =
    useRef("");

  const showAlert = ({
    severity = "error",
    title = "Error",
    message = "",
  }) => {
    setAlertState({
      open: true,
      severity,
      title,
      message,
    });
  };

  const closeAlert = (
    _,
    reason
  ) => {
    if (
      reason === "clickaway"
    ) {
      return;
    }

    setAlertState(
      (current) => ({
        ...current,
        open: false,
      })
    );
  };

  useEffect(() => {
    if (
      !restaurantId ||
      !menuId ||
      !branchId
    ) {
      setLoading(false);
      return undefined;
    }

    let active = true;

    const loadChannels =
      async () => {
        setLoading(true);

        try {
          const result =
            await getMenuChannels(
              restaurantId,
              branchId,
              menuId
            );

          if (!active) return;

          const normalized =
            normalizeMenuChannels(
              result.data
            );

          setMenu(
            normalized.menu
          );

          setChannels(
            normalized.channels
          );

          initialPayloadRef.current =
            JSON.stringify(
              buildMenuChannelsPayload(
                normalized.channels
              )
            );
        } catch (error) {
          if (!active) return;

          setMenu(null);
          setChannels([]);

          showAlert({
            severity: "error",
            title: "Error",
            message:
              getBackendMessage(
                error,
                "No se pudieron cargar los canales del menú."
              ),
          });
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

    loadChannels();

    return () => {
      active = false;
    };
  }, [
    restaurantId,
    menuId,
    branchId,
  ]);

  const currentPayload =
    useMemo(
      () =>
        buildMenuChannelsPayload(
          channels
        ),
      [channels]
    );

  const hasChanges =
    useMemo(
      () =>
        JSON.stringify(
          currentPayload
        ) !==
        initialPayloadRef.current,
      [currentPayload]
    );

  const summary =
    useMemo(
      () =>
        getMenuChannelsSummary(
          channels
        ),
      [channels]
    );

  const readOnly =
    !!menu?.is_archived;

  const handleEnabledChange = (
    channel,
    checked
  ) => {
    if (
      readOnly ||
      saving
    ) {
      return;
    }

    const enabledCount =
      channels.filter(
        (row) =>
          !!row
            ?.menu_configuration
            ?.is_enabled
      ).length;

    if (
      !checked &&
      menu?.is_active &&
      enabledCount <= 1
    ) {
      showAlert({
        severity: "warning",
        title: "No disponible",
        message:
          "Un menú activo debe permanecer habilitado en al menos un canal de venta.",
      });

      return;
    }

    setChannels(
      (current) =>
        updateChannelEnabled(
          current,
          channel
            .branch_sales_channel_id,
          checked
        )
    );
  };

  const handleDefaultChange = (
    channel,
    checked
  ) => {
    if (
      readOnly ||
      saving
    ) {
      return;
    }

    if (!checked) {
      setChannels(
        (current) =>
          updateChannelDefault(
            current,
            channel
              .branch_sales_channel_id,
            false
          )
      );

      return;
    }

    const currentDefaultId =
      channel?.default_menu_id
        ? Number(
            channel.default_menu_id
          )
        : null;

    const currentMenuId =
      menu?.id
        ? Number(menu.id)
        : null;

    const replacesAnotherMenu =
      currentDefaultId &&
      currentMenuId &&
      currentDefaultId !==
        currentMenuId;

    if (replacesAnotherMenu) {
      setReplacementChannel(
        channel
      );

      return;
    }

    setChannels(
      (current) =>
        updateChannelDefault(
          current,
          channel
            .branch_sales_channel_id,
          true
        )
    );
  };

  const confirmDefaultReplacement =
    () => {
      if (!replacementChannel) {
        return;
      }

      setChannels(
        (current) =>
          updateChannelDefault(
            current,
            replacementChannel
              .branch_sales_channel_id,
            true
          )
      );

      setReplacementChannel(
        null
      );
    };

  const handleSave = async () => {
    if (
      saving ||
      readOnly ||
      !hasChanges
    ) {
      return;
    }

    setSaving(true);

    try {
      const result =
        await syncMenuChannels(
          restaurantId,
          branchId,
          menuId,
          currentPayload
        );

      const normalized =
        normalizeMenuChannels(
          result.data
        );

      setMenu(
        normalized.menu
      );

      setChannels(
        normalized.channels
      );

      initialPayloadRef.current =
        JSON.stringify(
          buildMenuChannelsPayload(
            normalized.channels
          )
        );

      showAlert({
        severity: "success",
        title: "Hecho",
        message:
          result.message ||
          "Canales del menú guardados correctamente.",
      });
    } catch (error) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          getBackendMessage(
            error,
            "No se pudieron guardar los canales del menú."
          ),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(
      `/owner/restaurants/${restaurantId}/operation/menus`,
      {
        state: {
          restaurantName,
          branchId,
        },
      }
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <Box
          sx={{
            minHeight: "60vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack
            spacing={2}
            alignItems="center"
          >
            <CircularProgress />

            <Typography
              sx={{
                fontSize: 14,
                color: "text.secondary",
              }}
            >
              Cargando canales del menú…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  if (!branchId) {
    return (
      <PageContainer>
        <Paper sx={errorContainerSx}>
          <Typography sx={errorTitleSx}>
            No se pudo identificar la sucursal
          </Typography>

          <Typography sx={errorTextSx}>
            Regresa a la lista de menús y vuelve a seleccionar la
            configuración de canales.
          </Typography>

          <Button
            type="button"
            variant="contained"
            onClick={handleBack}
            sx={{
              mt: 2.5,
              height: 44,
              fontWeight: 800,
            }}
          >
            Volver a menús
          </Button>
        </Paper>
      </PageContainer>
    );
  }

  if (!menu) {
    return (
      <PageContainer>
        <Paper sx={errorContainerSx}>
          <Typography sx={errorTitleSx}>
            No fue posible cargar el menú
          </Typography>

          <Typography sx={errorTextSx}>
            La información del menú o de la sucursal no está disponible.
          </Typography>

          <Button
            type="button"
            variant="contained"
            onClick={handleBack}
            sx={{
              mt: 2.5,
              height: 44,
              fontWeight: 800,
            }}
          >
            Volver a menús
          </Button>
        </Paper>

        <AppAlert
          open={
            alertState.open
          }
          onClose={closeAlert}
          severity={
            alertState.severity
          }
          title={
            alertState.title
          }
          message={
            alertState.message
          }
          autoHideDuration={3000}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <MenuChannelsHeader
          menu={menu}
          hasChanges={
            hasChanges
          }
          saving={saving}
          onBack={handleBack}
          onSave={handleSave}
        />

        <MenuChannelsInstructionsCard
          readOnly={readOnly}
        />

        <MenuChannelsSummaryCards
          summary={summary}
        />

        <MenuChannelsList
          menu={menu}
          channels={channels}
          saving={saving}
          onEnabledChange={
            handleEnabledChange
          }
          onDefaultChange={
            handleDefaultChange
          }
        />
      </Stack>

      <MenuDefaultConfirmDialog
        open={
          !!replacementChannel
        }
        menu={menu}
        channel={
          replacementChannel
        }
        onClose={() =>
          setReplacementChannel(
            null
          )
        }
        onConfirm={
          confirmDefaultReplacement
        }
      />

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={
          alertState.severity
        }
        title={
          alertState.title
        }
        message={
          alertState.message
        }
        autoHideDuration={3000}
      />
    </PageContainer>
  );
}

const errorContainerSx = {
  p: {
    xs: 2,
    sm: 3,
  },
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
  textAlign: "center",
};

const errorTitleSx = {
  fontSize: 20,
  fontWeight: 800,
  color: "text.primary",
};

const errorTextSx = {
  mt: 1,
  fontSize: 14,
  color: "text.secondary",
  lineHeight: 1.55,
};