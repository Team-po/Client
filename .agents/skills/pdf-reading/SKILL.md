---
name: pdf-reading
description: "Reads local PDF contents in restricted environments. Use when a user wants text or slide contents from a PDF, especially when standard text extractors are unavailable or the PDF text layer is empty. Falls back to rendering pages as temporary images for visual inspection, then cleans them up."
user-invocable: false
---

# PDF Reading

Use this skill when you need to inspect a local PDF and normal text extraction is unavailable, broken, or returns empty output.

Typical cases:

- "이 PDF 읽어줘"
- "PDF 내용 보고 슬라이드/문서 반영해줘"
- `pdftotext`, `pdfinfo`, `pypdf`, `PyPDF2`, or `fitz` are not installed
- the PDF has little or no readable text layer

## Workflow

1. Start with text extraction first. Prefer the cheapest successful method.
   - `pdftotext <file> -`
   - `mutool draw -F txt <file>`
   - `python3 -c "import pypdf ..."`
   - `python3 -c "import PyPDF2 ..."`
   - `python3 -c "import fitz ..."`
2. If those tools are missing or produce empty output, render the PDF pages to temporary PNG files.
3. Inspect the rendered pages with the image viewer tool.
4. Summarize the contents in your own words.
5. Remove the temporary images immediately after inspection.

## Rendering Fallback

Prefer Ghostscript and render into a temporary directory under `/tmp`, not the repository.

```bash
tmpdir="$(mktemp -d /tmp/pdf-pages.XXXXXX)"
gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=png16m -r144 \
  -sOutputFile="$tmpdir/page-%02d.png" <file.pdf>
find "$tmpdir" -maxdepth 1 -name 'page-*.png' | sort
```

Notes:

- `-r144` is usually enough for readable slides and keeps files smaller.
- If the PDF is dense or small-text heavy, raise resolution to `-r200` or `-r300`.
- Keep the output in `/tmp` unless a tool limitation forces a workspace path.

## Inspection Rules

- Use the temporary rendered images only to read the PDF contents.
- Do not leave `page-*.png` files in the repository after the task.
- If you must render into the workspace for a tool limitation, delete those files before finishing.
- Report clearly when extraction was visual-only rather than text-layer-based.

## Cleanup

Always clean up after reading the pages.

```bash
rm -rf "$tmpdir"
```

If you rendered into the workspace instead, remove the generated files explicitly before handoff.

## Handoff

Tell the user:

- which extraction path worked
- whether the PDF was read from text or from rendered page images
- if anything was ambiguous because the PDF was image-based or low quality
