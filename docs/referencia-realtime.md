# Referencia de tiempo real y temporizadores

[Volver al índice](../README.md) · [Estados y flujos](estados-y-flujos.md)

Extractos ejecutables de suscripciones y temporizadores. Los canales calculados a partir de respuesta deben confirmarse con el backend. Los intervalos se muestran con contexto, sin asumir que todos están activos simultáneamente.

## src/components/auth/ForgotPasswordModal.jsx

[src/components/auth/ForgotPasswordModal.jsx](../src/components/auth/ForgotPasswordModal.jsx)

```js
// 44
    if (cooldown <= 0) return;
// 45
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
// 46
    return () => clearInterval(t);
// 47
  }, [cooldown, open]);
// 48

// 49
  // reset modal state when open toggles
// 50
  useEffect(() => {
// 51
    if (!open) return;
```

## src/components/connection/whasapo/chatinbot/ChatingBootPanel.jsx

[src/components/connection/whasapo/chatinbot/ChatingBootPanel.jsx](../src/components/connection/whasapo/chatinbot/ChatingBootPanel.jsx)

```js
// 181

// 182
    const timer = window.setInterval(() => {
// 183
      if (document.visibilityState !== "visible") return;
// 184
      refreshStatus(true);
// 185
    }, interval);
// 186

// 187
    return () => window.clearInterval(timer);
// 188

```

## src/components/floor/qr/BranchQrListPanel.jsx

[src/components/floor/qr/BranchQrListPanel.jsx](../src/components/floor/qr/BranchQrListPanel.jsx)

```js
// 350
            {items.map((qr) => {
// 351
              const channelName = qr?.sales_channel?.name || "—";
// 352
              const tableName = qr?.table?.name || "General";
// 353
              const purposeMeta = getQrPurposeMeta(qr, typeLabelMap);
// 354

// 355
              const blockedByPlan = !!qr?.blocked_by_plan;
// 356
              const blockedByAttentionMode = !!qr?.blocked_by_attention_mode;
// 357
              const isBlocked = blockedByPlan || blockedByAttentionMode;
```

## src/components/landing/home/HomeBusinessTypesSection.jsx

[src/components/landing/home/HomeBusinessTypesSection.jsx](../src/components/landing/home/HomeBusinessTypesSection.jsx)

```js
// 32
  useEffect(() => {
// 33
    const intervalId = window.setInterval(() => {
// 34
      setActiveIndex((current) => (current + 1) % businessTypes.length);
// 35
    }, 3000);
// 36

// 37
    return () => {
// 38
      window.clearInterval(intervalId);
// 39
    };
```

## src/components/landing/home/HomeFeaturesSection.jsx

[src/components/landing/home/HomeFeaturesSection.jsx](../src/components/landing/home/HomeFeaturesSection.jsx)

```js
// 85

// 86
    timerRef.current = setInterval(() => {
// 87
      setActiveIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1));
// 88
    }, 2000);
// 89
  };
// 90

// 91
  const handlePrev = () => {
// 92
    setActiveIndex((prev) => (prev === 0 ? features.length - 1 : prev - 1));
```

## src/components/menu/menus/menuChannels/MenuDefaultConfirmDialog.jsx

[src/components/menu/menus/menuChannels/MenuDefaultConfirmDialog.jsx](../src/components/menu/menus/menuChannels/MenuDefaultConfirmDialog.jsx)

```js
// 30

// 31
  const channelName =
// 32
    channel
// 33
      ?.sales_channel
// 34
      ?.name ||
// 35
    "Canal de venta";
// 36

// 37
  const currentDefaultName =
```

## src/components/menu/menuSets/manage/imports/MenuSetImportPreview.jsx

[src/components/menu/menuSets/manage/imports/MenuSetImportPreview.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportPreview.jsx)

```js
// 344

// 345
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
// 346
    return () => window.clearInterval(timer);
// 347
  }, [data?.preview_expires_at]);
// 348

// 349
  const differences = useMemo(() => {
// 350
    return buildDifferenceRows(data?.diff);
// 351
  }, [data?.diff]);
```

## src/components/menu/menuSets/manage/imports/MenuSetImportPublish.jsx

