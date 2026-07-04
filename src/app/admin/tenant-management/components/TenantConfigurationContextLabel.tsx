export interface TenantConfigurationContextLabelProps {
  tenantId?: string | null;
  organizationName?: string | null;
  className?: string;
}

/**
 * Shows which tenant an admin is configuring (matches settings detail page subtitle).
 */
export default function TenantConfigurationContextLabel({
  tenantId,
  organizationName,
  className = 'text-sm text-gray-600',
}: TenantConfigurationContextLabelProps) {
  const id = tenantId?.trim();
  if (!id) return null;

  const org = organizationName?.trim();

  return (
    <p className={className}>
      Configuration settings for tenant ID:{' '}
      <span className="font-mono font-medium text-gray-800">{id}</span>
      {org ? <span className="text-gray-500"> ({org})</span> : null}
    </p>
  );
}
