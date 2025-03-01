"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import nProgress from "nprogress";
import "nprogress/nprogress.css";

export default function Toploading() {
    const pathname = usePathname();

    useEffect(() => {
        nProgress.start();
        nProgress.done();
    },[pathname])

    return null;
}