[src/components/menu/menuSets/manage/imports/MenuSetImportPublish.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportPublish.jsx)

```js
// 97

// 98
    const timer = window.setInterval(() => setNow(Date.now()), 15000);
// 99
    return () => window.clearInterval(timer);
// 100
  }, [data?.preview_expires_at]);
// 101

// 102
  useEffect(() => {
// 103
    setNow(Date.now());
// 104
    setConfirmOpen(false);
```

## src/components/variants/content/VariantChannelsContent.jsx

[src/components/variants/content/VariantChannelsContent.jsx](../src/components/variants/content/VariantChannelsContent.jsx)

```js
// 334

// 335
      const channelName = row?.sales_channel?.name || "el canal seleccionado";
// 336

// 337
      if (change.mode === "remove") {
// 338
        items.push({
// 339
          branch_sales_channel_id: channelId,
// 340
          mode: "remove",
// 341
        });
```

## src/hooks/menu/useMenuAvailabilityRealtime.js

[src/hooks/menu/useMenuAvailabilityRealtime.js](../src/hooks/menu/useMenuAvailabilityRealtime.js)

```js
// 47
  const channelType = normalizeChannelType(realtime?.channel_type);
// 48
  const channelName = String(realtime?.channel || "").trim();
// 49
  const eventName = normalizeEventName(realtime?.event);
// 50
  const resolvedDebounceMs = normalizeDebounceMs(debounceMs);
// 51

// 52
  const callbackRef = useRef(onAvailabilityEvent);
// 53
  const errorCallbackRef = useRef(onError);
// 54
  const timerRef = useRef(null);
```

```js
// 108
        await callbackRef.current?.(pendingEvent, {
// 109
          channel_type: channelType,
// 110
          channel: channelName,
// 111
          event: eventName,
// 112
        });
// 113
      } catch (error) {
// 114
        reportError(error, {
// 115
          phase: "event_callback",
// 116
          payload: pendingEvent,
// 117
          channel_type: channelType,
// 118
          channel: channelName,
// 119
          event: eventName,
// 120
        });
// 121
      } finally {
// 122
        processingRef.current = false;
// 123

```

```js
// 158
        channelType === "private"
// 159
          ? echo.private(channelName)
// 160
          : echo.channel(channelName);
// 161

// 162
      subscription.listen(eventName, queueEvent);
// 163
    } catch (error) {
// 164
      reportError(error, {
// 165
        phase: "subscription",
// 166
        channel_type: channelType,
// 167
        channel: channelName,
// 168
        event: eventName,
// 169
      });
// 170
    }
// 171

// 172
    return () => {
```

```js
// 181
      try {
// 182
        subscription?.stopListening?.(eventName, queueEvent);
// 183
      } catch (error) {
// 184
        reportError(error, {
// 185
          phase: "stop_listening",
// 186
          channel_type: channelType,
// 187
          channel: channelName,
// 188
          event: eventName,
// 189
        });
// 190
      }
// 191

// 192
      try {
// 193
        if (typeof echo.leave === "function") {
// 194
          echo.leave(channelName);
// 195
        } else {
// 196
          echo.leaveChannel?.(channelName);
// 197
        }
// 198
      } catch (error) {
// 199
        reportError(error, {
// 200
          phase: "leave_channel",
// 201
          channel_type: channelType,
// 202
          channel: channelName,
// 203
          event: eventName,
// 204
        });
// 205
      }
// 206
    };
// 207
  }, [
```

## src/hooks/public/useTableQrSession.js

[src/hooks/public/useTableQrSession.js](../src/hooks/public/useTableQrSession.js)

```js
// 220

// 221
      joinPollRef.current = setInterval(async () => {
// 222
        try {
// 223
          const res = await getJoinRequestStatus(tid);
// 224
          const st = String(res?.data?.status || "").toLowerCase();
// 225

// 226
          if (st === "pending") {
// 227
            setJoinReq((p) => ({ ...(p || {}), status: "pending" }));
```

```js
// 347

// 348
    tickRef.current = setInterval(() => {
// 349
      setRemainingSec((prev) => Math.max(0, Number(prev || 0) - 1));
// 350
    }, 1000);
// 351

// 352
    return () => {
// 353
      if (tickRef.current) clearInterval(tickRef.current);
// 354
      tickRef.current = null;
```

