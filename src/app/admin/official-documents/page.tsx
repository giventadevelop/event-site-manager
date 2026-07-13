import { effectiveTenantId } from '@/lib/env';
import OfficialDocumentsClient from './OfficialDocumentsClient';
import {
  fetchOfficialDocumentCategoriesServer,
  fetchOfficialDocumentYearBundlesServer,
  fetchTenantOfficialDocumentsPagedServer,
} from './ApiServerActions';

export const dynamic = 'force-dynamic';

const LIST_PAGE_SIZE = 20;

export default async function OfficialDocumentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tenant?: string }> | { tenant?: string };
}) {
  const resolved =
    searchParams && typeof (searchParams as Promise<{ tenant?: string }>).then === 'function'
      ? await (searchParams as Promise<{ tenant?: string }>)
      : ((searchParams as { tenant?: string } | undefined) ?? {});
  const tenantId = effectiveTenantId(resolved.tenant);

  const [categoryResult, docsPage, initialBundles] = await Promise.all([
    fetchOfficialDocumentCategoriesServer(tenantId),
    fetchTenantOfficialDocumentsPagedServer({ page: 0, size: LIST_PAGE_SIZE, tenantId }),
    fetchOfficialDocumentYearBundlesServer(tenantId),
  ]);

  return (
    <OfficialDocumentsClient
      initialCategories={categoryResult.categories}
      categorySource={categoryResult.source}
      categoryMessage={categoryResult.message}
      initialDocuments={docsPage.content}
      initialTotalElements={docsPage.totalElements}
      initialTotalPages={docsPage.totalPages}
      initialPage={docsPage.page}
      listPageSize={docsPage.size}
      initialBundles={initialBundles}
    />
  );
}
