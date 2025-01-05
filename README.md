# Projet de fin de module NoSQL

La procédure pour entamer ce projet consiste à analyser différentes parties de celui-ci.

## Configuration du projet

Le projet possède deux configurations principales pour la base de données : MongoDB et Redis. Les services sont principalement utilisés dans le contrôleur, et les routes doivent être définies comme suit :

### Endpoints des routes

- `POST /api/courses`: Créer un nouveau cours
- `GET /api/courses`: Récupérer tous les cours
- `GET /api/courses/stats`: Récupérer les statistiques des cours
- `GET /api/courses/:id`: Récupérer un cours par son ID

- `POST /api/students`: Créer un nouvel étudiant
- `GET /api/students`: Récupérer tous les étudiants
- `GET /api/students/:id`: Récupérer un étudiant par son ID

### Pour plus de détails sur la procédure, référez-vous aux commits.

---

### cURL Commands for Testing Endpoints

#### 1. **Create a New Course**

To create a new course, use the following `POST` request:

```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
        "title": "Introduction to Docker",
        "description": "Learn how to containerize applications using Docker and improve your development workflow",
        "instructor": "Alex Johnson",
        "duration": "4 weeks"
      }'
```

#### 2. **Create Another Course**

```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
        "title": "Continuous Integration with Jenkins",
        "description": "Master the principles of CI/CD and automate testing and deployments using Jenkins",
        "instructor": "Sarah Lee",
        "duration": "6 weeks"
      }'
```

#### 3. **Create Another Course**

```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
        "title": "Kubernetes for Production Environments",
        "description": "Learn how to manage and scale containerized applications in production using Kubernetes",
        "instructor": "Daniel Green",
        "duration": "8 weeks"
      }'
```

#### 4. **Create a New Student**

To create a new student, use the following `POST` request:

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
        "firstName": "Oussama",
        "lastName": "EL-AMRANI",
        "email": "elamranioussama01@gmail.com",
        "phoneNumber": "1234567890"
      }'
```

#### 5. **Retrieve All Students**

To retrieve all students, use the following `GET` request:

```bash
curl -X GET http://localhost:3000/api/students
```

#### 6. **Retrieve All Students Again**

```bash
curl -X GET http://localhost:3000/api/students
```

#### 7. **Retrieve a Specific Student by ID**

To retrieve a student by their ID, use the following `GET` request with the student's ID (e.g., `677ae2218dd6c55b4765b4b6`):

```bash
curl -X GET http://localhost:3000/api/students/677ae2218dd6c55b4765b4b6
```

---

## Questions sur les Routes (courseRoutes.js)

- **Pourquoi séparer les routes dans différents fichiers ?**
- **Comment organiser les routes de manière cohérente ?**

## Questions sur les Contrôleurs (courseController.js)

- **Quelle est la différence entre un contrôleur et une route ?**
- **Pourquoi séparer la logique métier des routes ?**

## Questions sur les Variables d'Environnement (env.js)

- **Pourquoi est-il important de valider les variables d'environnement au démarrage ?**
- **Que se passe-t-il si une variable requise est manquante ?**

## Questions sur la Base de Données (db.js)

- **Pourquoi créer un module séparé pour les connexions aux bases de données ?**
- **Comment gérer proprement la fermeture des connexions ?**

## Questions sur Redis (redisService.js)

- **Comment gérer efficacement le cache avec Redis ?**
- **Quelles sont les bonnes pratiques pour les clés Redis ?**

## Questions sur les Services (mongoService.js)

- **Pourquoi créer des services séparés ?**

---