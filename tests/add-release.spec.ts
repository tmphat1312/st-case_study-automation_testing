import { expect, test } from "@playwright/test";
import { conformDateFormat } from "../utils/conform-date-format";
import { generateUniqueValue } from "../utils/generate-unique-value";
import { readDataRecordsFromFile } from "../utils/read-data-records-from-file";

const records = readDataRecordsFromFile<{
  Name: string;
  "From Date": string;
  "To Date": string;
  Description: string;
  Expected: "New release" | "Error";
}>("data/add-release-form-data.csv");

test.beforeEach(async ({ page }) => {
  await page.goto("/project/list?page=1");
});

test.describe("Add release", () => {
  records.forEach((record, index) => {
    test(`Add release @index: ${index}`, async ({ page }) => {
      // logs for bug reporting
      console.log("@index: ", index);
      console.log("record: ", record);

      // Navigate to the first project's releases
      const projectURL = await page.evaluate(() =>
        document.querySelector(".card a")?.getAttribute("href")
      );

      if (!projectURL) throw Error("No project found");

      await page.locator(".card a").first().click();
      await page.waitForURL(projectURL);
      await page.click("text=Releases");
      await page.waitForURL(projectURL + "/release?statusFilter=open&page=1");

      // open the add release modal form
      await page.click(".btn-add-release button");

      // assert that the heading with the content "Add Release" is visible
      await page.waitForSelector(".modal-title >> text=Add Release");
      await page.waitForSelector("#addRelease.show");

      // fill in the add release form
      await page.fill('input[name="name"]', generateUniqueValue(record.Name));
      try {
        record["From Date"] &&
          (await page.fill(
            'input[name="startDate"]',
            conformDateFormat(record["From Date"])
          ));
      } catch (_) {
        if (record.Expected == "New release")
          throw Error("Invalid `From Date` date format");
      }
      try {
        record["To Date"] &&
          (await page.fill(
            'input[name="endDate"]',
            conformDateFormat(record["To Date"])
          ));
      } catch (_) {
        if (record.Expected == "New release")
          throw Error("Invalid `To Date` date format");
      }
      await page.fill('textarea[name="description"]', record.Description);

      // hit the save button
      await page.click("text=Save");

      // wait for the page to perform validation
      await page.waitForTimeout(500);

      // assert the result
      if (record.Expected == "New release") {
        // the modal should be closed
        expect(await page.isVisible("#addRelease.modal")).toBe(false);
      } else {
        // the modal should still be visible
        expect(await page.isVisible("#addRelease.modal")).toBe(true);
      }
    });
  });
});
