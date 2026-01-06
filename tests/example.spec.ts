import { test, expect } from '@playwright/test';

test('creates a passkey and asserts it exists', async ({ browser }) => {

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

  // //  will allow future logins to use passkey??
  //     await client.send('WebAuthn.setUserVerified', {
  //     authenticatorId: authenticatorId,
  //     isUserVerified: true,
  //   });


  await page.goto('https://webauthn.io');
  await page.getByPlaceholder('example_username').fill('cropdusta');
  await page.getByRole('button', { name: 'Register' }).click();

  // Wait for registration to complete - look for success indicator
  await page.waitForSelector('text=Success', { timeout: 5000 });



  // get passkey results 
  //  TODO: check this is 0 at beginning of test
  const credentials = await client.send('WebAuthn.getCredentials', { authenticatorId });

  await expect(credentials.credentials.length).toBe(1);
  await expect(credentials.credentials[0].isResidentCredential).toBe(true);
  console.log('credentials', credentials);


  //  refresh and auth with passkey
  await page.reload()
  await expect(credentials.credentials.length).toBe(1);
  await expect(credentials.credentials[0].isResidentCredential).toBe(true);

  await page.getByPlaceholder('example_username').fill('cropdusta');
  await page.getByRole('button', { name: 'Authenticate' }).click();

  await page.waitForSelector(`text=You're logged in!`, { timeout: 5000 });



});
