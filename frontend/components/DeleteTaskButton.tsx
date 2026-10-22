"use client";

export default function DeleteTaskButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Delete this task? This cannot be undone.")) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="text-xs font-semibold text-muted hover:text-danger hover:bg-danger-subtle px-2.5 py-1 rounded-lg border border-transparent hover:border-danger-border transition-colors"
      >
        Delete
      </button>
    </form>
  );
}
