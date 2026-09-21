export const SITE_NAME = "BeforeDoors";
export const SITE_TAGLINE = "Know before you go";
export const SITE_DESCRIPTION =
  "Clear, evidence-based venue access information for planning with confidence.";
export const SITE_SOCIAL_IMAGE = "/beforedoors-social-card.png";
export const SITE_SOCIAL_IMAGE_ALT = `An open door with an orange knob. ${SITE_NAME} — ${SITE_TAGLINE}.`;

type SiteMetaOptions = {
  title: string;
  description?: string;
};

type SiteMetaEntry = {
  title?: string;
  name?: string;
  property?: string;
  content?: string;
};

export function createSiteMeta({ title, description = SITE_DESCRIPTION }: SiteMetaOptions) {
  return [
    { title },
    { name: "description", content: description },
    { name: "theme-color", content: "#f7f1e7" },
    { name: "application-name", content: SITE_NAME },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: SITE_SOCIAL_IMAGE },
    { property: "og:image:alt", content: SITE_SOCIAL_IMAGE_ALT },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: SITE_SOCIAL_IMAGE },
    { name: "twitter:image:alt", content: SITE_SOCIAL_IMAGE_ALT },
  ] satisfies SiteMetaEntry[];
}
