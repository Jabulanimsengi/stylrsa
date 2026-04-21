import { test, expect } from '@playwright/test';
import path from 'path';
import { createRequire } from 'module';

const backendDir = path.resolve(process.cwd(), '../backend');
const backendRequire = createRequire(path.join(backendDir, 'package.json'));
const dotenv = backendRequire('dotenv');
dotenv.config({ path: path.join(backendDir, '.env') });
const { PrismaClient } = backendRequire('@prisma/client');
const argon2 = backendRequire('argon2');
const prisma = new PrismaClient();

const cleanupEmails = new Set<string>();

async function dismissCookieBanner(page: import('@playwright/test').Page) {
  const acceptButton = page.getByRole('button', { name: 'Accept' });
  await acceptButton.click({ timeout: 5000 }).catch(() => {});
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

test.afterEach(async () => {
  for (const email of cleanupEmails) {
    await cleanupUserByEmail(email);
  }
  cleanupEmails.clear();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test('password reset lets an existing user sign in with a new password', async ({ page }) => {
  test.slow();

  const unique = Date.now();
  const email = `password-reset-smoke-${unique}@stylrsa.local`;
  const originalPassword = 'Original123!';
  const newPassword = 'ResetFresh123!';
  cleanupEmails.add(email);

  await cleanupUserByEmail(email);

  const passwordHash = await argon2.hash(originalPassword);
  await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      firstName: 'Reset',
      lastName: 'Smoke',
      role: 'SALON_OWNER',
      onboardingStatus: 'PROVIDER_SETUP_REQUIRED',
      emailVerified: true,
    },
  });

  await page.goto('/forgot-password');
  await dismissCookieBanner(page);
  await page.getByLabel('Email address').fill(email);
  await page.getByRole('button', { name: 'Send Reset Link' }).click();

  await expect
    .poll(async () => prisma.user.findUnique({
      where: { email },
      select: {
        resetPasswordToken: true,
        resetPasswordExpires: true,
      },
    }), { timeout: 15000 })
    .toBeTruthy();

  await expect(
    page.getByText("If an account with that email exists, we've sent password reset instructions.", { exact: false })
  ).toBeVisible({ timeout: 15000 });

  const resetUser = await prisma.user.findUnique({
    where: { email },
    select: {
      resetPasswordToken: true,
      resetPasswordExpires: true,
    },
  });

  expect(resetUser?.resetPasswordToken).toBeTruthy();
  expect(resetUser?.resetPasswordExpires).toBeTruthy();

  await page.goto(`/reset-password?token=${resetUser!.resetPasswordToken}`);
  await page.getByLabel('New Password', { exact: true }).fill(newPassword);
  await page.getByLabel('Confirm New Password', { exact: true }).fill(newPassword);
  await page.getByRole('button', { name: 'Reset Password' }).click();

  await expect(page.getByText('Password reset successfully! Redirecting to login...')).toBeVisible();
  await page.waitForURL(/\/\?auth=login/);
  await dismissCookieBanner(page);

  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible({ timeout: 15000 });
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(newPassword);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForURL('**/create-salon');
  await expect(page.getByRole('heading', { name: 'Create Your Salon Profile' })).toBeVisible();

  const finalUser = await prisma.user.findUnique({
    where: { email },
    select: {
      resetPasswordToken: true,
      resetPasswordExpires: true,
      failedLoginAttempts: true,
      accountLockedUntil: true,
    },
  });

  expect(finalUser?.resetPasswordToken).toBeNull();
  expect(finalUser?.resetPasswordExpires).toBeNull();
  expect(finalUser?.failedLoginAttempts).toBe(0);
  expect(finalUser?.accountLockedUntil).toBeNull();
});
