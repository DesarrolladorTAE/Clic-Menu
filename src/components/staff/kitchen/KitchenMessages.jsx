import React from "react";
import { msgErr, msgOk } from "./kitchen.helpers";

export default function KitchenMessages({ err, okMsg }) {
  return (
    <>
      {err ? <div style={msgErr}>{err}</div> : null}
      {okMsg ? <div style={msgOk}>{okMsg}</div> : null}
    </>
  );
}