```js
// 370

// 371
    heartbeatRef.current = setInterval(async () => {
// 372
      try {
// 373
        await heartbeatTableSession(session.session_id);
// 374
      } catch {}
// 375
    }, 30000);
// 376

// 377
    return stop;
```

## src/pages/auth/Register.jsx

[src/pages/auth/Register.jsx](../src/pages/auth/Register.jsx)

```js
// 90
    if (cooldown <= 0) return;
// 91
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
// 92
    return () => clearInterval(t);
// 93
  }, [cooldown]);
// 94

// 95
  useEffect(() => {
// 96
    const params = new URLSearchParams(window.location.search);
// 97
    const ref = params.get("ref");
```

## src/pages/connection/netpay/NetpayConnectionPage.jsx

[src/pages/connection/netpay/NetpayConnectionPage.jsx](../src/pages/connection/netpay/NetpayConnectionPage.jsx)

```js
// 155

// 156
    pollRef.current = setInterval(() => {
// 157
      if (document.visibilityState === "visible") {
// 158
        synchronizeTerminals();
// 159
      }
// 160
    }, 15000);
// 161

// 162
    return () => {
```

## src/pages/landing/blog/BlogPostDetailPage.jsx

[src/pages/landing/blog/BlogPostDetailPage.jsx](../src/pages/landing/blog/BlogPostDetailPage.jsx)

```js
// 390

// 391
    const timer = window.setInterval(() => {
// 392
      setSlideIndex((current) => {
// 393
        return (
// 394
          (current + 1) %
// 395
          slides.length
// 396
        );
// 397
      });
```

## src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx

[src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx](../src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx)

```js
// 214
  useEffect(() => {
// 215
    const intervalId = window.setInterval(() => {
// 216
      loadBase({ silent: true });
// 217

// 218
      if (tab === "history") {
// 219
        loadHistory({ page: pageRef.current, silent: true });
// 220
      }
// 221
    }, 30000);
```

## src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx

[src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx](../src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx)

```js
// 135
  useEffect(() => {
// 136
    const intervalId = window.setInterval(() => {
// 137
      if (hasLoadedRef.current) {
// 138
        loadSubscriptions({ silent: true });
// 139
      }
// 140
    }, 30000);
// 141

// 142
    return () => {
```

## src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx

[src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx](../src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx)

```js
// 162

// 163
    const timer = window.setInterval(() => {
// 164
      loadTracking({ silent: true });
// 165
    }, SILENT_REFRESH_MS);
// 166

// 167
    const refreshWhenVisible = () => {
// 168
      if (document.visibilityState === "visible") loadTracking({ silent: true });
// 169
    };
```

```js
// 188

// 189
    const channelName = `public.online-order.${token}`;
// 190

// 191
    const scheduleRefresh = () => {
// 192
      if (document.visibilityState !== "visible") return;
// 193
      if (wsRefreshRef.current) window.clearTimeout(wsRefreshRef.current);
// 194

// 195
      wsRefreshRef.current = window.setTimeout(() => {
```

```js
// 204

// 205
    echo.channel(channelName).listen(".online-order.tracking.updated", handleTrackingUpdated);
// 206

// 207
    return () => {
// 208
      if (wsRefreshRef.current) {
// 209
        window.clearTimeout(wsRefreshRef.current);
// 210
        wsRefreshRef.current = null;
// 211
      }
// 212

// 213
      echo.leaveChannel(channelName);
// 214
    };
// 215
  }, [trackingToken, loadTracking]);
// 216

// 217
  useEffect(() => {
// 218
    if (!trackingData?.public_number) return;
// 219

```

## src/pages/public/PublicMenuEntryPage.jsx

[src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx)

```js
// 620

// 621
    const channelName = `public.session.${publicSessionChannelId}`;
// 622
    const channel = echo.channel(channelName);
// 623

// 624
    const processSessionRealtime = async () => {
// 625
      if (sessionRealtimeRunningRef.current) {
// 626
        sessionRealtimeQueuedRef.current = true;
// 627
        return;
// 628
      }
```

