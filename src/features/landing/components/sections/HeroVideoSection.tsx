import React from "react";
import { ScrollVideoHero } from "../../../../components/ScrollVideoHero";
import { SectionComponentProps } from "../../types";
import { safeObject, safeString, safeNumber } from "../../registry/sectionSchemas";

export const HeroVideoSection: React.FC<SectionComponentProps> = ({
  content,
  settings,
}) => {
  const c = safeObject(content);
  const s = safeObject(settings);

  const videoSrc = safeString(c.videoUrl || c.heroVideoUrl || s.videoUrl);
  const scrollMultiplier = safeNumber(c.scrollMultiplier || s.scrollMultiplier, 4);

  return (
    <ScrollVideoHero
      videoSrc={videoSrc || undefined}
      scrollMultiplier={scrollMultiplier}
    />
  );
};
