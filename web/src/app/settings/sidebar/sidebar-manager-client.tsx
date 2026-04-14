"use client";

import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  clearSidebarConfig,
  getDefaultSidebarConfig,
  loadSidebarConfig,
  normalizeSidebarConfigForUser,
  saveSidebarConfig,
  type SidebarNavConfig,
  type SidebarNavLink,
  type SidebarNavSection,
} from "@/lib/sidebar-config";

function nextCollapsedMap(sections: SidebarNavSection[], defaultCollapsed: boolean) {
  const out: Record<string, boolean> = {};
  for (const s of sections) out[s.id] = defaultCollapsed;
  return out;
}

function applyDragEnd(prev: SidebarNavConfig, e: DragEndEvent): SidebarNavConfig | null {
  const { active, over } = e;
  if (!over || active.id === over.id) return null;
  const aid = String(active.id);
  const oid = String(over.id);

  if (aid.startsWith("sec-") && oid.startsWith("sec-")) {
    const oldIndex = prev.sections.findIndex((s) => s.id === aid);
    const newIndex = prev.sections.findIndex((s) => s.id === oid);
    if (oldIndex < 0 || newIndex < 0) return null;
    return { ...prev, sections: arrayMove(prev.sections, oldIndex, newIndex) };
  }

  if (aid.startsWith("lnk-") && oid.startsWith("lnk-")) {
    const secIdx = prev.sections.findIndex((s) => s.items.some((i) => i.id === aid));
    if (secIdx < 0) return null;
    const sec = prev.sections[secIdx];
    if (!sec.items.some((i) => i.id === oid)) return null;
    const oldIndex = sec.items.findIndex((i) => i.id === aid);
    const newIndex = sec.items.findIndex((i) => i.id === oid);
    if (oldIndex < 0 || newIndex < 0) return null;
    const nextItems = arrayMove(sec.items, oldIndex, newIndex);
    const sections = [...prev.sections];
    sections[secIdx] = { ...sec, items: nextItems };
    return { ...prev, sections };
  }

  return null;
}

