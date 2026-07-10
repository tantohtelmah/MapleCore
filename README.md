# MapleCore Banking Platform

**Tagline:** Secure core banking services for modern Canadian financial institutions.

> [!WARNING]
> **Security Disclaimer:** MapleCore is a demonstration banking platform using fictional data. It is not a real financial institution, and the security configuration is intended for portfolio demonstration only.

---

## 1. Project Overview & Business Problem

In modern fintech and enterprise banking systems, secure transaction processing, atomic integrity of ledgers, rule-based fraud mitigation, and strict auditability are non-negotiable requirements. Simple CRUD apps do not capture these complexities. 

MapleCore is a cloud-ready, modular-monolith core banking platform that models the internal backend ledger system and front-facing operations dashboard of a Canadian financial institution. It implements security verification, double-spending protection, daily transfer limits, immediate rule-based fraud alerts, in-app notifications, and audit logging.

---

## 2. Architecture Summary & Technology Stack

MapleCore is structured as a **modular monolith** with clean boundaries to allow eventual transition to microservices if needed.

### Technology Stack
*   **Backend:** Java 21, Spring Boot 3.3.x (Spring Web, JPA, Security, Actuator, Validation), Maven
*   **Database:** PostgreSQL (production), H2 (local testing), Flyway migrations
*   **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts
*   **DevOps:** Docker, Docker Compose, GitHub Actions (CI)
*   **Testing:** JUnit 5, Mockito, Spring Boot Test, MockMvc, Testcontainers (PostgreSQL)

---

## 3. Local Setup & Execution

### Prerequisites
*   Java 21 JDK
*   Node.js v20+
*   Docker & Docker Compose

### Fast-Track Development Run

1.  **Clone the repository** and copy `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```
2.  **Start Database Services:**
    ```bash
    docker compose up -d
    ```
    This spins up PostgreSQL (`localhost:5432`), pgAdmin (`localhost:8888`), and MailHog SMTP web-client (`localhost:8025`).

3.  **Run Backend Application:**
    ```bash
    cd backend
    mvn spring-boot:run
    ```
    The API server runs on `http://localhost:8080`. You can access the health status at `http://localhost:8080/actuator/health`.

4.  **Run Frontend Webpack/Vite Server:**
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```
    Open `http://localhost:5173` to access the application UI.

---

## 4. Test Instructions

*   **Backend Test Run (with coverage report):**
    ```bash
    cd backend
    mvn clean test
    ```
    Coverage reports are saved in `backend/target/site/jacoco/index.html`.

*   **Frontend Linting:**
    ```bash
    cd frontend
    npm run lint
    ```

---

## 5. Development Schedule

- **Phase 0:** Planning (Completed)
- **Phase 1:** Repository and Environment Setup (Completed)
- **Phase 2:** Java Domain Foundation (Next)
- **Phase 3:** Authentication & Security
- **Phase 4:** Customer & KYC Profiles
- **Phase 5:** Account Module
- **Phase 6:** Beneficiaries & Transactions
- **Phase 7:** Fraud, Notification & Audit
- **Phase 8:** Dashboards & Polish
- **Phase 9:** Documentation & DevOps
- **Phase 10:** Demo Preparation
