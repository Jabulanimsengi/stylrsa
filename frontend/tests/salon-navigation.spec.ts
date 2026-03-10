import { test, expect } from '@playwright/test';

test.describe('Salon profile navigation', () => {
  test('command search navigates to salon profile route', async ({ page }) => {
    await page.route('**/api/salons?search=**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'salon-1', name: 'Test Salon', slug: 'test-salon', city: 'Cape Town', province: 'Western Cape' },
        ]),
      });
    });

    await page.route('**/api/services?search=**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/api/salons/test-salon**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'salon-1',
          name: 'Test Salon',
          slug: 'test-salon',
          city: 'Cape Town',
          province: 'Western Cape',
          services: [],
          gallery: [],
          reviews: [],
        }),
      });
    });

    await page.goto('/test-salon-navigation');
    await page.click('button[aria-label="Search (Ctrl+K)"]');
    const commandInput = page.getByPlaceholder('Search salons, services, products...');
    await expect(commandInput).toBeVisible();
    await commandInput.fill('test');
    const result = page.getByTestId('command-result-salon-salon-1');
    await expect(result).toBeVisible();
    await expect(result).toHaveAttribute('data-url', '/salons/test-salon');
  });

  test('homepage venue autocomplete navigates to salon profile route', async ({ page }) => {
    await page.route('**/api/services/autocomplete**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          venues: [{ id: 'venue-1', name: 'Venue One', slug: 'venue-one', city: 'Johannesburg' }],
          services: [],
        }),
      });
    });

    await page.route('**/api/salons/venue-one**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'venue-1',
          name: 'Venue One',
          slug: 'venue-one',
          city: 'Johannesburg',
          province: 'Gauteng',
          services: [],
          gallery: [],
          reviews: [],
        }),
      });
    });

    await page.goto('/test-salon-navigation');
    const heroInput = page.locator('input[placeholder="All treatments and venues"]:visible');
    await expect(heroInput).toBeVisible();
    await heroInput.fill('ve');
    const venueSuggestion = page.getByTestId('hero-venue-venue-1');
    await expect(venueSuggestion).toBeVisible();
    await expect(venueSuggestion).toHaveAttribute('data-url', '/salons/venue-one');
  });
});
