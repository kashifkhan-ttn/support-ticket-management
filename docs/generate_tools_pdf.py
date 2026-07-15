#!/usr/bin/env python3
"""Generate TOOLS_AND_CONCEPTS.pdf from TOOLS_AND_CONCEPTS.md"""

from pathlib import Path
import re
from fpdf import FPDF

ROOT = Path(__file__).resolve().parent
MD_PATH = ROOT / "TOOLS_AND_CONCEPTS.md"
PDF_PATH = ROOT / "TOOLS_AND_CONCEPTS.pdf"


def clean(text: str) -> str:
    replacements = {
        "\u2014": "-",
        "\u2013": "-",
        "\u2192": "->",
        "\u2190": "<-",
        "\u2022": "-",
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u00a0": " ",
        "\u2713": "Y",
        "\u2717": "N",
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    return text.encode("latin-1", "replace").decode("latin-1")


class PDF(FPDF):
    def footer(self):
        self.set_y(-12)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(110, 110, 110)
        self.cell(0, 8, f"Page {self.page_no()}/{{nb}}", align="C")


def ensure_space(pdf: PDF, needed: float = 20):
    if pdf.get_y() > pdf.h - needed:
        pdf.add_page()


def write_text(pdf: PDF, text: str, *, bold=False, size=10, fill=False):
    text = clean(text)
    if not text:
        return
    ensure_space(pdf, 16)
    pdf.set_font("Helvetica", "B" if bold else "", size)
    pdf.set_x(pdf.l_margin)
    pdf.multi_cell(pdf.epw, 5, text, fill=fill)
    pdf.ln(0.5)


def is_separator_row(cells):
    return all(re.fullmatch(r":?-+:?", c.strip() or "-") for c in cells)


def render_table(pdf: PDF, rows):
    rows = [r for r in rows if not is_separator_row(r)]
    if not rows:
        return
    cols = max(len(r) for r in rows)
    col_w = pdf.epw / cols

    for i, row in enumerate(rows):
        ensure_space(pdf, 24)
        cells = (row + [""] * cols)[:cols]
        pdf.set_font("Helvetica", "B" if i == 0 else "", 8)

        wrapped = []
        max_lines = 1
        for cell in cells:
            words = clean(cell).split()
            lines = []
            cur = ""
            for word in words:
                test = f"{cur} {word}".strip()
                if pdf.get_string_width(test) <= col_w - 3:
                    cur = test
                else:
                    if cur:
                        lines.append(cur)
                    cur = word
            if cur:
                lines.append(cur)
            if not lines:
                lines = [""]
            wrapped.append(lines)
            max_lines = max(max_lines, len(lines))

        row_h = max(6, max_lines * 4 + 2)
        y0 = pdf.get_y()
        x0 = pdf.l_margin
        for ci, lines in enumerate(wrapped):
            x = x0 + ci * col_w
            if i == 0:
                pdf.set_fill_color(230, 238, 248)
                pdf.rect(x, y0, col_w, row_h, style="DF")
            else:
                pdf.set_fill_color(255, 255, 255)
                pdf.rect(x, y0, col_w, row_h, style="D")
            for li, line in enumerate(lines):
                pdf.set_xy(x + 1.2, y0 + 1 + li * 4)
                pdf.cell(col_w - 2.4, 4, line)
        pdf.set_y(y0 + row_h)
    pdf.ln(3)


def main():
    md = MD_PATH.read_text(encoding="utf-8")
    pdf = PDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.add_page()
    pdf.set_margins(16, 14, 16)
    pdf.set_text_color(0, 0, 0)

    # Cover header
    write_text(pdf, "Tools & Concepts Guide", bold=True, size=20)
    write_text(
        pdf,
        "Support Ticket Management System - why each tool/concept is used, pros & cons, and alternatives",
        size=11,
    )
    y = pdf.get_y() + 1
    pdf.set_draw_color(40, 100, 180)
    pdf.set_line_width(0.5)
    pdf.line(pdf.l_margin, y, pdf.w - pdf.r_margin, y)
    pdf.ln(6)

    in_code = False
    table_rows = []

    def flush_table():
        nonlocal table_rows
        if table_rows:
            render_table(pdf, table_rows)
            table_rows = []

    for raw in md.splitlines():
        line = raw.rstrip()

        if line.startswith("```"):
            flush_table()
            in_code = not in_code
            continue

        if in_code:
            ensure_space(pdf, 12)
            pdf.set_font("Courier", "", 8)
            pdf.set_fill_color(245, 245, 245)
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(pdf.epw, 4, clean(line) or " ", fill=True)
            continue

        if "|" in line and line.strip().startswith("|"):
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            table_rows.append(cells)
            continue

        flush_table()

        if not line.strip():
            pdf.ln(1.5)
            continue

        if line.startswith("# "):
            if pdf.page_no() > 1 or pdf.get_y() > 50:
                pdf.add_page()
            write_text(pdf, line[2:], bold=True, size=16)
        elif line.startswith("## "):
            pdf.ln(2)
            write_text(pdf, line[3:], bold=True, size=13)
        elif line.startswith("### "):
            write_text(pdf, line[4:], bold=True, size=11)
        elif line.startswith("---"):
            y = pdf.get_y() + 1
            pdf.set_draw_color(190, 190, 190)
            pdf.line(pdf.l_margin, y, pdf.w - pdf.r_margin, y)
            pdf.ln(3)
        elif line.startswith("- ") or line.startswith("* "):
            write_text(pdf, f"  - {line[2:]}", size=10)
        elif re.match(r"^\d+\.\s", line):
            write_text(pdf, f"  {line}", size=10)
        else:
            write_text(pdf, line, size=10)

    flush_table()
    pdf.output(str(PDF_PATH))
    print(f"Wrote {PDF_PATH} ({PDF_PATH.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
