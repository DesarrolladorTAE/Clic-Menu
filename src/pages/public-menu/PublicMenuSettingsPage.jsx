import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import PageContainer from "../../components/common/PageContainer";
import AppAlert from "../../components/common/AppAlert";

import PublicMenuSettingsHeader from "../../components/public-menu/PublicMenuSettingsHeader";
import PublicMenuInstructionsCard from "../../components/public-menu/PublicMenuInstructionsCard";
import PublicMenuBranchSelectorCard from "../../components/public-menu/PublicMenuBranchSelectorCard";
import PublicMenuContextCard from "../../components/public-menu/PublicMenuContextCard";
import PublicMenuSettingsFormCard from "../../components/public-menu/PublicMenuSettingsFormCard";
import PublicMenuCoverCard from "../../components/public-menu/PublicMenuCoverCard";
import PublicMenuGalleryCard from "../../components/public-menu/PublicMenuGalleryCard";

import { getBranchesByRestaurant } from "../../services/restaurant/branch.service";
import {
  deleteBranchPublicMenuCover,
  deleteBranchPublicMenuGalleryImage,
  getBranchPublicMenuGallery,
  getBranchPublicMenuSetting,
  updateBranchPublicMenuGalleryImage,
  updateBranchPublicMenuSetting,
  uploadBranchPublicMenuCover,
  uploadBranchPublicMenuGalleryImage,
} from "../../services/public-menu/branchPublicMenu.service";

const DEFAULT_FORM = {
  theme_color: "#FF7A00",
  facebook_url: "",
  instagram_url: "",
  tiktok_url: "",
  is_active: true,
};

function normalizeSetting(setting) {
  return {
    theme_color: setting?.theme_color || "#FF7A00",
    facebook_url: setting?.facebook_url || "",
    instagram_url: setting?.instagram_url || "",
    tiktok_url: setting?.tiktok_url || "",
    is_active: setting?.is_active !== undefined ? Boolean(setting.is_active) : true,
  };
}

