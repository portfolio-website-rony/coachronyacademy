import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_client/client/payments")({
  component: () => (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Payments</h1>
      <div className="glass rounded-2xl p-6">
        <p className="text-sm text-muted-foreground">Invoices and payment history will appear here.</p>
      </div>
    </div>
  ),
});
