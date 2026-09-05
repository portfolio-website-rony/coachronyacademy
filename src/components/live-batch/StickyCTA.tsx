import { useEffect, useState } from "react";

export function StickyCTA({ label, targetId }: { label: string; targetId: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Desktop — appears after hero */}
      <div
        className={`fixed bottom-6 right-6 z-40 hidden transition-all duration-300 md:block ${
          show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={go}
          className="rounded-xl bg-gradient-primary px-6 py-3.5 font-mont text-sm font-semibold tracking-tight text-background shadow-glow transition hover:opacity-90"
        >
          {label}
        </button>
      </div>

      {/* Mobile — fixed bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-background/90 p-3 backdrop-blur-md md:hidden">
        <button
          type="button"
          onClick={go}
          className="w-full rounded-xl bg-gradient-primary px-6 py-3.5 font-mont text-sm font-semibold tracking-tight text-background shadow-glow"
        >
          {label}
        </button>
      </div>
    </>
  );
}
