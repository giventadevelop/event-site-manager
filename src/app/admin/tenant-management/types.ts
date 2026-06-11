/**
 * DTO for tenant organization details.
 * Matches backend OpenAPI schema.
 */
export interface TenantOrganizationDTO {
  id?: number;
  tenantId: string;
  organizationName: string;
  domain?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionStartDate?: string; // YYYY-MM-DD
  subscriptionEndDate?: string;   // YYYY-MM-DD
  monthlyFeeUsd?: number;
  stripeCustomerId?: string;
  isActive?: boolean;
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
}

/**
 * DTO for tenant settings.
 * Matches backend OpenAPI schema.
 */
export interface TenantSettingsDTO {
  id?: number;
  tenantId: string;
  allowUserRegistration?: boolean;
  requireAdminApproval?: boolean;
  enableWhatsappIntegration?: boolean;
  enableEmailMarketing?: boolean;
  whatsappApiKey?: string;
  emailProviderConfig?: string;
  maxEventsPerMonth?: number;
  maxAttendeesPerEvent?: number;
  enableGuestRegistration?: boolean;
  maxGuestsPerAttendee?: number;
  defaultEventCapacity?: number;
  platformFeePercentage?: number;
  customCss?: string;
  customJs?: string;
  showEventsSectionInHomePage?: boolean;
  showTeamMembersSectionInHomePage?: boolean;
  showSponsorsSectionInHomePage?: boolean;
  isMembershipSubscriptionEnabled?: boolean;
  // Enhanced WhatsApp Integration Fields
  whatsappPhoneNumber?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  enableWhatsappNotifications?: boolean;
  enableWhatsappMarketing?: boolean;
  whatsappDefaultTemplate?: string;
  whatsappMaxMessagesPerDay?: number;
  whatsappRateLimit?: number;
  whatsappWebhookUrl?: string;
  whatsappWebhookToken?: string;
  emailFooterHtmlUrl?: string; // S3 URL for email footer HTML file
  emailHeaderImageUrl?: string; // S3 URL for email header image
  logoImageUrl?: string; // S3 URL for tenant logo image
  /** Ordered tenant default hero image URLs (parsed from JSON when returned by API). */
  defaultHeroImageUrls?: string[];
  /** JSON array string of default hero URLs (backend column). */
  defaultHeroImageUrlsJson?: string;
  defaultHeroDisplayMode?: 'slideshow' | 'random' | 'single';
  /** When true, tenant default slides append after event hero images in the homepage carousel. */
  defaultHeroIncludeWithEvents?: boolean;
  // Contact and Address Fields
  addressLine1?: string;
  addressLine2?: string;
  phoneNumber?: string;
  zipCode?: string;
  country?: string;
  stateProvince?: string;
  email?: string;
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
  tenantOrganization?: TenantOrganizationDTO;
}

/**
 * Form DTO for tenant organization creation/editing.
 * Omits fields that are auto-generated or supplied by the system.
 */
export type TenantOrganizationFormDTO = Omit<TenantOrganizationDTO, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Form DTO for tenant settings creation/editing.
 * Omits fields that are auto-generated or supplied by the system.
 */
export type TenantSettingsFormDTO = Omit<TenantSettingsDTO, 'id' | 'createdAt' | 'updatedAt' | 'tenantOrganization'>;

/**
 * Filter options for tenant organization list
 */
export interface TenantOrganizationFilters {
  search?: string;
  /** When set, scopes list to this tenant (tenantId.equals). */
  tenantId?: string;
  subscriptionStatus?: string;
  isActive?: boolean;
  sortBy?: 'organizationName' | 'createdAt' | 'subscriptionStatus';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter options for tenant settings list (JHipster-style criteria on /api/tenant-settings).
 * `tenantId` scopes with `tenantId.equals` only when non-empty (e.g. from ?tenant=).
 */
export interface TenantSettingsFilters {
  /** @deprecated use tenantIdContains */
  search?: string;
  tenantId?: string;
  tenantIdContains?: string;
  idEquals?: number;
  emailContains?: string;
  phoneNumberContains?: string;
  countryContains?: string;
  stateProvinceContains?: string;
  addressLine1Contains?: string;
  /** Resolved via /api/tenant-organizations then tenantId.in on settings (nested org criteria not used). */
  organizationNameContains?: string;
  allowUserRegistration?: boolean;
  requireAdminApproval?: boolean;
  enableWhatsappIntegration?: boolean;
  enableEmailMarketing?: boolean;
  enableGuestRegistration?: boolean;
  isMembershipSubscriptionEnabled?: boolean;
  sortBy?: 'tenantId' | 'createdAt' | 'updatedAt' | 'id' | 'maxEventsPerMonth';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * API response for paginated lists
 */
export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

