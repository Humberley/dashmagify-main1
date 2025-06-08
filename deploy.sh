#!/bin/bash

echo "🔄 Entrando no diretório do projeto..."
cd /root/dashmagify || { echo "❌ Diretório não encontrado!"; exit 1; }

echo "⬇️ Atualizando repositório via git pull..."
git pull origin main || { echo "❌ Falha ao puxar repositório"; exit 1; }

echo "🔨 Recriando imagem Docker local..."
docker build -t dashmagify:prod . || { echo "❌ Falha ao buildar imagem"; exit 1; }

echo "🚀 Atualizando stack no Docker Swarm..."
docker stack deploy -c docker-compose.yml dashmagify || { echo "❌ Falha ao atualizar stack"; exit 1; }

echo "✅ Deploy finalizado com sucesso!"

