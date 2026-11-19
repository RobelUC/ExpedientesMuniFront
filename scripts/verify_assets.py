"""Check the downloaded font files against their recorded content hashes."""
import hashlib
import json
from pathlib import Path
root = Path(__file__).resolve().parents[1] / 'public' / 'fonts'
for item in json.loads((root / 'sources.json').read_text()):
    assert hashlib.sha256((root / item['file']).read_bytes()).hexdigest() == item['sha256'], item['file']
assert 'https://' not in (root / 'fonts.css').read_text()
print('Font integrity verified; CSS loads local assets only.')
