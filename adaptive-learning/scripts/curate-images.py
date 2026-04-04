"""
Image Curation Script — maps extracted images to sections by page number,
selects the best 2-3 per section, and embeds them into section content JSON
files as image blocks.

Usage: python3 scripts/curate-images.py

Prerequisites:
  - Run extract-images.py first to populate public/images/ and manifest.json
  - Content JSON files must already exist in content/chapters/

SETUP:
  1. Set SECTION_PAGES dict to map each section to its page range in the textbook
     Format: { chapter_id: { "section_id": (start_page, end_page) } }
     Pages are 1-indexed (matching the textbook page numbers)
  2. Adjust MIN_AREA and MAX_IMAGES_PER_SECTION as needed
"""

import json
import os

# ============================================================
# CONFIGURE THESE FOR YOUR TEXTBOOK
# ============================================================

# Section page ranges (1-indexed, matching textbook page numbers)
# Derive from the table of contents: end_page is the page before the next section starts
SECTION_PAGES = {
    1: {
        "1.1": (20, 20),
        "1.2": (21, 29),
        "1.3": (30, 37),
        "1.4": (38, 41),
    },
    2: {
        "2.1": (48, 52),
        "2.2": (53, 59),
        "2.3": (60, 70),
        "2.4": (71, 74),
    },
    3: {
        "3.1": (84, 89),
        "3.2": (90, 95),
        "3.3": (96, 97),
        "3.4": (98, 108),
        "3.5": (109, 111),
    },
    4: {
        "4.1": (122, 125),
        "4.2": (126, 128),
        "4.3": (129, 132),
        "4.4": (133, 137),
        "4.5": (138, 145),
        "4.6": (146, 148),
    },
    5: {
        "5.1": (158, 160),
        "5.2": (161, 164),
        "5.3": (165, 172),
        "5.4": (173, 175),
        "5.5": (176, 179),
        "5.6": (180, 183),
    },
    6: {
        "6.1": (194, 194),
        "6.2": (195, 203),
        "6.3": (204, 214),
        "6.4": (215, 218),
    },
    7: {
        "7.1": (226, 229),
        "7.2": (230, 233),
        "7.3": (234, 239),
        "7.4": (240, 242),
        "7.5": (243, 248),
        "7.6": (249, 252),
    },
    8: {
        "8.1": (260, 266),
        "8.2": (267, 270),
        "8.3": (271, 280),
        "8.4": (281, 284),
    },
    9: {
        "9.1": (292, 295),
        "9.2": (296, 303),
        "9.3": (304, 324),
        "9.4": (325, 326),
    },
    10: {
        "10.1": (334, 339),
        "10.2": (340, 345),
        "10.3": (346, 353),
        "10.4": (354, 364),
    },
    11: {
        "11.1": (372, 373),
        "11.2": (374, 379),
        "11.3": (380, 384),
        "11.4": (385, 388),
        "11.5": (389, 389),
        "11.6": (390, 390),
        "11.7": (391, 395),
        "11.8": (396, 397),
        "11.9": (398, 402),
    },
    12: {
        "12.1": (412, 417),
        "12.2": (418, 420),
        "12.3": (421, 426),
        "12.4": (427, 433),
        "12.5": (434, 440),
        "12.6": (441, 443),
        "12.7": (444, 448),
    },
    13: {
        "13.1": (460, 467),
        "13.2": (468, 478),
        "13.3": (479, 488),
        "13.4": (489, 491),
    },
    14: {
        "14.1": (498, 507),
        "14.2": (508, 513),
        "14.3": (514, 525),
        "14.4": (526, 532),
        "14.5": (533, 540),
    },
    15: {
        "15.1": (550, 553),
        "15.2": (554, 556),
        "15.3": (557, 559),
        "15.4": (560, 565),
        "15.5": (566, 569),
        "15.6": (570, 571),
        "15.7": (572, 581),
        "15.8": (582, 585),
        "15.9": (586, 587),
        "15.10": (588, 593),
        "15.11": (594, 600),
    },
    16: {
        "16.1": (612, 616),
        "16.2": (617, 628),
        "16.3": (629, 632),
        "16.4": (633, 634),
        "16.5": (635, 638),
    },
}

# Minimum image area (width * height) to consider "significant"
MIN_AREA = 300000  # ~550x550 pixels

# Maximum images to embed per section
MAX_IMAGES_PER_SECTION = 3

# ============================================================
# Script logic (no changes needed below)
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST_PATH = os.path.join(BASE_DIR, 'public', 'images', 'manifest.json')
CONTENT_DIR = os.path.join(BASE_DIR, 'content', 'chapters')


