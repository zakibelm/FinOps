# Changelog

Toutes les modifications notables de ce projet seront documentées ici.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

## [1.0.0] - 2026-02-21

### Ajouté
- Architecture 3-paliers optimisée (Analyste→DeepSeek→Validateur)
- Pipeline intelligent avec détection automatique de complexité
- Cache sémantique vectoriel pour réduction coûts 70%
- Interface web Next.js 14 avec chat temps réel
- API Gateway Fastify avec auth JWT
- Workers Bull pour traitement asynchrone
- Multi-tenancy pour cabinets CPA
- Support upload documents (PDF, Excel)
- WebSocket streaming pour feedback temps réel
- Docker Compose pour développement local
- Documentation complète

### Performance
- Réduction coûts analyses : -43% (pipeline) / -86% (avec cache)
- Latence cache hit : <2s
- Cache hit rate : 70% (sectoriel)

### Modèles IA
- Phase 1 : Claude 3.5 Sonnet (planification)
- Phase 2 : DeepSeek V3 (calculs gratuits)
- Phase 3 : Claude 3.5 Sonnet (validation)

### Sécurité
- Auth JWT avec refresh tokens
- Chiffrement AES-256
- Rate limiting
- Isolation multi-tenant

[Unreleased]: https://github.com/zakibelm/FinOps/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/zakibelm/FinOps/releases/tag/v1.0.0
