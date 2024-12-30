import { expect, test } from "@playwright/test";
import { conformDateFormat } from "../utils/conform-date-format";
import { generateUniqueValue } from "../utils/generate-unique-value";
import { readDataRecordsFromFile } from "../utils/read-data-records-from-file";

const records = readDataRecordsFromFile<{
  "Test Plan Name": string;
  "Release Id": "[E]" | "[NE]" | (string & {});
  "Assignment Date": string;
  "Expiration Date": string;
  Description: string;
  Expected: "New test plan" | "Error";
}>("data/add-test-plan-form-data.csv");

test.beforeEach(async ({ page }) => {
  await page.goto("/project/list?page=1");
});

test.describe("Add test plan", () => {
  records.forEach((record, index) => {
    test(`Add test plan @index: ${index}`, async ({ page }) => {
      // logs for bug reporting
      console.log("@index: ", index);
      console.log("record: ", record);

      // Navigate to the first project's test plans
      const projectURL = await page.evaluate(() =>
        document.querySelector(".card a")?.getAttribute("href")
      );

      if (!projectURL) throw Error("No project found");

      await page.locator(".card a").first().click();
      await page.waitForURL(projectURL);
      await page.click("text=Test Plans");
      await page.waitForURL(projectURL + "/test-plan?page=1");

      // open the add test plan modal form
      await page.click("button[data-bs-target='#addTestPlan']");

      // assert that the heading with the content "Add Test Plan" is visible
      await page.waitForSelector(".modal-title >> text=Add Test Plan");
      await page.waitForSelector("#addTestPlan.show");

      // add the `fake-release` option to the select element
      await page.evaluate(() => {
        const selectElement = document.querySelector<HTMLSelectElement>(
          'select[name="releaseId"]'
        );
        const option = document.createElement("option");
        option.value = "fake-release";
        option.text = "fake-release";
        selectElement?.appendChild(option);
      });

      // looking for the first release id in the list
      const releaseId = await page.evaluate(
        () =>
          document.querySelectorAll<HTMLOptionElement>(
            "select[name='releaseId'] option"
          )[1].value
      );

      if (!releaseId) throw Error("No release found");

      // fill in the add test plan form
      await page.fill(
        'input[name="name"]',
        generateUniqueValue(record["Test Plan Name"])
      );
      record["Release Id"] &&
        (await page.selectOption(
          'select[name="releaseId"]',
          record["Release Id"] == "[E]" ? releaseId : "fake-release"
        ));
      try {
        record["Assignment Date"] &&
          (await page.fill(
            'input[name="startDate"]',
            conformDateFormat(record["Assignment Date"])
          ));
      } catch (_) {
        if (record.Expected == "New test plan")
          throw Error("Invalid `Assignment Date` date format");
      }
      try {
        record["Expiration Date"] &&
          (await page.fill(
            'input[name="endDate"]',
            conformDateFormat(record["Expiration Date"])
          ));
      } catch (_) {
        if (record.Expected == "New test plan")
          throw Error("Invalid `Expiration Date` date format");
      }
      await page.fill('textarea[name="description"]', record.Description);

      // hit the save button
      await page.click("text=Save");

      // wait for the page to perform validation
      await page.waitForTimeout(500);

      // assert the result
      if (record.Expected == "New test plan") {
        // the modal should be closed
        expect(await page.isVisible("#addTestPlan.modal")).toBe(false);
      } else {
        // the modal should still be visible
        expect(await page.isVisible("#addTestPlan.modal")).toBe(true);
      }
    });
  });
});
