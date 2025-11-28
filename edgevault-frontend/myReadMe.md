# Action Plan: Running MinIO with Docker

This guide explains how to properly start MinIO using Docker on Windows PowerShell.

---

## 📌 Prerequisites
- **Docker Desktop** installed on your machine.
- **PowerShell** terminal.

---

## 🚀 Step 1: Start Docker Desktop
1. Open **Docker Desktop** from your Start Menu.
2. Wait until Docker fully initializes (the icon in the system tray should stop animating and become stable).

---

## 🖥️ Step 2: Run MinIO in PowerShell
After Docker is running:

Run the following command in your PowerShell terminal:

```powershell
docker run -p 9000:9000 -p 9001:9001 --name edgevault-minio -e "MINIO_ROOT_USER=minioadmin" -e "MINIO_ROOT_PASSWORD=minioadmin" quay.io/minio/minio server /data --console-address ":9001"


Start the Existing Container
You don't need to create a new container; you just need to start the one that already exists.
Open a PowerShell or Command Prompt terminal.
Run the following command:
code
Bash
docker start edgevault-minio
That's it. This command will find the existing container named edgevault-minio and start it up with all the same settings (ports, environment variables, etc.) you used when you first created it.
Action Plan
Ensure Docker Desktop is running.
In your terminal, run docker start edgevault-minio.
You will see the name edgevault-minio printed in the terminal. The container is now running in the background.
Verify it's working:
Open your browser and navigate to the MinIO console at http://localhost:9001.
You should be able to log in. Your edgevault-documents bucket will still be there.
Restart your Spring Boot application. It will now be able to connect to the running MinIO container.
How to Manage the Container in the Future
Here are the basic commands you'll need:
To start the container:
code
Bash
docker start edgevault-minio
To stop the container:
code
Bash
docker stop edgevault-minio
To view logs (if you start it in the background):
code
Bash
docker logs -f edgevault-minio
To completely delete the container (if you want to start fresh):
First, stop it: docker stop edgevault-minio
Then, remove it: docker rm edgevault-minio
After removing it, you can use the original docker run ... command to create a new one.


Step 2: Configure Elasticsearch Connection
We will use a Docker container for our local Elasticsearch instance.
Start Elasticsearch with Docker: Open a terminal and run the following command. This will start a single-node Elasticsearch cluster.
code
Bash
docker run -p 9200:9200 -p 9300:9300 --name edgevault-es -e "discovery.type=single-node" -e "xpack.security.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.11.1
Note: The first run will download the image, which may take a few minutes. xpack.security.enabled=false is crucial for local development to disable authentication.