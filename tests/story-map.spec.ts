import {test, expect} from "@playwright/test"

test.beforeEach(async ({page}) => {
	await page.goto(`/produuuuuuuuct-a35e31/map`)
})

test(`can create epic`, async ({page}) => {
	await page.getByTestId(`add-epic`).click()
	await expect(page.getByRole(`textbox`).filter({hasText: `Epic 1`})).toHaveCount(1)
})
