import {
  useCallback, useMemo,
} from "react";
import {
  useLocation, useNavigate, useParams,
} from "react-router-dom";

import PromotionFormPage from "../../../components/menu/promotions/form/PromotionFormPage";

import {
  createPromotion,
} from "../../../services/menu/promotions/promotionForm.service";

export default function PromotionCreatePage() {
  const { restaurantId } =
    useParams();

  const location = useLocation();
  const navigate = useNavigate();

  const initialBranchId =
    location.state?.branchId || "";

  const initialType =
    location.state?.promotionType ||
    "promotional_price";

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
          await createPromotion(
            restaurantId,
            branchId,
            payload
          );

        const createdPromotion =
          result?.promotion || {
            ...payload,
            id: `nuevo-${Date.now()}`,
          };

        const nextCachedPromotions =
          [
            createdPromotion,
            ...cachedPromotions.filter(
              (promotion) =>
                String(
                  promotion?.id
                ) !==
                String(
                  createdPromotion.id
                )
            ),
          ];

        navigateToList({
          branchId,
          promotionType:
            createdPromotion?.type ||
            form.type,
          cachedPromotions:
            nextCachedPromotions,
          createdPromotion,
          successMessage:
            result?.response
              ?.message ||
            "Promoción creada correctamente.",
        });
      },
      [
        cachedPromotions,
        navigateToList,
        restaurantId,
      ]
    );

  return (
    <PromotionFormPage
      restaurantId={restaurantId}
      mode="create"
      initialBranchId={
        initialBranchId
      }
      initialType={initialType}
      onSubmit={handleSubmit}
      onBack={() =>
        navigateToList()
      }
      onCancel={() =>
        navigateToList()
      }
    />
  );
}