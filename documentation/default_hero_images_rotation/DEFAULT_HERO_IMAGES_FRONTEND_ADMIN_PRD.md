# Frontend Admin PRD: Default Homepage Hero Images (Tenant Settings)

**Related:** [DEFAULT_HERO_IMAGES_HOMEPAGE_ROTATION.html](./DEFAULT_HERO_IMAGES_HOMEPAGE_ROTATION.html) · [DEFAULT_HERO_IMAGES_BACKEND_APPLICATION_PRD.md](./DEFAULT_HERO_IMAGES_BACKEND_APPLICATION_PRD.md) · [DEFAULT_HERO_IMAGES_DATABASE_PRD.md](./DEFAULT_HERO_IMAGES_DATABASE_PRD.md) · [hero-image-selection-overlay-logic.md](./hero-image-selection-overlay-logic.md)

## Document information

| Field | Value |
|-------|--------|
| **Version** | 1.0 |
| **Status** | Ready for implementation (assumes backend `tenant_settings` fields + upload endpoint deployed) |
| **Scope** | Admin UX in **Tenant Management → Settings** for per-`tenantId` rotating default hero images |
| **Repo** | `event-site-manager` (Next.js App Router) |

---

## 1. Executive summary

Admins need a first-class workflow to attach **multiple rotating homepage hero images** for a satellite tenant without pasting S3 URLs manually. The public homepage already consumes `defaultHeroImageUrlsJson`, `defaultHeroDisplayMode`, and `defaultHeroIncludeWithEvents` via `TenantSettingsProvider` and `resolveHeroImages()`.

**Phase 1 (shipped):** Customization tab — URL textarea, display mode, checkbox, static thumbnails.

**Phase 2 (this PRD):** Dedicated **Homepage Hero** admin experience with **drag-and-drop multi-file upload**, single-file add, reorder, remove, live preview, and optional first-time **setup walkthrough** — patterned after event **media upload-multiple** and tenant **logo / email header** upload flows.

---

## 2. Problem statement

| Pain today | Target |
|------------|--------|
| Admins must upload images elsewhere, copy HTTPS URLs, paste one per line | Upload images directly in tenant settings |
| Hero config buried under Custom CSS/JS on Customization tab | Clear **Homepage Hero** tab or guided wizard |
| No reorder except editing textarea order | Drag-and-drop slide order with numbered thumbnails |
| No progress feedback for multiple files | Per-file and batch upload progress (like event media) |
| Super-admin editing another tenant must remember `tenantId` for S3 paths | Upload uses row `tenantId` via `?tenantId=` on proxy (same as logo upload) |

---

## 3. Users and entry points

| Persona | Goal | Entry |
|---------|------|--------|
| Tenant admin | Brand homepage when no event heroes | `/admin/tenant-management/settings/{id}/edit` |
| Super admin | Configure satellite tenant (`mosc-temp`, etc.) | Same; `tenantId` on settings row drives upload |
| Onboarding ops | Seed defaults for new tenant | Script + optional link to **Homepage Hero** tab after create |

**Routes (unchanged):**

- List: `/admin/tenant-management/settings`
- Edit: `/admin/tenant-management/settings/[id]/edit`
- Create: `/admin/tenant-management/settings/new`

---

## 4. UX recommendation

### 4.1 Primary: new tab **Homepage Hero** (recommended)

Add a fifth tab to `TenantSettingsForm` alongside General, Integrations, Limits, Customization.

| Tab | Color (unique in group) | Content |
|-----|-------------------------|---------|
| `homepageHero` | **Teal** (`teal-50/100/500/800`) | Full hero manager (this PRD) |

**Rationale:** Hero rotation is a distinct product surface (not “custom CSS”). A dedicated tab matches how **Integrations** isolates WhatsApp/email config. Keeps Customization tab for CSS/JS/email assets only.

**Move from Customization tab:** Remove the existing “Default Homepage Hero Images” block from Customization once the new tab ships (avoid duplicate editors).

### 4.2 Secondary: optional setup walkthrough (first visit)

When `defaultHeroImageUrlsJson` is empty and `mode === 'edit'`:

1. Show a compact **3-step callout** at top of Homepage Hero tab (not a blocking modal):
   - **Step 1 — Upload slides** (drag multiple images or pick one)
   - **Step 2 — Choose display mode** (slideshow / random / single)
   - **Step 3 — Save** (persist + “View homepage” link in new tab)

Dismiss with “Don’t show again” stored in `localStorage` key `tenantHeroWalkthroughDismissed:{settingsId}`.

**Not in scope:** Full-page wizard outside tenant settings form; keep one form + one Save for all tabs.

---

## 5. Functional requirements

### 5.1 Slide list (source of truth in UI)

