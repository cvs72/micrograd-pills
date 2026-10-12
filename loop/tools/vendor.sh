#!/usr/bin/env bash
# Fetches the vendored dependencies once, attended, with network: the three font families as woff2 plus a fonts.css
# of @font-face rules, Three.js r128 (the build the pages use today) and Three.js THREE_VERSION as an ES module, with
# their licences. Records every file's sha256 in site/vendor/SHA256SUMS. Run from the repository root.
set -eu
cd "$(dirname "$0")/../.."
V=$(sed -n 's/^THREE_VERSION: *\([0-9.]*\).*/\1/p' loop/PLAN.md | head -1)
mkdir -p site/vendor/fonts site/vendor/three
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
CSS="https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
curl -fsSL -A "$UA" "$CSS" > site/vendor/fonts/google.css
# every woff2 url becomes a local file named after its family, weight and subset
python3 - << 'PY'
import re, hashlib, pathlib, subprocess
css = pathlib.Path("site/vendor/fonts/google.css").read_text()
out = []
blocks = re.findall(r"(/\* ([\w-]+) \*/\s*@font-face \{([^}]*)\})", css)
for block, subset, body in blocks:
    fam = re.search(r"font-family: '([^']+)'", body).group(1)
    wt = re.search(r"font-weight: (\d+)", body).group(1)
    url = re.search(r"url\((https://[^)]+)\)", body).group(1)
    name = f"{fam.replace(' ', '')}-{wt}-{subset}.woff2"
    p = pathlib.Path("site/vendor/fonts") / name
    if not p.exists():
        subprocess.run(["curl", "-fsSL", "-o", str(p), url], check=True)
    body2 = body.replace(url, name)
    out.append(f"/* {subset} */\n@font-face {{{body2}}}")
pathlib.Path("site/vendor/fonts/fonts.css").write_text("/* Outfit, IBM Plex Sans and IBM Plex Mono, self-hosted (SIL Open Font License 1.1). Fetched by loop/tools/vendor.sh. */\n" + "\n".join(out) + "\n")
print(len(blocks), "font faces,", len(set(re.findall(r"url\(([^)]+)\)", "".join(o for o in out)))), "files")
PY
rm site/vendor/fonts/google.css
curl -fsSL -o site/vendor/fonts/LICENSE-Outfit.txt "https://raw.githubusercontent.com/Outfitio/Outfit-Fonts/main/OFL.txt"
curl -fsSL -o site/vendor/fonts/LICENSE-IBM-Plex.txt "https://raw.githubusercontent.com/IBM/plex/master/LICENSE.txt"
curl -fsSL -o site/vendor/three/three.min.js "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
curl -fsSL -o site/vendor/three/three.module.js "https://cdn.jsdelivr.net/npm/three@$V/build/three.module.js"
curl -fsSL -o site/vendor/three/three.core.js "https://cdn.jsdelivr.net/npm/three@$V/build/three.core.js"   # three.module.js imports it
curl -fsSL -o site/vendor/three/LICENSE "https://cdn.jsdelivr.net/npm/three@$V/LICENSE"
grep -q "REVISION = '$(echo $V | cut -d. -f2)'" site/vendor/three/three.core.js || { echo "three.core.js is not $V"; exit 1; }
grep -q '"128"' site/vendor/three/three.min.js || { echo "three.min.js is not r128"; exit 1; }
cat > site/vendor/README.md << EOF
# Vendored dependencies (fetched by loop/tools/vendor.sh, attended)
- fonts/: Outfit (Outfitio, OFL 1.1) and IBM Plex Sans + Mono (IBM, OFL 1.1), woff2 subsets as served by Google Fonts, plus fonts.css.
- three/three.min.js: Three.js r128 (MIT), the build the pages used from cdnjs.
- three/three.module.js + three.core.js: Three.js $V (MIT), ES module build from the npm package.
Checksums: SHA256SUMS. Verify with: (cd site/vendor && shasum -a 256 -c SHA256SUMS)
EOF
(cd site/vendor && find . -type f ! -name SHA256SUMS ! -name README.md | sort | xargs shasum -a 256 > SHA256SUMS)
du -sh site/vendor/fonts site/vendor/three; wc -l site/vendor/SHA256SUMS
