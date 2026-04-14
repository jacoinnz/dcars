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
  saveSidebarConfig,
  type SidebarNavConfig,
  type SidebarNavLink,
  type SidebarNavSection,
} from "@/lib/sidebar-config";

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
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-100 pb-3">
        <button
          type="button"
          className="cursor-grab touch-none rounded border border-stone-200 bg-stone-50 px-2 py-1.5 text-stone-500 hover:bg-stone-100 active:cursor-grabbing"
          aria-label="Drag section"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        <label className="min-w-0 flex-1 text-xs font-medium text-stone-600">
          Section title
          <input
            value={props.section.title}
            onChange={(e) => props.onChangeTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm text-stone-900"
          />
        </label>
        <button
          type="button"
          className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-800 hover:bg-red-100"
          onClick={props.onRemoveSection}
        >
          Remove section
        </button>
      </div>

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
        className="mt-3 text-sm font-semibold text-teal-800 hover:underline"
        onClick={props.onAddLink}
      >
        + Add link
      </button>
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
          className="mt-0.5 w-full rounded border border-stone-300 px-2 py-1 text-sm"
        />
      </label>
      <label className="min-w-[8rem] flex-1 text-[10px] font-medium text-stone-500">
        Path
        <input
          value={props.item.href}
          onChange={(e) => props.onChange({ href: e.target.value })}
          className="mt-0.5 w-full rounded border border-stone-300 px-2 py-1 font-mono text-sm"
          placeholder="/path"
        />
      </label>
      <button
        type="button"
        className="self-center rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-600 hover:bg-stone-100"
        onClick={props.onRemove}
      >
        Remove
      </button>
    </li>
  );
}

export function SidebarManagerClient() {
  const [config, setConfig] = useState<SidebarNavConfig>(() => getDefaultSidebarConfig());

  useEffect(() => {
    setConfig(loadSidebarConfig() ?? getDefaultSidebarConfig());
  }, []);

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
            persist(getDefaultSidebarConfig());
          }}
        >
          Reset to default
        </button>
        <button
          type="button"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-900 hover:bg-red-100"
          onClick={() => {
            clearSidebarConfig();
            setConfig(getDefaultSidebarConfig());
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
