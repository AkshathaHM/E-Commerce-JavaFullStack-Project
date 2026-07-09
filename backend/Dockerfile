# Build Stage
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Install Maven
RUN apt-get update && apt-get install -y maven

COPY . .
RUN mvn clean package -DskipTests

# Production Stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 9090
ENTRYPOINT ["java", "-jar", "app.jar"]
