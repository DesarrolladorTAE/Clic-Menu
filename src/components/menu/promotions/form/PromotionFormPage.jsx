import {
  Alert, Box, Button, CircularProgress, Paper, Stack, Typography,
} from "@mui/material";
import {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";

import PageContainer from "../../../common/PageContainer";
import AppAlert from "../../../common/AppAlert";

import PromotionFormHeader from "./PromotionFormHeader";
import PromotionFormStepper from "./PromotionFormStepper";
import PromotionInformationStep from "./PromotionInformationStep";
import PromotionChannelsSchedulesStep from "./PromotionChannelsSchedulesStep";
import PromotionProductsStep from "./PromotionProductsStep";
import PromotionConfigurationStep from "./PromotionConfigurationStep";
import PromotionReviewStep from "./PromotionReviewStep";
import PromotionFormActions from "./PromotionFormActions";

import {
  PROMOTION_FORM_STEPS,
  buildPromotionCreatePayload,
  buildPromotionEditForm,
  buildPromotionTargetKey,
  createInitialPromotionForm,
  extractPromotionApiError,
  getPromotionTargetLabel,
  validateCompletePromotionForm,
  validatePromotionStep,
} from "./promotionForm.helpers";

import {
  getPromotionEligibleProducts,
  getPromotionFormBranches,
  getPromotionFormChannels,
} from "../../../../services/menu/promotions/promotionForm.service";

function createFormState({
  mode,
  initialPromotion,
  initialBranchId,
  initialType,
}) {
  if (
    mode === "edit" &&
    initialPromotion
  ) {
    return buildPromotionEditForm(
      initialPromotion,
      {
        branchId:
          initialBranchId ||
          initialPromotion?.branch_id ||
          initialPromotion?.branch?.id ||
          "",
      }
    );
  }

  return createInitialPromotionForm({
    branchId: initialBranchId,
    type: initialType,
  });
}

function getCatalogTargetKeys(
  catalog,
  products
) {
  const catalogKeys = Array.isArray(
    catalog?.eligible_target_keys
  )
    ? catalog.eligible_target_keys
        .map(String)
        .filter(Boolean)
    : [];

  if (catalogKeys.length > 0) {
    return Array.from(
      new Set(catalogKeys)
    );
  }

  const keys = [];

  products.forEach((product) => {
    const productId = Number(
      product?.id
    );

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return;
    }

    keys.push(
      String(
        product?.target_key ||
          buildPromotionTargetKey(
            productId
          )
      )
    );

    const variants = Array.isArray(
      product?.variants
    )
      ? product.variants
      : [];

    variants.forEach((variant) => {
      const variantId = Number(
        variant?.id
      );

      if (
        !Number.isInteger(variantId) ||
        variantId <= 0
      ) {
        return;
      }

      keys.push(
        String(
          variant?.target_key ||
            buildPromotionTargetKey(
              productId,
              variantId
            )
        )
      );
    });
  });

  return Array.from(new Set(keys));
}

function enrichTargetsFromCatalog(
  targets,
  products
) {
  return targets.map((target) => {
    const product = products.find(
      (item) =>
        Number(item?.id) ===
        Number(target?.product_id)
    );

    if (!product) {
      return target;
    }

    const productName =
      product?.display_name ||
      product?.name ||
      target?.product_name;

    if (
      !target?.product_variant_id
    ) {
      return {
        ...target,
        product_name: productName,
        variant_name: null,
      };
    }

    const variants = Array.isArray(
      product?.variants
    )
      ? product.variants
      : [];

    const variant = variants.find(
      (item) =>
        Number(item?.id) ===
        Number(
          target.product_variant_id
        )
    );

    return {
      ...target,
      product_name: productName,
      variant_name:
        variant?.display_name ||
        variant?.name ||
        target?.variant_name,
    };
  });
}

