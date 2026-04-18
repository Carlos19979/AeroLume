/**
 * Visual regression snapshot tests for the SailPreview SVG component.
 *
 * These tests use the dev-only harness page at /sail-preview-harness, which
 * mounts SailPreview in isolation via query params. This avoids driving the
 * multi-step configurator flow for each snapshot (slow and brittle).
 *
 * NOTE: SVG rendering is deterministic but Windows vs Linux CI may produce
 * minor anti-aliasing differences in curved strokes. maxDiffPixels: 100
 * absorbs those without hiding meaningful regressions. If CI still drifts
 * consider adding threshold: 0.2 as a secondary guard.
 *
 * First run: use --update-snapshots to create baseline PNGs.
 * Subsequent runs: compare against stored PNGs under
 *   tests/e2e/visual/sail-preview.spec.ts-snapshots/
 */

import { test, expect } from '@playwright/test';

const HARNESS = '/sail-preview-harness';
const SNAPSHOT_OPTS = { maxDiffPixels: 100 };

/** Navigate to the harness and return the container locator. */
async function goTo(
  page: Parameters<Parameters<typeof test>[2]>[0],
  params: { sailType: string; variant: string; reefs?: number; accent?: string },
) {
  const qs = new URLSearchParams({ sailType: params.sailType, variant: params.variant });
  if (params.reefs != null) qs.set('reefs', String(params.reefs));
  if (params.accent) qs.set('accent', params.accent);
  await page.goto(`${HARNESS}?${qs.toString()}`);
  const container = page.getByTestId('sail-preview-harness');
  await container.waitFor({ state: 'visible' });
  return container;
}

// ---------------------------------------------------------------------------
// Mayor estándar (gvstd) — mainsail with standard batten, supports reefs
// ---------------------------------------------------------------------------

test('gvstd · cruising · 2 reefs', async ({ page }) => {
  const el = await goTo(page, { sailType: 'gvstd', variant: 'cruising', reefs: 2 });
  await expect(el).toHaveScreenshot('gvstd-cruising-2reefs.png', SNAPSHOT_OPTS);
});

test('gvstd · cruising · 3 reefs', async ({ page }) => {
  const el = await goTo(page, { sailType: 'gvstd', variant: 'cruising', reefs: 3 });
  await expect(el).toHaveScreenshot('gvstd-cruising-3reefs.png', SNAPSHOT_OPTS);
});

test('gvstd · cruising_racing · 2 reefs', async ({ page }) => {
  const el = await goTo(page, { sailType: 'gvstd', variant: 'cruising_racing', reefs: 2 });
  await expect(el).toHaveScreenshot('gvstd-cruising_racing-2reefs.png', SNAPSHOT_OPTS);
});

// ---------------------------------------------------------------------------
// Mayor full-batten (gvfull) — supports reefs
// ---------------------------------------------------------------------------

test('gvfull · cruising · 3 reefs', async ({ page }) => {
  const el = await goTo(page, { sailType: 'gvfull', variant: 'cruising', reefs: 3 });
  await expect(el).toHaveScreenshot('gvfull-cruising-3reefs.png', SNAPSHOT_OPTS);
});

// ---------------------------------------------------------------------------
// Mayor enrollable (gve) — in-mast furling, no reefs
// ---------------------------------------------------------------------------

test('gve · cruising · no reefs', async ({ page }) => {
  const el = await goTo(page, { sailType: 'gve', variant: 'cruising' });
  await expect(el).toHaveScreenshot('gve-cruising-noreefs.png', SNAPSHOT_OPTS);
});

// ---------------------------------------------------------------------------
// Génova (gn) — headsail, no reefs
// ---------------------------------------------------------------------------

test('gn · cruising · no reefs', async ({ page }) => {
  const el = await goTo(page, { sailType: 'gn', variant: 'cruising' });
  await expect(el).toHaveScreenshot('gn-cruising-noreefs.png', SNAPSHOT_OPTS);
});

// ---------------------------------------------------------------------------
// Génova enrollable (gse) — headsail with UV band, no reefs
// ---------------------------------------------------------------------------

test('gse · cruising · no reefs', async ({ page }) => {
  const el = await goTo(page, { sailType: 'gse', variant: 'cruising' });
  await expect(el).toHaveScreenshot('gse-cruising-noreefs.png', SNAPSHOT_OPTS);
});

// ---------------------------------------------------------------------------
// Génova enrollable narrow (gen) — code sail narrow, no reefs
// ---------------------------------------------------------------------------

test('gen · cruising · no reefs', async ({ page }) => {
  const el = await goTo(page, { sailType: 'gen', variant: 'cruising' });
  await expect(el).toHaveScreenshot('gen-cruising-noreefs.png', SNAPSHOT_OPTS);
});

// ---------------------------------------------------------------------------
// Spinnaker simétrico (spisym)
// ---------------------------------------------------------------------------

test('spisym · cruising · no reefs', async ({ page }) => {
  const el = await goTo(page, { sailType: 'spisym', variant: 'cruising' });
  await expect(el).toHaveScreenshot('spisym-cruising-noreefs.png', SNAPSHOT_OPTS);
});

// ---------------------------------------------------------------------------
// Mayor enrollable enrollador (furling) — code sail, no reefs
// ---------------------------------------------------------------------------

test('furling · cruising · no reefs', async ({ page }) => {
  const el = await goTo(page, { sailType: 'furling', variant: 'cruising' });
  await expect(el).toHaveScreenshot('furling-cruising-noreefs.png', SNAPSHOT_OPTS);
});

// ---------------------------------------------------------------------------
// Accent color propagation — custom red accent on gvstd
// ---------------------------------------------------------------------------

test('gvstd · cruising · 2 reefs · custom accent #ff0055', async ({ page }) => {
  const el = await goTo(page, { sailType: 'gvstd', variant: 'cruising', reefs: 2, accent: '#ff0055' });
  await expect(el).toHaveScreenshot('gvstd-cruising-2reefs-accent-ff0055.png', SNAPSHOT_OPTS);
});
