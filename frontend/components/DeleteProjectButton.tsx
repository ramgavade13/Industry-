"use client";

export default function DeleteProjectButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Delete this project? This cannot be undone.")) e.preventDefault();
      }}
    >
      <button type="submit" className="text-xs text-[#8B93A7] hover:text-[#D65F5F] transition-colors">
        Delete
      </button>
    </form>
  );
}