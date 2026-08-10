"use client";
import { UsersList } from "@/features/users/UsersList";
import { RoleGuard } from "@/components/Guards";

export default function UsersPage() {
  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <UsersList />
    </RoleGuard>
  );
}