- Maintain ordered list `heroSlides: { id: string; url: string; fileName?: string }[]` in component state.
- Initialize from `parseTenantDefaultHeroUrls(initialData)` on load.
- On form submit (or immediate PATCH after upload — see 5.4), serialize with `serializeDefaultHeroImageUrls(urls)` → `defaultHeroImageUrlsJson`.

### 5.2 Multi-file upload (required)

Mirror **event media** `upload-multiple` UX:

| Behavior | Requirement |
|----------|-------------|
| File input | `<input type="file" accept="image/*" multiple />` |
| Drag-and-drop | Dashed border zone; highlight on drag-over (same classes as email header / logo in `TenantSettingsForm`) |
| Batch select | User can drop or pick **1–N** files in one action |
| Validation | Image MIME only; max **10 MB** per file (align `SponsorImageUploadArea` / logo) |
| Recommended dimensions | Help text: **2000×800** (5:2 landscape) or wider; see hero mobile containment docs |
| Max slides | **20** URLs per tenant (soft cap with inline error) |

**Upload API (backend deployed):**

```http
POST /api/tenant-settings/upload/default-hero-image
Content-Type: multipart/form-data
Authorization: Bearer <jwt>   (via proxy)
X-Tenant-ID: <tenantId>
Body: file=<binary>
```

**Frontend proxy (to add):** `src/pages/api/proxy/tenant-settings/upload/default-hero-image.ts` — copy `tenant-logo.ts` pattern (`bodyParser: false`, stream forward, `?tenantId=` query).

**Client helper (to add):** `uploadDefaultHeroImageClient(file, tenantIdForUpload)` in `src/app/admin/tenant-management/settings/ApiServerActions.ts` — same shape as `uploadTenantLogoClient`.

**Batch strategy (Phase 2a):** Sequential POST per file in UI loop (no backend `upload-multiple` required). Show aggregate progress: `Uploading 2 of 5…`.

**Batch strategy (Phase 2b — optional later):** If backend adds `upload-default-hero-images-multiple`, switch to single FormData with `files[]` like `event-medias/upload-multiple`.

### 5.3 Single-file upload (required)

- Same drop zone and file input support **one** file (subset of multi).
- After success, **append** URL to end of `heroSlides` (do not replace entire list).

### 5.4 Persist timing

| Option | Recommendation |
|--------|----------------|
| A — Upload then auto-PATCH | **Preferred:** After each successful upload (or after batch completes), call `patchTenantSetting(settingsId, { defaultHeroImageUrlsJson })` so S3 URLs survive refresh without clicking main Save |
| B — Defer to form Save | Acceptable for MVP if A adds complexity; document that user must Save |

Match **logo / email header** behavior: those PATCH immediately after upload. **Hero should do the same.**

### 5.5 Reorder and remove

| Action | UX |
|--------|-----|
| Reorder | Drag handle on each thumbnail card; update array order |
| Remove | Red trash icon per slide; confirm if &gt; 0 slides; PATCH updated JSON |
| Slide number | Badge `1`, `2`, `3` on thumbnails (slideshow order) |

**Library:** Use native HTML5 drag-and-drop or lightweight existing project pattern; avoid new heavy dependencies unless already in repo.

### 5.6 Display settings (retain)

| Field | Control |
|-------|---------|
| `defaultHeroDisplayMode` | Select: slideshow / random / single |
| `defaultHeroIncludeWithEvents` | Checkbox with helper text linking to [hero-image-selection-overlay-logic.md](./hero-image-selection-overlay-logic.md) |

### 5.7 Live preview

- **Thumbnail strip:** object-cover cards (existing 128×80 pattern), `onError` hide broken image.
- **Hero preview panel:** Single large preview using first slide (or rotating mini-slideshow every 4s when mode = slideshow and ≥2 slides). Use `object-contain` and dark `#1a0a2e` letterbox background per hero CSS rules.

### 5.8 Advanced: paste URLs (retain as collapsible)

Collapsible **“Add URLs manually”** section:

- Textarea, one HTTPS URL per line (current behavior).
- **Merge** parsed lines into `heroSlides` (dedupe by URL), not replace uploads-only list without confirmation.

### 5.9 Create mode vs edit mode

| Mode | Upload |
|------|--------|
| `edit` + `settingsId` | Full upload enabled |
| `create` | Disable upload; show info: “Save settings first, then upload hero images on edit.” Same as logo upload when `!settingsId`. |

### 5.10 Tenant scoping (super-admin)

Use `tenantIdForUpload` from form/watch (already in `TenantSettingsForm`):

```typescript
const tenantIdForUpload =
  watch('tenantId')?.trim() || initialData?.tenantId?.trim() || undefined;
```

