# Manuscript build

Build the manuscript twice with the pinned TeX Live 2025 image:

```sh
image="texlive/texlive@sha256:ccf0168bb3dc1e5ba18094131ebb57177f90eca37ab2727bc2d2afb54ad60a51"
docker run --rm --platform linux/amd64 \
  -e SOURCE_DATE_EPOCH=1784246400 -e FORCE_SOURCE_DATE=1 -e TZ=UTC \
  -v "$PWD/research/llm-review-sequences/paper:/work" -w /work \
  "$image" /usr/local/texlive/2025/bin/x86_64-linux/pdflatex \
  -interaction=nonstopmode -halt-on-error paper.tex
docker run --rm --platform linux/amd64 \
  -e SOURCE_DATE_EPOCH=1784246400 -e FORCE_SOURCE_DATE=1 -e TZ=UTC \
  -v "$PWD/research/llm-review-sequences/paper:/work" -w /work \
  "$image" /usr/local/texlive/2025/bin/x86_64-linux/pdflatex \
  -interaction=nonstopmode -halt-on-error paper.tex
```

The 2026-07-17 correction build produced six pages with no warning on the second pass.

Copy and verify the release artifact:

```sh
cp research/llm-review-sequences/paper/paper.pdf output/pdf/paper.pdf
shasum -a 256 research/llm-review-sequences/paper/paper.tex output/pdf/paper.pdf
```

- `paper.tex` SHA-256: `e7a53813083fe1112e18444fcc1088c029e2569ec83a15c4b0f1c228506333e4`
- `output/pdf/paper.pdf` SHA-256: `8b576794765411e2cc25b3473ff06598cbb312ef50cdbd2f4a843e03c05aaf19`
