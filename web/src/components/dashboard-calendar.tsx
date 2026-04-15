"use client";

import "./dashboard-calendar.css";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { formatISO } from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  NativeSelect,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";

type CalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek" | "listDay";

type CalendarInstitution = { id: string; name: string; siteName: string; canManage: boolean };

type CalendarEvent = {
  id: string;
  title: string;
  start: string; // ISO
  end?: string; // ISO
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps?: {
    source: "institution_notice" | "notice_board";
    institutionId?: string;
    noticeType?: string;
    body?: string;
    readOnly?: boolean;
  };
};

function ymd(d: Date): string {
  return formatISO(d, { representation: "date" });
}

function nextDayYmd(d: Date): string {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + 1);
  return ymd(nd);
}

export function DashboardCalendar() {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [view, setView] = useState<CalendarView>("dayGridMonth");
  const [institutions, setInstitutions] = useState<CalendarInstitution[]>([]);
  const [institutionId, setInstitutionId] = useState<string>("all");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [draftInstitutionId, setDraftInstitutionId] = useState<string>("");
  const [draftType, setDraftType] = useState<"holiday" | "event" | "out_of_class">("event");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftStart, setDraftStart] = useState(ymd(new Date()));
  const [draftEnd, setDraftEnd] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const manageableIds = useMemo(
    () => new Set(institutions.filter((i) => i.canManage).map((i) => i.id)),
    [institutions],
  );

  const canEditForDraftInstitution = Boolean(draftInstitutionId && manageableIds.has(draftInstitutionId));

  const openCreateModalForDate = useCallback(
    (date: Date) => {
      setEditingId(null);
      setReadOnly(false);
      setSaveError(null);
      setDraftTitle("");
      setDraftBody("");
      setDraftType("event");
      setDraftStart(ymd(date));
      setDraftEnd("");
      const fallbackInst =
        institutionId !== "all"
          ? institutionId
          : (institutions.find((i) => i.canManage)?.id ?? institutions[0]?.id ?? "");
      setDraftInstitutionId(fallbackInst);
      setModalOpen(true);
    },
    [institutionId, institutions],
  );

  const openEditModalForEvent = useCallback(
    (ev: CalendarEvent) => {
      setSaveError(null);
      setEditingId(ev.id);
      const ro = Boolean(ev.extendedProps?.readOnly);
      setReadOnly(ro);
      setDraftTitle(ev.title ?? "");
      setDraftBody(ev.extendedProps?.body ?? "");
      setDraftType((ev.extendedProps?.noticeType as any) ?? "event");

      const startDate = ev.start ? new Date(ev.start) : new Date();
      const endDate = ev.end ? new Date(ev.end) : null;
      setDraftStart(ymd(startDate));
      // For all-day ranges, FullCalendar commonly stores end as exclusive.
      setDraftEnd(endDate ? ymd(new Date(endDate.getTime() - 24 * 60 * 60 * 1000)) : "");

      const inst = ev.extendedProps?.institutionId ?? "";
      setDraftInstitutionId(inst);
      setModalOpen(true);
    },
    [],
  );

  const applyView = useCallback(
    (next: CalendarView) => {
      setView(next);
      const api = calendarRef.current?.getApi?.();
      if (api) api.changeView(next);
    },
    [],
  );

  const fetchInstitutions = useCallback(async () => {
    try {
      const res = await fetch("/api/calendar/institutions", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load schools (${res.status})`);
      const data = (await res.json()) as { institutions: CalendarInstitution[] };
      setInstitutions(data.institutions ?? []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load schools.");
    }
  }, []);

  const fetchEventsForCurrentRange = useCallback(async () => {
    const api = calendarRef.current?.getApi?.();
    if (!api) return;
    const start = api.view.activeStart;
    const end = api.view.activeEnd;
    const params = new URLSearchParams();
    params.set("from", ymd(start));
    params.set("to", ymd(end));
    if (institutionId !== "all") params.set("institutionId", institutionId);

    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/calendar/events?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load events (${res.status})`);
      const data = (await res.json()) as { events: CalendarEvent[] };
      setEvents(data.events ?? []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load events.");
    } finally {
      setLoading(false);
    }
  }, [institutionId]);

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  useEffect(() => {
    // Once mounted, FullCalendar sets an initial range; load events for it.
    queueMicrotask(() => {
      fetchEventsForCurrentRange();
    });
  }, [fetchEventsForCurrentRange]);

  useEffect(() => {
    // When institution filter changes, refresh for the current visible range.
    fetchEventsForCurrentRange();
  }, [institutionId, fetchEventsForCurrentRange]);

  const onSave = useCallback(async () => {
    setSaveError(null);
    if (!draftInstitutionId) {
      setSaveError("Pick a school.");
      return;
    }
    if (!draftTitle.trim()) {
      setSaveError("Title is required.");
      return;
    }

    // Permission hint (server also enforces).
    if (!manageableIds.has(draftInstitutionId)) {
      setSaveError("You do not have permission to edit events for this school.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: editingId,
        institutionId: draftInstitutionId,
        noticeType: draftType,
        title: draftTitle.trim(),
        body: draftBody.trim(),
        startDate: draftStart || null,
        endDate: draftEnd || null,
      };

      const res = await fetch("/api/calendar/events", {
        method: editingId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || data.ok === false) throw new Error(data.error || `Save failed (${res.status})`);

      setModalOpen(false);
      await fetchEventsForCurrentRange();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }, [
    draftInstitutionId,
    draftType,
    draftTitle,
    draftBody,
    draftStart,
    draftEnd,
    editingId,
    manageableIds,
    fetchEventsForCurrentRange,
  ]);

  const institutionSelectData = useMemo(() => {
    return [
      { value: "all", label: "All schools" },
      ...institutions.map((i) => ({ value: i.id, label: `${i.name} — ${i.siteName}` })),
    ];
  }, [institutions]);

  const draftInstitutionData = useMemo(() => {
    return [
      { value: "", label: "Select school", disabled: true },
      ...institutions.map((i) => ({ value: i.id, label: `${i.name} — ${i.siteName}` })),
    ];
  }, [institutions]);

  const selectedInstitutionCanManage =
    institutionId !== "all" ? manageableIds.has(institutionId) : institutions.some((i) => i.canManage);

  // Basic double-click detection: FullCalendar provides single-click events,
  // so we detect rapid repeat within a short window.
  const lastClickRef = useRef<{ key: string; at: number } | null>(null);
  const isDoubleClick = useCallback((key: string) => {
    const now = Date.now();
    const prev = lastClickRef.current;
    lastClickRef.current = { key, at: now };
    return Boolean(prev && prev.key === key && now - prev.at < 350);
  }, []);

  return (
    <Paper withBorder radius="md" p="md" shadow="sm" bg="gray.0" style={{ minHeight: "min(22rem, 55vh)" }}>
      <Stack gap="sm">
        <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
          <Group gap="sm" align="flex-end" wrap="wrap">
            <Select
              label="View"
              value={view}
              onChange={(v) => {
                if (!v) return;
                applyView(v as CalendarView);
              }}
              data={[
                { value: "dayGridMonth", label: "Month" },
                { value: "timeGridWeek", label: "Week" },
                { value: "timeGridDay", label: "Day" },
                { value: "listWeek", label: "List (week)" },
                { value: "listDay", label: "List (day)" },
              ]}
              size="sm"
              allowDeselect={false}
              w={180}
            />
            <Select
              label="School"
              value={institutionId}
              onChange={(v) => setInstitutionId(v || "all")}
              data={institutionSelectData}
              size="sm"
              allowDeselect={false}
              w={320}
            />
          </Group>
          <Group gap="sm" align="flex-end">
            <Button
              type="button"
              variant="light"
              color="dark"
              size="sm"
              onClick={() => fetchEventsForCurrentRange()}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              type="button"
              color="teal"
              size="sm"
              disabled={!selectedInstitutionCanManage}
              onClick={() => openCreateModalForDate(new Date())}
            >
              Add event
            </Button>
          </Group>
        </Group>

        {loadError ? (
          <Alert color="yellow" title="Calendar" variant="light">
            {loadError}
          </Alert>
        ) : null}

        <div style={{ background: "white", borderRadius: "var(--mantine-radius-md)", padding: 8 }}>
          <FullCalendar
            ref={calendarRef as any}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView={view}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "",
            }}
            height="auto"
            nowIndicator
            selectable={selectedInstitutionCanManage}
            events={events as any}
            eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
            datesSet={() => {
              fetchEventsForCurrentRange();
            }}
            dateClick={(arg) => {
              if (!selectedInstitutionCanManage) return;
              const key = `d:${arg.dateStr}`;
              if (isDoubleClick(key)) openCreateModalForDate(arg.date);
            }}
            eventClick={(arg) => {
              const src = (arg.event.extendedProps as any)?.source ?? "institution_notice";
              const key = `e:${src}:${arg.event.id}`;
              if (!isDoubleClick(key)) return;

              const ev: CalendarEvent = {
                id: String(arg.event.id),
                title: arg.event.title,
                start: arg.event.start?.toISOString?.() ?? new Date().toISOString(),
                end: arg.event.end?.toISOString?.(),
                allDay: arg.event.allDay,
                extendedProps: arg.event.extendedProps as any,
              };
              openEditModalForEvent(ev);
            }}
          />
        </div>
      </Stack>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? (readOnly ? "Event details" : "Edit event") : "Add event"}
        centered
        size="lg"
      >
        <Stack gap="sm">
          {readOnly ? (
            <Alert color="blue" variant="light" title="Read only">
              This event is informational and can’t be edited here.
            </Alert>
          ) : null}
          {saveError ? (
            <Alert color="red" variant="light" title="Could not save">
              {saveError}
            </Alert>
          ) : null}

          <NativeSelect
            label="School"
            data={draftInstitutionData as any}
            value={draftInstitutionId}
            onChange={(e) => setDraftInstitutionId(e.currentTarget.value)}
            disabled={readOnly || Boolean(editingId)}
            required
          />
          {!readOnly && !canEditForDraftInstitution ? (
            <Text size="xs" c="dimmed">
              You can only add/edit events for schools where you are assigned as staff.
            </Text>
          ) : null}

          <NativeSelect
            label="Type"
            value={draftType}
            onChange={(e) => setDraftType(e.currentTarget.value as any)}
            data={[
              { value: "event", label: "Event" },
              { value: "holiday", label: "Holiday" },
              { value: "out_of_class", label: "Out of class" },
            ]}
            disabled={readOnly}
            required
          />
          <TextInput
            label="Title"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.currentTarget.value)}
            required
            disabled={readOnly}
          />
          <Textarea
            label="Details"
            value={draftBody}
            onChange={(e) => setDraftBody(e.currentTarget.value)}
            minRows={3}
            disabled={readOnly}
          />

          <Group grow align="flex-end">
            <TextInput
              type="date"
              label="Start date"
              value={draftStart}
              onChange={(e) => setDraftStart(e.currentTarget.value)}
              required
              disabled={readOnly}
            />
            <TextInput
              type="date"
              label="End date"
              value={draftEnd}
              onChange={(e) => setDraftEnd(e.currentTarget.value)}
              placeholder="Optional"
              disabled={readOnly}
            />
          </Group>

          {!readOnly ? (
            <Group justify="flex-end" mt="sm">
              <Button variant="default" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button color="teal" onClick={onSave} loading={saving} disabled={!canEditForDraftInstitution}>
                Save
              </Button>
            </Group>
          ) : (
            <Group justify="flex-end" mt="sm">
              <Button variant="default" onClick={() => setModalOpen(false)}>
                Close
              </Button>
            </Group>
          )}
        </Stack>
      </Modal>
    </Paper>
  );
}

