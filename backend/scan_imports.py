import os
import re
import sys

# Standard library modules (rough list to filter out)
std_lib = {
    'os', 'sys', 're', 'time', 'datetime', 'json', 'math', 'abc', 'typing',
    'collections', 'functools', 'inspect', 'io', 'pickle', 'shutil', 'subprocess',
    'tempfile', 'traceback', 'uuid', 'warnings', 'logging', 'contextlib',
    'types', 'asyncio', 'enum', 'copy', 'glob', 'base64', 'hashlib', 'hmac'
}

backend_dir = r"c:\Users\usk20\Downloads\StockTraQ\backend"
imported_modules = set()

# Regex for imports
import_re = re.compile(r'^\s*(?:from\s+([a-zA-Z0-9_\-]+)|import\s+([a-zA-Z0-9_\-]+))')

for root, dirs, files in os.walk(backend_dir):
    if '.venv' in root or '__pycache__' in root:
        continue
    for file in files:
        if file.endswith('.py'):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    for line in f:
                        match = import_re.match(line)
                        if match:
                            mod = match.group(1) or match.group(2)
                            if mod:
                                # Get top-level module name
                                top_mod = mod.split('.')[0]
                                if top_mod not in std_lib and top_mod != 'rag': # Filter relative/internal
                                    # Filter local modules (database, models, routes)
                                    if not os.path.exists(os.path.join(backend_dir, top_mod + '.py')) and \
                                       not os.path.exists(os.path.join(backend_dir, top_mod)):
                                        imported_modules.add(top_mod)
            except Exception:
                pass

print("Detected imported modules in backend:")
for m in sorted(imported_modules):
    print(f"- {m}")

# Read requirements.txt
req_path = os.path.join(backend_dir, "requirements.txt")
requirement_mods = set()
if os.path.exists(req_path):
    with open(req_path, 'r') as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                # Extract package name (without version)
                p = re.split(r'[=<>!]', line.strip())[0].strip().lower()
                requirement_mods.add(p)

print("\nMissing from requirements.txt:")
for m in sorted(imported_modules):
    m_lower = m.lower()
    # Handle some mappings: scikit-learn vs sklearn
    if m_lower == 'sklearn': m_lower = 'scikit-learn'
    
    if m_lower not in requirement_mods and m not in ['database', 'services', 'routes', 'models_v2']:
         print(f"- {m}")
