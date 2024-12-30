import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByLabel("Email Address")
    .fill(process.env.USER_EMAIL ?? "admin1@mail.com");
  await page.getByLabel("Password").fill(process.env.USER_PASSWORD ?? "123456");
  await page.getByRole("button", { name: "Login" }).click();

  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL("dashboard");

  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});
