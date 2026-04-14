export const NOTICE_TYPES = [
  { id: "holiday", label: "Holiday / closure" },
  { id: "event", label: "School event" },
  { id: "out_of_class", label: "Out-of-class" },
] as const;

export type NoticeTypeId = (typeof NOTICE_TYPES)[number]["id"];

export function isNoticeType(s: string): s is NoticeTypeId {
  return (NOTICE_TYPES as readonly { id: string }[]).some((t) => t.id === s);
}

export function noticeTypeLabel(id: string): string {
  const t = NOTICE_TYPES.find((x) => x.id === id);
  return t?.label ?? id;
}
