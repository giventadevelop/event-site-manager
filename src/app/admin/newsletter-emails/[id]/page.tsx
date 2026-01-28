import { auth } from "@clerk/nextjs/server";
import { fetchNewsletterEmailTemplateServer } from '../ApiServerActions';
import NewsletterEmailTemplateEditClient from './NewsletterEmailTemplateEditClient';

export default async function PromotionEmailTemplateEditPage(
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  const { params } = props;
  const { userId } = await auth();

  if (!userId) {
    return <div>You must be logged in to view this page.</div>;
  }

  // Handle params for Next.js 15+ compatibility
  let templateId: string;
  if (typeof params.then === 'function') {
    const resolvedParams = await params;
    templateId = resolvedParams.id;
  } else {
    templateId = params.id;
  }

  const template = await fetchNewsletterEmailTemplateServer(Number(templateId));

  return (
    <NewsletterEmailTemplateEditClient
      template={template}
      templateId={Number(templateId)}
    />
  );
}







