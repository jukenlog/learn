"""Run before publishing parent-page changes to invalidate stale asset caches."""
from pathlib import Path
import hashlib
import re
root = Path(__file__).resolve().parent.parent
page = root / 'math-parent.html'
def version(match):
    attribute, filename = match.groups()
    digest = hashlib.sha256((root / filename).read_bytes()).hexdigest()[:12]
    return f'{attribute}="{filename}?v={digest}"'
page.write_text(re.sub(r'(src|href)="(parent[^"?]*\.(?:js|css))(?:\?v=[^" ]+)?"', version, page.read_text()))
