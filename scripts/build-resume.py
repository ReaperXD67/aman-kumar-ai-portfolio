from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import pymupdf


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "profile" / "aman-kumar-resume.pdf"
PORTRAIT = ROOT / "public" / "profile" / "aman-avatar-20260924.jpg"

PORTFOLIO = "https://aman-kumar-ai-portfolio.vercel.app"
GITHUB = "https://github.com/ReaperXD67"
LINKEDIN = "https://www.linkedin.com/in/aman-kumar-494601329"
EMAIL = "mailto:amankumr3254u@gmail.com"
CERTIFICATE = f"{PORTFOLIO}/assets/micro1-certification.jpg"

AUTONOMOUS = "https://github.com/ReaperXD67/autonomous-personal-agent"
ATLASLM = "https://github.com/ReaperXD67/notebooklm-rag"
ATLASLM_LIVE = "https://notebooklm-rag-five.vercel.app"
MINEPULSE = "https://github.com/ReaperXD67/MinePulse"
MINEPULSE_LIVE = "https://karixmc.pl"

PAGE_W = 595.276
PAGE_H = 841.89
LEFT = 36.0
RIGHT = PAGE_W - LEFT
TEXT = (0, 0, 0)
NAVY = (0, 0, 0)
MUTED = (30 / 255, 30 / 255, 30 / 255)
LINK = (0, 45 / 255, 77 / 255)

FONT_DIR = Path(r"C:\Windows\Fonts")
REGULAR_FILE = FONT_DIR / "arial.ttf"
BOLD_FILE = FONT_DIR / "arialbd.ttf"
ITALIC_FILE = FONT_DIR / "ariali.ttf"
REGULAR_NAME = "ArialRegular"
BOLD_NAME = "ArialBold"
ITALIC_NAME = "ArialItalic"

REGULAR = pymupdf.Font(fontfile=str(REGULAR_FILE))
BOLD = pymupdf.Font(fontfile=str(BOLD_FILE))
ITALIC = pymupdf.Font(fontfile=str(ITALIC_FILE))


@dataclass(frozen=True)
class Project:
    name: str
    date: str
    stack: str
    source: str
    live: str | None
    bullets: tuple[str, ...]


PROJECTS = (
    Project(
        name="Autonomous Personal Agent | Durable Agent Control Plane",
        date="2026",
        stack="Python, FastAPI, PostgreSQL, Redis, Docker | Local alpha",
        source=AUTONOMOUS,
        live=None,
        bullets=(
            "Built a durable agent runtime with a PostgreSQL transactional outbox, Redis dispatch, worker leases, heartbeats and bounded retries to recover interrupted work.",
            "Bound human approvals to exact action payloads; checked persisted receipts to prevent replay of recorded side effects and rejected stale worker completions.",
            "Integrated local Qwen inference and controlled hosted-model fallback; isolated Docker workers and added dependency, secret and image scans to CI.",
        ),
    ),
    Project(
        name="AtlasLM | Evidence-Grounded RAG Workbench",
        date="2026",
        stack="Next.js, TypeScript, Qdrant, Upstash Vector, OpenRouter",
        source=ATLASLM,
        live=ATLASLM_LIVE,
        bullets=(
            "Built a live RAG workbench with deterministic PDF ingestion, contextual chunking, exact deduplication and source metadata that follows evidence through retrieval.",
            "Fused dense vector search and BM25 with reciprocal rank fusion, reranking and MMR; gated generation on evidence sufficiency and audited citations afterward.",
            "Deployed on Vercel with Upstash Vector and a local Qdrant adapter; exposed timed traces, retrieval evaluations and document-scoped semantic caching.",
        ),
    ),
    Project(
        name="MinePulse / KarixMC | Minecraft Marketplace + Paper Plugin",
        date="2026",
        stack="Next.js, TypeScript, Java, PostgreSQL, Redis, Prisma, Nginx",
        source=MINEPULSE,
        live=MINEPULSE_LIVE,
        bullets=(
            "Built and deployed a Next.js marketplace and Java Paper plugin for account linking, server-verified playtime rewards and in-game purchase delivery.",
            "Designed transactional ledgers, expiring delivery claims and durable plugin receipts; refunded eligible expired purchases without losing the accounting trail.",
            "Secured the plugin boundary with HMAC-SHA256 and replay protection; deployed app replicas, PostgreSQL and Redis behind Nginx with encrypted backups.",
        ),
    ),
)


