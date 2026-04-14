/** Parents / guardians: links to live tools and planned features (`/parents/feature/[key]`). */

export type ParentPanelStatus = "live" | "planned";

export type ParentPanelItem = {
  key: string;
  title: string;
  description: string;
  status: ParentPanelStatus;
  href?: string;
};

export type ParentPanelGroup = {
  id: string;
  title: string;
  description?: string;
  items: ParentPanelItem[];
};

export const PARENT_PANEL_GROUPS: ParentPanelGroup[] = [
  {
    id: "learning",
    title: "Children’s learning",
    items: [
      {
        key: "marks",
        title: "Children’s marks",
        description:
          "Coursework scores and formal exam marks for each linked child (read-only; schools publish what they record).",
        status: "live",
        href: "/parents/marks",
      },
      {
        key: "class-routine",
        title: "Class routine / timetable",
        description: "Daily or weekly timetable per class — coming when timetables are modelled in the app.",
        status: "planned",
      },
    ],
  },
  {
    id: "attendance",
    title: "Attendance",
    items: [
      {
        key: "attendance",
        title: "Child’s attendance tracking",
        description: "Day-by-day attendance your child’s school records, with optional school notes.",
        status: "live",
        href: "/family",
      },
    ],
  },
  {
    id: "finance",
    title: "Fees & payments",
    items: [
      {
        key: "invoices",
        title: "Payment invoices",
        description: "View fee notices and payment history — planned (needs billing integration).",
        status: "planned",
      },
    ],
  },
  {
    id: "communication",
    title: "Contact school",
    items: [
      {
        key: "messaging",
        title: "Messaging with teachers",
        description: "Secure messages between guardians and staff — planned.",
        status: "planned",
      },
    ],
  },
];

const ALL_KEYS = new Set(PARENT_PANEL_GROUPS.flatMap((g) => g.items.map((i) => i.key)));

export function isParentFeatureKey(key: string): boolean {
  return ALL_KEYS.has(key);
}

export function getParentFeatureByKey(key: string): ParentPanelItem | undefined {
  for (const g of PARENT_PANEL_GROUPS) {
    const f = g.items.find((i) => i.key === key);
    if (f) return f;
  }
  return undefined;
}
