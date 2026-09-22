export interface SiteConfig {
  heroVideo: string;
  heroVideoDesktop: string;
  heroVideoMobile: string;
  brandName: string;
  brandNameFa: string;
  brandTaglineFa: string;
  brandTaglineEn: string;
  scrollPromptFa: string;
  heroScrollMultiplier: number;
}

export const siteConfig: SiteConfig = {
  // Central location for video source - do NOT duplicate across components
  heroVideo:
    "https://golmohamadi.com/wp-content/uploads/2026/09/Create-A-Single-Continuous-Cin-3.mp4",
  heroVideoDesktop:
    "https://golmohamadi.com/wp-content/uploads/2026/09/Create-A-Single-Continuous-Cin-3.mp4",
  heroVideoMobile:
    "https://golmohamadi.com/wp-content/uploads/2026/09/Create-A-Single-Continuous-Cin-3.mp4",
  brandName: "Protein Golmohammadi",
  brandNameFa: "پروتئین گلمحمدی",
  brandTaglineFa: "اصالت کیفیت، تجربه‌ای ممتاز از پروتئین تازه و دستچین",
  brandTaglineEn: "The Art of Pure Premium Protein",
  scrollPromptFa: "برای کشف داستان ما اسکرول کنید",
  // Scroll height multiplier: determines the scroll distance in viewports (e.g., 4 = 400vh)
  // Higher value = slower, more cinematic scrubbing; lower value = faster scrub
  heroScrollMultiplier: 4.5,
};
