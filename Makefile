.PHONY: help start start-opt stop clean logs build rebuild prune status

help:
	@echo "🚀 VehiTrack Pro - Makefile"
	@echo ""
	@echo "Commandes disponibles:"
	@echo ""
	@echo "  make start          - Démarrer le système (optimisé séquentiel) - 7-10 min"
	@echo "  make start-opt      - Démarrer avec BuildKit (plus rapide après 1er run) - 5-8 min"
	@echo "  make stop           - Arrêter tous les services"
	@echo "  make stop-clean     - Arrêter et supprimer les volumes (🔴 perd les données)"
	@echo ""
	@echo "  make build          - Construire les images uniquement"
	@echo "  make rebuild        - Reconstruire toutes les images (--no-cache)"
	@echo ""
	@echo "  make logs           - Afficher les logs en temps réel"
	@echo "  make logs-tail      - Afficher les 50 dernières lignes"
	@echo "  make status         - Afficher le statut des conteneurs"
	@echo ""
	@echo "  make clean          - Nettoyer les images dangling"
	@echo "  make prune          - Nettoyer complètement (containers + images + volumes)"
	@echo ""
	@echo "  make up-infra       - Lancer seulement l'infrastructure (postgres, redis, etc)"
	@echo "  make up-backend     - Lancer l'infrastructure + backend uniquement"
	@echo "  make up-full        - Lancer tout (infrastructure + backend + frontend + nginx)"
	@echo ""

start:
	@chmod +x start.sh
	@./start.sh

start-opt:
	@chmod +x start-optimized.sh
	@./start-optimized.sh

stop:
	@chmod +x stop.sh
	@./stop.sh

stop-clean:
	@chmod +x stop.sh
	@./stop.sh --volumes --force

build:
	@docker-compose build

rebuild:
	@docker-compose build --no-cache

logs:
	@docker-compose logs -f

logs-tail:
	@docker-compose logs --tail=50 -f

status:
	@echo "📊 Statut des conteneurs:"
	@docker-compose ps
	@echo ""
	@echo "💾 Volumes:"
	@docker volume ls | grep vehitrack || echo "Aucun volume trouvé"
	@echo ""
	@echo "🖼️  Images:"
	@docker images | grep vehitrack || echo "Aucune image trouvée"

clean:
	@echo "🧹 Nettoyage des images dangling..."
	@docker image prune -f

prune:
	@echo "🧹 Nettoyage complet..."
	@docker-compose down -v
	@docker system prune -af
	@echo "✅ Nettoyage complet terminé"

up-infra:
	@echo "🚀 Démarrage de l'infrastructure..."
	@docker-compose up -d postgres redis kafka zookeeper minio
	@echo "✅ Infrastructure démarrée"

up-backend:
	@echo "🚀 Démarrage de l'infrastructure + backend..."
	@docker-compose up -d postgres redis kafka zookeeper minio
	@sleep 5
	@docker-compose --profile backend up -d

up-full:
	@./start.sh

# Alias
restart: stop start
shell-psql:
	@docker-compose exec postgres psql -U $${POSTGRES_USER:-vehitrack_user} -d vehitrack
shell-redis:
	@docker-compose exec redis redis-cli -a $${REDIS_PASSWORD:-password}

# Développement
dev-logs:
	@docker-compose logs -f --tail=100

test-health:
	@echo "🏥 Test des healthchecks..."
	@docker-compose ps --format "table {{.Service}}\t{{.Status}}"

# Informations
info:
	@echo "📋 Informations du système:"
	@echo ""
	@echo "Version Docker:"
	@docker --version
	@echo ""
	@echo "Docker Compose:"
	@docker-compose --version
	@echo ""
	@echo "Architecture:"
	@uname -m
	@echo ""
	@echo "Mémoire disponible:"
	@free -h | grep "^Mem"
	@echo ""
	@make status

# Performance tests
test-build-time:
	@echo "⏱️  Test du temps de build..."
	@time docker-compose build

# À ajouter dans votre .env pour optimiser
show-env-template:
	@echo "# Template .env pour performance optimale:"
	@echo ""
	@echo "# Docker"
	@echo "DOCKER_BUILDKIT=1"
	@echo "COMPOSE_DOCKER_CLI_BUILD=1"
	@echo ""
	@echo "# PostgreSQL"
	@echo "POSTGRES_USER=vehitrack_user"
	@echo "POSTGRES_PASSWORD=yaokouma"
	@echo ""
	@echo "# Redis"
	@echo "REDIS_PASSWORD=password"
	@echo ""
	@echo "# MinIO"
	@echo "MINIO_ACCESS_KEY=vehitrack_minio"
	@echo "MINIO_SECRET_KEY=password"
	@echo ""
	@echo "# Sécurité"
	@echo "SECRET_KEY=vehitrack_secret_key_2026"

.PHONY: show-env-template
