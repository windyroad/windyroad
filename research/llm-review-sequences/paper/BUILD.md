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

The 2026-07-19 pre-registration correction build produced six pages with no warning on the second pass.

Copy and verify the release artifact:

```sh
cp research/llm-review-sequences/paper/paper.pdf output/pdf/paper.pdf
shasum -a 256 research/llm-review-sequences/paper/paper.tex output/pdf/paper.pdf
```

- `paper.tex` SHA-256: `9e954ad4946685f58602264d5d11d0e3f00fc76c2cad987e2b6be06e1e38fa2d`
- `output/pdf/paper.pdf` SHA-256: `bbe0578e9700226860f70fe620d5dd466eb64947fe174625d2b2b1c87ddfa0d2`
