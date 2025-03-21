# Dépendances et Configuration

## Backend

### Dépendances internes

Les dépendances internes du backend sont définies dans `package.json` et se répartissent en deux catégories :

#### 1. Dépendances nécessaires en production :

- `@fastify/cors` - 10.0.2
- `argon2` - 0.41.1
- `dotenv` - 16.4.5
- `fastify` - 5.1.0
- `fastify-type-provider-zod` - 4.0.2
- `jose` - 5.9.6
- `mariadb` - 3.4.0
- `sequelize` - 6.37.5
- `zod` - 3.23.8
- `zod-validation-error` - 3.4.0

#### 2. Dépendances utilisées pour le développement :

- `@tsconfig/node20` - 20.1.4
- `@types/node` - 22.9.0
- `eslint` - 9.15.0
- `nodemon` - 3.1.7
- `prettier` - 3.3.3
- `ts-node` - 10.9.2
- `typescript` - 5.6.3
- `typescript-eslint` - 8.14.0

### Dépendances externes

Le backend nécessite les éléments suivants installés sur l'hôte :

- `Node.js` (version recommandée : >= 20.18.2)
- `Yarn` (version recommandée : >= 4.7.0)

### Dépendances de service

Le backend dépend des services suivants :

- Base de données MariaDB
    - URL prévue : `mysql://user:password@host:port/database`
    - Variables d'environnement requises :
        - `DB_HOST` (adresse de la base de données)
        - `DB_USER` (utilisateur)
        - `DB_PASSWORD` (mot de passe)
        - `DB_NAME` (nom de la base de données)

- Mode de lancement du backend
	- URL prévue : `https://api.tierhub.online`
	- Variables d’environnement requises :
		- `BE_HOST` (adresse du backend)
		- `BE_PORT` (port du backend)
		- `BE_NODE_ENV` (développement ou production)

# Authors
- **[Vincent](https://git.ecole-89.com/vincent.ribeiro-paradela)**
- **[Flavien](https://git.ecole-89.com/flavien.fromaget)**
- **[Victor](https://git.ecole-89.com/victor.vandeputte)**