Append `tenantUploadQuery(tenantIdForUpload)` on all upload fetches.

---

## 6. Non-functional requirements

| Area | Requirement |
|------|-------------|
| Accessibility | `title` + `aria-label` on upload zone, reorder, delete; keyboard focus on tab |
| Errors | `SaveStatusDialog` or inline banner per logo/header upload pattern |
| Loading | Disable drop zone while uploading; spinner on batch |
| Security | Client uploads only via `/api/proxy/...`; no direct S3 credentials in browser |
| Performance | Lazy-load preview images; debounce manual URL textarea merge |

---

## 7. Technical design

### 7.1 New / modified files

| File | Change |
|------|--------|
| `src/app/admin/tenant-management/components/TenantDefaultHeroManager.tsx` | **New** — upload zone, slide grid, reorder, preview, walkthrough callout |
| `src/app/admin/tenant-management/components/TenantSettingsForm.tsx` | Add `homepageHero` tab; mount manager; remove hero block from Customization |
| `src/app/admin/tenant-management/settings/ApiServerActions.ts` | Add `uploadDefaultHeroImageClient` |
| `src/pages/api/proxy/tenant-settings/upload/default-hero-image.ts` | **New** — proxy to backend |
| `src/lib/hero/defaultHeroImages.ts` | No change required (already has parse/serialize) |

### 7.2 Component API sketch

```tsx
interface TenantDefaultHeroManagerProps {
  settingsId?: number;
  tenantIdForUpload?: string;
  initialUrls?: string[];
  displayMode: 'slideshow' | 'random' | 'single';
  includeWithEvents: boolean;
  onUrlsChange: (urls: string[]) => void;
  onDisplayModeChange: (mode: 'slideshow' | 'random' | 'single') => void;
  onIncludeWithEventsChange: (value: boolean) => void;
  disabled?: boolean;
}
```

Parent `TenantSettingsForm` keeps react-hook-form registration for mode/checkbox; manager calls `onUrlsChange` so submit still sets `defaultHeroImageUrlsJson`.

### 7.3 Upload flow (sequence)

```mermaid
sequenceDiagram
  participant Admin
  participant Manager as TenantDefaultHeroManager
  participant Proxy as Next proxy upload
  participant API as Spring tenant-settings
  participant S3

  Admin->>Manager: Drop 3 image files
  loop Each file
    Manager->>Proxy: POST multipart file + tenantId query
    Proxy->>API: Forward stream + JWT + X-Tenant-ID
    API->>S3: Put tenants/{tenantId}/hero-defaults/...
    API-->>Proxy: { url }
    Proxy-->>Manager: { url }
    Manager->>Manager: Append to heroSlides
  end
  Manager->>API: PATCH defaultHeroImageUrlsJson
  Manager-->>Admin: Success + updated thumbnails
```

### 7.4 Reference implementations (copy patterns)

| Pattern | Reference file |
|---------|----------------|
| Single-file tenant upload + drag-drop | `TenantSettingsForm.tsx` (logo, email header) |
| `uploadTenantLogoClient` + `patchTenantSetting` | `settings/ApiServerActions.ts` |
| Proxy stream upload | `src/pages/api/proxy/tenant-settings/upload/tenant-logo.ts` |
| Multi-file selection + FormData loop | `MediaClientPage.tsx` (`files` input, progress) |
| Multi-image overview grid | `SponsorImageUploadArea.tsx`, `DirectorImageUploadArea.tsx` |
| Parse/serialize hero URLs | `src/lib/hero/defaultHeroImages.ts` |

### 7.5 Event media vs tenant hero upload

| | Event media `upload-multiple` | Tenant default hero |
|--|------------------------------|---------------------|
| Endpoint | `/api/proxy/event-medias/upload-multiple` | `/api/proxy/tenant-settings/upload/default-hero-image` |
| Metadata | eventId, flags, titles[] | None (tenant implied by `X-Tenant-ID`) |
| Storage path | Event media bucket layout | `tenants/{tenantId}/hero-defaults/` |
| Persistence | `event_media` rows | `tenant_settings.default_hero_image_urls_json` |
| Client | `MediaClientPage` direct fetch | `uploadDefaultHeroImageClient` + PATCH settings |

---

## 8. UI specification (Homepage Hero tab)

### 8.1 Layout (top to bottom)

1. **Page title:** “Default Homepage Hero Images”
2. **Walkthrough callout** (conditional, dismissible)
3. **Info box:** Explains fallback chain — event heroes → tenant defaults → `/images/hero_section/hero_images/fallback/default-hero.webp`
4. **Upload zone** (full width, dashed border)
   - Copy: “Upload one or more images. Drag and drop or click to browse.”
   - Accepted: PNG, JPG, JPEG, WEBP, GIF
