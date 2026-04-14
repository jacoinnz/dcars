"use client";

import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Anchor,
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  clearSidebarConfig,
  countNavigableLinks,
  getDefaultSidebarConfig,
  loadSidebarConfig,
  normalizeSidebarConfigForUser,
  removeSidebarLinkById,
  saveSidebarConfig,
  updateSidebarLinkById,
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

  {
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
    <Paper ref={setNodeRef} style={style} withBorder shadow="sm" p="md" radius="md">
      <Group
        gap="xs"
        wrap="wrap"
        align="flex-end"
        pb={props.collapsed ? 0 : "sm"}
        style={
          props.collapsed
            ? undefined
            : { borderBottom: "1px solid var(--mantine-color-gray-2)" }
        }
      >
        <UnstyledButton
          type="button"
          style={{ cursor: "grab", touchAction: "none" }}
          aria-label="Drag section"
          {...attributes}
          {...listeners}
        >
          <Paper withBorder px="xs" py={6} bg="gray.0">
            <Text size="sm" c="dimmed">
              ⠿
            </Text>
          </Paper>
        </UnstyledButton>
        <Button type="button" size="compact-xs" variant="default" onClick={props.onToggleCollapsed}>
          {props.collapsed ? "Show" : "Hide"}
        </Button>
        <TextInput
          label="Section title"
          size="xs"
          style={{ flex: "1 1 12rem", minWidth: 0 }}
          value={props.section.title}
          onChange={(e) => props.onChangeTitle(e.target.value)}
          readOnly={Boolean(props.section.locked)}
          styles={{
            input: props.section.locked
              ? { backgroundColor: "var(--mantine-color-gray-1)" }
              : undefined,
          }}
        />
        {props.section.locked ? null : (
          <Button type="button" size="compact-xs" color="red" variant="light" onClick={props.onRemoveSection}>
            Remove section
          </Button>
        )}
      </Group>

      {props.collapsed ? (
        <Text mt="sm" size="xs" c="dimmed">
          {countNavigableLinks(props.section.items)} link(s)
        </Text>
      ) : (
        <>
          <SortableContext items={props.section.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <Stack component="ul" gap="xs" mt="md" p={0} style={{ listStyle: "none" }}>
              {props.section.items.map((item) => (
                <SortableLinkRow
                  key={item.id}
                  item={item}
                  onChange={(patch) => props.onChangeLink(item.id, patch)}
                  onRemove={() => props.onRemoveLink(item.id)}
                  onPatchLinkId={props.onChangeLink}
                  onRemoveLinkId={props.onRemoveLink}
                />
              ))}
            </Stack>
          </SortableContext>

          <Button
            type="button"
            variant="subtle"
            color="teal"
            size="compact-sm"
            mt="md"
            disabled={Boolean(props.section.locked)}
            onClick={props.onAddLink}
          >
            + Add link
          </Button>
        </>
      )}
    </Paper>
  );
}

