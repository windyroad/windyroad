# Manuscript build

The current pre-outcome PDF was built with Tectonic 0.16.9 for Apple Silicon. The release archive and TeX resource bundle are content-bound as follows:

- Tectonic release: `tectonic@0.16.9`.
- Release archive SHA-256: `edb67c61aba768289f6da441c9e6f523cfaff4f8b2a5708523ef29c543f8e88e`.
- Resource bundle: `https://relay.fullyjustified.net/default_bundle_v33.tar`.
- Tectonic bundle content identifier: `6ffe055852f8faf66c0acbe1a7fb27f87b869a90bad1204f3bf4d9683f597c7c`.
- Tectonic bundle index SHA-256: `0fb434b0fa5fdebea7f767ed9c31939c99a780d6f95cd3f540aae55910bb5697`.
- Reproducible timestamp: `SOURCE_DATE_EPOCH=1784246400`, with UTC forced.

Download and verify the compiler:

```sh
version="0.16.9"
root="tmp/tectonic-$version"
archive="$root/tectonic.tar.gz"
mkdir -p "$root"
curl -fL \
  "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%40$version/tectonic-$version-aarch64-apple-darwin.tar.gz" \
  -o "$archive"
test "$(shasum -a 256 "$archive" | cut -d ' ' -f 1)" = \
  "edb67c61aba768289f6da441c9e6f523cfaff4f8b2a5708523ef29c543f8e88e"
tar -xzf "$archive" -C "$root"
"$root/tectonic" --version
```

Populate the named bundle cache and build once, then prove that a cache-only deterministic build produces identical bytes:

```sh
bundle="https://relay.fullyjustified.net/default_bundle_v33.tar"
mkdir -p tmp/pdfs/online tmp/pdfs/offline output/pdf
SOURCE_DATE_EPOCH=1784246400 FORCE_SOURCE_DATE=1 TZ=UTC \
  "$root/tectonic" --bundle "$bundle" -Z deterministic-mode \
  --keep-logs --outdir tmp/pdfs/online \
  research/llm-review-sequences/paper/paper.tex
SOURCE_DATE_EPOCH=1784246400 FORCE_SOURCE_DATE=1 TZ=UTC \
  "$root/tectonic" --only-cached --bundle "$bundle" -Z deterministic-mode \
  --keep-logs --outdir tmp/pdfs/offline \
  research/llm-review-sequences/paper/paper.tex
cmp tmp/pdfs/online/paper.pdf tmp/pdfs/offline/paper.pdf
cp tmp/pdfs/offline/paper.pdf output/pdf/paper.pdf
```

The 2026-07-28 build produced eight US-letter pages. The log contained no layout, citation, or reference warning. All eight pages were rendered at 150 dpi and inspected for clipping, overlap, missing text, and malformed tables. Text extraction returned 31,472 characters, the expected title and sections, and all five references. All fonts are embedded and subset with Unicode mappings. The PDF catalog contains the title, author, `en-AU` language, and 12 outline entries.

Render and inspect the artifact:

```sh
mkdir -p tmp/pdfs/render
pdftoppm -r 150 -png output/pdf/paper.pdf tmp/pdfs/render/paper
pdfinfo output/pdf/paper.pdf
pdffonts output/pdf/paper.pdf
pdftotext -layout output/pdf/paper.pdf tmp/pdfs/paper.txt
```

## Accessibility build target

The default artifact above keeps the conservative arXiv-compatible build path. It is machine-readable and has embedded fonts, Unicode mappings, language metadata, and outlines, but it is not structurally tagged and is not claimed to conform to PDF/UA.

The source contains an opt-in target for a current LaTeX release. Defining `\EnableTaggedPDF` before reading `paper.tex` enables `\DocumentMetadata` with `tagging=on`, PDF/UA-2 metadata, and explicit first-row table-header tagging. Build that target with LuaLaTeX from LaTeX 2025-11-01 or later, then validate the result with veraPDF and a screen-reader reading-order check before calling it accessible:

```sh
lualatex '\def\EnableTaggedPDF{1}\input{paper.tex}'
verapdf paper.pdf
```

The accessible target is deliberately separate because tagged-PDF support is still evolving and arXiv recompiles submitted LaTeX source. Manual PDF-only remediation is not the reproducible source of truth.

Current hashes:

- `paper.tex` SHA-256: `53b850b56aeb5c74fb34e286ad4d730f491e62efac6f0715543b283cb1325479`.
- `output/pdf/paper.pdf` SHA-256: `3843abcb74ac8135b6c434c0600d2d233189eb9175edbb2912353f742b284727`.

The PDF is a pre-outcome manuscript, not the final arXiv artifact. It must be rebuilt after registered outcomes, analysis, and final source revision.
