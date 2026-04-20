import { test, expect, type Page } from '@playwright/test';
import path from 'path';
import { createRequire } from 'module';

const backendDir = path.resolve(process.cwd(), '../backend');
const backendRequire = createRequire(path.join(backendDir, 'package.json'));
const dotenv = backendRequire('dotenv');
dotenv.config({ path: path.join(backendDir, '.env') });
const { PrismaClient } = backendRequire('@prisma/client');
const prisma = new PrismaClient();

const BACKEND_ORIGIN = 'http://127.0.0.1:5000';
const cleanupEmails = new Set<string>();

type ApprovedSalon = {
  id: string;
  slug?: string | null;
  name: string;
  services?: Array<{ id: string; title?: string | null; name?: string | null }>;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function dismissCookieBanner(page: Page) {
  const acceptButton = page.getByRole('button', { name: 'Accept' });
  await acceptButton.click({ timeout: 5000 }).catch(() => {});
}

async function waitForVerificationToken(email: string) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { verificationToken: true },
    });

    if (user?.verificationToken) {
      return user.verificationToken;
    }

    await sleep(500);
  }

  throw new Error(`Timed out waiting for verification token for ${email}`);
}

async function cleanupUserByEmail(email: string) {
  const users = await prisma.user.findMany({
    where: { email },
    select: { id: true },
  });

  for (const user of users) {
    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { userId: user.id } }),
      prisma.favorite.deleteMany({ where: { userId: user.id } }),
      prisma.serviceLike.deleteMany({ where: { userId: user.id } }),
      prisma.userAddress.deleteMany({ where: { userId: user.id } }),
      prisma.oAuthAccount.deleteMany({ where: { userId: user.id } }),
      prisma.booking.deleteMany({ where: { userId: user.id } }),
      prisma.salon.deleteMany({ where: { ownerId: user.id } }),
      prisma.user.delete({ where: { id: user.id } }),
    ]);
  }
}

async function getBookableSalon(): Promise<ApprovedSalon> {
  const response = await fetch(`${BACKEND_ORIGIN}/api/salons/approved`);
  if (!response.ok) {
    throw new Error(`Failed to load approved salons: ${response.status}`);
  }

  const salons = (await response.json()) as ApprovedSalon[];
  const match = salons.find((salon) => Array.isArray(salon.services) && salon.services.length > 0);

  if (!match) {
    throw new Error('No approved salon with bookable services was found for smoke testing.');
  }

  return match;
}

test.afterEach(async () => {
  for (const email of cleanupEmails) {
    await cleanupUserByEmail(email);
  }
  cleanupEmails.clear();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test.describe.serial('Owner signup and guest booking smoke checks', () => {
  test('salon owner can sign up, verify email, and land on create salon', async ({ page }) => {
    const unique = Date.now();
    const email = `owner-smoke-${unique}@stylrsa.local`;
    const password = 'OwnerSmoke123!';
    cleanupEmails.add(email);

    await cleanupUserByEmail(email);

    await page.goto('/');
    await dismissCookieBanner(page);
    await page.getByText('List your salon', { exact: true }).click();

    await expect(page.getByRole('heading', { name: 'List your salon' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Create your salon owner account' })).toBeVisible();
    await expect(page.getByText('This signup is for salon owners only.')).toBeVisible();

    await page.getByLabel('Email address').fill(email);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await expect(page.getByText('Profile details')).toBeVisible();
    await page.getByLabel('First Name').fill('Smoke');
    await page.getByLabel('Last Name').fill('Owner');
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Create Salon Owner Account' }).click();

    await expect(page.getByRole('heading', { name: 'Verify Your Email' }).last()).toBeVisible();

    const verificationToken = await waitForVerificationToken(email);
    for (const [index, digit] of verificationToken.split('').entries()) {
      await page.getByLabel(`Digit ${index + 1}`).fill(digit);
    }
    await page.getByRole('button', { name: 'Verify Email' }).click();

    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL('**/create-salon');
    await expect(page.getByRole('heading', { name: 'Create Your Salon Profile' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Business details' })).toBeVisible();
    await expect(page.getByLabel('Salon name')).toBeVisible();
    await expect(page.getByLabel('Business email')).toHaveValue(email);
  });

  test('guest booking keeps the flow connected and prepares a WhatsApp handoff', async ({ page }) => {
    const salon = await getBookableSalon();

    await page.addInitScript(() => {
      Object.defineProperty(window, '__lastOpenedUrl', {
        configurable: true,
        enumerable: false,
        writable: true,
        value: null,
      });

      window.open = ((url?: string | URL) => {
        (window as unknown as Window & { __lastOpenedUrl: string | null }).__lastOpenedUrl =
          typeof url === 'string' ? url : url?.toString() ?? null;
        return null as never;
      }) as typeof window.open;
    });

    await page.goto(`/salons/${salon.slug || salon.id}`);
    await dismissCookieBanner(page);

    await expect(page.getByRole('heading', { name: /book appointment/i })).not.toBeVisible({ timeout: 1000 }).catch(() => {});
    await page.getByRole('button', { name: /book now/i }).first().click();

    await expect(page.getByRole('heading', { name: 'Book Appointment' })).toBeVisible();
    await expect(page.getByText('Continue Your Booking')).toBeVisible();

    await page.getByLabel('First Name *').fill('Guest');
    await page.getByLabel('Surname *').fill('Booking');
    await page.getByLabel('Contact Number *').fill('0821234567');
    await page.getByLabel('Email Address').fill('guest.booking@example.com');
    await page.getByRole('button', { name: /^Continue$/ }).click();

    await expect(page.getByText('Select Date & Time')).toBeVisible();
    await page.locator('[data-date]').first().click();
    await page.getByRole('button', { name: '09:00 - 12:00' }).click();
    await page.getByRole('button', { name: /^Continue$/ }).click();

    await expect(page.getByText('Preferences')).toBeVisible();
    await page.getByRole('button', { name: /^Continue$/ }).click();

    await expect(page.getByText('Review & Proceed')).toBeVisible();
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Continue to WhatsApp' }).click();

    await expect.poll(async () => page.evaluate(() => (window as unknown as Window & { __lastOpenedUrl?: string | null }).__lastOpenedUrl ?? null)).toContain('https://wa.me/');
    await expect.poll(async () => page.evaluate(() => (window as unknown as Window & { __lastOpenedUrl?: string | null }).__lastOpenedUrl ?? null)).toContain('StylRSA%20Booking%20Request');
  });
});