```js
// 689

// 690
    channel.listen(".public.session.updated", onSessionUpdated);
// 691

// 692
    return () => {
// 693
      echo.leave(channelName);
// 694
    };
// 695
  }, [
// 696
    publicSessionChannelId,
// 697
    load,
// 698
    qr?.refreshSession,
// 699
    qr?.session?.order_id,
```

```js
// 711

// 712
    const channelName = `public.order.${publicOrderChannelId}`;
// 713
    const channel = echo.channel(channelName);
// 714

// 715
    const processOrderRealtime = async () => {
// 716
      if (orderRealtimeRunningRef.current) {
// 717
        orderRealtimeQueuedRef.current = true;
// 718
        return;
// 719
      }
```

```js
// 754

// 755
    channel.listen(".public.order.updated", onOrderUpdated);
// 756

// 757
    return () => {
// 758
      echo.leave(channelName);
// 759
    };
// 760
  }, [
// 761
    publicOrderChannelId,
// 762
    cartOrder?.applyRealtimeOrderReason,
// 763
    cartOrder?.refreshOrder,
// 764
    cartOrder?.currentOrderId,
```

## src/pages/staff/casher/CashierHomePage.jsx

[src/pages/staff/casher/CashierHomePage.jsx](../src/pages/staff/casher/CashierHomePage.jsx)

```js
// 181

// 182
      pollRef.current = setInterval(() => {
// 183
        if (document.visibilityState === "visible") load({ silent: true });
// 184
      }, 10000);
// 185
    };
// 186

// 187
    boot();
// 188

```

## src/pages/staff/casher/CashierQueuePage.jsx

[src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx)

```js
// 241

// 242
    pollRef.current = setInterval(() => {
// 243
      if (document.visibilityState === "visible") load({ silent: true });
// 244
    }, 10000);
// 245

// 246
    return () => {
// 247
      if (pollRef.current) clearInterval(pollRef.current);
// 248
    };
```

```js
// 273

// 274
    const channelName = `branch.${branchId}.cashier`;
// 275

// 276
    const scheduleRefresh = () => {
// 277
      if (wsRefreshFastRef.current) clearTimeout(wsRefreshFastRef.current);
// 278
      if (wsRefreshSlowRef.current) clearTimeout(wsRefreshSlowRef.current);
// 279

// 280
      wsRefreshFastRef.current = setTimeout(
```

```js
// 315
      .private(channelName)
// 316
      .listen(".cashier.queue.updated", handleCashierQueueUpdated);
// 317

// 318
    return () => {
// 319
      if (wsRefreshFastRef.current) {
// 320
        clearTimeout(wsRefreshFastRef.current);
// 321
        wsRefreshFastRef.current = null;
// 322
      }
```

```js
// 328

// 329
      echo.leaveChannel(channelName);
// 330
    };
// 331
    // eslint-disable-next-line react-hooks/exhaustive-deps
// 332
  }, [branchId, staffId]);
// 333

// 334
  useEffect(() => {
// 335
    return () => {
```

## src/pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx

[src/pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx)

```js
// 116

// 117
    pollRef.current = setInterval(() => {
// 118
      if (document.visibilityState === "visible") load({ silent: true });
// 119
    }, 8000);
// 120

// 121
    return () => {
// 122
      if (pollRef.current) clearInterval(pollRef.current);
// 123
    };
```

```js
// 129

// 130
    const channelName = `branch.${branchId}.cashier`;
// 131

// 132
    const scheduleRefresh = () => {
// 133
      if (wsRefreshFastRef.current) clearTimeout(wsRefreshFastRef.current);
// 134
      if (wsRefreshSlowRef.current) clearTimeout(wsRefreshSlowRef.current);
// 135

// 136
      wsRefreshFastRef.current = setTimeout(() => {
```

```js
// 151

// 152
    echo.private(channelName).listen(".cashier.queue.updated", handleCashierQueueUpdated);
// 153

// 154
    return () => {
// 155
      if (wsRefreshFastRef.current) {
// 156
        clearTimeout(wsRefreshFastRef.current);
// 157
        wsRefreshFastRef.current = null;
// 158
      }
```

