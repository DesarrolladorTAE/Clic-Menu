//Permite redirigir a la pagina de planes segun sea el caso
export function handleRestaurantApiError(err, navigate, restaurantId) {
  const status = err?.response?.status;
  const code = err?.response?.data?.code;

  // Si está bloqueado por suscripción, lo mandas a planes
  if (status === 403 && code === "SUBSCRIPTION_REQUIRED") {
    navigate(`/owner/restaurants/${restaurantId}/plans`, { replace: true });
    return true;
  }

  // Si alcanzó límite de sucursales, igual lo mandas a planes (upgrade)
  if (status === 403 && code === "BRANCH_LIMIT_REACHED") {
    navigate(`/owner/restaurants/${restaurantId}/plans`);
    return true;
  }

  return false;
}
