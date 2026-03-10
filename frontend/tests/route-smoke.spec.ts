import { expect, test } from '@playwright/test';

test.describe('Route smoke coverage', () => {
  test('homepage shell renders search and hero controls', async ({ page }) => {
    await page.goto('/test-salon-navigation');

    await expect(page.getByRole('button', { name: 'Search (Ctrl+K)' })).toBeVisible();
    await expect(page.locator('input[placeholder="All treatments and venues"]:visible')).toBeVisible();
  });

  test('salons list renders client-fetched results', async ({ page }) => {
    await page.route('**/api/salons/approved**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'salon-list-1',
            name: 'List Smoke Salon',
            slug: 'list-smoke-salon',
            city: 'Cape Town',
            province: 'Western Cape',
            backgroundImage: '/art_one.webp',
            avgRating: 4.8,
            reviews: [{ id: 'review-1' }],
          },
        ]),
      });
    });

    await page.goto('/salons?province=Western%20Cape');

    await expect(page.getByRole('heading', { name: 'Explore Salons' })).toBeVisible();
    await expect(page.getByText('List Smoke Salon')).toBeVisible();
    await expect(page.getByText('Cape Town, Western Cape')).toBeVisible();
  });

  test('salon detail harness renders booking and review content', async ({ page }) => {
    await page.goto('/test-salon-profile');

    await expect(page.getByTestId('test-salon-profile-page')).toBeVisible();
    await expect(page.getByText('Smoke Test Studio')).toBeVisible();
    await expect(page.getByText('Silk Press')).toBeVisible();
    await expect(page.getByText('Fast, clean, and consistent service.')).toBeVisible();
  });
});
