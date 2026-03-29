"""
Extract Chapter 1 text from the OpenStax Introduction to Business PDF.
Outputs raw text that can be used to generate structured content JSONs.
"""

import PyPDF2
import os
import json

PDF_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'IntroductionToBusiness-OP_8D04gAa.pdf')

# Chapter 1 spans roughly PDF pages 15-60 (0-indexed: 14-59)
# We'll extract a range and look for section headers
START_PAGE = 14  # 0-indexed
END_PAGE = 65    # extract generously, we'll trim

def extract_text():
    with open(PDF_PATH, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        print(f"Total pages in PDF: {len(reader.pages)}")

        text = ""
        for i in range(START_PAGE, min(END_PAGE, len(reader.pages))):
            page_text = reader.pages[i].extract_text()
            if page_text:
                text += f"\n--- PAGE {i+1} ---\n"
                text += page_text

    # Save raw extraction
    output_path = os.path.join(os.path.dirname(__file__), 'chapter1-raw.txt')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(text)

    print(f"Extracted {len(text)} characters to scripts/chapter1-raw.txt")
    print(f"First 500 chars:\n{text[:500]}")

if __name__ == '__main__':
    extract_text()
