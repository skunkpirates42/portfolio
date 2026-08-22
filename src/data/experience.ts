export interface Role {
  title: string;
  company: string;
  location: string;
  period: string;
  points: string[];
}

export const roles: Role[] = [
  {
    title: "Senior Frontend Software Engineer",
    company: "Recharge",
    location: "Remote",
    period: "May 2023 - Aug 2026",
    points: [
      "Led frontend development of the merchant analytics platform: dashboards and drill-down reports surfacing business metrics previously unavailable to 20,000+ merchants.",
      "Primary frontend engineer on the custom analytics reports product through two architectural generations, from canned reports with pre-selected metrics and dimensions to fully customizable reports. Collaborated closely with backend and data engineers.",
    ],
  },
  {
    title: "Senior Full-Stack Software Engineer",
    company: "Stay.AI",
    location: "Remote",
    period: "Nov 2022 - May 2023",
    points: [
      "Led the architectural design and development of the customer portal rebuild, using React, Zustand, Material UI, Node, Express, Redis, PostgreSQL and Twilio.",
    ],
  },
  {
    title: "Frontend Software Engineer",
    company: "Recharge",
    location: "Remote",
    period: "Feb 2021 - Oct 2022",
    points: [
      "Developed and maintained e-commerce subscription management software using Vue, TypeScript, Nuxt, Vuetify, Cypress, Jinja, Flask and SQL.",
    ],
  },
  {
    title: "Software Developer",
    company: "Covetrus",
    location: "Portland, ME / Remote",
    period: "Apr 2019 - Feb 2021",
    points: [
      "Iterated on a digital prescription management platform serving 100,000+ veterinary customers using the Scaled Agile Framework, with React, TypeScript, Apollo, GraphQL, Express, Node.js, MongoDB, MySQL, Java, Spring Boot and Kafka.",
      "Joined as a software developer intern in April 2019 and was offered a full-time role after six weeks.",
    ],
  },
];
