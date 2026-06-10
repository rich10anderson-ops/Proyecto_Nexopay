#!/usr/bin/env bash
set -euo pipefail

# start-day.sh - Automatiza el inicio del día de trabajo con Git
# Uso: ./scripts/start-day.sh [branch-name] [--push]
# Ejemplos:
#   ./scripts/start-day.sh feat/login --push
#   ./scripts/start-day.sh
# Si no se pasa branch-name, se crea `feat/YYYYMMDD`.

PUSH=false
BRANCH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--push)
      PUSH=true
      shift
      ;;
    -h|--help)
      echo "Uso: $0 [branch-name] [--push]"
      exit 0
      ;;
    *)
      if [[ -z "$BRANCH" ]]; then
        BRANCH="$1"
        shift
      else
        echo "Argumentos no reconocidos: $1" >&2
        exit 1
      fi
      ;;
  esac
done

if [[ -z "$BRANCH" ]]; then
  BRANCH="feat/$(date +%Y%m%d)"
fi

echo "Sincronizando ramas remotas..."
git fetch --all --prune

# Detectar base (main o master)
if git show-ref --verify --quiet refs/heads/main; then
  BASE=main
elif git show-ref --verify --quiet refs/heads/master; then
  BASE=master
else
  BASE=main
fi

if git rev-parse --verify "$BASE" >/dev/null 2>&1; then
  git switch "$BASE" || git checkout "$BASE"
  git pull --rebase origin "$BASE"
else
  echo "No se encontró la rama $BASE localmente; intentado crear desde remoto..."
  git fetch origin
  if git ls-remote --exit-code --heads origin "$BASE" >/dev/null 2>&1; then
    git switch -c "$BASE" --track "origin/$BASE"
    git pull --rebase origin "$BASE"
  else
    echo "No se encontró la rama $BASE en remoto. Abortando." >&2
    exit 1
  fi
fi

# Crear o cambiar a la rama deseada
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  echo "La rama $BRANCH ya existe localmente. Cambiando a ella."
  git switch "$BRANCH"
else
  if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
    echo "La rama $BRANCH existe en remoto. Creando tracking local y cambiando a ella."
    git switch -c "$BRANCH" --track "origin/$BRANCH"
  else
    echo "Creando rama $BRANCH desde $BASE"
    git switch -c "$BRANCH"
  fi
fi

if $PUSH; then
  echo "Pusheando rama a origin..."
  git push -u origin "$BRANCH"
else
  echo "Rama lista localmente: $BRANCH"
  echo "Para subirla: git push -u origin $BRANCH"
fi

echo "Listo."
#!/usr/bin/env bash
set -euo pipefail

# start-day.sh - Automatiza el inicio del día de trabajo con Git
# Uso: ./scripts/start-day.sh [branch-name] [--push]
# Ejemplos:
#   ./scripts/start-day.sh feat/login --push
#   ./scripts/start-day.sh
# Si no se pasa branch-name, se crea `feat/YYYYMMDD`.

PUSH=false
BRANCH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--push)
      PUSH=true
      shift
      ;;
    -h|--help)
      echo "Uso: $0 [branch-name] [--push]"
      exit 0
      ;;
    *)
      if [[ -z "$BRANCH" ]]; then
        BRANCH="$1"
        shift
      else
        echo "Argumentos no reconocidos: $1" >&2
        exit 1
      fi
      ;;
  esac
done

if [[ -z "$BRANCH" ]]; then
  BRANCH="feat/$(date +%Y%m%d)"
fi

echo "Sincronizando ramas remotas..."
git fetch --all --prune

# Detectar base (main o master)
if git show-ref --verify --quiet refs/heads/main; then
  BASE=main
elif git show-ref --verify --quiet refs/heads/master; then
  BASE=master
else
  BASE=main
fi

if git rev-parse --verify "$BASE" >/dev/null 2>&1; then
  git switch "$BASE" || git checkout "$BASE"
  git pull --rebase origin "$BASE"
else
  echo "No se encontró la rama $BASE localmente; intentado crear desde remoto..."
  git fetch origin
  if git ls-remote --exit-code --heads origin "$BASE" >/dev/null 2>&1; then
    git switch -c "$BASE" --track "origin/$BASE"
    git pull --rebase origin "$BASE"
  else
    echo "No se encontró la rama $BASE en remoto. Abortando." >&2
    exit 1
  fi
fi

# Crear o cambiar a la rama deseada
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  echo "La rama $BRANCH ya existe localmente. Cambiando a ella."
  git switch "$BRANCH"
else
  if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
    echo "La rama $BRANCH existe en remoto. Creando tracking local y cambiando a ella."
    git switch -c "$BRANCH" --track "origin/$BRANCH"
  else
    echo "Creando rama $BRANCH desde $BASE"
    git switch -c "$BRANCH"
  fi
fi

if $PUSH; then
  echo "Pusheando rama a origin..."
  git push -u origin "$BRANCH"
else
  echo "Rama lista localmente: $BRANCH"
  echo "Para subirla: git push -u origin $BRANCH"
fi

echo "Listo."
