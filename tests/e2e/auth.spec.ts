import { test } from "@playwright/test";

import { loginAs, type RegressionRole } from "./helpers/auth";

const roles: readonly RegressionRole[] = [
  "administrator",
  "salesman",
  "promoter",
  "operator",
  "client",
  "finance",
  "manager",
  "recruiter",
];

test.describe("authentication regression", () => {
  for (const role of roles) {
    test(`${role} can sign in and reach its home workspace`, async ({
      page,
    }) => {
      await loginAs(page, role);
    });
  }
});
