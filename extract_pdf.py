import os
import sys
import io

# Try to import PyPDF2 (fallback to pdfminer if needed)
try:
    import PyPDF2
except ImportError:
    print('PyPDF2 not installed, attempting to install via pip')
    import subprocess, sys
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--quiet', 'PyPDF2'])
    import PyPDF2

pdf_path = r"e:\prochcek\Thuyetrinh\nội dung bài\phòng chống bẫy Việc nhẹ lương cao.pdf"
output_path = r"e:\prochcek\Thuyetrinh\nội dung bài\pdf_extracted.txt"

if not os.path.exists(pdf_path):
    print('PDF not found')
    sys.exit(1)

with open(pdf_path, 'rb') as f:
    reader = PyPDF2.PdfReader(f)
    text = []
    for page_num, page in enumerate(reader.pages):
        try:
            page_text = page.extract_text()
        except Exception as e:
            page_text = ''
        text.append(page_text if page_text else '')

full_text = "\n\n---PAGE BREAK---\n\n".join(text)

with open(output_path, 'w', encoding='utf-8') as out_f:
    out_f.write(full_text)

print('Extraction completed, lines:', len(full_text.splitlines()))
