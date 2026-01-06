import { test, expect } from '@playwright/test';

test.beforeEach(({ browserName }) => {
  test.skip(browserName !== 'chromium');
});

test('creates passkey', async ({ browser }) => {

  const context = await browser.newContext();
  const page = await context.newPage();

  const client = await context.newCDPSession(page);
  await client.send('WebAuthn.enable');
  const result = await client.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'usb',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
    },
  });

  const authenticatorId = result.authenticatorId;

  await page.goto('https://webauthn.io');
  await page.getByPlaceholder('example_username').fill('123');
  await page.getByRole('button', { name: 'Register' }).click();
  await page.waitForSelector('text=Success', { timeout: 5000 });

  // verify passkey created
  const credentials = await client.send('WebAuthn.getCredentials', { authenticatorId });
  await expect(credentials.credentials.length).toBe(1);
  await expect(credentials.credentials[0].isResidentCredential).toBe(true);


  //  refresh and auth with passkey
  await page.reload()
  await expect(credentials.credentials.length).toBe(1);
  await page.getByPlaceholder('example_username').fill('123');
  await page.getByRole('button', { name: 'Authenticate' }).click();

  await page.waitForSelector(`text=You're logged in!`, { timeout: 5000 });
});
