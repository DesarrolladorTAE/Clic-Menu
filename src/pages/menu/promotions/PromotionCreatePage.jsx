import {
  Box,
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
import AppAlert from "../../../components/common/AppAlert";

import PromotionFormHeader from "../../../components/menu/promotions/form/PromotionFormHeader";
import PromotionFormStepper from "../../../components/menu/promotions/form/PromotionFormStepper";
import PromotionInformationStep from "../../../components/menu/promotions/form/PromotionInformationStep";
import PromotionChannelsSchedulesStep from "../../../components/menu/promotions/form/PromotionChannelsSchedulesStep";
import PromotionProductsStep from "../../../components/menu/promotions/form/PromotionProductsStep";
import PromotionConfigurationStep from "../../../components/menu/promotions/form/PromotionConfigurationStep";
import PromotionReviewStep from "../../../components/menu/promotions/form/PromotionReviewStep";
import PromotionFormActions from "../../../components/menu/promotions/form/PromotionFormActions";

import {
  PROMOTION_FORM_STEPS,
  buildPromotionCreatePayload,
  buildPromotionTargetKey,
  createInitialPromotionForm,
  extractPromotionApiError,
  validateCompletePromotionForm,
  validatePromotionStep,
} from "../../../components/menu/promotions/form/promotionForm.helpers";

import {
  createPromotion,
  getPromotionEligibleProducts,
  getPromotionFormBranches,
  getPromotionFormChannels,
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
    Array.isArray(
      location.state?.cachedPromotions
    )
      ? location.state
          .cachedPromotions
      : [];

  const [form, setForm] = useState(
    () =>
      createInitialPromotionForm({
        branchId: initialBranchId,
        type: initialType,
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

  const selectedBranch =
    useMemo(() => {
      return (
        branches.find(
          (branch) =>
            Number(branch.id) ===
            Number(form.branch_id)
        ) || null
      );
    }, [
      branches,
      form.branch_id,
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
    if (reason === "clickaway") {
      return;
    }

    setAlertState((previous) => ({
      ...previous,
      open: false,
    }));
  };

  const navigateToList = (
    state = {}
  ) => {
    navigate(
      `/owner/restaurants/${restaurantId}/operation/promotions`,
      {
        state: {
          restaurantName,
          branchId:
            form.branch_id,
          promotionType:
            form.type,
          cachedPromotions,
          ...state,
        },
      }
    );
  };

  useEffect(() => {
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

          const preferredBranch =
            result.find(
              (branch) =>
                Number(
                  branch.id
                ) ===
                Number(
                  initialBranchId
                )
            ) || result[0];

          setForm((previous) => ({
            ...previous,
            branch_id:
              preferredBranch?.id
                ? String(
                    preferredBranch.id
                  )
                : "",
          }));
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
    restaurantId,
    initialBranchId,
  ]);

  useEffect(() => {
    if (!form.branch_id) {
      setChannels([]);
      setProducts([]);
      return undefined;
    }

    let active = true;

    const loadBranchData =
      async () => {
        setLoadingBranchData(true);
        setProducts([]);

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
            usableChannels
          );

          setForm((previous) => {
            const validIds =
              new Set(
                usableChannels.map(
                  (channel) =>
                    String(
                      channel.branch_sales_channel_id
                    )
                )
              );

            const nextChannelIds =
              previous.channel_ids.filter(
                (channelId) =>
                  validIds.has(
                    String(
                      channelId
                    )
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
        } catch (error) {
          if (!active) {
            return;
          }

          setChannels([]);
          setProducts([]);

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
    restaurantId,
    form.branch_id,
  ]);

  useEffect(() => {
    if (
      !form.branch_id ||
      !selectedChannelKey
    ) {
      setProducts([]);
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

          const eligibleTargetKeys =
            new Set(
              (
                Array.isArray(
                  catalog?.eligible_target_keys
                )
                  ? catalog.eligible_target_keys
                  : []
              ).map(String)
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

          setForm((previous) => ({
            ...previous,
            targets:
              previous.targets
                .filter((target) =>
                  eligibleTargetKeys.has(
                    String(
                      target.target_key
                    )
                  )
                )
                .map((target) => {
                  const nextPrices =
                    Object.fromEntries(
                      Object.entries(
                        target.channel_prices ||
                          {}
                      ).filter(
                        ([channelId]) =>
                          selectedChannelSet.has(
                            String(
                              channelId
                            )
                          )
                      )
                    );

                  return {
                    ...target,
                    channel_prices:
                      nextPrices,
                  };
                }),
          }));
        } catch (error) {
          if (!active) {
            return;
          }

          setProducts([]);

          showAlert({
            severity: "error",
            title: "Error",
            message:
              extractPromotionApiError(
                error,
                "No se pudieron cargar los productos y variantes vendibles."
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
    restaurantId,
    form.branch_id,
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
              variant.name,
            channel_prices: {},
          },
        ],
      };
    });
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

    setSaving(true);

    try {
      const payload =
        buildPromotionCreatePayload(
          form,
          statusOverride
        );

      const result =
        await createPromotion(
          restaurantId,
          form.branch_id,
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
                promotion.id
              ) !==
              String(
                createdPromotion.id
              )
          ),
        ];

      navigateToList({
        branchId:
          form.branch_id,
        promotionType:
          createdPromotion.type ||
          form.type,
        cachedPromotions:
          nextCachedPromotions,
        createdPromotion,
        successMessage:
          result?.response
            ?.message ||
          "Promoción creada correctamente.",
      });
    } catch (error) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          extractPromotionApiError(
            error,
            "No se pudo crear la promoción."
          ),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadingBranches) {
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
              Preparando el formulario
              de promoción…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  if (branches.length === 0) {
    return (
      <PageContainer>
        <Stack spacing={3}>
          <PromotionFormHeader
            onBack={() =>
              navigateToList()
            }
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
              Registra una sucursal
              antes de crear
              promociones.
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
          branchName={
            selectedBranch?.name
          }
          onBack={() =>
            navigateToList()
          }
        />

        <PromotionFormStepper
          activeStep={activeStep}
          onStepChange={
            setActiveStep
          }
        />

        {activeStep === 0 ? (
          <PromotionInformationStep
            form={form}
            branches={branches}
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
          onCancel={() =>
            navigateToList()
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