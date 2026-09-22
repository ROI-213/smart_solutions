import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — Smart Solutions" }] }),
  component: () => <Navigate to="/admin/dashboard" replace />,
});