export default function PublicMenuSettingsPage() {
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [loadingBranch, setLoadingBranch] = useState(false);
  const [saving, setSaving] = useState(false);

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  const [setting, setSetting] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [form, setForm] = useState(DEFAULT_FORM);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const selectedBranch = useMemo(() => {
    return branches.find((b) => String(b.id) === String(branchId)) || null;
  }, [branches, branchId]);

  const canSave = useMemo(() => {
    if (!branchId) return false;
    const color = String(form.theme_color || "").trim();
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }, [branchId, form.theme_color]);

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({
      open: true,
      severity,
      title,
      message,
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const loadBranchPublicMenu = async (targetBranchId) => {
    if (!targetBranchId) {
      setSetting(null);
      setGallery([]);
      setForm(DEFAULT_FORM);
      return;
    }

    const [settingData, galleryData] = await Promise.all([
      getBranchPublicMenuSetting(restaurantId, targetBranchId),
      getBranchPublicMenuGallery(restaurantId, targetBranchId),
    ]);

    setSetting(settingData);
    setGallery(Array.isArray(galleryData) ? galleryData : []);
    setForm(normalizeSetting(settingData));
  };

  const loadAll = async () => {
    setLoading(true);

    try {
      let loadedBranches = await getBranchesByRestaurant(restaurantId);
      loadedBranches = Array.isArray(loadedBranches) ? loadedBranches : [];

      setBranches(loadedBranches);

      const nextBranchId = loadedBranches?.[0]?.id
        ? String(loadedBranches[0].id)
        : "";

      setBranchId(nextBranchId);

      if (nextBranchId) {
        await loadBranchPublicMenu(nextBranchId);
      } else {
        setSetting(null);
        setGallery([]);
        setForm(DEFAULT_FORM);
      }
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo cargar la configuración del menú público.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  useEffect(() => {
    if (!branchId) return;

    (async () => {
      setLoadingBranch(true);

      try {
        await loadBranchPublicMenu(branchId);
      } catch (e) {
        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudo cargar la configuración de la sucursal seleccionada.",
        });
      } finally {
        setLoadingBranch(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  const handleChangeField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!branchId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal antes de guardar.",
      });
      return;
    }

    const payload = {
      theme_color: String(form.theme_color || "#FF7A00").trim().toUpperCase(),
      facebook_url: form.facebook_url?.trim() || null,
      instagram_url: form.instagram_url?.trim() || null,
      tiktok_url: form.tiktok_url?.trim() || null,
      is_active: Boolean(form.is_active),
    };

    setSaving(true);

    try {
      const updated = await updateBranchPublicMenuSetting(
        restaurantId,
        branchId,
        payload
      );

      setSetting(updated);
      setForm(normalizeSetting(updated));

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Configuración del menú público guardada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo guardar la configuración del menú público.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadCover = async (file) => {
    if (!branchId || !file) return;

    setSaving(true);

    try {
      const updated = await uploadBranchPublicMenuCover(restaurantId, branchId, file);
      setSetting(updated);
      setForm(normalizeSetting(updated));

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Portada actualizada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.errors?.image?.[0] ||
          e?.response?.data?.message ||
          "No se pudo subir la portada.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCover = async () => {
    if (!branchId) return;

    const ok = window.confirm("¿Eliminar la portada del menú público?");
    if (!ok) return;

    setSaving(true);

    try {
      const updated = await deleteBranchPublicMenuCover(restaurantId, branchId);
      setSetting(updated);
      setForm(normalizeSetting(updated));

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Portada eliminada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo eliminar la portada del menú público.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadGalleryImage = async (file) => {
    if (!branchId || !file) return;

    setSaving(true);

    try {
      await uploadBranchPublicMenuGalleryImage(restaurantId, branchId, file);
      const galleryData = await getBranchPublicMenuGallery(restaurantId, branchId);
      setGallery(Array.isArray(galleryData) ? galleryData : []);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Imagen agregada a la galería correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.errors?.image?.[0] ||
          e?.response?.data?.message ||
          "No se pudo subir la imagen de galería.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGalleryImage = async (imageId, payload) => {
    if (!branchId || !imageId) return;

    setSaving(true);

    try {
      await updateBranchPublicMenuGalleryImage(
        restaurantId,
        branchId,
        imageId,
        payload
      );

      const galleryData = await getBranchPublicMenuGallery(restaurantId, branchId);
      setGallery(Array.isArray(galleryData) ? galleryData : []);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Imagen actualizada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo actualizar la imagen de galería.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGalleryImage = async (imageId) => {
    if (!branchId || !imageId) return;

    const ok = window.confirm("¿Eliminar esta imagen de la galería?");
    if (!ok) return;

    setSaving(true);

    try {
      await deleteBranchPublicMenuGalleryImage(restaurantId, branchId, imageId);
      setGallery((prev) => prev.filter((img) => Number(img.id) !== Number(imageId)));

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Imagen eliminada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo eliminar la imagen de galería.",
      });
    } finally {
      setSaving(false);
    }
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
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando configuración del menú público…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <PublicMenuSettingsHeader
          selectedBranch={selectedBranch}
          saving={saving}
          onSave={handleSave}
          canSave={canSave && !loadingBranch}
        />

        <PublicMenuInstructionsCard />

        <PublicMenuBranchSelectorCard
          branches={branches}
          branchId={branchId}
          onChangeBranch={setBranchId}
          selectedBranch={selectedBranch}
          disabled={saving || loadingBranch}
        />

        {loadingBranch ? (
          <Box sx={{ py: 3, display: "grid", placeItems: "center" }}>
            <Stack spacing={1.5} alignItems="center">
              <CircularProgress size={28} color="primary" />
              <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                Cargando datos de la sucursal…
              </Typography>
            </Stack>
          </Box>
        ) : (
          <>
            <PublicMenuContextCard
              selectedBranch={selectedBranch}
              setting={setting}
              gallery={gallery}
            />

            <PublicMenuSettingsFormCard
              form={form}
              onChange={handleChangeField}
              disabled={!selectedBranch || saving}
            />

            <PublicMenuCoverCard
              setting={setting}
              disabled={!selectedBranch || saving}
              onUpload={handleUploadCover}
              onDelete={handleDeleteCover}
            />

            <PublicMenuGalleryCard
              gallery={gallery}
              disabled={!selectedBranch || saving}
              onUpload={handleUploadGalleryImage}
              onUpdate={handleUpdateGalleryImage}
              onDelete={handleDeleteGalleryImage}
            />
          </>
        )}
      </Stack>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={4000}
      />
    </PageContainer>
  );
}
