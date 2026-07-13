import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import PromotionFormHeader from "../../../components/menu/promotions/form/PromotionFormHeader";
import PromotionFormPage from "../../../components/menu/promotions/form/PromotionFormPage";

import {
  extractPromotionApiError,
} from "../../../components/menu/promotions/form/promotionForm.helpers";

import {
  getPromotion,
  updatePromotion,
} from "../../../services/menu/promotions/promotion.service";

function getPromotionBranchId(
  promotion
) {
  return (
    promotion?.branch_id ??
    promotion?.branch?.id ??
    ""
  );
}

export default function PromotionEditPage() {
  const {
    restaurantId,
    promotionId,
  } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  const restaurantName =
    location.state?.restaurantName ||
    "RESTAURANTE";

  const cachedPromotions =
    useMemo(() => {
      return Array.isArray(
        location.state
          ?.cachedPromotions
      )
        ? location.state
            .cachedPromotions
        : [];
    }, [
      location.state
        ?.cachedPromotions,
    ]);

  const cachedPromotion =
    useMemo(() => {
      return (
        cachedPromotions.find(
          (promotion) =>
            String(
              promotion?.id
            ) ===
            String(promotionId)
        ) || null
      );
    }, [
      cachedPromotions,
      promotionId,
    ]);

  const queryBranchId =
    useMemo(() => {
      const params =
        new URLSearchParams(
          location.search
        );

      return (
        params.get("branchId") ||
        ""
      );
    }, [location.search]);

  const initialBranchId =
    String(
      location.state?.branchId ||
      queryBranchId ||
      getPromotionBranchId(
        cachedPromotion
      ) ||
      ""
    );

  const initialType =
    location.state?.promotionType ||
    cachedPromotion?.type ||
    "promotional_price";

  const [
    promotion,
    setPromotion,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const [reloadKey, setReloadKey] =
    useState(0);

  const navigateToList =
    useCallback(
      (state = {}) => {
        navigate(
          `/owner/restaurants/${restaurantId}/operation/promotions`,
          {
            state: {
              restaurantName,
              branchId:
                initialBranchId,
              promotionType:
                initialType,
              cachedPromotions,
              ...state,
            },
          }
        );
      },
      [
        cachedPromotions,
        initialBranchId,
        initialType,
        navigate,
        restaurantId,
        restaurantName,
      ]
    );

  useEffect(() => {
    let active = true;

    const loadPromotion =
      async () => {
        setLoading(true);
        setLoadError("");

        if (!initialBranchId) {
          setPromotion(null);
          setLoadError(
            "No se pudo identificar la sucursal de la promoción."
          );
          setLoading(false);
          return;
        }

        try {
          const result =
            await getPromotion(
              restaurantId,
              initialBranchId,
              promotionId
            );

          if (!active) {
            return;
          }

          if (!result?.id) {
            throw new Error(
              "La promoción solicitada no está disponible."
            );
          }

          setPromotion(result);
        } catch (error) {
          if (!active) {
            return;
          }

          setPromotion(null);
          setLoadError(
            extractPromotionApiError(
              error,
              "No se pudo cargar la promoción."
            )
          );
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

    loadPromotion();

    return () => {
      active = false;
    };
  }, [
    initialBranchId,
    promotionId,
    reloadKey,
    restaurantId,
  ]);

  const handleSubmit =
    useCallback(
      async (
        payload,
        {
          branchId,
          form,
        }
      ) => {
        const result =
          await updatePromotion(
            restaurantId,
            branchId,
            promotionId,
            payload
          );

        let updatedPromotion =
          result?.promotion || null;

        try {
          const refreshedPromotion =
            await getPromotion(
              restaurantId,
              branchId,
              promotionId
            );

          if (
            refreshedPromotion?.id
          ) {
            updatedPromotion =
              refreshedPromotion;
          }
        } catch {
          updatedPromotion =
            updatedPromotion || null;
        }

        updatedPromotion =
          updatedPromotion || {
            ...promotion,
            ...payload,
            id: promotionId,
            branch_id:
              Number(branchId),
          };

        const promotionExists =
          cachedPromotions.some(
            (item) =>
              String(item?.id) ===
              String(promotionId)
          );

        const nextCachedPromotions =
          promotionExists
            ? cachedPromotions.map(
                (item) =>
                  String(item?.id) ===
                  String(promotionId)
                    ? updatedPromotion
                    : item
              )
            : [
                updatedPromotion,
                ...cachedPromotions,
              ];

        navigateToList({
          branchId,
          promotionType:
            updatedPromotion?.type ||
            form.type,
          cachedPromotions:
            nextCachedPromotions,
          updatedPromotion,
          successMessage:
            result?.response
              ?.message ||
            "Promoción actualizada correctamente.",
        });
      },
      [
        cachedPromotions,
        navigateToList,
        promotion,
        promotionId,
        restaurantId,
      ]
    );

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
                color:
                  "text.secondary",
              }}
            >
              Cargando la promoción…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  if (
    loadError ||
    !promotion
  ) {
    return (
      <PageContainer>
        <Stack spacing={3}>
          <PromotionFormHeader
            title="Editar promoción"
            description="Administra la promoción de"
            onBack={() =>
              navigateToList()
            }
          />

          <Paper
            sx={{
              p: {
                xs: 3,
                sm: 4,
              },
              borderRadius: 1,
              backgroundColor:
                "background.paper",
              border: "1px solid",
              borderColor:
                "divider",
              boxShadow: "none",
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 800,
                color:
                  "text.primary",
              }}
            >
              No se pudo cargar la promoción
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: 14,
                color:
                  "text.secondary",
                lineHeight: 1.55,
              }}
            >
              {loadError ||
                "La promoción solicitada no está disponible."}
            </Typography>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              justifyContent="center"
              spacing={1.5}
              sx={{ mt: 2.5 }}
            >
              <Button
                type="button"
                variant="outlined"
                onClick={() =>
                  navigateToList()
                }
                sx={{
                  minWidth: 190,
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Volver a promociones
              </Button>

              {initialBranchId ? (
                <Button
                  type="button"
                  variant="contained"
                  onClick={() =>
                    setReloadKey(
                      (current) =>
                        current + 1
                    )
                  }
                  sx={{
                    minWidth: 190,
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  Reintentar
                </Button>
              ) : null}
            </Stack>
          </Paper>
        </Stack>
      </PageContainer>
    );
  }

  return (
    <PromotionFormPage
      key={promotion.id}
      restaurantId={restaurantId}
      mode="edit"
      promotionId={promotionId}
      initialPromotion={
        promotion
      }
      initialBranchId={
        initialBranchId
      }
      initialType={
        promotion?.type ||
        initialType
      }
      onSubmit={handleSubmit}
      onBack={() =>
        navigateToList()
      }
      onCancel={() =>
        navigateToList()
      }
      title="Editar promoción"
      description="Modifica la promoción configurada para"
      saveLabel="Guardar cambios"
      savingLabel="Guardando…"
      saveInactiveLabel="Guardar como inactiva"
    />
  );
}