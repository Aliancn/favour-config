#!/usr/bin/env python3
"""Extract a WeChat公众号 article as Markdown with LaTeX formulas + local image capture.

Usage:
    python3 extract_wxmp.py <url> <output-dir>

Outputs:
    <output-dir>/article_extracted.md   — Markdown with $...$ / $$...$$ formulas and images/xxx.png refs
    <output-dir>/article_meta.json      — title, author, publishTime, image stats
    <output-dir>/images/                — captured image files (img_000_hash.png, ...)

Key techniques:
1. SVG formula spans → $...$ / $$...$$ via data-formula attribute (no OCR needed)
2. <img> tags → local files via response.body() capture during page load (bypasses防盗链 + URL时效性)
3. Lazy-load forcing: data-src → src + full-page scroll before extraction
4. Content-type header used for image extension detection (more reliable than URL guessing)

Prerequisites:
    - Python 3.12+ with playwright installed (global venv at ~/.venv or equivalent)
    - Chromium browser installed via `playwright install chromium`
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import re
import sys
from pathlib import Path

# JavaScript executed in the browser to traverse the DOM and extract:
# - Text content as Markdown
# - SVG formulas (data-formula attribute → $LaTeX$)
# - Image metadata (src, alt, DOM order index) for later local file replacement
JS_EXTRACT = r"""() => {
    const content = document.querySelector('#js_content') || document.querySelector('.rich_media_content');
    if (!content) return { text: '', title: '', author: '', publishTime: '', images: [] };

    const title = (document.querySelector('#activity-name') || {}).textContent || '';
    const author = (document.querySelector('#js_name') || {}).textContent || '';
    const publishTime = (document.querySelector('#publish_time') || {}).textContent || '';

    var imgList = [];
    var imgIndex = 0;

    function extractText(node) {
        if (node.nodeType === 3) return node.textContent;
        if (node.nodeType !== 1) return '';

        // Math formula: WeChat renders formulas as <span data-formula="..."> containing an SVG
        var formula = node.getAttribute && node.getAttribute('data-formula');
        if (formula) return '$' + formula.trim() + '$';

        var tag = node.tagName.toLowerCase();
        var parts = [];
        for (var i = 0; i < node.childNodes.length; i++) parts.push(extractText(node.childNodes[i]));
        var inner = parts.join('');

        if (tag === 'br') return '\n';
        if (tag === 'strong' || tag === 'b') return '**' + inner.trim() + '**';
        if (tag === 'em' || tag === 'i') return '*' + inner.trim() + '*';
        if (tag === 'code') {
            if (node.parentElement && node.parentElement.tagName.toLowerCase() === 'pre') return inner;
            return '`' + inner + '`';
        }
        if (tag === 'pre') {
            var lang = '';
            var codeEl = node.querySelector('code');
            if (codeEl && codeEl.className) {
                var m = codeEl.className.match(/language-([a-z]+)/i);
                if (m) lang = m[1];
            }
            return '\n```' + lang + '\n' + inner.trim() + '\n```\n';
        }
        if (tag === 'a') return '[' + inner.trim() + '](' + (node.getAttribute('href') || '') + ')';
        if (tag === 'h1') return '\n# ' + inner.trim() + '\n';
        if (tag === 'h2') return '\n## ' + inner.trim() + '\n';
        if (tag === 'h3') return '\n### ' + inner.trim() + '\n';
        if (tag === 'h4') return '\n#### ' + inner.trim() + '\n';
        if (tag === 'blockquote') return '\n> ' + inner.trim().split('\n').join('\n> ') + '\n';
        if (tag === 'p' || tag === 'section') return '\n' + inner + '\n';
        if (tag === 'ul' || tag === 'ol') return '\n' + inner + '\n';
        if (tag === 'li') return '- ' + inner.trim() + '\n';
        if (tag === 'tr') return inner.trim() + '\n';
        if (tag === 'td' || tag === 'th') return inner.trim() + ' | ';
        if (tag === 'table') return '\n' + inner + '\n';
        if (tag === 'svg') return '';  // SVG is just the visual rendering of the formula
        if (tag === 'img') {
            var src = node.getAttribute('data-src') || node.getAttribute('src') || '';
            if (!src || src.startsWith('data:')) return '';
            if (src.startsWith('//')) src = 'https:' + src;
            var alt = (node.getAttribute('alt') || '').trim();
            var idx = imgIndex++;
            imgList.push({ src: src, alt: alt, index: idx });
            return 'IMG_PLACEHOLDER_' + idx + '_' + alt;
        }
        return inner;
    }

    var text = extractText(content);
    return { text: text, title: title.trim(), author: author.trim(), publishTime: publishTime.trim(), images: imgList };
}"""


def detect_extension(content_type: str, url: str) -> str:
    """Determine image file extension from HTTP content-type header or URL."""
    ct = (content_type or "").lower()
    if "png" in ct:
        return ".png"
    if "jpeg" in ct or "jpg" in ct:
        return ".jpg"
    if "gif" in ct:
        return ".gif"
    if "webp" in ct:
        return ".webp"
    if "svg" in ct:
        return ".svg"
    # Fallback: guess from URL
    url_lower = url.lower()
    if ".gif" in url_lower:
        return ".gif"
    if ".jpg" in url_lower or ".jpeg" in url_lower:
        return ".jpg"
    if ".webp" in url_lower:
        return ".webp"
    if ".svg" in url_lower:
        return ".svg"
    return ".png"  # WeChat default


def fix_block_formulas(text: str) -> str:
    """Convert single-line $formula$ (with no other $ on the line) to block $$formula$$.

    Heuristic: a line that starts with $ and ends with $, has exactly 2 $ chars,
    and is longer than 3 chars — treat as a display formula.
    """
    lines = text.split("\n")
    cleaned = []
    for line in lines:
        s = line.strip()
        if (
            s.startswith("$")
            and s.endswith("$")
            and s.count("$") == 2
            and len(s) > 3
        ):
            cleaned.append(f"\n$${s[1:-1]}$$\n")
        else:
            cleaned.append(line)
    return "\n".join(cleaned)


def clean_whitespace(text: str) -> str:
    """Normalize excessive blank lines and trailing spaces."""
    text = re.sub(r"\n{4,}", "\n\n\n", text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    return text.strip()


async def extract_article(url: str, outdir: Path) -> dict:
    """Extract a WeChat article: content + formulas + images.

    Returns metadata dict with title, author, publishTime, image stats.
    """
    from playwright.async_api import async_playwright

    outdir.mkdir(parents=True, exist_ok=True)
    img_dir = outdir / "images"
    img_dir.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(
            viewport={"width": 800, "height": 1200},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36",
        )
        page = await ctx.new_page()

        # Capture image responses as raw bytes during page load.
        # This bypasses防盗链 (Referer check) and URL时效性 (token expiry),
        # because the browser already has a valid session when loading the page.
        captured_images: dict[str, tuple[bytes, str]] = {}  # url → (body, content_type)

        async def on_response(response):
            try:
                rt = response.request.resource_type
            except Exception:
                return
            if rt != "image":
                return
            try:
                body = await response.body()
                if len(body) > 500:  # skip tiny icons/sprites
                    ct = response.headers.get("content-type", "")
                    captured_images[response.url] = (body, ct)
            except Exception:
                pass

        page.on("response", lambda r: asyncio.create_task(on_response(r)))

        print(f"Loading: {url[:80]}...", file=sys.stderr)
        await page.goto(url, wait_until="networkidle", timeout=60000)
        await page.wait_for_timeout(2000)

        # Force lazy-loaded images: set data-src → src so the browser fetches them
        forced = await page.evaluate("""() => {
            let count = 0;
            document.querySelectorAll('img[data-src]').forEach(img => {
                const ds = img.getAttribute('data-src');
                if (ds && img.getAttribute('src') !== ds) {
                    img.setAttribute('src', ds);
                    count++;
                }
            });
            return count;
        }""")
        print(f"Forced {forced} lazy images to load", file=sys.stderr)

        # Scroll through the entire page to trigger any remaining lazy loading
        prev_height = 0
        for _ in range(50):
            curr_height = await page.evaluate("document.body.scrollHeight")
            if curr_height == prev_height:
                break
            prev_height = curr_height
            await page.evaluate(f"window.scrollTo(0, {curr_height})")
            await page.wait_for_timeout(300)

        await page.evaluate("window.scrollTo(0, 0)")
        await page.wait_for_timeout(3000)

        print(
            f"Captured {len(captured_images)} image responses", file=sys.stderr
        )

        # Extract article content via DOM traversal
        result = await page.evaluate(JS_EXTRACT)
        await browser.close()

    text = result["text"]
    images_info = result.get("images", [])

    # Save captured images and build URL → local-path mapping
    url_to_local: dict[str, str] = {}
    for img_info in images_info:
        src = img_info["src"]
        idx = img_info["index"]
        alt = img_info["alt"]

        # Find matching captured image (URL may differ in query params)
        img_bytes = None
        content_type = ""
        if src in captured_images:
            img_bytes, content_type = captured_images[src]
        else:
            # Fuzzy match: compare without query string
            src_base = src.split("?")[0]
            for cap_url, (cap_body, cap_ct) in captured_images.items():
                if cap_url.split("?")[0] == src_base:
                    img_bytes = cap_body
                    content_type = cap_ct
                    break

        if img_bytes:
            ext = detect_extension(content_type, src)
            url_hash = hashlib.md5(src.encode()).hexdigest()[:8]
            filename = f"img_{idx:03d}_{url_hash}{ext}"
            filepath = img_dir / filename
            filepath.write_bytes(img_bytes)
            url_to_local[src] = f"images/{filename}"
            print(
                f"  Saved: {filename} ({len(img_bytes)} bytes)", file=sys.stderr
            )
        else:
            print(f"  MISS: img_{idx:03d} {src[:80]}...", file=sys.stderr)

    # Replace IMG_PLACEHOLDER tokens with local image paths or remote fallback
    for img_info in images_info:
        src = img_info["src"]
        idx = img_info["index"]
        alt = img_info["alt"]
        placeholder = f"IMG_PLACEHOLDER_{idx}_{alt}"

        if src in url_to_local:
            local_path = url_to_local[src]
            replacement = f"\n\n![{alt}]({local_path})\n\n"
        else:
            # Fallback: keep remote URL (may expire but better than nothing)
            replacement = f"\n\n![{alt}]({src})\n\n"

        text = text.replace(placeholder, replacement)

    # Post-process: fix block formulas and clean whitespace
    text = fix_block_formulas(text)
    text = clean_whitespace(text)

    # Save outputs
    (outdir / "article_extracted.md").write_text(text, encoding="utf-8")
    meta = {
        "title": result.get("title", ""),
        "author": result.get("author", ""),
        "publishTime": result.get("publishTime", ""),
        "images_total": len(images_info),
        "images_saved": len(url_to_local),
        "images_missed": len(images_info) - len(url_to_local),
    }
    (outdir / "article_meta.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    print(f"\nTitle: {meta['title']}", file=sys.stderr)
    print(f"Author: {meta['author']}", file=sys.stderr)
    print(f"Length: {len(text)} chars", file=sys.stderr)
    print(
        f"Images: {meta['images_saved']}/{meta['images_total']} saved",
        file=sys.stderr,
    )

    return meta


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Extract a WeChat article as Markdown with LaTeX + local images."
    )
    parser.add_argument("url", help="WeChat article URL (mp.weixin.qq.com/s/...)")
    parser.add_argument(
        "output_dir", help="Output directory for extracted markdown + images/"
    )
    args = parser.parse_args()

    outdir = Path(args.output_dir).resolve()
    try:
        meta = asyncio.run(extract_article(args.url, outdir))
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    # stdout: just the output path for scripting
    print(str(outdir / "article_extracted.md"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
