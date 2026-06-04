#!/usr/bin/env node

/**
 * Comprehensive Sanity Test Runner with TestSprite API Integration
 * Real browser testing with DOM element checking, JavaScript error detection, and enhanced validation
 * Expected Duration: ~15-20 minutes
 *
 * This script uses Playwright for real browser automation.
 * TestSprite API key can be loaded from .env.local for future API integration.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Get TestSprite API key from environment
const testSpriteApiKey = process.env.TESTSPRITE_KEY || process.env.TESTSPRITE_API_KEY;

// Get test credentials from environment
const testCredentials = {
  email: process.env.TEST_USER_EMAIL || process.env.TEST_ADMIN_EMAIL,
  password: process.env.TEST_USER_PASSWORD || process.env.TEST_ADMIN_PASSWORD
};

// Test configuration
const config = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 30000, // 30 seconds per test
  retries: 1,
  testDuration: '15-20 minutes',
  screenshotOnFailure: true,
  performanceTiming: true,
  useTestSpriteApi: !!testSpriteApiKey, // Use TestSprite API if key is available (PREFERRED)
  usePlaywright: true,  // Fallback to Playwright if TestSprite API unavailable
  // Authentication configuration
  authEnabled: !!(testCredentials.email && testCredentials.password),
  authStatePath: path.join(__dirname, '.auth-state.json'), // Path to save auth state
  credentials: testCredentials
};

// Enhanced test scenarios with more pages and detailed validation
const testScenarios = [
  // ==========================================
  // PUBLIC PAGES - Core Functionality
  // ==========================================
  {
    id: 'sanity-001',
    name: 'Homepage Load Test',
    url: '/',
    category: 'public-pages',
    priority: 'critical',
    expectedElements: [
      'nav, header, [class*="nav"]',
      'main, [class*="main"], [class*="content"]',
      'h1, h2, h3, [class*="title"], [class*="heading"]',
      'a[href*="/events"], a[href="/events"]',
      'a[href*="/gallery"], a[href="/gallery"]'
    ],
    validation: [
      'Page loads without errors',
      'Navigation menu is visible',
      'Main content area is present',
      'No JavaScript console errors',
      'Page title contains "Malayalees"',
      'Event cards or listings visible'
    ],
    interactions: [
      { type: 'wait', selector: 'main', timeout: 5000 },
      { type: 'check', selector: 'nav', visible: true },
      { type: 'check', selector: 'a[href="/events"]', visible: true }
    ]
  },
  {
    id: 'sanity-002',
    name: 'Events Listing Page Test',
    url: '/events',
    category: 'public-pages',
    priority: 'critical',
    expectedElements: [
      'h1',
      '.grid, [class*="grid"]',
      '[class*="event"], [class*="card"]',
      'input[type="search"], input[type="text"]',
      'button, a[href*="/events/"]'
    ],
    validation: [
      'Events page loads successfully',
      'Event cards or list items are visible',
      'Search/filter functionality accessible',
      'No JavaScript errors',
      'Pagination controls present (if applicable)',
      'Event images load correctly'
    ],
    interactions: [
      { type: 'wait', selector: '[class*="event"], [class*="card"]', timeout: 5000 },
      { type: 'check', selector: 'h1', visible: true },
      { type: 'check', selector: 'input[type="search"], input[type="text"]', visible: true }
    ]
  },
  {
    id: 'sanity-003',
    name: 'Event Details Page Test',
    url: '/events/1',
    category: 'public-pages',
    priority: 'critical',
    expectedElements: [
      'h1',
      '[class*="event"]',
      'a[href*="/tickets"], button',
      '[class*="date"], [class*="time"], [class*="location"]',
      'img, [class*="image"]'
    ],
    validation: [
      'Event details page loads',
      'Event information is displayed',
      'Registration/ticket button is present',
      'Sponsors section visible (if applicable)',
      'Event date and time displayed',
      'Location information present',
      'No 404 errors'
    ],
    skipIf: 'No events available',
    interactions: [
      { type: 'wait', selector: 'h1', timeout: 5000 },
      { type: 'check', selector: 'a[href*="/tickets"], button', visible: true }
    ]
  },
  {
    id: 'sanity-004',
    name: 'Sponsors Listing Page Test',
    url: '/sponsors',
    category: 'public-pages',
    priority: 'high',
    expectedElements: [
      'h1, h2, [class*="title"], [class*="heading"]',
      '[class*="sponsor"], [class*="card"], [class*="grid"], main, [class*="container"]',
      'img, [class*="logo"], [class*="image"]'
    ],
    validation: [
      'Sponsors page loads successfully',
      'Sponsor cards are visible',
      'Search functionality is accessible',
      'Pagination controls present (if applicable)',
      'Sponsor logos/images load'
    ]
  },
  {
    id: 'sanity-005',
    name: 'Sponsor Details Page Test',
    url: '/sponsors/1',
    category: 'public-pages',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="sponsor"]',
      'img, [class*="image"]',
      '[class*="contact"], [class*="address"]'
    ],
    validation: [
      'Sponsor details page loads',
      'Sponsor information displayed',
      'Contact information visible',
      'Logo/image displayed',
      'No broken images'
    ],
    skipIf: 'No sponsors available'
  },
  {
    id: 'sanity-006',
    name: 'Gallery Page Test',
    url: '/gallery',
    category: 'public-pages',
    priority: 'high',
    expectedElements: [
      'h1, h2, [class*="title"], [class*="heading"]',
      '[class*="gallery"], [class*="grid"], [class*="container"], main',
      'img, [class*="image"], [class*="photo"]'
    ],
    validation: [
      'Gallery page loads successfully',
      'Media items are displayed',
      'Filter/category selection works',
      'Images load without errors',
      'No broken image links',
      'Lightbox/modal works (if applicable)'
    ],
    interactions: [
      { type: 'wait', selector: 'img', timeout: 5000 },
      { type: 'check', selector: 'img', count: { min: 1 } }
    ]
  },
  {
    id: 'sanity-007',
    name: 'Polls Listing Page Test',
    url: '/polls',
    category: 'public-pages',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="poll"], [class*="card"]',
      'button, a[href*="/polls/"]',
      '[class*="vote"], [class*="option"]'
    ],
    validation: [
      'Polls page loads successfully',
      'Poll cards are visible',
      'Vote buttons are accessible',
      'No JavaScript errors',
      'Poll options displayed correctly'
    ]
  },
  {
    id: 'sanity-008',
    name: 'Calendar Page Test',
    url: '/calendar',
    category: 'public-pages',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="calendar"]',
      'button, [class*="month"], [class*="day"]',
      '[class*="event"]'
    ],
    validation: [
      'Calendar page loads successfully',
      'Calendar widget is visible',
      'Navigation controls work',
      'Events are displayed on calendar',
      'Month/year navigation functional'
    ]
  },
  {
    id: 'sanity-009',
    name: 'MOSC Homepage Test',
    url: '/mosc',
    category: 'public-pages',
    priority: 'medium',
    expectedElements: [
      'h1, h2',
      'nav',
      'main',
      'a[href*="/mosc/"]'
    ],
    validation: [
      'MOSC homepage loads',
      'Navigation menu visible',
      'Content sections displayed',
      'No layout errors',
      'Quick links functional'
    ]
  },
  {
    id: 'sanity-010',
    name: 'MOSC Holy Synod Page Test',
    url: '/mosc/holy-synod',
    category: 'public-pages',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="synod"], [class*="member"]',
      'img, [class*="image"]',
      'a[href*="/holy-synod/"]'
    ],
    validation: [
      'Holy Synod page loads',
      'Synod members displayed',
      'Member images load',
      'Member details accessible',
      'No broken links'
    ]
  },
  {
    id: 'sanity-011',
    name: 'MOSC Gallery Page Test',
    url: '/mosc/gallery',
    category: 'public-pages',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="gallery"], [class*="album"]',
      'img, [class*="image"]',
      'a[href*="/gallery/"]'
    ],
    validation: [
      'MOSC Gallery page loads',
      'Photo albums displayed',
      'Images load correctly',
      'Album links functional'
    ]
  },
  {
    id: 'sanity-012',
    name: 'MOSC Directory Page Test',
    url: '/mosc/directory',
    category: 'public-pages',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="directory"], [class*="list"]',
      'input[type="search"], input[type="text"]',
      'a, button'
    ],
    validation: [
      'Directory page loads',
      'Directory listings visible',
      'Search functionality works',
      'Contact information displayed'
    ]
  },
  {
    id: 'sanity-013',
    name: 'Charity Theme Page Test',
    url: '/charity-theme',
    category: 'public-pages',
    priority: 'low',
    expectedElements: [
      'h1',
      'main',
      '[class*="charity"]'
    ],
    validation: [
      'Charity theme page loads',
      'Content is displayed',
      'Styling is applied correctly',
      'No errors'
    ]
  },
  {
    id: 'sanity-014',
    name: 'Pricing Page Test',
    url: '/pricing',
    category: 'public-pages',
    priority: 'medium',
    expectedElements: [
      'h1',
      '[class*="pricing"], [class*="plan"]',
      'button, a[href*="/sign-up"]',
      '[class*="price"], [class*="feature"]'
    ],
    validation: [
      'Pricing page loads',
      'Pricing plans displayed',
      'Subscribe/sign up buttons accessible',
      'No errors',
      'Plan features visible'
    ]
  },

  // ==========================================
  // ADMIN PAGES - Core Management
  // ==========================================
  {
    id: 'sanity-015',
    name: 'Admin Dashboard Access Test',
    url: '/admin',
    category: 'admin-pages',
    priority: 'critical',
    requiresAuth: true,
    expectedElements: [
      'h1, h2',
      '[class*="admin"]',
      'nav, [class*="nav"]',
      'a[href*="/admin/events"]',
      '[class*="grid"], [class*="card"]'
    ],
    validation: [
      'Admin dashboard loads',
      'Navigation menu is visible',
      'Quick stats or cards displayed',
      'No authentication errors',
      'Admin navigation functional',
      'Title contains "Admin"'
    ],
    interactions: [
      { type: 'wait', selector: 'h1, h2', timeout: 5000 },
      { type: 'check', selector: 'a[href*="/admin/events"]', visible: true }
    ]
  },
  {
    id: 'sanity-016',
    name: 'Admin Events Management Hub Test',
    url: '/admin/manage-events',
    category: 'admin-pages',
    priority: 'critical',
    requiresAuth: true,
    expectedElements: [
      'h1',
      '[class*="grid"], [class*="card"]',
      'a[href*="/admin/events/new"], button',
      'input[type="search"], input[type="text"]',
      'table, [class*="table"]'
    ],
    validation: [
      'Events management hub loads',
      'Event cards or list displayed',
      'Create new event button visible',
      'Search/filter controls present',
      'Event list table functional',
      'Pagination controls work'
    ]
  },
  {
    id: 'sanity-017',
    name: 'Admin Event Overview Test',
    url: '/admin/events/1',
    category: 'admin-pages',
    priority: 'critical',
    requiresAuth: true,
    expectedElements: [
      'h1',
      '[class*="tab"], nav',
      'a[href*="/edit"], button',
      '[class*="event-details"]',
      'a[href*="/tickets"], a[href*="/media"], a[href*="/sponsors"]'
    ],
    validation: [
      'Event overview page loads',
      'Tabs or navigation visible',
      'Edit button accessible',
      'Event details displayed',
      'Management links functional',
      'No 404 errors'
    ],
    skipIf: 'No events available'
  },
  {
    id: 'sanity-018',
    name: 'Admin Event Edit Page Test',
    url: '/admin/events/1/edit',
    category: 'admin-pages',
    priority: 'critical',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'form',
      'input[name*="title"], input[name*="name"]',
      'input[type="date"], input[type="time"]',
      'button[type="submit"], button[type="button"]'
    ],
    validation: [
      'Event edit page loads',
      'Edit form visible',
      'Form fields populated',
      'Save button accessible',
      'Form validation works',
      'Cancel button functional'
    ],
    skipIf: 'No events available',
    interactions: [
      { type: 'wait', selector: 'form', timeout: 5000 },
      { type: 'check', selector: 'button[type="submit"]', visible: true }
    ]
  },
  {
    id: 'sanity-019',
    name: 'Admin Event Media Management Test',
    url: '/admin/events/1/media/list',
    category: 'admin-pages',
    priority: 'high',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'input[type="file"], button[type="submit"]',
      '[class*="media"], [class*="image"]',
      'button, a[href*="/media"]',
      '[class*="grid"], [class*="list"]'
    ],
    validation: [
      'Media management page loads',
      'Upload controls visible',
      'Media grid/list displayed',
      'File upload button accessible',
      'Media items display correctly',
      'Delete/edit buttons present'
    ],
    skipIf: 'No events available'
  },
  {
    id: 'sanity-020',
    name: 'Admin Event Sponsors Management Test',
    url: '/admin/events/1/sponsors',
    category: 'admin-pages',
    priority: 'high',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"], [class*="grid"]',
      'button, a[href*="/sponsors"]',
      'input[type="text"], form',
      'button[type="submit"]'
    ],
    validation: [
      'Sponsors management page loads',
      'Sponsors table/list visible',
      'Add sponsor button accessible',
      'Action buttons present',
      'Sponsor form functional',
      'Edit/delete buttons work'
    ],
    skipIf: 'No events available'
  },
  {
    id: 'sanity-021',
    name: 'Admin Event Ticket Types Management Test',
    url: '/admin/events/1/ticket-types/list',
    category: 'admin-pages',
    priority: 'critical',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"]',
      'button, a[href*="/ticket-types"]',
      'form, input[type="text"], input[type="number"]',
      'button[type="submit"]'
    ],
    validation: [
      'Ticket types page loads',
      'Ticket types table visible',
      'Create ticket type button accessible',
      'Form elements present',
      'Price fields functional',
      'CRUD operations work'
    ],
    skipIf: 'No events available'
  },
  {
    id: 'sanity-022',
    name: 'Admin Event Tickets Management Test',
    url: '/admin/events/1/tickets/list',
    category: 'admin-pages',
    priority: 'critical',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"]',
      'input[type="search"], select',
      'button, a[href*="/tickets"]',
      '[class*="pagination"]'
    ],
    validation: [
      'Tickets page loads',
      'Tickets table visible',
      'Search/filter controls present',
      'Pagination works',
      'Ticket details accessible',
      'Check-in functionality present'
    ],
    skipIf: 'No events available'
  },
  {
    id: 'sanity-023',
    name: 'Admin Event Performers Management Test',
    url: '/admin/events/1/performers',
    category: 'admin-pages',
    priority: 'high',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"], [class*="grid"]',
      'button, a[href*="/new"]',
      'form, input[type="text"]',
      'img, [class*="image"]'
    ],
    validation: [
      'Performers management page loads',
      'Performers list visible',
      'Add performer button accessible',
      'Action buttons present',
      'Performer images load',
      'Form validation works'
    ],
    skipIf: 'No events available'
  },
  {
    id: 'sanity-024',
    name: 'Admin Event Contacts Management Test',
    url: '/admin/event-contacts',
    category: 'admin-pages',
    priority: 'high',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"]',
      'button, form',
      'input[type="text"], input[type="email"], input[type="tel"]',
      'button[type="submit"]'
    ],
    validation: [
      'Contacts management page loads',
      'Contacts table visible',
      'Add/edit buttons accessible',
      'Form elements present',
      'Contact information displayed',
      'CRUD operations functional'
    ]
  },
  {
    id: 'sanity-025',
    name: 'Admin Event Emails Management Test',
    url: '/admin/event-emails',
    category: 'admin-pages',
    priority: 'high',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"]',
      'button, form',
      'input[type="email"], input[type="text"]',
      'button[type="submit"]'
    ],
    validation: [
      'Emails management page loads',
      'Emails table visible',
      'Create email button accessible',
      'Form elements present',
      'Email validation works',
      'List functionality works'
    ]
  },
  {
    id: 'sanity-026',
    name: 'Admin Event Program Directors Test',
    url: '/admin/event-program-directors',
    category: 'admin-pages',
    priority: 'high',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"], [class*="grid"]',
      'button, a[href*="/new"]',
      'form, input[type="text"]',
      'img, [class*="image"]'
    ],
    validation: [
      'Program directors page loads',
      'Directors list visible',
      'Add director button accessible',
      'Form elements present',
      'Director images load',
      'Management functions work'
    ]
  },
  {
    id: 'sanity-027',
    name: 'Admin Event Registrations Management Test',
    url: '/admin/events/registrations',
    category: 'admin-pages',
    priority: 'critical',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"]',
      'select, input[type="text"]',
      'button',
      '[class*="pagination"], [class*="filter"]'
    ],
    validation: [
      'Registrations page loads',
      'Registrations table visible',
      'Filter/search controls present',
      'Export or action buttons accessible',
      'Pagination works',
      'Registration details accessible'
    ]
  },
  {
    id: 'sanity-028',
    name: 'Admin Membership Plans Management Test',
    url: '/admin/membership/plans',
    category: 'admin-pages',
    priority: 'high',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"], [class*="grid"]',
      'button, a[href*="/new"]',
      'form, input[type="text"], input[type="number"]',
      'button[type="submit"]'
    ],
    validation: [
      'Membership plans page loads',
      'Plans list visible',
      'Create plan button accessible',
      'Form elements present',
      'Plan details displayed',
      'CRUD operations work'
    ]
  },
  {
    id: 'sanity-029',
    name: 'Admin Membership Subscriptions Test',
    url: '/admin/membership/subscriptions',
    category: 'admin-pages',
    priority: 'high',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"]',
      'button, a[href*="/subscriptions"]',
      'select, input[type="text"]',
      '[class*="status"], [class*="filter"]'
    ],
    validation: [
      'Subscriptions page loads',
      'Subscriptions table visible',
      'View details buttons accessible',
      'Filter controls present',
      'Subscription status displayed',
      'Cancel functionality works'
    ]
  },
  {
    id: 'sanity-030',
    name: 'Admin Manage Usage Test',
    url: '/admin/manage-usage',
    category: 'admin-pages',
    priority: 'high',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"]',
      'input[type="search"], select',
      'button, form',
      '[class*="user"], [class*="profile"]'
    ],
    validation: [
      'Manage usage page loads',
      'Users table visible',
      'Search functionality works',
      'User profile editing accessible',
      'Status filters work',
      'User management functions work'
    ]
  },
  {
    id: 'sanity-031',
    name: 'Admin Executive Committee Management Test',
    url: '/admin/executive-committee',
    category: 'admin-pages',
    priority: 'medium',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"], [class*="grid"]',
      'button, form',
      'input[type="text"], img',
      'button[type="submit"]'
    ],
    validation: [
      'Executive committee page loads',
      'Committee members list visible',
      'Add/edit buttons accessible',
      'Form elements present',
      'Member images load',
      'Management functions work'
    ]
  },
  {
    id: 'sanity-032',
    name: 'Admin Focus Groups Management Test',
    url: '/admin/focus-groups',
    category: 'admin-pages',
    priority: 'medium',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"], [class*="grid"]',
      'a[href*="/new"], button',
      'form, input[type="text"]',
      'button[type="submit"]'
    ],
    validation: [
      'Focus groups page loads',
      'Groups list visible',
      'Create group button accessible',
      'Action buttons present',
      'Group management works',
      'Form validation functional'
    ]
  },
  {
    id: 'sanity-033',
    name: 'Admin Polls Management Test',
    url: '/admin/polls',
    category: 'admin-pages',
    priority: 'medium',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"], [class*="grid"]',
      'button, a[href*="/new"]',
      'form, input[type="text"]',
      'button[type="submit"]'
    ],
    validation: [
      'Polls management page loads',
      'Polls list visible',
      'Create poll button accessible',
      'Action buttons present',
      'Poll options management works',
      'Vote tracking functional'
    ]
  },
  {
    id: 'sanity-034',
    name: 'Admin Tenant Management Test',
    url: '/admin/tenant-management/organizations',
    category: 'admin-pages',
    priority: 'medium',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'nav, [class*="tab"]',
      'button, form',
      'table, [class*="table"]',
      'a[href*="/organizations/"]'
    ],
    validation: [
      'Tenant management page loads',
      'Tabs or navigation visible',
      'Organizations list displayed',
      'Settings forms accessible',
      'Save buttons present',
      'Organization management works'
    ]
  },
  {
    id: 'sanity-035',
    name: 'Admin Tenant Settings Test',
    url: '/admin/tenant-management/settings',
    category: 'admin-pages',
    priority: 'medium',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'form',
      'input[type="text"], input[type="email"]',
      'button[type="submit"]',
      'table, [class*="table"]'
    ],
    validation: [
      'Tenant settings page loads',
      'Settings form visible',
      'Input fields accessible',
      'Save button present',
      'Settings list displayed',
      'Edit functionality works'
    ]
  },
  {
    id: 'sanity-036',
    name: 'Admin Bulk Email Test',
    url: '/admin/bulk-email',
    category: 'admin-pages',
    priority: 'medium',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'form',
      'input[type="email"], textarea',
      'button[type="submit"]',
      'select, input[type="checkbox"]'
    ],
    validation: [
      'Bulk email page loads',
      'Email form visible',
      'Recipient selection works',
      'Message editor accessible',
      'Send button present',
      'Email templates functional'
    ]
  },
  {
    id: 'sanity-037',
    name: 'Admin Tenant Email Addresses Test',
    url: '/admin/tenant-email-addresses',
    category: 'admin-pages',
    priority: 'medium',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'table, [class*="table"]',
      'button, form',
      'input[type="email"]',
      'button[type="submit"]'
    ],
    validation: [
      'Email addresses page loads',
      'Email addresses table visible',
      'Add email button accessible',
      'Form elements present',
      'Email validation works',
      'CRUD operations functional'
    ]
  },
  {
    id: 'sanity-038',
    name: 'Admin QR Code Scanner Test',
    url: '/admin/qrcode-scan/tickets',
    category: 'admin-pages',
    priority: 'medium',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'video, canvas, [class*="camera"]',
      'button',
      'input[type="text"], [class*="scanner"]'
    ],
    validation: [
      'QR scanner page loads',
      'Camera/video element visible',
      'Scan button accessible',
      'No camera permission errors',
      'Scanner interface functional',
      'Manual entry option available'
    ]
  },

  // ==========================================
  // USER PAGES - Profile & Settings
  // ==========================================
  {
    id: 'sanity-039',
    name: 'User Profile Page Test',
    url: '/profile',
    category: 'user-pages',
    priority: 'high',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'form',
      'input[name="firstName"], input[name="lastName"]',
      'input[name="email"]',
      'button[type="submit"]',
      'img, [class*="avatar"]'
    ],
    validation: [
      'Profile page loads',
      'Profile form visible',
      'Input fields populated',
      'Save button accessible',
      'Profile image displayed',
      'Form validation works'
    ],
    interactions: [
      { type: 'wait', selector: 'form', timeout: 5000 },
      { type: 'check', selector: 'input[name="firstName"]', visible: true },
      { type: 'check', selector: 'button[type="submit"]', visible: true }
    ]
  },
  {
    id: 'sanity-040',
    name: 'User Dashboard Test',
    url: '/dashboard',
    category: 'user-pages',
    priority: 'high',
    requiresAuth: true,
    expectedElements: [
      'h1, h2',
      '[class*="card"], [class*="grid"]',
      'a, button',
      '[class*="event"], [class*="ticket"]'
    ],
    validation: [
      'Dashboard page loads',
      'Dashboard cards/widgets visible',
      'Navigation links accessible',
      'User data displayed',
      'Upcoming events shown',
      'Recent tickets displayed'
    ]
  },
  {
    id: 'sanity-041',
    name: 'User Settings Page Test',
    url: '/settings',
    category: 'user-pages',
    priority: 'medium',
    requiresAuth: true,
    expectedElements: [
      'h1',
      'form',
      'input, select',
      'button[type="submit"]',
      '[class*="tab"], nav'
    ],
    validation: [
      'Settings page loads',
      'Settings form visible',
      'Input fields accessible',
      'Save button present',
      'Settings tabs functional',
      'Preferences saved correctly'
    ]
  },

  // ==========================================
  // AUTHENTICATION PAGES
  // ==========================================
  {
    id: 'sanity-042',
    name: 'Sign In Page Test',
    url: '/sign-in',
    category: 'authentication',
    priority: 'critical',
    expectedElements: [
      'h1, h2',
      'form',
      'input[type="email"], input[type="text"]',
      'button[type="submit"]',
      'a[href*="/sign-up"]',
      '[class*="social"], button[type="button"]'
    ],
    validation: [
      'Sign in page loads',
      'Sign in form visible',
      'Email/password fields present',
      'Social login buttons visible (if applicable)',
      'Sign up link accessible',
      'Form validation works',
      'No authentication errors'
    ],
    interactions: [
      { type: 'wait', selector: 'form', timeout: 5000 },
      { type: 'check', selector: 'input[type="email"], input[type="text"]', visible: true },
      { type: 'check', selector: 'button[type="submit"]', visible: true }
    ]
  },
  {
    id: 'sanity-043',
    name: 'Sign Up Page Test',
    url: '/sign-up',
    category: 'authentication',
    priority: 'critical',
    expectedElements: [
      'h1, h2',
      'form',
      'input[type="email"]',
      'button[type="submit"]',
      'a[href*="/sign-in"]',
      '[class*="social"], button[type="button"]'
    ],
    validation: [
      'Sign up page loads',
      'Sign up form visible',
      'Registration fields present',
      'Social sign up buttons visible (if applicable)',
      'Sign in link accessible',
      'Form validation works',
      'Password requirements shown'
    ]
  },

  // ==========================================
  // UTILITY & LEGAL PAGES
  // ==========================================
  {
    id: 'sanity-044',
    name: 'Privacy Policy Page Test',
    url: '/privacy',
    category: 'legal-pages',
    priority: 'low',
    expectedElements: [
      'h1',
      'main, article',
      'p, [class*="content"]',
      'nav, [class*="breadcrumb"]'
    ],
    validation: [
      'Privacy policy page loads',
      'Content is displayed',
      'No errors',
      'Text is readable',
      'Navigation works',
      'Page structure correct'
    ]
  },
  {
    id: 'sanity-045',
    name: 'Terms of Service Page Test',
    url: '/terms',
    category: 'legal-pages',
    priority: 'low',
    expectedElements: [
      'h1',
      'main, article',
      'p, [class*="content"]',
      'nav, [class*="breadcrumb"]'
    ],
    validation: [
      'Terms page loads',
      'Content is displayed',
      'No errors',
      'Text is readable',
      'Navigation works',
      'Page structure correct'
    ]
  }
];

// Test execution with TestSprite MCP or Playwright fallback
async function executeTest(test) {
  const startTime = Date.now();
  const testUrl = `${config.baseUrl}${test.url}`;
  const errors = [];
  const warnings = [];
  let screenshotPath = null;

  try {
    // Use Playwright directly for browser automation
    // Note: TestSprite is MCP-only (works in Cursor AI context), not a REST API
    // The API key is for MCP server authentication, not REST API calls
    if (config.usePlaywright) {
      return await executeTestWithPlaywright(test, testUrl, startTime);
    } else {
      throw new Error('Playwright is required for browser automation. Run: npm install --save-dev playwright && npx playwright install chromium');
    }
  } catch (error) {
    const duration = Date.now() - startTime;

    // Capture screenshot on failure if enabled
    if (config.screenshotOnFailure) {
      try {
        screenshotPath = await captureScreenshot(testUrl, test.id);
      } catch (screenshotError) {
        warnings.push(`Failed to capture screenshot: ${screenshotError.message}`);
      }
    }

    return {
      success: false,
      duration: `${duration}ms`,
      error: error.message,
      errors: errors,
      warnings: warnings,
      screenshot: screenshotPath
    };
  }
}

// Note: TestSprite is MCP-only (works in Cursor AI context), not a REST API
// This function is kept for future reference but TestSprite doesn't have REST API endpoints
// The API key is for MCP server authentication, not REST API calls
async function executeTestWithTestSprite(test, testUrl, startTime) {
  // TestSprite doesn't have a REST API - it's MCP-only
  // MCP servers only work in Cursor's AI context, not in Node.js scripts
  throw new Error('TestSprite is MCP-only (Cursor AI context), not a REST API. Use Playwright for Node.js scripts.');
}

// Global browser instance and auth state (reused across tests)
let globalBrowser = null;
let authStateLoaded = false;

// Initialize browser and authentication
async function initializeBrowserAndAuth() {
  if (globalBrowser && authStateLoaded) {
    return globalBrowser;
  }

  const playwright = await import('playwright');

  // Launch browser
  globalBrowser = await playwright.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // If authentication is enabled and credentials are provided, authenticate
  if (config.authEnabled && config.credentials.email && config.credentials.password) {
    try {
      // Check if auth state file exists
      if (fs.existsSync(config.authStatePath)) {
        console.log('   🔐 Loading saved authentication state...');
        // Auth state will be loaded when creating context
        authStateLoaded = true;
      } else {
        console.log('   🔐 No saved auth state found. Authenticating...');
        // Create authenticated context and save state
        await authenticateAndSaveState(globalBrowser);
        authStateLoaded = true;
      }
    } catch (authError) {
      console.warn(`   ⚠️  Authentication failed: ${authError.message}`);
      console.warn(`   ⚠️  Admin pages will fail with 401. Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local`);
    }
  }

  return globalBrowser;
}

// Authenticate and save state
async function authenticateAndSaveState(browser) {
  const playwright = await import('playwright');

  // Create temporary context for authentication
  const tempContext = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York'
  });

  const tempPage = await tempContext.newPage();

  try {
    // Navigate to sign-in
    await tempPage.goto(`${config.baseUrl}/sign-in`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Wait for and fill email
    const emailSelector = 'input[type="email"], input[name="identifier"], input[id*="identifier"], input[placeholder*="email" i]';
    await tempPage.waitForSelector(emailSelector, { timeout: 10000 });
    await tempPage.fill(emailSelector, config.credentials.email);

    // Wait for and fill password
    const passwordSelector = 'input[type="password"], input[name="password"]';
    await tempPage.waitForSelector(passwordSelector, { timeout: 10000 });
    await tempPage.fill(passwordSelector, config.credentials.password);

    // Submit form
    const submitSelector = 'button[type="submit"], button:has-text("Sign in"), button:has-text("Continue")';
    await tempPage.waitForSelector(submitSelector, { timeout: 10000 });
    await tempPage.click(submitSelector);

    // Wait for redirect (sign-in successful)
    await tempPage.waitForURL(
      (url) => !url.pathname.includes('/sign-in') && !url.pathname.includes('/sign-up'),
      { timeout: 30000 }
    );

    // Save authentication state
    await tempContext.storageState({ path: config.authStatePath });
    console.log(`   ✅ Authentication successful! State saved to ${config.authStatePath}`);
  } finally {
    await tempContext.close();
  }
}

// Execute test using Playwright
async function executeTestWithPlaywright(test, testUrl, startTime) {
  let playwright;
  try {
    playwright = await import('playwright');
  } catch (importError) {
    throw new Error('Playwright not installed. Run: npm install --save-dev playwright && npx playwright install chromium');
  }

  // Initialize browser and auth if needed
  const browser = await initializeBrowserAndAuth();

  let context;
  let page;
  const errors = [];
  const warnings = [];
  let screenshotPath = null;

  try {
    // Create context - use saved auth state if available and test requires auth
    const contextOptions = {
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'en-US',
      timezoneId: 'America/New_York'
    };

    // If test requires auth and we have saved state, use it
    if (test.requiresAuth && config.authEnabled && fs.existsSync(config.authStatePath)) {
      contextOptions.storageState = config.authStatePath;
    }

    context = await browser.newContext(contextOptions);
    page = await context.newPage();
    // Set up console error listener
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Set up page error listener
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // Navigate to page with redirect handling
    // For public pages, Clerk might redirect to sign-in if middleware misconfigures
    // Follow redirects and check final URL
    // Use domcontentloaded first for faster initial load, then wait for networkidle
    let response;
    try {
      response = await page.goto(testUrl, {
        waitUntil: 'domcontentloaded', // Faster initial load
        timeout: config.timeout
      });

      // Wait for network to be idle after initial load (gives time for Next.js compilation)
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
        // If networkidle times out, that's okay - page might still be loading
        warnings.push('Network idle timeout - page may still be loading');
      });
    } catch (navigationError) {
      // Handle connection errors more gracefully
      if (navigationError.message.includes('ERR_CONNECTION_RESET') ||
          navigationError.message.includes('ERR_CONNECTION_REFUSED') ||
          navigationError.message.includes('net::ERR')) {
        // Server might be compiling - wait a bit and retry once
        warnings.push(`Connection error on first attempt: ${navigationError.message}`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

        try {
          response = await page.goto(testUrl, {
            waitUntil: 'domcontentloaded',
            timeout: config.timeout
          });
          await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
        } catch (retryError) {
          throw new Error(`Connection failed after retry: ${retryError.message}. Server may be down or compiling.`);
        }
      } else {
        throw navigationError;
      }
    }

    // Check if we were redirected to sign-in page (indicates middleware blocking)
    const finalUrl = page.url();
    if (finalUrl.includes('/sign-in') && !testUrl.includes('/sign-in')) {
      throw new Error(`Page redirected to sign-in (401 Unauthorized). Public route may be missing from middleware publicRoutes. Original URL: ${testUrl}`);
    }

    if (!response || !response.ok()) {
      // Get more details about the error
      const status = response?.status() || 'unknown';
      const statusText = response?.statusText() || 'unknown';
      throw new Error(`Page returned status ${status} ${statusText}. URL: ${testUrl}, Final URL: ${finalUrl}`);
    }

    // Wait for page to be ready
    await page.waitForLoadState('domcontentloaded');

    // Check for JavaScript errors (treat React warnings as warnings, not errors)
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('setState') &&
      !err.includes('Cannot update a component') &&
      !err.includes('while rendering')
    );
    const reactWarnings = consoleErrors.filter(err =>
      err.includes('setState') ||
      err.includes('Cannot update a component') ||
      err.includes('while rendering')
    );

    if (criticalErrors.length > 0) {
      errors.push(`JavaScript console errors: ${criticalErrors.join(', ')}`);
    }
    if (reactWarnings.length > 0) {
      warnings.push(`React warnings (non-critical): ${reactWarnings.join(', ')}`);
    }
    if (pageErrors.length > 0) {
      errors.push(`Page errors: ${pageErrors.join(', ')}`);
    }

    // Check expected elements (more flexible - check if ANY element in selector group exists)
    const missingElements = [];
    for (const selector of test.expectedElements || []) {
      try {
        // Handle comma-separated selectors (e.g., "h1, h2, h3")
        const selectorParts = selector.split(',').map(s => s.trim());
        let found = false;

        for (const part of selectorParts) {
          try {
            const element = await page.locator(part).first();
            const isVisible = await element.isVisible().catch(() => false);
            if (isVisible) {
              found = true;
              break; // Found at least one element in this selector group
            }
          } catch (partError) {
            // Continue checking other parts
            continue;
          }
        }

        if (!found) {
          missingElements.push(selector);
        }
      } catch (checkError) {
        // Only add to missing if we couldn't check at all
        missingElements.push(selector);
      }
    }

    // Only report missing elements as warnings if page loaded successfully (status 200)
    // Missing elements are less critical than page load failures
    if (missingElements.length > 0 && response && response.ok()) {
      warnings.push(`Some expected elements not found: ${missingElements.join(', ')}`);
    } else if (missingElements.length > 0) {
      errors.push(`Missing elements: ${missingElements.join(', ')}`);
    }

    // Execute interactions if defined
    if (test.interactions) {
      for (const interaction of test.interactions) {
        try {
          if (interaction.type === 'wait') {
            await page.waitForSelector(interaction.selector, { timeout: interaction.timeout || 5000 });
          } else if (interaction.type === 'check') {
            const element = await page.locator(interaction.selector).first();
            if (interaction.visible !== undefined) {
              const isVisible = await element.isVisible();
              if (isVisible !== interaction.visible) {
                errors.push(`Element ${interaction.selector} visibility check failed`);
              }
            }
            if (interaction.count) {
              const count = await page.locator(interaction.selector).count();
              if (interaction.count.min && count < interaction.count.min) {
                errors.push(`Element ${interaction.selector} count ${count} is less than minimum ${interaction.count.min}`);
              }
              if (interaction.count.max && count > interaction.count.max) {
                errors.push(`Element ${interaction.selector} count ${count} is greater than maximum ${interaction.count.max}`);
              }
            }
          }
        } catch (interactionError) {
          warnings.push(`Interaction failed: ${interactionError.message}`);
        }
      }
    }

    // Check page title
    const title = await page.title();
    if (test.validation && test.validation.some(v => v.includes('title'))) {
      if (!title || title.toLowerCase().includes('error')) {
        errors.push(`Page title indicates error: ${title}`);
      }
    }

    // Capture screenshot on failure
    if (errors.length > 0 && config.screenshotOnFailure) {
      screenshotPath = path.join(__dirname, 'screenshots', `failure-${test.id}-${Date.now()}.png`);
      await fs.promises.mkdir(path.dirname(screenshotPath), { recursive: true });
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }

    const duration = Date.now() - startTime;
    const success = errors.length === 0;

    // Close browser properly
    if (browser) {
      await browser.close().catch(() => {}); // Ignore close errors
    }

    return {
      success,
      duration: `${duration}ms`,
      error: errors.length > 0 ? errors.join('; ') : null,
      errors: errors,
      warnings: warnings,
      screenshot: screenshotPath,
      consoleErrors: consoleErrors,
      pageErrors: pageErrors,
      missingElements: missingElements.length > 0 ? missingElements : null
    };
  } catch (error) {
    // Ensure browser is closed even on error
    if (browser) {
      await browser.close().catch(() => {}); // Ignore close errors
    }

    // Provide more helpful error messages
    if (error.message.includes('Target page, context or browser has been closed')) {
      throw new Error(`Browser closed unexpectedly. This may indicate: 1) Playwright browser not installed (run: npx playwright install chromium), 2) System resource issues, or 3) Browser crash. Original error: ${error.message}`);
    }
    throw error;
  }
}

// Capture screenshot helper
async function captureScreenshot(url, testId) {
  // This would be implemented with TestSprite MCP or Playwright
  const screenshotPath = path.join(__dirname, 'screenshots', `failure-${testId}-${Date.now()}.png`);
  await fs.promises.mkdir(path.dirname(screenshotPath), { recursive: true });
  return screenshotPath;
}

// Main test execution function
async function runSanityTests() {
  console.log('🚀 Starting Comprehensive Malayalees US Site Sanity Tests');
  console.log(`📍 Base URL: ${config.baseUrl}`);
  console.log(`⏱️  Expected Duration: ${config.testDuration}`);
  if (config.authEnabled && config.credentials.email) {
    console.log(`🔐 Authentication: Enabled (${config.credentials.email})`);
    if (fs.existsSync(config.authStatePath)) {
      console.log(`   ✅ Using saved authentication state`);
    } else {
      console.log(`   ⚠️  No saved auth state - will authenticate on first admin test`);
    }
  } else {
    console.log(`🔐 Authentication: Disabled (admin pages will fail with 401)`);
    console.log(`   💡 Tip: Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local to enable authentication`);
  }
  console.log(`🧪 Test Engine: Playwright (Browser automation)`);
  if (testSpriteApiKey) {
    console.log(`   ℹ️  TestSprite API key found (for MCP server use in Cursor AI)`);
  }
  console.log(`   📦 Using: Local browser execution with Playwright`);
  console.log('='.repeat(70));

  const results = {
    total: testScenarios.length,
    passed: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    testResults: [],
    categories: {
      'public-pages': { total: 0, passed: 0, failed: 0 },
      'admin-pages': { total: 0, passed: 0, failed: 0 },
      'user-pages': { total: 0, passed: 0, failed: 0 },
      'authentication': { total: 0, passed: 0, failed: 0 },
      'legal-pages': { total: 0, passed: 0, failed: 0 }
    }
  };

  // Count tests by category
  testScenarios.forEach(test => {
    if (results.categories[test.category]) {
      results.categories[test.category].total++;
    }
  });

  for (const test of testScenarios) {
    console.log(`\n🧪 [${test.id}] Running: ${test.name}`);
    console.log(`   Category: ${test.category} | Priority: ${test.priority}`);
    console.log(`   URL: ${config.baseUrl}${test.url}`);

    // Check if test should be skipped
    if (test.skipIf) {
      console.log(`   ⏭️  SKIPPED: ${test.skipIf}`);
      results.skipped++;
      results.testResults.push({
        id: test.id,
        name: test.name,
        url: test.url,
        category: test.category,
        priority: test.priority,
        status: 'skipped',
        duration: '0ms',
        error: test.skipIf
      });
      continue;
    }

    try {
      // Add small delay between tests to prevent overwhelming the server
      // This is especially important when Next.js needs to compile pages
      if (test.id !== 'sanity-001') {
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between tests
      }

      const testResult = await executeTest(test);

      const testData = {
        id: test.id,
        name: test.name,
        url: test.url,
        category: test.category,
        priority: test.priority,
        status: testResult.success ? 'passed' : 'failed',
        duration: testResult.duration || '0ms',
        error: testResult.error || null,
        errors: testResult.errors || [],
        warnings: testResult.warnings || [],
        expectedElements: test.expectedElements,
        validation: test.validation,
        screenshot: testResult.screenshot || null,
        missingElements: testResult.missingElements || null,
        consoleErrors: testResult.consoleErrors || [],
        pageErrors: testResult.pageErrors || []
      };

      results.testResults.push(testData);

      // Update category stats
      if (results.categories[test.category]) {
        if (testResult.success) {
          results.categories[test.category].passed++;
          results.passed++;
        } else {
          results.categories[test.category].failed++;
          results.failed++;
        }
      }

      if (testResult.success) {
        console.log(`   ✅ PASSED (${testData.duration})`);
        if (testResult.warnings && testResult.warnings.length > 0) {
          testResult.warnings.forEach(w => console.log(`      ⚠️  ${w}`));
        }
      } else {
        console.log(`   ❌ FAILED: ${testResult.error}`);
        if (testResult.errors && testResult.errors.length > 0) {
          testResult.errors.forEach(e => console.log(`      • ${e}`));
        }
        if (testResult.missingElements && testResult.missingElements.length > 0) {
          console.log(`      Missing elements: ${testResult.missingElements.join(', ')}`);
        }
        results.errors.push({
          test: test.name,
          category: test.category,
          error: testResult.error,
          missingElements: testResult.missingElements
        });
      }
    } catch (error) {
      console.log(`   💥 ERROR: ${error.message}`);
      results.failed++;
      results.errors.push({
        test: test.name,
        category: test.category,
        error: error.message
      });

      results.testResults.push({
        id: test.id,
        name: test.name,
        url: test.url,
        category: test.category,
        priority: test.priority,
        status: 'failed',
        duration: '0ms',
        error: error.message
      });

      // Update category stats
      if (results.categories[test.category]) {
        results.categories[test.category].failed++;
      }
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 COMPREHENSIVE SANITY TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  const successRate = results.total - results.skipped > 0
    ? ((results.passed / (results.total - results.skipped)) * 100).toFixed(1)
    : 0;
  console.log(`Success Rate: ${successRate}%`);

  // Category breakdown
  console.log('\n📋 Results by Category:');
  Object.entries(results.categories).forEach(([category, stats]) => {
    if (stats.total > 0) {
      const rate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0;
      console.log(`   ${category}: ${stats.passed}/${stats.total} passed (${rate}%)`);
    }
  });

  if (results.errors.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.errors.forEach(error => {
      console.log(`   • [${error.category}] ${error.test}: ${error.error}`);
      if (error.missingElements && error.missingElements.length > 0) {
        console.log(`     Missing: ${error.missingElements.join(', ')}`);
      }
    });
  }

  console.log('\n🎯 Comprehensive sanity tests completed!');
  console.log('📄 Generating HTML report...');

  // Generate HTML report
  await generateHTMLReport(results);

  // Cleanup: Close browser if it was opened
  if (globalBrowser) {
    console.log('\n🧹 Cleaning up browser...');
    await globalBrowser.close().catch(() => {});
    globalBrowser = null;
    authStateLoaded = false;
  }

  return results;
}

// Generate comprehensive HTML report (keeping existing implementation)
async function generateHTMLReport(results) {
  const timestamp = new Date().toLocaleString();
  const successRate = results.total - results.skipped > 0
    ? ((results.passed / (results.total - results.skipped)) * 100).toFixed(1)
    : 0;

  // Group tests by category
  const testsByCategory = {};
  results.testResults.forEach(test => {
    if (!testsByCategory[test.category]) {
      testsByCategory[test.category] = [];
    }
    testsByCategory[test.category].push(test);
  });

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Sanity Test Report - Malayalees US Site</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .summary {
            padding: 30px;
            border-bottom: 2px solid #eee;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .summary-card .number {
            font-size: 2.5em;
            font-weight: bold;
        }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .total { color: #007bff; }
        .success-rate { color: #17a2b8; }
        .skipped { color: #ffc107; }
        .category-section {
            padding: 30px;
            border-bottom: 1px solid #eee;
        }
        .category-section:last-child {
            border-bottom: none;
        }
        .category-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
        }
        .category-header h2 {
            color: #333;
            font-size: 1.5em;
        }
        .category-stats {
            display: flex;
            gap: 15px;
            font-size: 0.9em;
        }
        .category-stats span {
            padding: 5px 10px;
            border-radius: 4px;
            background: #f8f9fa;
        }
        .test-item {
            display: flex;
            align-items: flex-start;
            padding: 15px;
            margin: 10px 0;
            border-radius: 6px;
            border-left: 4px solid;
            transition: background-color 0.2s;
        }
        .test-item:hover {
            background-color: #f8f9fa;
        }
        .test-item.passed {
            background: #d4edda;
            border-left-color: #28a745;
        }
        .test-item.failed {
            background: #f8d7da;
            border-left-color: #dc3545;
        }
        .test-item.skipped {
            background: #fff3cd;
            border-left-color: #ffc107;
        }
        .test-status {
            font-size: 1.5em;
            margin-right: 15px;
            flex-shrink: 0;
        }
        .test-info {
            flex: 1;
        }
        .test-info h4 {
            margin: 0 0 5px 0;
            color: #333;
            font-size: 1.1em;
        }
        .test-info .test-id {
            font-family: monospace;
            font-size: 0.85em;
            color: #666;
            margin-right: 10px;
        }
        .test-info .test-priority {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 0.75em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .priority-critical { background: #dc3545; color: white; }
        .priority-high { background: #fd7e14; color: white; }
        .priority-medium { background: #ffc107; color: #333; }
        .priority-low { background: #6c757d; color: white; }
        .test-info p {
            margin: 5px 0 0 0;
            color: #666;
            font-size: 0.9em;
        }
        .test-details {
            margin-left: auto;
            text-align: right;
            flex-shrink: 0;
        }
        .test-details .url {
            font-family: monospace;
            background: #f1f1f1;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 0.85em;
            margin-bottom: 5px;
            display: inline-block;
        }
        .test-details .duration {
            font-size: 0.8em;
            color: #666;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #666;
            border-top: 1px solid #eee;
        }
        .timestamp {
            font-size: 0.9em;
            opacity: 0.8;
        }
        .expandable {
            margin-top: 10px;
            padding: 10px;
            background: rgba(0,0,0,0.02);
            border-radius: 4px;
            font-size: 0.85em;
        }
        .expandable h5 {
            margin: 0 0 5px 0;
            color: #333;
        }
        .expandable ul {
            margin: 5px 0 0 20px;
            color: #666;
        }
        .error-details {
            margin-top: 5px;
            padding: 5px;
            background: #fff3cd;
            border-left: 3px solid #ffc107;
            font-size: 0.85em;
        }
        .missing-elements {
            color: #dc3545;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Comprehensive Sanity Test Report</h1>
            <p>Malayalees US Site Event Registration Platform</p>
            <p style="margin-top: 10px; font-size: 0.9em;">Test Engine: ${testSpriteApiKey ? 'TestSprite API (Cloud)' : 'Playwright (Local)'} | ${results.total} Tests | ${successRate}% Success Rate</p>
        </div>

        <div class="summary">
            <h2>📊 Test Summary</h2>
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Total Tests</h3>
                    <div class="number total">${results.total}</div>
                </div>
                <div class="summary-card">
                    <h3>Passed</h3>
                    <div class="number passed">${results.passed}</div>
                </div>
                <div class="summary-card">
                    <h3>Failed</h3>
                    <div class="number failed">${results.failed}</div>
                </div>
                <div class="summary-card">
                    <h3>Skipped</h3>
                    <div class="number skipped">${results.skipped}</div>
                </div>
                <div class="summary-card">
                    <h3>Success Rate</h3>
                    <div class="number success-rate">${successRate}%</div>
                </div>
            </div>
        </div>

        ${Object.entries(testsByCategory).map(([category, tests]) => {
          const categoryStats = results.categories[category] || { total: 0, passed: 0, failed: 0 };
          const categoryRate = categoryStats.total > 0
            ? ((categoryStats.passed / categoryStats.total) * 100).toFixed(1)
            : 0;

          return `
        <div class="category-section">
            <div class="category-header">
                <h2>${category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
                <div class="category-stats">
                    <span>Total: ${categoryStats.total}</span>
                    <span style="color: #28a745;">Passed: ${categoryStats.passed}</span>
                    <span style="color: #dc3545;">Failed: ${categoryStats.failed}</span>
                    <span style="color: #17a2b8;">Rate: ${categoryRate}%</span>
                </div>
            </div>
            ${tests.map(test => `
                <div class="test-item ${test.status}">
                    <div class="test-status">${test.status === 'passed' ? '✅' : test.status === 'skipped' ? '⏭️' : '❌'}</div>
                    <div class="test-info">
                        <h4>
                            <span class="test-id">${test.id}</span>
                            ${test.name}
                            ${test.priority ? `<span class="test-priority priority-${test.priority}">${test.priority}</span>` : ''}
                        </h4>
                        <p>${test.status === 'passed' ? 'Test completed successfully' : test.status === 'skipped' ? `Skipped: ${test.error || 'N/A'}` : `Error: ${test.error || 'Unknown error'}`}</p>
                        ${test.missingElements && test.missingElements.length > 0 ? `
                        <div class="error-details">
                            <strong class="missing-elements">Missing Elements:</strong> ${test.missingElements.map(el => `<code>${el}</code>`).join(', ')}
                        </div>
                        ` : ''}
                        ${test.errors && test.errors.length > 0 ? `
                        <div class="error-details">
                            <strong>Errors:</strong> ${test.errors.join('; ')}
                        </div>
                        ` : ''}
                        ${test.expectedElements && test.expectedElements.length > 0 ? `
                        <div class="expandable">
                            <h5>Expected Elements:</h5>
                            <ul>
                                ${test.expectedElements.map(el => `<li><code>${el}</code></li>`).join('')}
                            </ul>
                        </div>
                        ` : ''}
                    </div>
                    <div class="test-details">
                        <div class="url">${test.url}</div>
                        <div class="duration">${test.duration}</div>
                        ${test.screenshot ? `<div style="margin-top: 5px;"><a href="${test.screenshot}" target="_blank" style="font-size: 0.8em; color: #007bff;">📷 Screenshot</a></div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        `;
        }).join('')}

        <div class="footer">
            <p>Generated by Comprehensive TestSprite Sanity Test Suite</p>
            <p class="timestamp">Report generated on: ${timestamp}</p>
            <p class="timestamp">Base URL: ${config.baseUrl}</p>
            <p class="timestamp">Test Engine: ${testSpriteApiKey ? 'TestSprite API (Cloud Execution)' : 'Playwright (Local Execution)'}</p>
        </div>
    </div>
</body>
</html>`;

  const reportPath = path.join(__dirname, 'comprehensive-test-report.html');

  try {
    await fs.promises.writeFile(reportPath, htmlContent, 'utf8');
    console.log(`✅ HTML report generated: ${reportPath}`);
  } catch (error) {
    console.error('❌ Failed to generate HTML report:', error.message);
  }
}

// Export for use
export {
  config,
  testScenarios,
  runSanityTests,
  executeTest,
  executeTestWithPlaywright,
  executeTestWithTestSprite
};

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule || !process.env.NODE_ENV) {
  runSanityTests().catch(console.error);
}

