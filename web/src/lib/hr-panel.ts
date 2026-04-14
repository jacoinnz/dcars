/** Human resources menu: live routes vs planned (`/hr/feature/[key]`). */

export type HrPanelStatus = "live" | "planned";

export type HrPanelItem = {
  key: string;
  title: string;
  description: string;
  status: HrPanelStatus;
  href?: string;
};

export type HrPanelGroup = {
  id: string;
  title: string;
  description?: string;
  items: HrPanelItem[];
};

export const HR_PANEL_GROUPS: HrPanelGroup[] = [
  {
    id: "directory",
    title: "Staff directory",
    description: "Who is assigned to which school today.",
    items: [
      {
        key: "staff-directory",
        title: "Staff directory",
        description:
          "Teachers and management linked to each institution you can see, with school and site names.",
        status: "live",
        href: "/hr/directory",
      },
    ],
  },
  {
    id: "staff-attendance",
    title: "Staff attendance",
    description:
      "Employee clock-in, shifts, and absence — separate from student roll (not implemented yet).",
    items: [
      {
        key: "staff-attendance",
        title: "Staff attendance",
        description:
          "Record daily staff presence, lateness, or leave per site — planned (needs HR policy and data model).",
        status: "planned",
      },
      {
        key: "staff-attendance-report",
        title: "Staff attendance report",
        description:
          "Filter and export staff attendance by person, role, school, or date range — planned.",
        status: "planned",
      },
    ],
  },
  {
    id: "payroll",
    title: "Payroll",
    description: "Salary and deductions — planned with finance integration.",
    items: [
      {
        key: "payroll",
        title: "Payroll",
        description:
          "Pay runs, pay components, and approvals — planned (requires payroll engine or export to payroll bureau).",
        status: "planned",
      },
      {
        key: "payroll-report",
        title: "Payroll report",
        description:
          "Summaries for accounting, audits, and bank files — planned alongside payroll processing.",
        status: "planned",
      },
    ],
  },
];

const ALL_KEYS = new Set(HR_PANEL_GROUPS.flatMap((g) => g.items.map((i) => i.key)));

export function isHrFeatureKey(key: string): boolean {
  return ALL_KEYS.has(key);
}

export function getHrFeatureByKey(key: string): HrPanelItem | undefined {
  for (const g of HR_PANEL_GROUPS) {
    const f = g.items.find((i) => i.key === key);
    if (f) return f;
  }
  return undefined;
}
