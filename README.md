# 🛡️ API Monitor & Alert System

A simple and powerful system to monitor your APIs and get alerts when things go wrong.

---

## 🚀 How to Run (Development)

1. **Install everything at once:**  
   Run this in the main folder:
   ```bash
   npm install
   ```

2. **Start the Frontend & Backend:**  
   ```bash
   npm run dev
   ```
   - **Frontend:** [http://localhost:8080](http://localhost:8080)
   - **Backend:** [http://localhost:5000](http://localhost:5000)

---

## 🏗️ Build & Start (Production)

If you want to run the final, optimized version:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

---

## ⚙️ How Environment Variables Work

This project uses a modern way to handle your secrets without needing extra libraries like `dotenv`.

### 1. Backend Secrets (`backend/.env`)
Your backend variables are kept inside the `backend/` folder.  
- **Required values:**
  - `MONGO_API`: Your full MongoDB connection string.
  - `COLLECTION_NAME`: The name of the collection to watch (e.g., `alert`).

**How it's read:**  
We use the native Node.js flag `--env-file=.env` in the `package.json`. This is the fastest and most secure way to load secrets in modern Node.js (v20.6+).

---

## 🔗 Changing Dynamic URLs
If your local or webhook URLs change, edit the following file:
- **File location:** `frontend/src/lib/api.ts`

**Variables to modify:**
- `WEBHOOK_BASE`: Set your external webhook URL (e.g., n8n).  
- `INTERNAL_BASE`: Set your internal backend URL (usually `http://localhost:5000`).

---

## 🛠️ Tech Stack
- **Frontend:** Next.js (App Router), Tailwind CSS v4, Lucide Icons.
---

## 🤖 n8n Automation (The "Brains")

This project includes a powerful n8n workflow that acts as the monitoring engine. It handles data processing, AI analysis, and notifications.

### 🧩 How the Workflow Works:
1. **Webhook Receiver:** Listens for incoming monitoring data from your APIs.
2. **Python Logic:** Analyzes the data for 3 specific issues:
   - **High Latency:** Over 3000ms.
   - **Error Status:** Status codes 500 or higher.
   - **No Data:** When an API returns empty records.
3. **AI Analysis (GPT-4o Mini):** If an issue is found, an AI generates a human-friendly explanation of the problem.
4. **Database Storage:** Saves the alert details (API name, issues, AI message, and timestamp) into your MongoDB.
5. **Email Alerts:** Automatically sends a professional email notification to your inbox.

### 📥 How to Import to n8n:
1. Open your n8n instance.
2. Create a new workflow.
3. Open the file: `n8n/api_monitor_n8n_automation.json`.
4. Copy the entire content and **paste** it directly into your n8n canvas.
5. Update your **Credentials** (MongoDB and Gmail) within the nodes.
