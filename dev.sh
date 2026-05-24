#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="docker-compose.dev.yml"
PROJECT="vehitrack_dev"

case "${1:-help}" in
  up)
    # Nettoie les containers conflictuels avant de démarrer
    docker ps -a --format "{{.Names}}" | grep vehitrack | xargs docker rm -f 2>/dev/null || true
    docker compose -f $COMPOSE_FILE -p $PROJECT up --build -d
    echo "✅ Stack DEV démarrée — http://localhost"
    echo "   Frontend : bash dev.sh frontend"
    ;;
  down)
    docker compose -f $COMPOSE_FILE -p $PROJECT down
    echo "🛑 Stack DEV arrêtée (containers supprimés)"
    ;;
  stop)
    docker compose -f $COMPOSE_FILE -p $PROJECT stop
    echo "⏸  Stack DEV suspendue (containers conservés)"
    echo "   Relancer avec : bash dev.sh start"
    ;;
  start)
    docker compose -f $COMPOSE_FILE -p $PROJECT start
    echo "▶️  Stack DEV relancée"
    ;;
  restart)
    docker compose -f $COMPOSE_FILE -p $PROJECT restart ${2:-}
    echo "🔄 Restart effectué"
    ;;
  logs)
    docker compose -f $COMPOSE_FILE -p $PROJECT logs -f ${2:-}
    ;;
  status)
    echo "=== Containers ==="
    docker compose -f $COMPOSE_FILE -p $PROJECT ps
    echo ""
    echo "=== Health checks ==="
    for port in 8001 8002 8003 8004 8007; do
      code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 \
        http://localhost:$port/health 2>/dev/null || echo "000")
      if [ "$code" = "200" ]; then
        echo "  ✅ :$port → HTTP $code"
      else
        echo "  ❌ :$port → HTTP $code"
      fi
    done
    echo ""
    echo "=== Frontend ==="
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 \
      http://localhost:3000 2>/dev/null || echo "000")
    if [ "$code" = "200" ]; then
      echo "  ✅ :3000 → HTTP $code"
    else
      echo "  ❌ :3000 → HTTP $code (lancer : bash dev.sh frontend)"
    fi
    ;;
  frontend)
    echo "▶️  Lancement du frontend sur http://localhost:3000"
    cd "$(dirname "$0")/frontend" && npm run dev
    ;;
  dev)
    # Lance backend + frontend en une commande
    echo "🚀 Démarrage complet VehiTrack Pro..."
    docker ps -a --format "{{.Names}}" | grep vehitrack | xargs docker rm -f 2>/dev/null || true
    docker compose -f $COMPOSE_FILE -p $PROJECT up --build -d
    echo ""
    echo "✅ Backend démarré"
    echo "▶️  Lancement du frontend..."
    cd "$(dirname "$0")/frontend" && npm run dev
    ;;
  rebuild)
    docker compose -f $COMPOSE_FILE -p $PROJECT up --build -d \
      ${2:?Usage: bash dev.sh rebuild <service>}
    echo "🔨 Service ${2} rebuild effectué"
    ;;
  clean)
    docker compose -f $COMPOSE_FILE -p $PROJECT down -v
    echo "🧹 Stack DEV nettoyée (containers + volumes supprimés)"
    ;;
  *)
    echo ""
    echo "Usage: bash dev.sh <commande> [option]"
    echo ""
    echo "Commandes disponibles :"
    echo "  dev                 🚀 Démarre TOUT (backend + frontend) en une commande"
    echo "  up                  Démarre et build tous les services backend"
    echo "  down                Arrête et supprime les containers"
    echo "  stop                Suspend les containers (données conservées)"
    echo "  start               Relance les containers suspendus"
    echo "  frontend            Lance le frontend Next.js"
    echo "  restart [service]   Redémarre tous les services ou un seul"
    echo "  logs [service]      Affiche les logs (tous ou un seul)"
    echo "  status              État des containers + health checks"
    echo "  rebuild <service>   Rebuild et relance un service spécifique"
    echo "  clean               Supprime containers + volumes (reset complet)"
    echo ""
    echo "Workflow après extinction PC :"
    echo "  Terminal 1 → bash dev.sh up"
    echo "  Terminal 2 → bash dev.sh frontend"
    echo "  Ou tout en un → bash dev.sh dev"
    echo ""
    ;;
esac
