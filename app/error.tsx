"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <button
        onClick={() => reset()}
        className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
      >
        Try again
      </button>
    </div>
  );
}
