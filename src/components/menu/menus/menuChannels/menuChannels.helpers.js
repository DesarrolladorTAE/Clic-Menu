export function normalizeMenuChannels(
  data
) {
  const channels = Array.isArray(
    data?.channels
  )
    ? data.channels.map(
        (channel) => ({
          ...channel,

          branch_sales_channel_id:
            Number(
              channel
                ?.branch_sales_channel_id
            ),

          branch_id:
            Number(
              channel?.branch_id
            ),

          is_active:
            !!channel?.is_active,

          is_usable:
            !!channel?.is_usable,

          default_menu_id:
            channel?.default_menu_id
              ? Number(
                  channel.default_menu_id
                )
              : null,

          menu_configuration: {
            ...(channel
              ?.menu_configuration ||
              {}),

            is_enabled:
              !!channel
                ?.menu_configuration
                ?.is_enabled,

            is_default:
              !!channel
                ?.menu_configuration
                ?.is_default,

            can_enable:
              !!channel
                ?.menu_configuration
                ?.can_enable,

            can_set_default:
              !!channel
                ?.menu_configuration
                ?.can_set_default,
          },
        })
      )
    : [];

  return {
    menu: data?.menu || null,
    channels,
  };
}

export function buildMenuChannelsPayload(
  channels
) {
  return {
    channels: (
      Array.isArray(channels)
        ? channels
        : []
    ).map((channel) => ({
      branch_sales_channel_id:
        Number(
          channel
            .branch_sales_channel_id
        ),

      is_enabled:
        !!channel
          ?.menu_configuration
          ?.is_enabled,

      is_default:
        !!channel
          ?.menu_configuration
          ?.is_default,
    })),
  };
}

export function updateChannelEnabled(
  channels,
  branchSalesChannelId,
  checked
) {
  return channels.map(
    (channel) => {
      if (
        Number(
          channel
            .branch_sales_channel_id
        ) !==
        Number(
          branchSalesChannelId
        )
      ) {
        return channel;
      }

      return {
        ...channel,

        menu_configuration: {
          ...channel
            .menu_configuration,

          is_enabled:
            checked,

          /*
          |--------------------------------------------------------------------------
          | Un canal deshabilitado no puede conservar este menú como predeterminado
          |--------------------------------------------------------------------------
          */
          is_default:
            checked
              ? !!channel
                  .menu_configuration
                  .is_default
              : false,
        },
      };
    }
  );
}

export function updateChannelDefault(
  channels,
  branchSalesChannelId,
  checked
) {
  return channels.map(
    (channel) => {
      if (
        Number(
          channel
            .branch_sales_channel_id
        ) !==
        Number(
          branchSalesChannelId
        )
      ) {
        return channel;
      }

      return {
        ...channel,

        menu_configuration: {
          ...channel
            .menu_configuration,

          /*
          |--------------------------------------------------------------------------
          | Predeterminado siempre implica habilitado
          |--------------------------------------------------------------------------
          */
          is_enabled:
            checked
              ? true
              : !!channel
                  .menu_configuration
                  .is_enabled,

          is_default:
            checked,
        },
      };
    }
  );
}

export function getMenuChannelsSummary(
  channels
) {
  const rows = Array.isArray(
    channels
  )
    ? channels
    : [];

  return {
    available:
      rows.length,

    enabled:
      rows.filter(
        (channel) =>
          !!channel
            ?.menu_configuration
            ?.is_enabled
      ).length,

    defaults:
      rows.filter(
        (channel) =>
          !!channel
            ?.menu_configuration
            ?.is_default
      ).length,

    blocked:
      rows.filter(
        (channel) =>
          !channel?.is_usable
      ).length,
  };
}

export function getBackendMessage(
  error,
  fallback
) {
  const data =
    error?.response?.data;

  const messages =
    Object.values(
      data?.errors || {}
    )
      .flat(Infinity)
      .filter(Boolean);

  return (
    data?.message ||
    messages[0] ||
    error?.message ||
    fallback
  );
}