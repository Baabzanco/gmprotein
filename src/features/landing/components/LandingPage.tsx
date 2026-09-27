import React, { useEffect, useState } from "react";
import { LandingSectionPublicDTO } from "../types";
import { getLandingSections } from "../services/landingApi";
import { LandingSectionRenderer } from "./LandingSectionRenderer";
import { LegacyLandingFallback } from "./LegacyLandingFallback";

export const LandingPage: React.FC = () => {
  const [sections, setSections] = useState<LandingSectionPublicDTO[] | null>(null);

  useEffect(() => {
    let isMounted = true;

    getLandingSections()
      .then((data) => {
        if (isMounted) {
          setSections(data || []);
        }
      })
      .catch((err) => {
        console.warn("[LandingPage] Fallback activated due to fetch error:", err);
        if (isMounted) {
          setSections([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // While initializing or if sections table is empty, render the seamless compatibility fallback
  if (sections === null || sections.length === 0) {
    return <LegacyLandingFallback />;
  }

  // Dynamic Section Registry rendering
  return (
    <>
      {sections.map((section) => (
        <LandingSectionRenderer key={section.id || section.key} section={section} />
      ))}
    </>
  );
};
