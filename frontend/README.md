# Dépendances et Configuration

## Frontend

### Dépendances internes

Les dépendances internes du frontend sont définies dans `package.json` et se répartissent en deux catégories :

#### 1. Dépendances nécessaires en production :

- `react` (`^19.0.0`)
- `react-dom` (`^19.0.0`)
- `react-modal` (`^3.16.3`)
- `react-router-dom` (`^7.3.0`)
- `vite` (`^6.1.0`)
- `@vitejs/plugin-react` (`^4.3.4`)

#### 2. Dépendances utilisées pour le développement :

- `@eslint/js` (`^9.19.0`)
- `@types/react` (`^19.0.8`)
- `@types/react-dom` (`^19.0.3`)
- `eslint` (`^9.19.0`)
- `eslint-plugin-react-hooks` (`^5.0.0`)
- `eslint-plugin-react-refresh` (`^0.4.18`)
- `globals` (`^15.14.0`)
- `typescript` (`~5.7.2`)
- `typescript-eslint` (`^8.22.0`)

### Dépendances externes

Le frontend nécessite les éléments suivants installés sur l'hôte :

- `Node.js` (version recommandée : >= 20.18.2)
- `Yarn` (version recommandée : >= 4.7.0)

### Dépendances de service

Le frontend dépend des services suivants :

- Backend (API Fastify)
    - URL : `https://api.tierhub.online`
    - Variables d’environnement requises :
        - `API_BASE_URL` (URL de l’API backend)

# Authors
- **[Vincent](https://git.ecole-89.com/vincent.ribeiro-paradela)**
- **[Flavien](https://git.ecole-89.com/flavien.fromaget)**
- **[Victor](https://git.ecole-89.com/victor.vandeputte)**