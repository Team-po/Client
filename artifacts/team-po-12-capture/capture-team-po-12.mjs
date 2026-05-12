import fs from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

const require = createRequire(
	"/Users/hwangjo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/",
);
const { PDFDocument } = require("pdf-lib");
const { chromium } = require("playwright");

const outDir = "/Users/hwangjo/Client/artifacts/team-po-12-capture";
const targetUrl = "http://127.0.0.1:5173/deck/team-po-12?mode=capture";
const slideWidth = 1680;
const slideHeight = 945;
const deviceScaleFactor = 2;

const readPngSize = (bytes) => {
	const signature = bytes.subarray(0, 8).toString("hex");

	if (signature !== "89504e470d0a1a0a") {
		throw new Error("Expected PNG screenshot output");
	}

	return {
		width: bytes.readUInt32BE(16),
		height: bytes.readUInt32BE(20),
	};
};

await fs.mkdir(outDir, { recursive: true });
const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "team-po-12-capture-"));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
	viewport: { width: 1800, height: 1100 },
	deviceScaleFactor,
});

try {
	await page.goto(targetUrl, { waitUntil: "load" });
	await page.waitForSelector("[class*='presentation-slide-inner']");
	await page.evaluate(() => document.fonts?.ready);

	const slides = page.locator("[class*='presentation-slide-inner']");
	const slideCount = await slides.count();
	const measurements = [];
	const slidePaths = [];
	const visualChecks = await page.evaluate(() => {
		const slideNodes = Array.from(
			document.querySelectorAll("[class*='presentation-slide-inner']"),
		);
		const textSelectors = [
			"h1",
			"h2",
			"h3",
			"h4",
			"p",
			"span",
			"a",
			"button",
		].join(",");

		return slideNodes.map((slide, slideIndex) => {
			const slideRect = slide.getBoundingClientRect();
			const textOverflow = Array.from(slide.querySelectorAll(textSelectors))
				.filter((element) => {
					const rect = element.getBoundingClientRect();
					const style = window.getComputedStyle(element);
					const hasText = element.textContent?.trim();
					const visible =
						style.display !== "none" &&
						style.visibility !== "hidden" &&
						rect.width > 0 &&
						rect.height > 0;

					if (!hasText || !visible) {
						return false;
					}

					return (
						element.scrollWidth > element.clientWidth + 8 ||
						element.scrollHeight > element.clientHeight + 18
					);
				})
				.map((element) => ({
					tag: element.tagName.toLowerCase(),
					text: element.textContent?.trim().replace(/\s+/g, " ").slice(0, 90),
					clientWidth: element.clientWidth,
					scrollWidth: element.scrollWidth,
					clientHeight: element.clientHeight,
					scrollHeight: element.scrollHeight,
				}));
			const outsideSlide = Array.from(slide.querySelectorAll("*"))
				.filter((element) => {
					const rect = element.getBoundingClientRect();
					const style = window.getComputedStyle(element);
					const visible =
						style.display !== "none" &&
						style.visibility !== "hidden" &&
						rect.width > 0 &&
						rect.height > 0;

					if (!visible) {
						return false;
					}

					return (
						rect.left < slideRect.left - 2 ||
						rect.right > slideRect.right + 2 ||
						rect.top < slideRect.top - 2 ||
						rect.bottom > slideRect.bottom + 2
					);
				})
				.map((element) => ({
					tag: element.tagName.toLowerCase(),
					text: element.textContent?.trim().replace(/\s+/g, " ").slice(0, 90),
					className: String(element.className).slice(0, 120),
				}));

			return {
				index: slideIndex + 1,
				textOverflow,
				outsideSlide,
			};
		});
	});

	for (let index = 0; index < slideCount; index += 1) {
		const slide = slides.nth(index);
		await slide.scrollIntoViewIfNeeded();
		const box = await slide.boundingBox();

		if (!box) {
			throw new Error(`Could not measure slide ${index + 1}`);
		}

		measurements.push({
			index: index + 1,
			width: Math.round(box.width),
			height: Math.round(box.height),
			x: Math.round(box.x),
			y: Math.round(box.y),
		});

		const slidePath = path.join(
			outDir,
			`slide-${String(index + 1).padStart(2, "0")}.png`,
		);
		await slide.screenshot({ path: slidePath, animations: "disabled" });
		slidePaths.push(slidePath);
	}

	const imageDimensions = [];
	const pdf = await PDFDocument.create();

	for (const slidePath of slidePaths) {
		const pngBytes = await fs.readFile(slidePath);
		const png = await pdf.embedPng(pngBytes);
		const size = readPngSize(pngBytes);
		imageDimensions.push({ path: slidePath, ...size });
		const pdfPage = pdf.addPage([slideWidth, slideHeight]);

		pdfPage.drawImage(png, {
			x: 0,
			y: 0,
			width: slideWidth,
			height: slideHeight,
		});
	}

	const pdfPath = path.join(outDir, "team-po-12-presentation.pdf");
	const manifestPath = path.join(outDir, "capture-manifest.json");

	await fs.writeFile(pdfPath, await pdf.save());
	await fs.writeFile(
		manifestPath,
		JSON.stringify(
			{
				url: targetUrl,
				deviceScaleFactor,
				slideCount,
				expectedSlideSize: {
					css: { width: slideWidth, height: slideHeight },
					pixels: {
						width: slideWidth * deviceScaleFactor,
						height: slideHeight * deviceScaleFactor,
					},
				},
				measurements,
				imageDimensions,
				visualChecks,
				slides: slidePaths,
				pdf: pdfPath,
			},
			null,
			2,
		),
	);

	console.log(
		JSON.stringify(
			{
				slideCount,
				measurements,
				imageDimensions,
				visualIssues: visualChecks.filter(
					(check) =>
						check.textOverflow.length > 0 || check.outsideSlide.length > 0,
				),
				pdf: pdfPath,
				manifest: manifestPath,
			},
			null,
			2,
		),
	);
} finally {
	await browser.close();
	await fs.rm(tempDir, { recursive: true, force: true });
}
