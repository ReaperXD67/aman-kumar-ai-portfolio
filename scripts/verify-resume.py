"""Check the canonical resume's actual PDF text, links, fonts and page geometry.

This is a structural QA check, not a guarantee about a particular ATS vendor.
Run after the builder and visual Poppler inspection, using the bundled Python.
"""

import argparse
import hashlib
import json
from pathlib import Path

import pymupdf
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
DEFAULT = ROOT / "public" / "profile" / "aman-kumar-resume.pdf"
ORDER = (
    "AMAN KUMAR",
    "SUMMARY",
    "EXPERIENCE",
    "Autonomous Personal Agent",
    "AtlasLM",
    "MinePulse / KarixMC",
    "TECHNICAL SKILLS",
    "EDUCATION & CERTIFICATION",
)
EXPECTED_LINKS = {
    "mailto:amankumr3254u@gmail.com",
    "https://aman-kumar-ai-portfolio.vercel.app",
    "https://github.com/ReaperXD67",
    "https://www.linkedin.com/in/aman-kumar-494601329",
    "https://github.com/ReaperXD67/autonomous-personal-agent",
    "https://notebooklm-rag-five.vercel.app",
    "https://github.com/ReaperXD67/notebooklm-rag",
    "https://karixmc.pl",
    "https://github.com/ReaperXD67/MinePulse",
    "https://aman-kumar-ai-portfolio.vercel.app/assets/micro1-certification.jpg",
}


def verify(path: Path) -> dict:
    document = pymupdf.open(path)
    assert len(document) == 1, "Expected exactly one page"
    page = document[0]
    text = PdfReader(path).pages[0].extract_text()
    offsets = [text.index(label) for label in ORDER]
    assert offsets == sorted(offsets), "Extracted text order is incorrect"
    assert "\ufffd" not in text, "Text contains replacement characters"
    assert len(text.split()) >= 350, "Missing resume text"
    links = {link["uri"] for link in page.get_links()}
    assert links == EXPECTED_LINKS, "Missing or unexpected hyperlink targets"
    fonts = page.get_fonts()
    assert all(document.extract_font(font[0])[3] for font in fonts), "Unembedded font"
    spans = [
        span
        for block in page.get_text("dict")["blocks"] if "lines" in block
        for line in block["lines"]
        for span in line["spans"]
    ]
    assert all(page.rect.contains(pymupdf.Rect(span["bbox"])) for span in spans), "Off-page text"
    assert len(page.get_images()) == 1, "Expected only the requested header portrait"
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    manifest = path.with_name("resume.json")
    if manifest.exists():
        assert json.loads(manifest.read_text(encoding="utf-8"))["sha256"] == digest, "Stale resume manifest"
    return {
        "pages": len(document),
        "wordCount": len(text.split()),
        "hyperlinks": len(links),
        "embeddedFonts": [font[3] for font in fonts],
        "images": len(page.get_images()),
        "contentBottomPt": round(max(span["bbox"][3] for span in spans), 2),
        "bytes": path.stat().st_size,
        "sha256": digest,
        "result": "PASS",
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("path", nargs="?", type=Path, default=DEFAULT)
    args = parser.parse_args()
    print(json.dumps(verify(args.path), indent=2))
