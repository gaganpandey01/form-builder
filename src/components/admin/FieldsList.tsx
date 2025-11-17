import React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,

} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
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

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined,
  };

  const dragHandleProps = { ...attributes, ...listeners };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <FieldEditor
        field={field}
        index={index}
        updateField={updateField}
        deleteField={deleteField}
        allFields={allFields}
        isDragging={isDragging}
        dragHandleProps={dragHandleProps}
        duplicateField={duplicateField}
      />
    </div>
  );
}

export const FieldsList: React.FC<FieldsListProps> = ({
  fields,
  updateField,
  deleteField,
  duplicateField,
  onDragEnd,
}) => {
  const sensors = useSensors(useSensor(PointerSensor));
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={fields.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
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
          {fields.length === 0 && (
            <div
              className="text-center py-8 sm:py-12 border-2 border-dashed rounded-lg"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
            >
              <p className="text-sm sm:text-base">
                No fields added yet. Add your first field below.
              </p>
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
};
