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

# El token de npm tiene bypass_2fa=false, así que el registro exige un OTP en
# cada escritura. Cuando pnpm no lo recibe, arranca su flujo de autenticación
# web (imprime una URL y un QR) y aborta con ERR_PNPM_WEBAUTH_TIMEOUT antes de
# que dé tiempo a teclear contraseña y segundo factor. Por eso lo pedimos aquí:
# el código viaja en la cabecera de la petición y el flujo web no llega a
# arrancar.
#
# Solo se pregunta si hay terminal y si no se pasó --otp a mano. En CI no hay
# TTY, no se pregunta, y la publicación va por OIDC (.github/workflows/publish.yml),
# que no necesita ni token ni segundo factor.
OTP_EN_ARGS=no
for arg in "$@"; do
  case "$arg" in
    --otp | --otp=*) OTP_EN_ARGS=si ;;
  esac
done

if [ "$OTP_EN_ARGS" = no ] && [ -t 0 ]; then
  printf 'Código de 6 dígitos de tu app de autenticación (Enter para omitir): '
  read -r OTP || OTP=''
  if [ -n "$OTP" ]; then
    set -- "$@" "--otp=$OTP"
  fi
fi

pnpm publish --access public "$@"