```js
// 164

// 165
      echo.leaveChannel(channelName);
// 166
    };
// 167
    // eslint-disable-next-line react-hooks/exhaustive-deps
// 168
  }, [branchId, id]);
// 169

// 170
  const handleBack = () => {
// 171
    const fromTab = location.state?.fromTab === "mine" ? "mine" : "available";
```

## src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx

[src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx)

```js
// 179

// 180
    pollRef.current = setInterval(() => {
// 181
      if (document.visibilityState === "visible" && !busyOrderId && !dialogAction) {
// 182
        load({ silent: true });
// 183
      }
// 184
    }, 8000);
// 185

// 186
    return () => {
```

```js
// 194

// 195
    const channelName = `branch.${branchId}.cashier`;
// 196

// 197
    const scheduleRefresh = () => {
// 198
      if (wsRefreshFastRef.current) clearTimeout(wsRefreshFastRef.current);
// 199
      if (wsRefreshSlowRef.current) clearTimeout(wsRefreshSlowRef.current);
// 200

// 201
      wsRefreshFastRef.current = setTimeout(() => {
```

```js
// 223

// 224
    echo.private(channelName).listen(".cashier.queue.updated", handleCashierQueueUpdated);
// 225

// 226
    return () => {
// 227
      if (wsRefreshFastRef.current) {
// 228
        clearTimeout(wsRefreshFastRef.current);
// 229
        wsRefreshFastRef.current = null;
// 230
      }
```

```js
// 236

// 237
      echo.leaveChannel(channelName);
// 238
    };
// 239
    // eslint-disable-next-line react-hooks/exhaustive-deps
// 240
  }, [branchId]);
// 241

// 242
  useEffect(() => {
// 243
    const requestedTab = searchParams.get("tab") === "mine" ? "mine" : "available";
```

## src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentLoad.js

[src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentLoad.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentLoad.js)

```js
// 290

// 291
    pollRef.current = setInterval(() => {
// 292
      if (
// 293
        document.visibilityState === "visible" &&
// 294
        !paymentInProgressRef.current &&
// 295
        !paymentCompletedRef.current
// 296
      ) {
// 297
        load({ silent: true, preserveForm: true });
```

```js
// 311

// 312
    const channelName = `branch.${branchId}.cashier`;
// 313

// 314
    const scheduleRefresh = () => {
// 315
      if (wsRefreshFastRef.current) clearTimeout(wsRefreshFastRef.current);
// 316
      if (wsRefreshSlowRef.current) clearTimeout(wsRefreshSlowRef.current);
// 317

// 318
      wsRefreshFastRef.current = setTimeout(() => {
```

```js
// 339

// 340
    echo.private(channelName).listen(".cashier.queue.updated", handleCashierQueueUpdated);
// 341

// 342
    return () => {
// 343
      if (wsRefreshFastRef.current) {
// 344
        clearTimeout(wsRefreshFastRef.current);
// 345
        wsRefreshFastRef.current = null;
// 346
      }
```

```js
// 352

// 353
      echo.leaveChannel(channelName);
// 354
    };
// 355

// 356
    // eslint-disable-next-line react-hooks/exhaustive-deps
// 357
  }, [branchId, selectedSaleId]);
// 358

// 359
  return {
```

## src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx

[src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx](../src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx)

```js
// 350

// 351
    pollRef.current = setInterval(() => {
// 352
      if (document.visibilityState === "visible") {
// 353
        load({ silent: true });
// 354
      }
// 355
    }, 12000);
// 356

// 357
    return () => {
```

## src/pages/staff/kitchen/KitchenDashboard.jsx

[src/pages/staff/kitchen/KitchenDashboard.jsx](../src/pages/staff/kitchen/KitchenDashboard.jsx)

```js
// 326
      if (pollRef.current) clearInterval(pollRef.current);
// 327
      pollRef.current = setInterval(() => {
// 328
        if (document.hidden) return;
// 329
        loadOrders();
// 330
      }, 10000);
// 331
    };
// 332

// 333
    startPolling();
```

```js
// 351

// 352
    const channelName = `branch.${branchId}.kitchen`;
// 353

// 354
    const scheduleRefresh = () => {
// 355
      if (wsRefreshFastRef.current) clearTimeout(wsRefreshFastRef.current);
// 356
      if (wsRefreshSlowRef.current) clearTimeout(wsRefreshSlowRef.current);
// 357

// 358
      wsRefreshFastRef.current = setTimeout(() => {
```

