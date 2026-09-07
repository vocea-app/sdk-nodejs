#!/bin/sh
# Verifica que el paquete construido se puede consumir en los dos formatos que
# declara package.json. Un fallo aquí no lo detecta ningún test sobre src/.
set -eu

cd "$(dirname "$0")/.."

pnpm run build

echo "→ Comprobando require() (CJS, campo main)"
node -e "
const { VoceaClient, VoceaError } = require('./dist/index.js');
if (typeof VoceaClient !== 'function') throw new Error('VoceaClient no es exportado en CJS');
if (typeof VoceaError !== 'function') throw new Error('VoceaError no es exportado en CJS');
const c = new VoceaClient({ apiKey: 'vca_test' });
if (!c.models) throw new Error('falta el recurso models en CJS');
console.log('  CJS ok');
"

echo "→ Comprobando import (ESM, campo module)"
node --input-type=module -e "
import { VoceaClient, VoceaError } from './dist/index.mjs';
if (typeof VoceaClient !== 'function') throw new Error('VoceaClient no es exportado en ESM');
if (typeof VoceaError !== 'function') throw new Error('VoceaError no es exportado en ESM');
const c = new VoceaClient({ apiKey: 'vca_test' });
if (!c.models) throw new Error('falta el recurso models en ESM');
console.log('  ESM ok');
"

echo "→ Comprobando que existen las declaraciones de tipos"
test -f dist/index.d.ts || { echo "falta dist/index.d.ts"; exit 1; }
test -f dist/index.d.mts || { echo "falta dist/index.d.mts"; exit 1; }
echo "  tipos ok"
