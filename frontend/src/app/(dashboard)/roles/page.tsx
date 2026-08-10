"use client";
import { RolesManager } from "@/features/rbac/RolesManager";
import { RoleGuard } from "@/components/Guards";

export default function RolesPage() {
  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <RolesManager />
    </RoleGuard>
  );
}
