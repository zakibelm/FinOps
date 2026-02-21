# Contributing to FinOps

Merci de votre intérêt pour contribuer à FinOps ! 🎉

## Comment contribuer

### Signaler un bug

1. Vérifiez que le bug n'a pas déjà été signalé
2. Créez une issue avec :
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs actuel
   - Screenshots si applicable

### Proposer une fonctionnalité

1. Créez une issue avec le label `enhancement`
2. Décrivez la fonctionnalité et son cas d'usage
3. Discutez de l'implémentation avec les maintainers

### Pull Requests

1. Forkez le repo
2. Créez une branche (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## Standards de code

### TypeScript
- Utilisez des types explicites
- Évitez `any`
- Documentez les fonctions publiques

### Commits
Format: `type(scope): message`

Types:
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `refactor`: Refactoring
- `test`: Tests
- `chore`: Maintenance

Exemple: `feat(pipeline): add semantic caching`

## Structure des branches

- `main`: Production
- `develop`: Développement
- `feature/*`: Nouvelles fonctionnalités
- `fix/*`: Corrections

## Tests

Avant de soumettre une PR :
```bash
npm test
npm run lint
```

## Code of Conduct

Soyez respectueux et constructif. Nous voulons créer une communauté accueillante !

## Questions ?

Ouvrez une issue ou contactez-nous : zakibelm@gmail.com

Merci ! 💰
