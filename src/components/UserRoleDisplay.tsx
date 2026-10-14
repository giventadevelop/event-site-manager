'use client';

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { BRAND_NAME } from "@/lib/brand";

const ORG_NAME = BRAND_NAME;

export function UserRoleDisplay() {
  const { user, isLoaded: userLoaded } = useUser();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRole() {
      if (!userLoaded) return;
      if (!user) return;
      try {
        const memberships = await user.getOrganizationMemberships();
        const targetOrgMembership = memberships.find(
          (membership: any) => membership.organization.name === ORG_NAME
        );
        setRole(targetOrgMembership?.role || "user");
      } catch {
        setRole("user");
      }
    }
    fetchRole();
  }, [user, userLoaded]);

  if (!userLoaded) return null;
  if (!user) return null;
  if (!role) return null;

  return (
    <div className="mb-4 text-center text-lg text-blue-700 font-semibold">Role: {role}</div>
  );
}