function SortableSectionCard(props: {
  section: SidebarNavSection;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onChangeTitle: (title: string) => void;
  onRemoveSection: () => void;
  onChangeLink: (linkId: string, patch: Partial<SidebarNavLink>) => void;
  onRemoveLink: (linkId: string) => void;
  onAddLink: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.section.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
    >
      <div className={`flex flex-wrap items-center gap-2 ${props.collapsed ? "" : "border-b border-stone-100 pb-3"}`}>
        <button
          type="button"
          className="cursor-grab touch-none rounded border border-stone-200 bg-stone-50 px-2 py-1.5 text-stone-500 hover:bg-stone-100 active:cursor-grabbing"
          aria-label="Drag section"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        <button
          type="button"
          className="rounded border border-stone-200 bg-white px-2 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
          onClick={props.onToggleCollapsed}
          aria-label={props.collapsed ? "Expand section" : "Collapse section"}
        >
          {props.collapsed ? "Show" : "Hide"}
        </button>
        <label className="min-w-0 flex-1 text-xs font-medium text-stone-600">
          Section title
          <input
            value={props.section.title}
            onChange={(e) => props.onChangeTitle(e.target.value)}
            readOnly={Boolean(props.section.locked)}
            className={`mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm text-stone-900 ${
              props.section.locked ? "bg-stone-100 text-stone-600" : "bg-white"
            }`}
          />
        </label>
        {props.section.locked ? null : (
          <button
            type="button"
            className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-800 hover:bg-red-100"
            onClick={props.onRemoveSection}
          >
            Remove section
          </button>
        )}
      </div>

      {props.collapsed ? (
        <p className="mt-2 text-xs text-stone-500">
          {props.section.items.length} link(s)
        </p>
      ) : (
        <>
          <SortableContext items={props.section.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <ul className="mt-3 space-y-2">
              {props.section.items.map((item) => (
                <SortableLinkRow
                  key={item.id}
                  item={item}
                  onChange={(patch) => props.onChangeLink(item.id, patch)}
                  onRemove={() => props.onRemoveLink(item.id)}
                />
              ))}
            </ul>
          </SortableContext>

          <button
            type="button"
            className={`mt-3 text-sm font-semibold ${
              props.section.locked ? "cursor-not-allowed text-stone-400" : "text-teal-800 hover:underline"
            }`}
            onClick={props.onAddLink}
            disabled={Boolean(props.section.locked)}
          >
            + Add link
          </button>
        </>
      )}
    </div>
  );
}

function SortableLinkRow(props: {
  item: SidebarNavLink;
  onChange: (patch: Partial<SidebarNavLink>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="flex flex-wrap items-end gap-2 rounded-lg bg-stone-50/80 p-2">
      <button
        type="button"
        className="cursor-grab touch-none self-center rounded border border-stone-200 bg-white px-1.5 py-1 text-stone-500"
        aria-label="Drag link"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <label className="min-w-[8rem] flex-1 text-[10px] font-medium text-stone-500">
        Label
        <input
          value={props.item.label}
          onChange={(e) => props.onChange({ label: e.target.value })}
          readOnly={Boolean(props.item.locked)}
          className={`mt-0.5 w-full rounded border border-stone-300 px-2 py-1 text-sm ${
            props.item.locked ? "bg-stone-100 text-stone-600" : "bg-white"
          }`}
        />
      </label>
      {props.item.locked ? null : (
        <button
          type="button"
          className="self-center rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-600 hover:bg-stone-100"
          onClick={props.onRemove}
        >
          Remove
        </button>
      )}
    </li>
  );
}

export function SidebarManagerClient(props: { isSuperAdmin: boolean }) {
  const [config, setConfig] = useState<SidebarNavConfig>(() =>
    getDefaultSidebarConfig({ isSuperAdmin: props.isSuperAdmin }),
  );
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    nextCollapsedMap(config.sections, true),
  );

  useEffect(() => {
    const raw =
      loadSidebarConfig() ?? getDefaultSidebarConfig({ isSuperAdmin: props.isSuperAdmin });
    const next = normalizeSidebarConfigForUser(raw, { isSuperAdmin: props.isSuperAdmin });
    setConfig(next);
    setCollapsed((prev) => {
      const out = { ...prev };
      for (const s of next.sections) {
        if (out[s.id] === undefined) out[s.id] = true;
      }
      // prune removed sections
      for (const k of Object.keys(out)) {
        if (!next.sections.some((s) => s.id === k)) delete out[k];
      }
      return out;
    });
  }, [props.isSuperAdmin]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function persist(next: SidebarNavConfig) {
    setConfig(next);
    saveSidebarConfig(next);
  }

  function updateSection(sectionId: string, fn: (s: SidebarNavSection) => SidebarNavSection) {
    const sections = config.sections.map((s) => (s.id === sectionId ? fn(s) : s));
    persist({ ...config, sections });
  }

  function onDragEnd(e: DragEndEvent) {
    setConfig((prev) => {
      const next = applyDragEnd(prev, e);
      if (!next) return prev;
      saveSidebarConfig(next);
      return next;
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link href="/dashboard" className="text-sm font-medium text-teal-800 underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-stone-900">Sidebar manager</h1>
      <p className="mt-2 max-w-2xl text-sm text-stone-600">
        Drag sections and links to reorder. Add sections or links for the left menu. Your layout is stored in
        this browser (localStorage). The Administration block is always shown for super admins and is not
        edited here.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50"
          onClick={() => setCollapsed(nextCollapsedMap(config.sections, false))}
        >
          Expand all
        </button>
        <button
          type="button"
          className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50"
          onClick={() => setCollapsed(nextCollapsedMap(config.sections, true))}
        >
          Collapse all
        </button>
        <button
          type="button"
          className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
          onClick={() => {
            const id = `sec-${crypto.randomUUID()}`;
            persist({
              ...config,
              sections: [
                ...config.sections,
                {
                  id,
                  title: "New section",
                  items: [{ id: `lnk-${crypto.randomUUID()}`, href: "/", label: "New link" }],
                },
              ],
            });
          }}
        >
          Add section
        </button>
        <button
          type="button"
          className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50"
          onClick={() => {
            persist(getDefaultSidebarConfig({ isSuperAdmin: props.isSuperAdmin }));
            setCollapsed(nextCollapsedMap(getDefaultSidebarConfig({ isSuperAdmin: props.isSuperAdmin }).sections, true));
          }}
        >
          Reset to default
        </button>
        <button
          type="button"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-900 hover:bg-red-100"
          onClick={() => {
            clearSidebarConfig();
            setConfig(getDefaultSidebarConfig({ isSuperAdmin: props.isSuperAdmin }));
            setCollapsed(nextCollapsedMap(getDefaultSidebarConfig({ isSuperAdmin: props.isSuperAdmin }).sections, true));
          }}
        >
          Clear saved layout
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={config.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="mt-8 flex flex-col gap-4">
            {config.sections.map((section) => (
              <SortableSectionCard
                key={section.id}
                section={section}
                collapsed={collapsed[section.id] ?? true}
                onToggleCollapsed={() =>
                  setCollapsed((prev) => ({ ...prev, [section.id]: !(prev[section.id] ?? true) }))
                }
                onChangeTitle={(title) => updateSection(section.id, (s) => ({ ...s, title }))}
                onRemoveSection={() => {
                  if (!confirm(`Remove section “${section.title}” and all its links?`)) return;
                  persist({
                    ...config,
                    sections: config.sections.filter((x) => x.id !== section.id),
                  });
                }}
                onChangeLink={(linkId, patch) => {
                  updateSection(section.id, (s) => ({
                    ...s,
                    items: s.items.map((it) => (it.id === linkId ? { ...it, ...patch } : it)),
                  }));
                }}
                onRemoveLink={(linkId) => {
                  updateSection(section.id, (s) => ({
                    ...s,
                    items: s.items.filter((it) => it.id !== linkId),
                  }));
                }}
                onAddLink={() => {
                  updateSection(section.id, (s) => ({
                    ...s,
                    items: [...s.items, { id: `lnk-${crypto.randomUUID()}`, href: "/", label: "New link" }],
                  }));
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
