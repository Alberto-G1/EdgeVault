# EdgeVault - Local Development Setup & Run Instructions

This guide provides a complete walkthrough for setting up and running the EdgeVault Enterprise Document Management System on a local development machine.

---

## 📚 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Initial Project Setup (One-Time Only)](#-initial-project-setup-one-time-only)
   - [Backend: Spring Boot](#-backend-spring-boot)
   - [Frontend: React + Vite](#-frontend-react--vite)
   - [Database: MySQL](#-database-mysql)
3. [Running External Services with Docker](#-running-external-services-with-docker)
   - [Starting Docker Desktop](#-starting-docker-desktop)
   - [Creating the Docker Containers (First Time Only)](#-creating-the-docker-containers-first-time-only)
     - [MinIO (S3 Object Store)](#minio-s3-object-store)
     - [Elasticsearch (Search Index)](#elasticsearch-search-index)
4. [Daily Development Workflow](#-daily-development-workflow)
   - [Starting Services](#-starting-services)
   - [Running the Application](#-running-the-application)
   - [Stopping Services](#-stopping-services)
5. [Docker Container Management](#-docker-container-management)

---

## 🔌 Prerequisites

Before you begin, ensure you have the following software installed:

- **Java JDK 17 or higher**
- **IntelliJ IDEA** (Community or Ultimate)
- **Node.js LTS version** (includes npm)
- **Docker Desktop**
- **A SQL client** (like DBeaver, MySQL Workbench, or the IntelliJ database tool)

---

## 🚀 Initial Project Setup (One-Time Only)

Follow these steps when you are setting up the project for the first time.

### ⚫ Backend: Spring Boot

1.  **Open Project:** Open the `edgevault-backend` directory in IntelliJ IDEA.
2.  **Load Maven Dependencies:** IntelliJ should automatically detect the `pom.xml` file. If a small "M" icon with a refresh symbol appears, click it. Alternatively, right-click the `pom.xml` file -> **Maven** -> **Reload project**. This will download all necessary Java libraries.

### 🔵 Frontend: React + Vite

1.  **Open Terminal:** Open a terminal (like PowerShell or Git Bash) and navigate into the `edgevault-frontend` directory.
2.  **Install Dependencies:** Run the following command to download all necessary JavaScript libraries. This may take a few minutes.
    ```bash
    npm install
    ```

### 🐬 Database: MySQL

1.  **Start MySQL:** Ensure your local MySQL server is running.
2.  **Create Database:** Using your SQL client, connect to your MySQL instance and run the following command to create the application's database:
    ```sql
    CREATE DATABASE edgevault_db;
    ```
    *Note: The Spring Boot application is configured to create and update tables automatically, so you only need to create the empty database.*

---

## 🐳 Running External Services with Docker

Our application depends on MinIO (for file storage) and Elasticsearch (for search). We will run both using Docker.

### 1️⃣ Starting Docker Desktop

- **Crucial First Step:** Before running any `docker` commands, **you must start the Docker Desktop application** from your Start Menu.
- Wait until its icon in the system tray is stable and says "Docker Desktop is running." If you don't do this, all docker commands will fail with a "cannot find the file specified" error.

### 2️⃣ Creating the Docker Containers (First Time Only)

Run these commands **once** to download the images and create the persistent containers for our services.

#### MinIO (S3 Object Store)

Open a terminal and run this command. This creates a container named `edgevault-minio`.

```bash
docker run -p 9000:9000 -p 9001:9001 --name edgevault-minio -e "MINIO_ROOT_USER=minioadmin" -e "MINIO_ROOT_PASSWORD=minioadmin" quay.io/minio/minio server /data --console-address ":9001"