export default function PromotionFormPage({
  restaurantId,
  mode = "create",
  promotionId = null,
  initialPromotion = null,
  initialBranchId = "",
  initialType = "promotional_price",
  onSubmit,
  onBack,
  onCancel,
  title,
  description,
  backLabel = "Volver a promociones",
  saveLabel,
  savingLabel,
  saveInactiveLabel,
  showSaveInactive,
}) {
  const isEditing =
    mode === "edit";

  const waitingInitialPromotion =
    isEditing &&
    !initialPromotion;

  const initialPromotionKeyRef =
    useRef(null);

  const [form, setForm] = useState(
    () =>
      createFormState({
        mode,
        initialPromotion,
        initialBranchId,
        initialType,
      })
  );

  const [activeStep, setActiveStep] =
    useState(0);

  const [branches, setBranches] =
    useState([]);

  const [channels, setChannels] =
    useState([]);

  const [products, setProducts] =
    useState([]);

  const [
    eligibleTargetKeys,
    setEligibleTargetKeys,
  ] = useState([]);

  const [
    loadingBranches,
    setLoadingBranches,
  ] = useState(true);

  const [
    loadingBranchData,
    setLoadingBranchData,
  ] = useState(false);

  const [
    loadingProducts,
    setLoadingProducts,
  ] = useState(false);

  const [
    branchDataLoaded,
    setBranchDataLoaded,
  ] = useState(false);

  const [
    catalogStatus,
    setCatalogStatus,
  ] = useState("idle");

  const [saving, setSaving] =
    useState(false);

  const [
    alertState,
    setAlertState,
  ] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const resolvedTitle =
    title ||
    (isEditing
      ? "Editar promoción"
      : "Crear promoción");

  const resolvedDescription =
    description ||
    (isEditing
      ? "Modifica la promoción configurada para"
      : "Configura una nueva promoción para");

  const resolvedSaveLabel =
    saveLabel ||
    (isEditing
      ? "Guardar cambios"
      : "Crear promoción");

  const resolvedSavingLabel =
    savingLabel ||
    (isEditing
      ? "Guardando…"
      : "Creando…");

  const resolvedSaveInactiveLabel =
    saveInactiveLabel ||
    (isEditing
      ? "Guardar como inactiva"
      : "Guardar inactiva");

  const selectedBranch =
    useMemo(() => {
      const branchFromList =
        branches.find(
          (branch) =>
            Number(branch.id) ===
            Number(form.branch_id)
        );

      if (branchFromList) {
        return branchFromList;
      }

      if (
        isEditing &&
        initialPromotion?.branch
      ) {
        return {
          ...initialPromotion.branch,
          id:
            initialPromotion.branch.id ||
            form.branch_id,
          name:
            initialPromotion.branch.name ||
            initialPromotion.branch
              .branch_name ||
            `Sucursal ${form.branch_id}`,
        };
      }

      return null;
    }, [
      branches,
      form.branch_id,
      initialPromotion,
      isEditing,
    ]);

  const formBranches =
    useMemo(() => {
      if (!isEditing) {
        return branches;
      }

      return selectedBranch
        ? [selectedBranch]
        : branches;
    }, [
      branches,
      isEditing,
      selectedBranch,
    ]);

  const selectedChannelIds =
    useMemo(() => {
      return Array.from(
        new Set(
          (
            Array.isArray(
              form.channel_ids
            )
              ? form.channel_ids
              : []
          )
            .map((id) => Number(id))
            .filter(
              (id) =>
                Number.isInteger(id) &&
                id > 0
            )
        )
      );
    }, [form.channel_ids]);

  const selectedChannelKey =
    useMemo(() => {
      return [...selectedChannelIds]
        .sort((a, b) => a - b)
        .join(",");
    }, [selectedChannelIds]);

  const usableChannelIdSet =
    useMemo(() => {
      return new Set(
        channels
          .filter(
            (channel) =>
              channel?.is_usable !==
              false
          )
          .map((channel) =>
            String(
              channel
                .branch_sales_channel_id
            )
          )
      );
    }, [channels]);

  const invalidSelectedChannels =
    useMemo(() => {
      if (
        !isEditing ||
        !branchDataLoaded
      ) {
        return [];
      }

      return selectedChannelIds
        .filter(
          (channelId) =>
            !usableChannelIdSet.has(
              String(channelId)
            )
        )
        .map((channelId) => {
          const channel =
            channels.find(
              (item) =>
                Number(
                  item
                    ?.branch_sales_channel_id
                ) ===
                Number(channelId)
            );

          return {
            id: channelId,
            name:
              channel?.name ||
              `Canal ${channelId}`,
          };
        });
    }, [
      branchDataLoaded,
      channels,
      isEditing,
      selectedChannelIds,
      usableChannelIdSet,
    ]);

  const invalidChannelKey =
    useMemo(() => {
      return invalidSelectedChannels
        .map((channel) => channel.id)
        .sort((a, b) => a - b)
        .join(",");
    }, [invalidSelectedChannels]);

  const eligibleTargetKeySet =
    useMemo(() => {
      return new Set(
        eligibleTargetKeys.map(String)
      );
    }, [eligibleTargetKeys]);

  const invalidTargets =
    useMemo(() => {
      if (
        !isEditing ||
        catalogStatus !== "ready"
      ) {
        return [];
      }

      return form.targets.filter(
        (target) =>
          !eligibleTargetKeySet.has(
            String(target.target_key)
          )
      );
    }, [
      catalogStatus,
      eligibleTargetKeySet,
      form.targets,
      isEditing,
    ]);

  const shouldShowSaveInactive =
    typeof showSaveInactive ===
    "boolean"
      ? showSaveInactive
      : isEditing
        ? form.is_active
        : true;

  const showAlert = ({
    severity = "error",
    title: alertTitle = "Error",
    message = "",
  }) => {
    setAlertState({
      open: true,
      severity,
      title: alertTitle,
      message,
    });
  };

  const closeAlert = (
    _,
    reason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setAlertState((previous) => ({
      ...previous,
      open: false,
    }));
  };

  useEffect(() => {
    if (
      !isEditing ||
      !initialPromotion
    ) {
      return;
    }

    const promotionKey = String(
      promotionId ||
      initialPromotion?.id ||
      ""
    );

    if (
      initialPromotionKeyRef.current ===
      promotionKey
    ) {
      return;
    }

    initialPromotionKeyRef.current =
      promotionKey;

    setForm(
      createFormState({
        mode,
        initialPromotion,
        initialBranchId,
        initialType,
      })
    );

    setActiveStep(0);
  }, [
    initialBranchId,
    initialPromotion,
    initialType,
    isEditing,
    mode,
    promotionId,
  ]);

  useEffect(() => {
    if (waitingInitialPromotion) {
      return undefined;
    }

    let active = true;

    const loadBranches =
      async () => {
        setLoadingBranches(true);

        try {
          const result =
            await getPromotionFormBranches(
              restaurantId
            );

          if (!active) {
            return;
          }

          setBranches(result);

          setForm((previous) => {
            const requestedBranchId =
              isEditing
                ? previous.branch_id ||
                  initialBranchId
                : initialBranchId;

            const preferredBranch =
              result.find(
                (branch) =>
                  Number(branch.id) ===
                  Number(
                    requestedBranchId
                  )
              ) ||
              (!isEditing
                ? result[0]
                : null);

            if (
              isEditing &&
              !preferredBranch &&
              previous.branch_id
            ) {
              return previous;
            }

            return {
              ...previous,
              branch_id:
                preferredBranch?.id
                  ? String(
                      preferredBranch.id
                    )
                  : "",
            };
          });
        } catch (error) {
          if (!active) {
            return;
          }

          setBranches([]);

          showAlert({
            severity: "error",
            title: "Error",
            message:
              extractPromotionApiError(
                error,
                "No se pudieron cargar las sucursales."
              ),
          });
        } finally {
          if (active) {
            setLoadingBranches(
              false
            );
          }
        }
      };

    loadBranches();

    return () => {
      active = false;
    };
  }, [
    initialBranchId,
    isEditing,
    restaurantId,
    waitingInitialPromotion,
  ]);

  useEffect(() => {
    if (
      waitingInitialPromotion ||
      !form.branch_id
    ) {
      setChannels([]);
      setProducts([]);
      setBranchDataLoaded(false);

      return undefined;
    }

    let active = true;

    const loadBranchData =
      async () => {
        setLoadingBranchData(true);
        setBranchDataLoaded(false);
        setProducts([]);
        setEligibleTargetKeys([]);
        setCatalogStatus("idle");

        try {
          const channelsResult =
            await getPromotionFormChannels(
              restaurantId,
              form.branch_id
            );

          if (!active) {
            return;
          }

          const usableChannels =
            channelsResult.filter(
              (channel) =>
                channel.is_usable !==
                false
            );

          setChannels(
            isEditing
              ? channelsResult
              : usableChannels
          );

          setForm((previous) => {
            if (isEditing) {
              return previous;
            }

            const validIds =
              new Set(
                usableChannels.map(
                  (channel) =>
                    String(
                      channel
                        .branch_sales_channel_id
                    )
                )
              );

            const nextChannelIds =
              previous.channel_ids.filter(
                (channelId) =>
                  validIds.has(
                    String(channelId)
                  )
              );

            return {
              ...previous,
              channel_ids:
                nextChannelIds,
              targets:
                nextChannelIds
                  .length > 0
                  ? previous.targets
                  : [],
            };
          });

          setBranchDataLoaded(true);
        } catch (error) {
          if (!active) {
            return;
          }

          setChannels([]);
          setProducts([]);
          setBranchDataLoaded(false);

          showAlert({
            severity: "error",
            title: "Error",
            message:
              extractPromotionApiError(
                error,
                "No se pudieron cargar los canales de la sucursal."
              ),
          });
        } finally {
          if (active) {
            setLoadingBranchData(
              false
            );
          }
        }
      };

    loadBranchData();

    return () => {
      active = false;
    };
  }, [
    form.branch_id,
    isEditing,
    restaurantId,
    waitingInitialPromotion,
  ]);

  useEffect(() => {
    if (
      !form.branch_id ||
      !selectedChannelKey
    ) {
      setProducts([]);
      setEligibleTargetKeys([]);
      setCatalogStatus("idle");
      setLoadingProducts(false);

      setForm((previous) => {
        if (
          previous.targets.length ===
          0
        ) {
          return previous;
        }

        return {
          ...previous,
          targets: [],
        };
      });

      return undefined;
    }

    if (
      isEditing &&
      invalidSelectedChannels.length > 0
    ) {
      setProducts([]);
      setEligibleTargetKeys([]);
      setCatalogStatus("blocked");
      setLoadingProducts(false);

      return undefined;
    }

    let active = true;

    const requestedChannelIds =
      selectedChannelKey
        .split(",")
        .map((id) => Number(id))
        .filter(
          (id) =>
            Number.isInteger(id) &&
            id > 0
        );

    const loadEligibleProducts =
      async () => {
        setLoadingProducts(true);
        setProducts([]);
        setEligibleTargetKeys([]);
        setCatalogStatus("loading");

        try {
          const catalog =
            await getPromotionEligibleProducts(
              restaurantId,
              form.branch_id,
              requestedChannelIds
            );

          if (!active) {
            return;
          }

          const eligibleProducts =
            Array.isArray(
              catalog?.data
            )
              ? catalog.data
              : [];

          const targetKeys =
            getCatalogTargetKeys(
              catalog,
              eligibleProducts
            );

          const eligibleTargetSet =
            new Set(
              targetKeys.map(String)
            );

          const selectedChannelSet =
            new Set(
              requestedChannelIds.map(
                (id) => String(id)
              )
            );

          setProducts(
            eligibleProducts
          );

          setEligibleTargetKeys(
            targetKeys
          );

          setForm((previous) => {
            const nextTargets =
              previous.targets
                .filter((target) => {
                  if (isEditing) {
                    return true;
                  }

                  return eligibleTargetSet.has(
                    String(
                      target.target_key
                    )
                  );
                })
                .map((target) => {
                  const nextPrices =
                    Object.fromEntries(
                      Object.entries(
                        target.channel_prices ||
                          {}
                      ).filter(
                        ([channelId]) =>
                          selectedChannelSet.has(
                            String(channelId)
                          )
                      )
                    );

                  return {
                    ...target,
                    channel_prices:
                      nextPrices,
                  };
                });

            return {
              ...previous,
              targets:
                enrichTargetsFromCatalog(
                  nextTargets,
                  eligibleProducts
                ),
            };
          });

          setCatalogStatus("ready");
        } catch (error) {
          if (!active) {
            return;
          }

          setProducts([]);
          setEligibleTargetKeys([]);
          setCatalogStatus("error");

          showAlert({
            severity: "error",
            title: "Error",
            message:
              extractPromotionApiError(
                error,
                isEditing
                  ? "No se pudieron validar los productos y variantes de la promoción."
                  : "No se pudieron cargar los productos y variantes vendibles."
              ),
          });
        } finally {
          if (active) {
            setLoadingProducts(
              false
            );
          }
        }
      };

    loadEligibleProducts();

    return () => {
      active = false;
    };
  }, [
    form.branch_id,
    invalidChannelKey,
    invalidSelectedChannels.length,
    isEditing,
    restaurantId,
    selectedChannelKey,
  ]);

  const handleFieldChange = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleBranchChange = (
    branchId
  ) => {
    if (isEditing) {
      if (
        String(branchId) !==
        String(form.branch_id)
      ) {
        showAlert({
          severity: "info",
          title: "Sucursal fija",
          message:
            "La sucursal de una promoción existente no se puede cambiar.",
        });
      }

      return;
    }

    const hasSelections =
      form.channel_ids.length > 0 ||
      form.targets.length > 0;

    if (hasSelections) {
      const confirmed =
        window.confirm(
          "Al cambiar de sucursal se eliminarán los canales y productos seleccionados. ¿Deseas continuar?"
        );

      if (!confirmed) {
        return;
      }
    }

    setForm((previous) => ({
      ...previous,
      branch_id:
        String(branchId),
      channel_ids: [],
      targets: [],
    }));

    setChannels([]);
    setProducts([]);
    setEligibleTargetKeys([]);
    setCatalogStatus("idle");
    setActiveStep(0);
  };

  const handleTypeChange = (
    type
  ) => {
    setForm((previous) => ({
      ...previous,
      type,
    }));
  };

  const handleToggleChannel = (
    channel,
    checked
  ) => {
    const channelId = Number(
      channel.branch_sales_channel_id
    );

    if (
      checked &&
      channel?.is_usable === false
    ) {
      showAlert({
        severity: "warning",
        title: "Canal no disponible",
        message:
          "Este canal no está disponible para la sucursal o el plan actual.",
      });

      return;
    }

    setForm((previous) => {
      const currentIds =
        previous.channel_ids.map(
          Number
        );

      const nextIds = checked
        ? Array.from(
            new Set([
              ...currentIds,
              channelId,
            ])
          )
        : currentIds.filter(
            (id) =>
              id !== channelId
          );

      const nextTargets =
        previous.targets.map(
          (target) => {
            if (checked) {
              return target;
            }

            const prices = {
              ...(target.channel_prices ||
                {}),
            };

            delete prices[
              String(channelId)
            ];

            return {
              ...target,
              channel_prices:
                prices,
            };
          }
        );

      return {
        ...previous,
        channel_ids: nextIds,
        targets:
          nextIds.length > 0
            ? nextTargets
            : [],
      };
    });
  };

  const handleRemoveInvalidChannel = (
    channelId
  ) => {
    setForm((previous) => {
      const nextChannelIds =
        previous.channel_ids.filter(
          (id) =>
            Number(id) !==
            Number(channelId)
        );

      const nextTargets =
        previous.targets.map(
          (target) => {
            const prices = {
              ...(target.channel_prices ||
                {}),
            };

            delete prices[
              String(channelId)
            ];

            return {
              ...target,
              channel_prices:
                prices,
            };
          }
        );

      return {
        ...previous,
        channel_ids:
          nextChannelIds,
        targets:
          nextChannelIds.length > 0
            ? nextTargets
            : [],
      };
    });
  };

  const handleScheduleChange = (
    dayOfWeek,
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      schedules:
        previous.schedules.map(
          (schedule) =>
            Number(
              schedule.day_of_week
            ) ===
            Number(dayOfWeek)
              ? {
                  ...schedule,
                  [field]: value,
                }
              : schedule
        ),
    }));
  };

  const handleSetAllSchedules = (
    enabled
  ) => {
    setForm((previous) => ({
      ...previous,
      schedules:
        previous.schedules.map(
          (schedule) => ({
            ...schedule,
            enabled,
          })
        ),
    }));
  };

  const handleToggleProduct = (
    product,
    checked
  ) => {
    const targetKey =
      product?.target_key ||
      buildPromotionTargetKey(
        product.id
      );

    setForm((previous) => {
      if (!checked) {
        return {
          ...previous,
          targets:
            previous.targets.filter(
              (target) =>
                target.target_key !==
                targetKey
            ),
        };
      }

      const alreadySelected =
        previous.targets.some(
          (target) =>
            target.target_key ===
            targetKey
        );

      if (alreadySelected) {
        return previous;
      }

      return {
        ...previous,
        targets: [
          ...previous.targets,
          {
            target_key:
              targetKey,
            product_id: Number(
              product.id
            ),
            product_variant_id:
              null,
            product_name:
              product.display_name ||
              product.name,
            variant_name: null,
            channel_prices: {},
          },
        ],
      };
    });
  };

  const handleToggleVariant = (
    product,
    variant,
    checked
  ) => {
    const targetKey =
      variant?.target_key ||
      buildPromotionTargetKey(
        product.id,
        variant.id
      );

    setForm((previous) => {
      if (!checked) {
        return {
          ...previous,
          targets:
            previous.targets.filter(
              (target) =>
                target.target_key !==
                targetKey
            ),
        };
      }

      const alreadySelected =
        previous.targets.some(
          (target) =>
            target.target_key ===
            targetKey
        );

      if (alreadySelected) {
        return previous;
      }

      return {
        ...previous,
        targets: [
          ...previous.targets,
          {
            target_key:
              targetKey,
            product_id: Number(
              product.id
            ),
            product_variant_id:
              Number(
                variant.id
              ),
            product_name:
              product.display_name ||
              product.name,
            variant_name:
              variant.display_name ||
              variant.name,
            channel_prices: {},
          },
        ],
      };
    });
  };

  const handleRemoveInvalidTarget = (
    targetKey
  ) => {
    setForm((previous) => ({
      ...previous,
      targets:
        previous.targets.filter(
          (target) =>
            String(
              target.target_key
            ) !==
            String(targetKey)
        ),
    }));
  };

  const handleRuleChange = (
    section,
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [field]: value,
      },
    }));
  };

  const handleTargetPriceChange = (
    targetKey,
    channelId,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      targets:
        previous.targets.map(
          (target) =>
            target.target_key ===
            targetKey
              ? {
                  ...target,
                  channel_prices: {
                    ...(target.channel_prices ||
                      {}),
                    [String(
                      channelId
                    )]: value,
                  },
                }
              : target
        ),
    }));
  };

  const getBasePrice =
    useCallback(
      (target, channelId) => {
        const product =
          products.find(
            (item) =>
              Number(item.id) ===
              Number(
                target.product_id
              )
          );

        if (!product) {
          return null;
        }

        if (
          target.product_variant_id
        ) {
          const variants =
            Array.isArray(
              product.variants
            )
              ? product.variants
              : [];

          const variant =
            variants.find(
              (item) =>
                Number(item.id) ===
                Number(
                  target.product_variant_id
                )
            );

          const variantChannels =
            Array.isArray(
              variant?.channels
            )
              ? variant.channels
              : [];

          const variantChannel =
            variantChannels.find(
              (item) =>
                Number(
                  item.branch_sales_channel_id
                ) ===
                Number(channelId)
            );

          if (
            Number.isFinite(
              Number(
                variantChannel?.price
              )
            )
          ) {
            return Number(
              variantChannel.price
            );
          }

          if (
            Number.isFinite(
              Number(variant?.price)
            )
          ) {
            return Number(
              variant.price
            );
          }
        }

        const productChannels =
          Array.isArray(
            product.channels
          )
            ? product.channels
            : [];

        const productChannel =
          productChannels.find(
            (item) =>
              Number(
                item.branch_sales_channel_id
              ) ===
              Number(channelId)
          );

        if (
          Number.isFinite(
            Number(
              productChannel?.price
            )
          )
        ) {
          return Number(
            productChannel.price
          );
        }

        if (
          Number.isFinite(
            Number(
              product.base_price
            )
          )
        ) {
          return Number(
            product.base_price
          );
        }

        if (
          Number.isFinite(
            Number(product.price)
          )
        ) {
          return Number(
            product.price
          );
        }

        return null;
      },
      [products]
    );

  const validateEligibility =
    () => {
      if (!isEditing) {
        return null;
      }

      if (
        invalidSelectedChannels.length >
        0
      ) {
        return {
          step: 1,
          message:
            "La promoción contiene canales que ya no están disponibles. Retíralos antes de guardar.",
        };
      }

      if (
        selectedChannelIds.length > 0 &&
        catalogStatus === "error"
      ) {
        return {
          step: 2,
          message:
            "No fue posible validar los productos participantes. Inténtalo nuevamente antes de guardar.",
        };
      }

      if (
        selectedChannelIds.length > 0 &&
        ["idle", "loading"].includes(
          catalogStatus
        )
      ) {
        return {
          step: 2,
          message:
            "Espera a que termine la validación de los productos participantes.",
        };
      }

      if (
        invalidTargets.length > 0
      ) {
        return {
          step: 2,
          message:
            "La promoción contiene productos o variantes que ya no están disponibles. Retíralos antes de guardar.",
        };
      }

      return null;
    };

  const handleNext = () => {
    const error =
      validatePromotionStep(
        activeStep,
        form
      );

    if (error) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: error,
      });

      return;
    }

    const eligibilityError =
      validateEligibility();

    if (
      eligibilityError &&
      eligibilityError.step <=
        activeStep
    ) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message:
          eligibilityError.message,
      });

      return;
    }

    setActiveStep((current) =>
      Math.min(
        PROMOTION_FORM_STEPS.length -
          1,
        current + 1
      )
    );
  };

  const handlePrevious = () => {
    setActiveStep((current) =>
      Math.max(
        0,
        current - 1
      )
    );
  };

  const handleSave = async (
    statusOverride = null
  ) => {
    const validation =
      validateCompletePromotionForm(
        form
      );

    if (validation) {
      setActiveStep(
        validation.step
      );

      showAlert({
        severity: "warning",
        title: "Nota",
        message:
          validation.message,
      });

      return;
    }

    const eligibilityValidation =
      validateEligibility();

    if (eligibilityValidation) {
      setActiveStep(
        eligibilityValidation.step
      );

      showAlert({
        severity: "warning",
        title: "Nota",
        message:
          eligibilityValidation.message,
      });

      return;
    }

    if (
      typeof onSubmit !==
      "function"
    ) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          "No se configuró la acción para guardar la promoción.",
      });

      return;
    }

    setSaving(true);

    try {
      const payload =
        buildPromotionCreatePayload(
          form,
          statusOverride
        );

      await onSubmit(payload, {
        mode,
        form,
        branchId:
          form.branch_id,
        promotionId,
        statusOverride,
      });
    } catch (error) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          extractPromotionApiError(
            error,
            isEditing
              ? "No se pudo actualizar la promoción."
              : "No se pudo crear la promoción."
          ),
      });
    } finally {
      setSaving(false);
    }
  };

  if (
    waitingInitialPromotion ||
    loadingBranches
  ) {
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
              {isEditing
                ? "Cargando la promoción…"
                : "Preparando el formulario de promoción…"}
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  if (
    branches.length === 0
  ) {
    return (
      <PageContainer>
        <Stack spacing={3}>
          <PromotionFormHeader
            title={resolvedTitle}
            description={
              resolvedDescription
            }
            branchName={
              selectedBranch?.name
            }
            backLabel={backLabel}
            onBack={onBack}
          />

          <Paper
            sx={{
              p: 4,
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
              No hay sucursales
              disponibles
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: 14,
                color:
                  "text.secondary",
              }}
            >
              Registra una sucursal antes
              de administrar promociones.
            </Typography>
          </Paper>
        </Stack>

        <AppAlert
          open={alertState.open}
          onClose={closeAlert}
          severity={
            alertState.severity
          }
          title={alertState.title}
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
        <PromotionFormHeader
          title={resolvedTitle}
          description={
            resolvedDescription
          }
          branchName={
            selectedBranch?.name
          }
          backLabel={backLabel}
          onBack={onBack}
        />

        <PromotionFormStepper
          activeStep={activeStep}
          onStepChange={
            setActiveStep
          }
        />

        {invalidSelectedChannels.length >
        0 ? (
          <Alert
            severity="warning"
            variant="outlined"
            sx={{
              borderRadius: 2,
            }}
          >
            <Stack spacing={1.25}>
              <Box>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    color:
                      "text.primary",
                  }}
                >
                  Hay canales que ya no están disponibles
                </Typography>

                <Typography
                  sx={{
                    mt: 0.35,
                    fontSize: 13,
                    color:
                      "text.secondary",
                  }}
                >
                  Retíralos antes de guardar la promoción.
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
              >
                {invalidSelectedChannels.map(
                  (channel) => (
                    <Button
                      key={channel.id}
                      type="button"
                      size="small"
                      color="warning"
                      variant="outlined"
                      onClick={() =>
                        handleRemoveInvalidChannel(
                          channel.id
                        )
                      }
                    >
                      Quitar {channel.name}
                    </Button>
                  )
                )}
              </Stack>
            </Stack>
          </Alert>
        ) : null}

        {invalidTargets.length > 0 ? (
          <Alert
            severity="warning"
            variant="outlined"
            sx={{
              borderRadius: 2,
            }}
          >
            <Stack spacing={1.25}>
              <Box>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    color:
                      "text.primary",
                  }}
                >
                  Hay productos o variantes que ya no están disponibles
                </Typography>

                <Typography
                  sx={{
                    mt: 0.35,
                    fontSize: 13,
                    color:
                      "text.secondary",
                  }}
                >
                  Retíralos antes de guardar la promoción.
                </Typography>
              </Box>

              <Stack spacing={1}>
                {invalidTargets.map(
                  (target) => (
                    <Stack
                      key={
                        target.target_key
                      }
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      alignItems={{
                        xs: "stretch",
                        sm: "center",
                      }}
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 700,
                          color:
                            "text.primary",
                        }}
                      >
                        {getPromotionTargetLabel(
                          target
                        )}
                      </Typography>

                      <Button
                        type="button"
                        size="small"
                        color="warning"
                        variant="outlined"
                        onClick={() =>
                          handleRemoveInvalidTarget(
                            target.target_key
                          )
                        }
                      >
                        Quitar
                      </Button>
                    </Stack>
                  )
                )}
              </Stack>
            </Stack>
          </Alert>
        ) : null}

        {isEditing &&
        catalogStatus === "error" ? (
          <Alert
            severity="error"
            variant="outlined"
            sx={{
              borderRadius: 2,
            }}
          >
            No se pudieron validar los productos y variantes participantes. No podrás guardar hasta que la validación se complete correctamente.
          </Alert>
        ) : null}

        {activeStep === 0 ? (
          <PromotionInformationStep
            form={form}
            branches={formBranches}
            loading={
              loadingBranchData ||
              saving
            }
            onFieldChange={
              handleFieldChange
            }
            onBranchChange={
              handleBranchChange
            }
            onTypeChange={
              handleTypeChange
            }
          />
        ) : null}

        {activeStep === 1 ? (
          <PromotionChannelsSchedulesStep
            channels={channels}
            selectedChannelIds={
              selectedChannelIds
            }
            schedules={
              form.schedules
            }
            loading={
              loadingBranchData
            }
            onToggleChannel={
              handleToggleChannel
            }
            onScheduleChange={
              handleScheduleChange
            }
            onSetAllSchedules={
              handleSetAllSchedules
            }
          />
        ) : null}

        {activeStep === 2 ? (
          <PromotionProductsStep
            products={products}
            targets={form.targets}
            selectedChannelIds={
              selectedChannelIds
            }
            loading={
              loadingBranchData ||
              loadingProducts
            }
            onToggleProduct={
              handleToggleProduct
            }
            onToggleVariant={
              handleToggleVariant
            }
          />
        ) : null}

        {activeStep === 3 ? (
          <PromotionConfigurationStep
            form={form}
            channels={channels}
            getBasePrice={
              getBasePrice
            }
            onRuleChange={
              handleRuleChange
            }
            onTargetPriceChange={
              handleTargetPriceChange
            }
          />
        ) : null}

        {activeStep === 4 ? (
          <PromotionReviewStep
            form={form}
            branch={
              selectedBranch
            }
            channels={channels}
            isEditing={isEditing}
          />
        ) : null}

        <PromotionFormActions
          activeStep={activeStep}
          totalSteps={
            PROMOTION_FORM_STEPS.length
          }
          saving={saving}
          loading={
            loadingBranchData ||
            loadingProducts
          }
          onCancel={
            onCancel || onBack
          }
          onPrevious={
            handlePrevious
          }
          onNext={handleNext}
          onSaveInactive={() =>
            handleSave("inactive")
          }
          onSave={() =>
            handleSave(null)
          }
          saveInactiveLabel={
            resolvedSaveInactiveLabel
          }
          saveLabel={
            resolvedSaveLabel
          }
          savingLabel={
            resolvedSavingLabel
          }
          showSaveInactive={
            shouldShowSaveInactive
          }
        />
      </Stack>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={
          alertState.severity
        }
        title={alertState.title}
        message={
          alertState.message
        }
        autoHideDuration={3000}
      />
    </PageContainer>
  );
}