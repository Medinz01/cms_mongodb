// components/ViewTracker.js
"use client";
import { useEffect, useRef } from "react";

export default function ViewTracker({ pageId }) {
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (hasTrackedView.current) return;

    const viewedPages = JSON.parse(sessionStorage.getItem("viewedPages") || "[]");
    if (viewedPages.includes(pageId)) return;

    hasTrackedView.current = true;

    const trackView = async () => {
      try {
        const response = await fetch(`/api/pages/${pageId}/view`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          sessionStorage.setItem(
            "viewedPages",
            JSON.stringify([...viewedPages, pageId])
          );
        } else {
          console.error("Failed to track view:", response.statusText);
        }
      } catch (error) {
        console.error("Error tracking view:", error);
      }
    };

    trackView();

    return () => {
      hasTrackedView.current = false;
    };
  }, [pageId]);

  return null;
}