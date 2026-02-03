import React from "react";
import "./assets/styles.css";

export function Toast({ message, show }) {
  if (!show) return null;
  return (
    <div className="toast-notification">
      {message}
    </div>
  );
}
