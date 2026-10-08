import { contactLinks } from "./links";

const profileLinkLabels = ["GitHub", "LinkedIn"];

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Peter Ramos",
  url: "https://www.peterramos.dev/",
  jobTitle: "Senior Full-Stack Engineer",
  sameAs: contactLinks
    .filter((link) => profileLinkLabels.includes(link.label))
    .map((link) => link.href),
};
