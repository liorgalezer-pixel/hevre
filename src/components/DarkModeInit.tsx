"use client";

import { useEffect } from "react";

export default function DarkModeInit() {
  useEffect(() => {
    if (localStorage.getItem("hevre_dark_mode") === "1") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return null;
}
