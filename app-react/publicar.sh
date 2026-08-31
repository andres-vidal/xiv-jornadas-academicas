#!/bin/sh
# Compila y deja el resultado en el archivo que se publica como artefacto.
# El artefacto se envuelve solo en <!doctype><head><body>, así que hay que
# entregar un fragmento: el contenido del head seguido del contenido del body.
set -e
cd "$(dirname "$0")"
npm run build >/dev/null
/usr/bin/python3 - <<'PY'
import re
s = open("dist/index.html", encoding="utf8").read()
head = re.search(r"<head>(.*?)</head>", s, re.S).group(1)
body = re.search(r"<body>(.*?)</body>", s, re.S).group(1)
frag = head.strip() + "\n" + body.strip() + "\n"
assert "<!doctype" not in frag.lower() and "<html" not in frag.lower()
assert "<title>" in frag[:8192], "el título tiene que entrar en los primeros 8KB"
open("dist/y-si-miramos-por-otro-lado.html", "w", encoding="utf8").write(frag)
print("fragmento:", len(frag), "bytes")
PY
