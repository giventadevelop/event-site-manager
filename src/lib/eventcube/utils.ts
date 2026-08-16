import type { EventDetailsDTO } from '@/types';
import { isTicketedFundraiserEvent } from '@/lib/donation/utils';

/**
 * Event Cube embed ticketing (optional field; not all tenants use Event Cube).
 */
export function isTicketedEventCube(event: EventDetailsDTO): boolean {
  if (event.admissionType?.toUpperCase() !== 'TICKETED') {
    return false;
  }
  return Boolean(event.eventcubeEmbedUrl?.trim());
}

/**
 * Ticketed event that sells via an external vendor URL (Zeffy, etc.).
 * Excludes Event Cube embed events when present (embed takes priority).
 */
export function isExternalTicketedEvent(event: EventDetailsDTO): boolean {
  if (event.admissionType?.toUpperCase() !== 'TICKETED') {
    return false;
  }
  if (isTicketedEventCube(event)) {
    return false;
  }
  return Boolean(event.externalTicketUrl?.trim());
}

export type BuyTicketsTarget =
  | { kind: 'internal'; href: string }
  | { kind: 'external'; href: string };

/**
 * Resolve Buy Tickets destination.
 * Priority: Event Cube embed → external ticket URL → ticketed fundraiser → internal Stripe/manual.
 *
 * Note: event-site-manager fundraiser checkout path is /donation-checkout (not givebutter-checkout).
 */
export function resolveBuyTicketsTarget(
  event: EventDetailsDTO,
  opts?: { internalPath?: 'checkout' | 'tickets' }
): BuyTicketsTarget | null {
  if (!event?.id) return null;
  if (event.admissionType?.toUpperCase() !== 'TICKETED') return null;

  if (isTicketedEventCube(event)) {
    return { kind: 'internal', href: `/events/${event.id}/eventcube-checkout` };
  }

  const externalUrl = event.externalTicketUrl?.trim();
  if (externalUrl) {
    return { kind: 'external', href: externalUrl };
  }

  if (isTicketedFundraiserEvent(event)) {
    return { kind: 'internal', href: `/events/${event.id}/donation-checkout` };
  }

  if (opts?.internalPath === 'tickets') {
    return { kind: 'internal', href: `/events/${event.id}/tickets` };
  }

  const checkoutRoute =
    event.manualPaymentEnabled === true &&
    (event.paymentFlowMode === 'MANUAL_ONLY' || event.paymentFlowMode === 'HYBRID')
      ? `/events/${event.id}/manual-checkout`
      : `/events/${event.id}/checkout`;

  return { kind: 'internal', href: checkoutRoute };
}
