# Specification diagrams

The `cfar-*.svg` figures follow the CABE-ARCH drawings in this directory:
Technic lettering, square process blocks, cylindrical Key Services, document
and locked-envelope symbols, pastel blue (`#dae8fc` / `#6c8ebf`) and green
(`#d5e8d4` / `#82b366`) elements, and red (`#ad0022`) transport arrows.
Dashed black connections denote CKAP; vertical dashed lines in the exchange
figure are participant lifelines. Colours are also identified by labels.

Each SVG contains editable, uncompressed draw.io source in its `content`
attribute, as the existing architecture SVGs do. Open the SVG in diagrams.net
to edit the shapes, connections and text. Preserve the embedded diagram when
exporting an updated SVG. Technic is the same font referenced by the existing
architecture diagrams; the checked-in CFAR renderings use outlined lettering
so displaying them requires neither an installed font nor a network request.
The editable source retains the text and the original font reference. No font
file is included.

The figures are informative illustrations of CFAR's current Early Interbinding,
SFLP and Non-Captive Lease Key flow. Captions and image alternatives live in
`src/spec/cfar.md`. Retain the SVG `title` and `desc` when editing. Review the
diagrams with their captions: neither the conceptual package layout nor the
sequence's processing boxes define additional protocol requirements.
