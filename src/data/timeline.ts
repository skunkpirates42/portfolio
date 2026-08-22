export interface Chapter {
  id: string;
  period: string;
  sortYear: number;
  title: string;
  body: string;
}

export const chapters: Chapter[] = [
  {
    id: "jazz",
    period: "2012",
    sortYear: 2012,
    title: "A degree in jazz guitar",
    body: "B.Sc Jazz Studies at SUNY New Paltz. For my senior project I picked the musicians, ran the rehearsals, handled the promotion, and played an hour-long set to a live audience. It was the first time I shipped something with a hard deadline and no way to hide.",
  },
  {
    id: "colorado",
    period: "2013 - 2017",
    sortYear: 2013,
    title: "Colorado",
    body: "I moved out to ski and mountain bike, and paid for it by running the kitchen at a pizza bar and grill. Managing a line during a dinner rush is triage under load: fixed capacity, competing priorities, and no version of the night where you get to stop and redesign the system.",
  },
  {
    id: "code",
    period: "2018",
    sortYear: 2018,
    title: "Learned to code",
    body: "Thinkful's engineering immersion, starting November 2018. HTML, CSS, JavaScript, Node, React, Redux, and algorithms, several hours a week alongside a senior developer.",
  },
  {
    id: "covetrus",
    period: "2019",
    sortYear: 2019,
    title: "Six weeks to full-time",
    body: "Joined Covetrus as a software developer intern in April 2019 and was offered a full-time role six weeks later. Spent nearly two years on a digital prescription management platform serving more than 100,000 veterinary customers.",
  },
  {
    id: "senior",
    period: "2021 - 2026",
    sortYear: 2021,
    title: "Recharge, Stay.AI, senior",
    body: "Five years in remote, distributed engineering orgs. Frontend engineer at Recharge, a stint leading the customer portal rebuild at Stay.AI, then back to Recharge as a senior frontend engineer leading the merchant analytics platform.",
  },
];