def is_likely_screenshot(img):
    """Heuristic: is this image a meaningful screenshot vs decorative?"""
    area = img['width'] * img['height']
    if area < MIN_AREA:
        return False
    aspect = img['width'] / max(img['height'], 1)
    if aspect < 0.3 or aspect > 3.0:
        return False
    return True


def score_image(img):
    """Score image quality for ranking — prefer larger, screenshot-like images."""
    area = img['width'] * img['height']
    aspect = img['width'] / max(img['height'], 1)
    # Prefer landscape or near-square (typical for screenshots)
    aspect_bonus = 1.0 if 0.5 < aspect < 2.5 else 0.5
    return area * aspect_bonus


def select_best_images(images, max_count=MAX_IMAGES_PER_SECTION):
    """Select the top N images, preferring images from different pages."""
    if not images:
        return []

    # Filter to screenshots only
    screenshots = [img for img in images if is_likely_screenshot(img)]
    if not screenshots:
        return []

    # Sort by score descending
    screenshots.sort(key=score_image, reverse=True)

    # Select from different pages when possible
    selected = []
    seen_pages = set()
    for img in screenshots:
        if len(selected) >= max_count:
            break
        if img['page'] not in seen_pages:
            selected.append(img)
            seen_pages.add(img['page'])

    # Fill remaining slots if needed
    if len(selected) < max_count:
        for img in screenshots:
            if len(selected) >= max_count:
                break
            if img not in selected:
                selected.append(img)

    return selected


def embed_images_in_section(section_file, images):
    """Insert image blocks into a section's contentBlocks array."""
    with open(section_file, 'r', encoding='utf-8') as f:
        section = json.load(f)

    blocks = section.get('contentBlocks', [])
    section_title = section.get('title', '')

    # Create image blocks
    image_blocks = []
    for img in images:
        image_blocks.append({
            "type": "image",
            "title": f"{section_title} — textbook illustration (p. {img['page']})",
            "body": "",
            "imageSrc": img['path'],
            "imageAlt": f"Screenshot illustrating {section_title.lower()}",
            "imageCaption": f"{section_title} — textbook illustration (p. {img['page']})"
        })

    if not image_blocks:
        return False

    # Insert images: first image after first concept block, rest after example blocks
    new_blocks = []
    img_idx = 0
    inserted_first = False

    for block in blocks:
        new_blocks.append(block)
        if not inserted_first and block.get('type') == 'concept' and img_idx < len(image_blocks):
            new_blocks.append(image_blocks[img_idx])
            img_idx += 1
            inserted_first = True
        elif inserted_first and block.get('type') == 'example' and img_idx < len(image_blocks):
            new_blocks.append(image_blocks[img_idx])
            img_idx += 1

    # Append any remaining images at the end (before summary)
    while img_idx < len(image_blocks):
        # Insert before the last block if it's a summary
        if new_blocks and new_blocks[-1].get('type') == 'summary':
            new_blocks.insert(-1, image_blocks[img_idx])
        else:
            new_blocks.append(image_blocks[img_idx])
        img_idx += 1

    section['contentBlocks'] = new_blocks

    with open(section_file, 'w', encoding='utf-8') as f:
        json.dump(section, f, indent=2, ensure_ascii=False)

    return True


def main():
    if not SECTION_PAGES:
        print("ERROR: No section pages configured. Edit SECTION_PAGES dict in this script.")
        return

    if not os.path.exists(MANIFEST_PATH):
        print(f"Error: Manifest not found at {MANIFEST_PATH}")
        print("Run extract-images.py first.")
        return

    with open(MANIFEST_PATH, 'r') as f:
        manifest = json.load(f)

    total_embedded = 0
    sections_with_images = 0
    total_sections = 0

    for ch_id, sections in sorted(SECTION_PAGES.items()):
        for sec_id, (start_page, end_page) in sorted(sections.items(),
                                                       key=lambda x: float(x[0])):
            total_sections += 1
            # Find images within this section's page range
            section_images = [
                img for img in manifest
                if img['chapter'] == ch_id and start_page <= img['page'] <= end_page
            ]

            best = select_best_images(section_images)
            if not best:
                continue

            section_file = os.path.join(CONTENT_DIR, f'ch{ch_id:02d}', 'sections',
                                        f'{sec_id}.json')
            if not os.path.exists(section_file):
                print(f"  Warning: Section file not found: {section_file}")
                continue

            if embed_images_in_section(section_file, best):
                sections_with_images += 1
                total_embedded += len(best)

    print(f"\n{'='*50}")
    print(f"Images embedded: {total_embedded}")
    print(f"Sections with images: {sections_with_images}/{total_sections}")
    print(f"Coverage: {sections_with_images/max(total_sections,1)*100:.0f}%")
    print(f"{'='*50}")


if __name__ == '__main__':
    main()