function SortableLinkRow(props: {
  item: SidebarNavLink;
  onChange: (patch: Partial<SidebarNavLink>) => void;
  onRemove: () => void;
  onPatchLinkId: (linkId: string, patch: Partial<SidebarNavLink>) => void;
  onRemoveLinkId: (linkId: string) => void;
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
    <Paper
      component="li"
      ref={setNodeRef}
      style={style}
      p="xs"
      radius="sm"
      withBorder
      bg="gray.0"
    >
      <Group gap="xs" wrap="wrap" align="flex-end">
        <UnstyledButton
          type="button"
          style={{ cursor: "grab", touchAction: "none", alignSelf: "center" }}
          aria-label="Drag link"
          {...attributes}
          {...listeners}
        >
          <Paper withBorder px={6} py={4} bg="white">
            <Text size="xs" c="dimmed">
              ⠿
            </Text>
          </Paper>
        </UnstyledButton>
        <TextInput
          label="Label"
          size="xs"
          style={{ flex: "1 1 8rem", minWidth: 0 }}
          value={props.item.label}
          onChange={(e) => props.onChange({ label: e.target.value })}
          readOnly={Boolean(props.item.locked)}
          styles={{
            label: { fontSize: 10 },
            input: props.item.locked
              ? { backgroundColor: "var(--mantine-color-gray-1)" }
              : undefined,
          }}
        />
        {props.item.locked ? null : (
          <Button type="button" size="compact-xs" variant="default" onClick={props.onRemove}>
            Remove
          </Button>
        )}
      </Group>
      {props.item.children?.length ? (
        <Stack gap="xs" mt="sm" pl="md" style={{ borderLeft: "2px solid var(--mantine-color-teal-3)" }}>
          <Text size="xs" c="teal" fw={600}>
            Nested links
          </Text>
          {props.item.children.map((ch) => (
            <Group key={ch.id} gap="xs" wrap="wrap" align="flex-end">
              <TextInput
                label="Label"
                size="xs"
                style={{ flex: "1 1 8rem", minWidth: 0 }}
                value={ch.label}
                onChange={(e) => props.onPatchLinkId(ch.id, { label: e.target.value })}
                readOnly={Boolean(ch.locked)}
                styles={{
                  label: { fontSize: 10 },
                  input: ch.locked ? { backgroundColor: "var(--mantine-color-gray-1)" } : undefined,
                }}
              />
              {ch.locked ? null : (
                <Button
                  type="button"
                  size="compact-xs"
                  variant="default"
                  onClick={() => props.onRemoveLinkId(ch.id)}
                >
                  Remove
                </Button>
              )}
            </Group>
          ))}
        </Stack>
      ) : null}
    </Paper>
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
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate from localStorage after mount (client-only) */
    setConfig(next);
    setCollapsed((prev) => {
      const out = { ...prev };
      for (const s of next.sections) {
        if (out[s.id] === undefined) out[s.id] = true;
      }
      for (const k of Object.keys(out)) {
        if (!next.sections.some((s) => s.id === k)) delete out[k];
      }
      return out;
    });
    /* eslint-enable react-hooks/set-state-in-effect */
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
    <Box component="div" mx="auto" maw={720} w="100%" px="md" py="xl" style={{ flex: 1 }}>
      <Anchor component={Link} href="/dashboard" size="sm" fw={500}>
        ← Back to dashboard
      </Anchor>
      <Title order={1} mt="md" size="h2">
        Sidebar manager
      </Title>
      <Text mt="sm" size="sm" c="dimmed" maw={640}>
        Drag sections and links to reorder. Add sections or links for the left menu. Your layout is stored in
        this browser (localStorage). The Administration block is always shown for super admins and is not
        edited here.
      </Text>

      <Group gap="xs" wrap="wrap" mt="lg">
        <Button
          type="button"
          variant="default"
          onClick={() => setCollapsed(nextCollapsedMap(config.sections, false))}
        >
          Expand all
        </Button>
        <Button
          type="button"
          variant="default"
          onClick={() => setCollapsed(nextCollapsedMap(config.sections, true))}
        >
          Collapse all
        </Button>
        <Button
          type="button"
          color="teal"
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
        </Button>
        <Button
          type="button"
          variant="default"
          onClick={() => {
            persist(getDefaultSidebarConfig({ isSuperAdmin: props.isSuperAdmin }));
            setCollapsed(
              nextCollapsedMap(
                getDefaultSidebarConfig({ isSuperAdmin: props.isSuperAdmin }).sections,
                true,
              ),
            );
          }}
        >
          Reset to default
        </Button>
        <Button
          type="button"
          color="red"
          variant="light"
          onClick={() => {
            clearSidebarConfig();
            setConfig(getDefaultSidebarConfig({ isSuperAdmin: props.isSuperAdmin }));
            setCollapsed(
              nextCollapsedMap(
                getDefaultSidebarConfig({ isSuperAdmin: props.isSuperAdmin }).sections,
                true,
              ),
            );
          }}
        >
          Clear saved layout
        </Button>
      </Group>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={config.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <Stack gap="md" mt="xl">
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
                    items: updateSidebarLinkById(s.items, linkId, patch),
                  }));
                }}
                onRemoveLink={(linkId) => {
                  updateSection(section.id, (s) => ({
                    ...s,
                    items: removeSidebarLinkById(s.items, linkId),
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
          </Stack>
        </SortableContext>
      </DndContext>
    </Box>
  );
}
