import { DndContext,  closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FieldEditor } from "./FieldEditor";
import type { FormField } from "../../types";

interface FieldsListProps {
  fields: FormField[];
  updateField: (id: string, updates: Partial<FormField>) => void;
  deleteField: (id: string) => void;
  duplicateField: (id: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

function SortableFieldItem({
  field,
  index,
  updateField,
  deleteField,
  duplicateField,
  allFields,
}: {
  field: FormField;
  index: number;
  updateField: (id: string, updates: Partial<FormField>) => void;
  deleteField: (id: string) => void;
  duplicateField: (id: string) => void;
  allFields: FormField[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <FieldEditor
        field={field}
        index={index}
        updateField={updateField}
        deleteField={deleteField}
        duplicateField={duplicateField}
        allFields={allFields}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export function FieldsList({
  fields,
  updateField,
  deleteField,
  duplicateField,
  onDragEnd,
}: FieldsListProps) {
  if (fields.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-xl border-2 border-dashed"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border-light)",
        }}
      >
        <p
          className="text-lg font-medium mb-2"
          style={{ color: "var(--text-secondary)" }}
        >
          No fields yet
        </p>
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          Add fields below to start building your form
        </p>
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <SortableFieldItem
              key={field.id}
              field={field}
              index={index}
              updateField={updateField}
              deleteField={deleteField}
              duplicateField={duplicateField}
              allFields={fields}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