```js
// 373

// 374
    echo.private(channelName).listen(".kitchen.kds.updated", handleKitchenUpdated);
// 375

// 376
    return () => {
// 377
      if (wsRefreshFastRef.current) {
// 378
        clearTimeout(wsRefreshFastRef.current);
// 379
        wsRefreshFastRef.current = null;
// 380
      }
```

```js
// 385

// 386
      echo.leaveChannel(channelName);
// 387
    };
// 388
  }, [branchId, loadOrders]);
// 389

// 390
  useEffect(() => {
// 391
    return () => {
// 392
      if (wsRefreshFastRef.current) clearTimeout(wsRefreshFastRef.current);
```

## src/pages/staff/waiter/StaffMenuEntryPage.jsx

[src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx)

```js
// 696
    const currentTableId = Number(tableId);
// 697
    const channelName = `branch.${branchId}.tables`;
// 698
    const channel = echo.private(channelName);
// 699

// 700
    const onTableUpdated = async (event) => {
// 701
      const eventTableId = Number(event?.table_id || 0);
// 702

// 703
      if (!eventTableId || eventTableId !== currentTableId) return;
// 704
      if (realtimeBusyRef.current) return;
```

```js
// 745

// 746
    channel.listen(".table.grid.updated", onTableUpdated);
// 747

// 748
    return () => {
// 749
      echo.leave(channelName);
// 750
    };
// 751
  }, [branchId, tableId]);
// 752

// 753

// 754
  useMenuAvailabilityRealtime({
// 755
    echo,
```

## src/pages/staff/waiter/WaiterTablesGrid.jsx

[src/pages/staff/waiter/WaiterTablesGrid.jsx](../src/pages/staff/waiter/WaiterTablesGrid.jsx)

```js
// 437

// 438
      pollRef.current = setInterval(() => {
// 439
        if (document.visibilityState === "visible") {
// 440
          load({ silent: true });
// 441
        }
// 442
      }, 10000);
// 443
    };
// 444

```

```js
// 575

// 576
    const channelName = `branch.${branchId}.tables`;
// 577

// 578
    const scheduleRefresh = () => {
// 579
      if (wsRefreshFastRef.current) clearTimeout(wsRefreshFastRef.current);
// 580
      if (wsRefreshSlowRef.current) clearTimeout(wsRefreshSlowRef.current);
// 581

// 582
      wsRefreshFastRef.current = setTimeout(() => {
```

```js
// 604

// 605
    echo.private(channelName).listen(".table.grid.updated", handleGridUpdated);
// 606

// 607
    return () => {
// 608
      if (wsRefreshFastRef.current) {
// 609
        clearTimeout(wsRefreshFastRef.current);
// 610
        wsRefreshFastRef.current = null;
// 611
      }
```

```js
// 616

// 617
      echo.leaveChannel(channelName);
// 618
    };
// 619
    // eslint-disable-next-line react-hooks/exhaustive-deps
// 620
  }, [meta?.branch_id, meta?.staff_id]);
// 621

// 622
  useEffect(() => {
// 623
    return () => {
```

## src/realtime/TestEventPage.jsx

[src/realtime/TestEventPage.jsx](../src/realtime/TestEventPage.jsx)

```js
// 31

// 32
    const kitchenChannel = echo.channel("branch.10.kitchen");
// 33
    const tablesChannel = echo.channel("branch.10.tables");
// 34

// 35
    kitchenChannel.listen(".kitchen.kds.updated", (e) => {
// 36
      addLog("Evento cocina recibido", e);
// 37
    });
// 38

// 39
    tablesChannel.listen(".table.grid.updated", (e) => {
// 40
      addLog("Evento mesas recibido", e);
// 41
    });
// 42

// 43
    return () => {
// 44
      echo.leave("branch.10.kitchen");
// 45
      echo.leave("branch.10.tables");
// 46
    };
// 47
  }, []);
// 48

// 49
  return (
// 50
    <div style={{ padding: 24 }}>
// 51
      <h1>Prueba Realtime</h1>
```

