#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: run-docker.sh [options] [-- <extra docker run args>]

Build and run the ai-service Docker image defined in ../Dockerfile.

Options:
  --image NAME         Override the Docker image name (default: aksara-legal-ai-service)
  --tag TAG            Override the Docker image tag (default: latest)
  --name NAME          Container name to use when running (default: aksara-legal-ai-service)
  --port PORT          Host port to expose the API on (default: 7700)
  --env-file FILE      Path to an env file passed to docker run (default: ../.env if present)
  --no-cache           Build without using Docker cache
  --build-only         Only build the image; skip docker run
  --detach, -d         Run the container in detached mode
  -h, --help           Show this help message and exit

Use "--" to pass additional flags directly to docker run. For example:
  ./scripts/run-docker.sh -- -e EXTRA_FLAG=value
EOF
}

abort() {
  echo "[run-docker] error: $*" >&2
  exit 1
}

command -v docker >/dev/null 2>&1 || abort "docker CLI is required but not found in PATH"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

IMAGE_NAME=${IMAGE_NAME:-aksara-legal-ai-service}
IMAGE_TAG=${IMAGE_TAG:-latest}
CONTAINER_NAME=${CONTAINER_NAME:-aksara-legal-ai-service}
PORT=${PORT:-7700}
CONTAINER_PORT=7700
DEFAULT_ENV_FILE="${PROJECT_ROOT}/.env"
ENV_FILE=${ENV_FILE:-$DEFAULT_ENV_FILE}
BUILD_ONLY=false
DETACH=false
NO_CACHE=false
RUN_EXTRA_ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --image)
      shift
      [[ $# -gt 0 ]] || abort "--image requires a value"
      IMAGE_NAME="$1"
      ;;
    --tag)
      shift
      [[ $# -gt 0 ]] || abort "--tag requires a value"
      IMAGE_TAG="$1"
      ;;
    --name)
      shift
      [[ $# -gt 0 ]] || abort "--name requires a value"
      CONTAINER_NAME="$1"
      ;;
    --port)
      shift
      [[ $# -gt 0 ]] || abort "--port requires a value"
      PORT="$1"
      ;;
    --env-file)
      shift
      [[ $# -gt 0 ]] || abort "--env-file requires a value"
      ENV_FILE="$1"
      ;;
    --no-cache)
      NO_CACHE=true
      ;;
    --build-only)
      BUILD_ONLY=true
      ;;
    --detach|-d)
      DETACH=true
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    --)
      shift
      RUN_EXTRA_ARGS+=("$@")
      break
      ;;
    *)
      RUN_EXTRA_ARGS+=("$1")
      ;;
  esac
  shift || true
done

if ! [[ $PORT =~ ^[0-9]+$ ]]; then
  abort "--port must be an integer (received: $PORT)"
fi

# Resolve the env file path if provided relative to project root.
if [[ -n "$ENV_FILE" && ! -f "$ENV_FILE" ]]; then
  ALT_ENV_FILE="${PROJECT_ROOT}/${ENV_FILE}"
  if [[ -f "$ALT_ENV_FILE" ]]; then
    ENV_FILE="$ALT_ENV_FILE"
  else
    echo "[run-docker] warning: env file '$ENV_FILE' not found; container will rely on baked-in defaults" >&2
    ENV_FILE=""
  fi
fi

BUILD_FLAGS=(-t "${IMAGE_NAME}:${IMAGE_TAG}")
if [[ "$NO_CACHE" == true ]]; then
  BUILD_FLAGS+=(--no-cache)
fi

pushd "$PROJECT_ROOT" >/dev/null
trap 'popd >/dev/null' EXIT

to_docker_path() {
  local original_path="$1"
  if [[ -z "$original_path" ]]; then
    echo ""
    return
  fi

  if command -v cygpath >/dev/null 2>&1; then
    cygpath -w "$original_path"
  else
    echo "$original_path"
  fi
}

echo "[run-docker] Building image ${IMAGE_NAME}:${IMAGE_TAG}..."
docker build "${BUILD_FLAGS[@]}" .

echo "[run-docker] Image built successfully"

if [[ "$BUILD_ONLY" == true ]]; then
  echo "[run-docker] Skipping docker run because --build-only was provided"
  exit 0
fi

RUN_FLAGS=(--rm --name "$CONTAINER_NAME" -p "${PORT}:${CONTAINER_PORT}")
if [[ "$DETACH" == true ]]; then
  RUN_FLAGS+=(-d)
else
  RUN_FLAGS+=(-it)
fi

if [[ -n "$ENV_FILE" ]]; then
  DOCKER_ENV_FILE="$(to_docker_path "$ENV_FILE")"
  RUN_FLAGS+=(--env-file "$DOCKER_ENV_FILE")
fi

# Always mount the generated folder to persist artifacts locally
HOST_GENERATED_DIR="${PROJECT_ROOT}/generated"
mkdir -p "$HOST_GENERATED_DIR"
DOCKER_GENERATED_DIR="$(to_docker_path "$HOST_GENERATED_DIR")"
RUN_FLAGS+=(-v "${DOCKER_GENERATED_DIR}:/app/generated")

cat <<EOF
[run-docker] Starting container with the following options:
  Container name : $CONTAINER_NAME
  Host port      : $PORT -> container ${CONTAINER_PORT}
  Image          : ${IMAGE_NAME}:${IMAGE_TAG}
  Env file       : ${ENV_FILE:-<none>}
EOF

if [[ ${#RUN_EXTRA_ARGS[@]} -gt 0 ]]; then
  echo "  Extra args    : ${RUN_EXTRA_ARGS[*]}"
fi

docker run "${RUN_FLAGS[@]}" "${RUN_EXTRA_ARGS[@]}" "${IMAGE_NAME}:${IMAGE_TAG}"
