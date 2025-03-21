docker build -t tierhub-database -f mariadb/Dockerfile .
docker run -d --name database-container -p 3306:3306 tierhub-database

docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' database-container

yarn install
yarn compile

docker build -t tierhub-backend -f debian/Dockerfile .
docker run -d --name backend-container -p 8080:8080 tierhub-backend
