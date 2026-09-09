#!/bin/sh
# Publica @vocea.app/sdk en npm tomando el token de .env.
#
# Por qué no basta con un .npmrc versionado que expanda ${NPM_AUTH_TOKEN}:
# pnpm ignora, a propósito, las credenciales de registro con variables de
# entorno cuando vienen de un .npmrc de proyecto. Ese fichero se commitea, y un
# cambio de `registry` bastaría para mandar el token a un registro ajeno. Así
# que el token se inyecta en un .npmrc efímero, con permisos 600, en un
# directorio temporal que se borra al salir pase lo que pase.
set -eu

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Falta .env. Copia .env.example a .env y pon tu token de npm." >&2
  exit 1
fi

set -a
. ./.env
set +a

if [ -z "${NPM_AUTH_TOKEN:-}" ]; then
  echo "NPM_AUTH_TOKEN está vacío en .env." >&2
  exit 1
fi

NPMRC_DIR=$(mktemp -d)
trap 'rm -rf "$NPMRC_DIR"' EXIT INT TERM HUP

(umask 077; printf '//registry.npmjs.org/:_authToken=%s\n' "$NPM_AUTH_TOKEN" > "$NPMRC_DIR/.npmrc")

export NPM_CONFIG_USERCONFIG="$NPMRC_DIR/.npmrc"

# El build no puede depender de un lifecycle script: el ~/.npmrc del usuario
# lleva ignore-scripts=true, que también silencia prepublishOnly.
pnpm run build

# La publicación la hace npm, no pnpm.
#
# El token tiene bypass_2fa=false, así que el registro exige autenticación
# adicional en cada escritura. pnpm resuelve eso abriendo un flujo web (imprime
# una URL y un QR) cuya ventana de espera es demasiado corta para teclear
# contraseña y segundo factor: siempre acaba en ERR_PNPM_WEBAUTH_TIMEOUT. npm
# hace el mismo flujo con una ventana mucho más amplia, y es además el único
# camino cuando la cuenta usa passkey en vez de códigos TOTP, porque entonces no
# existe ningún --otp válido que pasar.
#
# Cambiar de gestor aquí es inocuo: el paquete no tiene dependencias, así que no
# hay ningún "workspace:" que solo pnpm sepa resolver, y `npm pack` produce
# exactamente los mismos 6 ficheros.
#
# Dentro de un script no existe el alias `npm=pnpm` del shell interactivo, así
# que este `npm` es el binario real.

# --no-git-checks es una bandera de pnpm. Como npm no la conoce, aquí se traduce
# a saltarse las comprobaciones que pnpm hacía y no se le pasa a npm.
COMPROBAR_GIT=si
N=$#
I=0
while [ "$I" -lt "$N" ]; do
  arg=$1
  shift
  case "$arg" in
    --no-git-checks) COMPROBAR_GIT=no ;;
    *) set -- "$@" "$arg" ;;
  esac
  I=$((I + 1))
done

# pnpm publish se negaba a publicar fuera de main o con cambios sin commitear.
# npm no comprueba nada, así que la guarda se reproduce a mano: publicar una
# versión que no está en el repositorio deja una release imposible de reproducir.
if [ "$COMPROBAR_GIT" = si ]; then
  RAMA=$(git rev-parse --abbrev-ref HEAD)
  if [ "$RAMA" != main ]; then
    echo "Estás en '$RAMA', no en main. Usa --no-git-checks si es deliberado." >&2
    exit 1
  fi
  if [ -n "$(git status --porcelain -uall)" ]; then
    echo "Hay cambios sin commitear. Usa --no-git-checks si es deliberado." >&2
    exit 1
  fi
fi

npm publish --access public "$@"
