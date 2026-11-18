"use client";
import { useEffect, useState } from "react";

export function Essai() {
  const [t, setT] = useState("");
  useEffect(() => {
    setT(new Date().toISOString());
  }, []);
  const x: any = t;
  return <p>{x}</p>;
}
