# SonarQube Setup (FounderLink)

This repository includes a root [`sonar-project.properties`](/C:/Users/hp/Desktop/FounderLink%20-%20Copy/sonar-project.properties) so all services can be scanned together.

## 1) Build classes and tests reports

From repository root:

```powershell
./auth-service/mvnw -f auth-service/pom.xml test
./user-service/mvnw -f user-service/pom.xml test
./startup-service/mvnw -f startup-service/pom.xml test
./investment-service/mvnw -f investment-service/pom.xml test
./team-service/mvnw -f team-service/pom.xml test
./messaging-service/mvnw -f messaging-service/pom.xml test
./notification-service/mvnw -f notification-service/pom.xml test
./api-gateway/mvnw -f api-gateway/pom.xml test
./config-server/mvnw -f config-server/pom.xml test
./eureka-server/mvnw -f eureka-server/pom.xml test
```

## 2) Run Sonar scanner

```powershell
sonar-scanner `
  -Dsonar.host.url=http://localhost:9000 `
  -Dsonar.login=$env:SONAR_TOKEN
```

## 3) Security-related env vars

These services now require `security.jwt.secret` (configured via `SECURITY_JWT_SECRET`):

- `auth-service`
- `user-service`
- `startup-service`
- `investment-service`
- `team-service`
- `messaging-service`

Use a strong secret with at least 32 characters.
