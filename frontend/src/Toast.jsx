import React, { useEffect } from "react";
import "./assets/styles.css";

export function Toast({ message, show, type = "success", duration = 3000, onClose }) {
  useEffect(() => {
    if (!show) return;

    const timer = window.setTimeout(() => {
      onClose?.();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [show, duration, onClose]);

  if (!show) return null;

  return <div className={`toast-notification toast-notification--${type}`}>{message}</div>;
}
