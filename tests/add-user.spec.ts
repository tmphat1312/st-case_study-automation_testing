import { expect, test } from "@playwright/test";
import { generateUniqueValue } from "../utils/generate-unique-value";
import { readDataRecordsFromFile } from "../utils/read-data-records-from-file";

const records = readDataRecordsFromFile<{
  "First Name": string;
  "Last Name": string;
  Email: string;
  Language: "English" | "Vietnamese" | (string & {});
  Status: "Active" | "Inactive" | (string & {});
  "User Designation":
    | "VP Of Operation"
    | "Senior Software Engineer"
    | "Software Engineer"
    | "Senior QA Manager"
    | "QA/Project Manager"
    | "Quality Architect"
    | "QA Lead"
    | "Quality Analyst"
    | "Technical Architect"
    | "Engineering Manager"
    | "Accout Manager"
    | "Developer"
    | "CTO"
    | (string & {});
  "Is Adminstrator": "TRUE" | "FALSE" | "";
  Project: "[E]" | "[NE]" | "";
  "Access Type": "Tester" | "Developer" | "Manager" | (string & {});
  Locale: string;
  Timezone: string;
  Expected: "New user" | "Error";
}>("data/add-user-form-data.csv");

test.beforeEach(async ({ page }) => {
  await page.goto("administration/add-user");
});

test.describe("Add user", () => {
  records.forEach((record, index) => {
    test(`Add user @index: ${index}`, async ({ page }) => {
      // logs for bug reporting
      console.log("@index: ", index);
      console.log("record: ", record);

      // make sure the form is visible
      await page.waitForURL("administration/add-user");
      await page.waitForSelector("#addUserForm");

      // get the first projectId to use, bcz it is from the db
      // so I can not use a concrete value here
      const firstProjectId = await page.evaluate(
        () =>
          document.querySelectorAll<HTMLOptionElement>(
            "select[name='projectId'] option"
          )[1].value
      );

      // handle the alert dialog
      page.on("dialog", async (dialog) => {
        console.log(page.url());
        console.log("Dialog message:", dialog.message());
        await dialog.accept();
      });

      // add record.[value] to the select option if it is not already there
      await page.evaluate(
        ({ record }) => {
          function addOptionToSelect(name: string, value: string) {
            const select = document.querySelector(`select[name='${name}']`);
            const availableOptions = new Set(
              Array.from(select?.querySelectorAll("option") ?? []).map(
                (option) => option.value
              )
            );

            if (!availableOptions.has(value)) {
              const option = document.createElement("option");
              option.value = value;
              option.text = value;
              select?.appendChild(option);
            }
          }

          addOptionToSelect("language", record.Language);
          addOptionToSelect("status", record.Status);
          addOptionToSelect("access-type", record["Access Type"]);
          addOptionToSelect("projectId", "fake-project");
        },
        { record }
      );

      // fill in the add user form
      await page.getByPlaceholder("First Name").fill(record["First Name"]);
      await page.getByPlaceholder("Last Name").fill(record["Last Name"]);
      await page
        .getByPlaceholder("Email")
        .fill(generateUniqueValue(record.Email));
      record.Language &&
        page.locator(`select[name='language']`).selectOption({
          value: record.Language,
        });
      record.Status &&
        page.locator(`select[name='status']`).selectOption({
          value: record.Status,
        });
      record["User Designation"] &&
        (await page
          .getByLabel("User Designation")
          .fill(record["User Designation"]));
      await page
        .locator("input[name='isAdmin']")
        .setChecked(record["Is Adminstrator"] === "TRUE");
      record["Project"] &&
        (await page.locator("select[name='projectId']").selectOption({
          value: record.Project == "[E]" ? firstProjectId : "fake-project",
        }));
      record["Access Type"] &&
        (await page.locator("select[name='access-type']").selectOption({
          value: record["Access Type"],
        }));
      record.Locale && (await page.getByLabel("Locale").fill(record.Locale));
      record.Timezone &&
        (await page.getByLabel("Timezone").fill(record.Timezone));

      // hit the save button
      await page.click("text=Save");

      // wait for the alert
      await page.waitForTimeout(1000);

      // check if the user was added successfully
      if (record.Expected === "New user") {
        page.waitForURL("administration?page=1");
        expect(page.url()).toBe("http://localhost:4000/administration?page=1");
      } else {
        expect(page.url()).toBe(
          "http://localhost:4000/administration/add-user"
        );
      }
    });
  });
});
