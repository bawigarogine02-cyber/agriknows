"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AOSProvider() {
  useEffect(() => {
    AOS.init({
      duration: 700,
      once: true,
      offset: 30,
      easing: "ease-out-cubic",
      mirror: false,
    });
  }, []);

  return null;
}
