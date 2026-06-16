import { MessageCircle, Send } from "lucide-react";

const WHATSAPP = "https://wa.me/8801960254383?text=Hi%20CoachRony%2C%20I%27m%20interested%20in%20your%20programs.";
const MESSENGER = "https://m.me/coachrony";

export function FloatingActions() {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
      <a
        href={MESSENGER}
        target="_blank"
        rel="noreferrer"
        aria-label="Messenger"
        className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground shadow-glow-blue transition hover:scale-110"
      >
        <Send className="h-5 w-5" />
      </a>
      <a
        href={WHATSAPP}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        className="grid h-14 w-14 place-items-center rounded-full bg-[oklch(0.72_0.18_152)] text-background shadow-glow transition hover:scale-110"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}