5. **Slide grid** (responsive `grid-cols-2 md:grid-cols-4 gap-4`)
   - Thumbnail, order badge, drag handle, delete button
6. **Display mode** + **Include with events** (two-column on md+)
7. **Live preview** panel
8. **Advanced** — collapsed “Add URLs manually”

### 8.2 Styling

- Follow admin action button pattern for primary actions (green upload CTA optional).
- Icon buttons for delete: `w-10 h-10` inline SVG per icon standards (no react-icons for action buttons in new code).
- Tab styling: match existing tab nav in `TenantSettingsForm` (teal palette, unique vs blue/green/purple/orange).

### 8.3 Empty state

When no slides and no uploads:

- Illustration or icon in upload zone
- “No default hero images yet. Homepage will use the platform emergency image until you upload slides or upcoming events provide hero media.”

---

## 9. Integration with homepage runtime

No changes required to `HeroSection.tsx` if `defaultHeroImageUrlsJson` is PATCHed correctly.

**Verification after admin save:**

1. Open `/` on tenant domain (or local with correct `NEXT_PUBLIC_TENANT_ID`).
2. With no upcoming `isHomePageHeroImage` events, slideshow shows uploaded URLs.
3. Toggle `defaultHeroIncludeWithEvents` — with upcoming event heroes, tenant slides append when enabled.

---

## 10. Phased delivery

| Phase | Deliverable | Depends on |
|-------|-------------|------------|
| **2a** | Proxy route + `uploadDefaultHeroImageClient` + sequential multi-upload + PATCH | Backend upload endpoint |
| **2b** | `TenantDefaultHeroManager` + Homepage Hero tab; remove Customization duplicate | 2a |
| **2c** | Reorder + walkthrough callout | 2b |
| **2d** (optional) | Backend batch upload endpoint; switch client to single request | Backend |

---

## 11. Acceptance criteria

- [ ] Admin can upload **one** image; URL appears in slide list and persists after page reload.
- [ ] Admin can upload **multiple** images in one pick/drop; all URLs appended in order with progress UI.
- [ ] Admin can **reorder** slides; order matches homepage slideshow order after save.
- [ ] Admin can **remove** a slide; PATCH updates JSON; homepage reflects removal.
- [ ] Display mode and “include with events” save with tenant settings.
- [ ] Super-admin editing tenant B uploads to tenant B’s S3 prefix (`?tenantId=`).
- [ ] Create mode shows disabled upload with clear message.
- [ ] Invalid file type/size shows inline error without breaking form.
- [ ] Manual URL paste (advanced) still works for ops with pre-uploaded S3 assets.
- [ ] Customization tab no longer contains duplicate hero URL textarea.

---

## 12. Test plan

### Manual

1. Edit settings for `tenant_demo_002` → Homepage Hero → upload 3 WEBP files → reload → 3 thumbnails.
2. Reorder slides → save → confirm JSON order via GET `/api/proxy/tenant-settings/{id}`.
3. Delete middle slide → homepage shows remaining order.
4. Set mode **random** → refresh homepage multiple times (visual check).
5. Enable upcoming event with `isHomePageHeroImage` + **include with events** → both event and default slides in rotation.
6. Upload 11 MB file → validation error.
7. Create new settings → upload disabled until save + re-open edit.

### Regression

- Logo and email header upload unchanged on Customization tab.
- `node scripts/seed-tenant-default-hero-images.js` still works (CLI onboarding).

---

## 13. Out of scope

- Cropping / image resizing in admin UI (document link to `documentation/IMAGE_RESIZING_GUIDE.md` in help text only).
- Replacing S3 objects in bucket when re-uploading same filename (backend concern).
- Per-slide display duration (event media has `homePageHeroDisplayDurationSeconds`; tenant defaults use global homepage interval in `HeroSection`).
- Bulk import from another tenant’s settings.

---

## 14. References

| Resource | Path |
|----------|------|
| Architecture HTML | `documentation/default_hero_images_rotation/DEFAULT_HERO_IMAGES_HOMEPAGE_ROTATION.html` |
| Backend API PRD | `documentation/default_hero_images_rotation/DEFAULT_HERO_IMAGES_BACKEND_APPLICATION_PRD.md` |
| Database PRD | `documentation/default_hero_images_rotation/DEFAULT_HERO_IMAGES_DATABASE_PRD.md` |
| Hero resolver | `src/lib/hero/defaultHeroImages.ts` |
| Current form (Phase 1) | `src/app/admin/tenant-management/components/TenantSettingsForm.tsx` |
| Seed script | `scripts/seed-tenant-default-hero-images.js` |
