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

- `paper.tex` SHA-256: `fa92b6e820c4d4c6e62ecfdb2f258ea36712b1d172cdf5ef3d4e3b7722c70da5`
- `output/pdf/paper.pdf` SHA-256: `a5c99e1843ccfe675b444bb0288478d525555215406f4faf6dbea518db37d8d0`