def text_width(text: str, size: float, font: pymupdf.Font = REGULAR) -> float:
    return font.text_length(text, fontsize=size)


def fit_size(text: str, max_width: float, preferred: float, minimum: float, font: pymupdf.Font) -> float:
    size = preferred
    while size > minimum and text_width(text, size, font) > max_width:
        size -= 0.1
    return size


def draw_text(
    page: pymupdf.Page,
    x: float,
    y: float,
    text: str,
    size: float,
    *,
    fontname: str = REGULAR_NAME,
    color: tuple[float, float, float] = TEXT,
) -> None:
    page.insert_text((x, y), text, fontsize=size, fontname=fontname, color=color, overlay=True)


def draw_centered(
    page: pymupdf.Page,
    y: float,
    text: str,
    size: float,
    *,
    font: pymupdf.Font = REGULAR,
    fontname: str = REGULAR_NAME,
    color: tuple[float, float, float] = TEXT,
) -> None:
    draw_text(page, (PAGE_W - text_width(text, size, font)) / 2, y, text, size, fontname=fontname, color=color)


def draw_link(
    page: pymupdf.Page,
    x: float,
    y: float,
    text: str,
    url: str,
    size: float,
    *,
    font: pymupdf.Font = REGULAR,
    fontname: str = REGULAR_NAME,
) -> float:
    width = text_width(text, size, font)
    draw_text(page, x, y, text, size, fontname=fontname, color=LINK)
    page.draw_line((x, y + 1.1), (x + width, y + 1.1), color=LINK, width=0.45)
    page.insert_link(
        {
            "kind": pymupdf.LINK_URI,
            "from": pymupdf.Rect(x, y - size, x + width, y + 2.3),
            "uri": url,
        }
    )
    return width


def draw_centered_segments(page: pymupdf.Page, y: float, segments: list[tuple[str, str | None]], size: float) -> None:
    total = sum(text_width(text, size) for text, _ in segments)
    x = (PAGE_W - total) / 2
    for text, url in segments:
        if url:
            x += draw_link(page, x, y, text, url, size)
        else:
            draw_text(page, x, y, text, size, color=TEXT)
            x += text_width(text, size)


def wrap(text: str, width: float, size: float, font: pymupdf.Font = REGULAR) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if text_width(candidate, size, font) <= width:
            current = candidate
        else:
            if not current:
                raise ValueError(f"Word exceeds available line width: {word}")
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_wrapped(
    page: pymupdf.Page,
    y: float,
    text: str,
    *,
    size: float,
    leading: float,
    x: float = LEFT,
    width: float = RIGHT - LEFT,
    font: pymupdf.Font = REGULAR,
    fontname: str = REGULAR_NAME,
    color: tuple[float, float, float] = TEXT,
) -> float:
    for line in wrap(text, width, size, font):
        draw_text(page, x, y, line, size, fontname=fontname, color=color)
        y += leading
    return y


def draw_bullets(page: pymupdf.Page, y: float, bullets: Iterable[str], *, size: float = 10.2, leading: float = 12.5) -> float:
    first_x = LEFT + 4
    continuation_x = LEFT + 12
    for bullet in bullets:
        # Reserve the hanging indent for every line so continuations never
        # extend beyond the same right edge as the first line.
        lines = wrap(bullet, RIGHT - continuation_x, size)
        for index, line in enumerate(lines):
            if index == 0:
                draw_text(page, first_x, y, "-", size)
            draw_text(page, continuation_x, y, line, size)
            y += leading
        y += 2.0
    return y


def section(page: pymupdf.Page, y: float, title: str) -> float:
    draw_text(page, LEFT, y, title, 10.3, fontname=BOLD_NAME, color=NAVY)
    page.draw_line((LEFT, y + 3.6), (RIGHT, y + 3.6), color=(0.55, 0.55, 0.55), width=0.5)
    return y + 14.8


def role_header(page: pymupdf.Page, y: float, title: str, org: str, dates: str) -> float:
    draw_text(page, LEFT, y, title, 10.2, fontname=BOLD_NAME)
    date_size = 9.2
    draw_text(page, RIGHT - text_width(dates, date_size, BOLD), y, dates, date_size, fontname=BOLD_NAME)
    y += 12.1
    draw_text(page, LEFT, y, f"{org} | Remote", 9.3, color=MUTED)
    return y + 12.6


def project_header(page: pymupdf.Page, y: float, project: Project) -> float:
    title_size = fit_size(project.name, RIGHT - LEFT - 38, 10.2, 9.6, BOLD)
    draw_text(page, LEFT, y, project.name, title_size, fontname=BOLD_NAME)
    draw_text(page, RIGHT - text_width(project.date, 9.0, BOLD), y, project.date, 9.0, fontname=BOLD_NAME)
    y += 12.0
    stack_size = 8.8
    draw_text(page, LEFT, y, project.stack, stack_size, color=MUTED)
    x = LEFT + text_width(project.stack, stack_size)
    if project.live:
        draw_text(page, x, y, " | ", stack_size, color=MUTED)
        x += text_width(" | ", stack_size)
        x += draw_link(page, x, y, "Live", project.live, stack_size)
    draw_text(page, x, y, " | ", stack_size, color=MUTED)
    x += text_width(" | ", stack_size)
    draw_link(page, x, y, "Source", project.source, stack_size)
    return y + 12.7


def build(output: Path = OUTPUT, portrait: Path = PORTRAIT) -> None:
    if not portrait.is_file():
        raise FileNotFoundError(f"Approved portrait not found: {portrait}; pass --portrait explicitly.")
    output.parent.mkdir(parents=True, exist_ok=True)
    document = pymupdf.open()
    page = document.new_page(width=PAGE_W, height=PAGE_H)
    # WinAnsi keeps ordinary spaces and ASCII hyphens intact in extracted text,
    # while still embedding and subsetting Arial for consistent rendering.
    page.insert_font(fontname=REGULAR_NAME, fontfile=str(REGULAR_FILE), set_simple=True)
    page.insert_font(fontname=BOLD_NAME, fontfile=str(BOLD_FILE), set_simple=True)

    # The user explicitly requested a portrait on 24 September 2026. Keep it
    # confined to the header: all qualifications remain ordinary selectable
    # single-column text. No resume can guarantee compatibility with every ATS.
    photo_rect = pymupdf.Rect(RIGHT - 66, 27, RIGHT, 93)
    page.insert_image(photo_rect, filename=str(portrait), keep_proportion=True)
    draw_text(page, LEFT, 42.0, "AMAN KUMAR", 25.0, fontname=BOLD_NAME)
    draw_text(page, LEFT, 58.0, "AI ENGINEER & FULL-STACK DEVELOPER", 10.6, fontname=BOLD_NAME)
    draw_text(page, LEFT, 73.0, "Bengaluru, India | +91 76671 16926", 9.3)
    draw_link(page, LEFT, 87.0, "amankumr3254u@gmail.com", EMAIL, 9.3)
    x = LEFT
    for label, url in (
        ("Portfolio", PORTFOLIO),
        ("GitHub / ReaperXD67", GITHUB),
        ("LinkedIn / Aman Kumar", LINKEDIN),
    ):
        if x > LEFT:
            draw_text(page, x, 102.0, "   |   ", 9.3, color=MUTED)
            x += text_width("   |   ", 9.3)
        x += draw_link(page, x, 102.0, label, url, 9.3)

    y = section(page, 120.0, "SUMMARY")
    y = draw_wrapped(
        page,
        y,
        "AI engineer building LLM applications, agentic workflows and full-stack products with traceable decisions and recoverable execution. Experience in AI product delivery at SIP Organization and self-adaptive systems at micro1.",
        size=10.2,
        leading=12.5,
    )
    y += 4.0

    y = section(page, y, "EXPERIENCE")
    y = role_header(page, y, "Project Lead Developer Intern", "SIP Organization", "Jul 2026 - Present")
    y = draw_bullets(
        page,
        y,
        (
            "Lead development of AI-powered WhatsApp onboarding and customer-assistance workflows, including context-aware conversations and response orchestration.",
            "Build backend integrations across AI microservices and coordinate reliability and end-to-end product delivery.",
        ),
    )
    y = role_header(page, y + 3.0, "AI Engineer Intern", "micro1", "Aug 2025 - Jul 2026")
    y = draw_bullets(
        page,
        y,
        (
            "Implemented automatic worker spawning and dynamic task allocation in a self-adaptive AI architecture.",
            "Built modular cells for inter-cell communication, workload distribution, resource management and monitoring.",
        ),
    )
    y = role_header(page, y + 3.0, "Independent AI / Machine Learning Developer", "Freelance", "2025 - Present")
    y = draw_bullets(
        page,
        y,
        (
            "Deliver AI and automation workflows with PyTorch, FastAPI, Dify and n8n across training, evaluation, inference and data-processing pipelines.",
        ),
    )
    y += 5.0

    y = section(page, y, "PROJECTS")
    for project in PROJECTS:
        y = project_header(page, y, project)
        y = draw_bullets(page, y, project.bullets)
        y += 2.2

    y = section(page, y + 2.0, "TECHNICAL SKILLS")
    skill_rows = (
        ("Languages", "Python, TypeScript, JavaScript, Java, SQL"),
        ("AI / ML", "LLM applications, retrieval-augmented generation (RAG), agentic systems, PyTorch, embeddings, evaluation"),
        ("Backend / Data", "FastAPI, Next.js, React, REST APIs, PostgreSQL, pgvector, Redis, Qdrant, Prisma, OAuth"),
        ("Infrastructure", "Docker, Linux, Nginx, GitHub Actions, CI/CD, Vercel, VPS, observability, webhooks"),
    )
    for label, value in skill_rows:
        label_text = f"{label}: "
        draw_text(page, LEFT, y, label_text, 9.0, fontname=BOLD_NAME)
        value_x = LEFT + text_width(label_text, 9.0, BOLD)
        lines = wrap(value, RIGHT - value_x, 9.0)
        for index, line in enumerate(lines):
            draw_text(page, value_x if index == 0 else LEFT + 8, y, line, 9.0)
            y += 11.0
        y += 0.4

    y = section(page, y + 5.2, "EDUCATION & CERTIFICATION")
    draw_text(page, LEFT, y, "B.Sc. Computer Science", 10.0, fontname=BOLD_NAME)
    dates = "Aug 2024 - Sep 2028"
    draw_text(page, RIGHT - text_width(dates, 9.0, BOLD), y, dates, 9.0, fontname=BOLD_NAME)
    y += 11.7
    draw_text(page, LEFT, y, "Scaler School of Technology in collaboration with BITS Pilani | Bengaluru, India", 8.75, color=MUTED)
    y += 12.0
    label = "Certified Freelance AI / Machine Learning Developer - micro1, Mar 2026 | "
    draw_text(page, LEFT, y, label, 8.5)
    draw_link(page, LEFT + text_width(label, 8.5), y, "Certificate", CERTIFICATE, 8.5)

    if y > PAGE_H - 34:
        raise ValueError(f"Resume content overflowed the one-page layout at y={y:.1f}")

    document.set_metadata(
        {
            "title": "Aman Kumar - AI Engineer and Full-Stack Developer Resume",
            "author": "Aman Kumar",
            "subject": "AI engineering, agentic systems, RAG, backend systems, and full-stack product engineering",
            "keywords": (
                "AI Engineer, Applied AI Engineer, Full-Stack Engineer, LLM applications, agentic systems, "
                "RAG, retrieval augmented generation, evaluation, observability, human in the loop, guardrails, "
                "Python, TypeScript, FastAPI, Next.js, React, PostgreSQL, pgvector, Redis, vector database, "
                "Docker, CI/CD, GitHub Actions, Vercel, VPS, REST APIs, OAuth, webhooks"
            ),
            "creator": "Aman Kumar",
            "producer": "PyMuPDF",
        }
    )

    # Keep only used glyphs from the real font programs: the document remains
    # selectable text, while avoiding megabytes of unused Arial coverage.
    document.subset_fonts()
    if output.exists():
        output.unlink()
    document.save(output, garbage=4, deflate=True, deflate_fonts=True, clean=True)
    document.close()
    print(f"Output: {output}; final baseline: {y:.1f}pt")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build the canonical one-page resume; use --output for a review candidate.")
    parser.add_argument("--output", type=Path, default=OUTPUT)
    parser.add_argument("--portrait", type=Path, default=PORTRAIT)
    args = parser.parse_args()
    build(args.output, args.portrait)
