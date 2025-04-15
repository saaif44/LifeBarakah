
# 🧠 Habit Life — Full Stack Habit Tracker

A minimalistic full-stack habit tracker web app to help users build and track positive routines like prayer, drinking water, workouts, and reading the Quran.

---

## ✨ Features

- ✅ User authentication (JWT-based login/signup)
- 🔨 Create, update, delete habits and individual tasks
- 📅 Daily check-ins with historical view by date
- 📈 Prometheus monitoring for server metrics
- 🧩 PM2 for process management (auto-restarts backend)
- 🌐 NGINX reverse proxy (frontend + API routing)
- 🔐 WSL2 Linux server with firewall + SSH key auth (for local production simulation)

---

## 📁 Project Structure

```
habit-life/
├── backend/         # Node.js + Express + PostgreSQL API
├── frontend/        # React + TailwindCSS (Vite)
├── prometheus/      # Prometheus config & setup (in WSL2)
├── nginx/           # NGINX config (inside Ubuntu)
```

---

## 🚀 Setup Guide (Local with WSL2)

### 1. ✅ Install WSL2 + Ubuntu (Windows 11)
```sh
wsl --install
# Restart and set up Ubuntu
```

### 2. 🧱 Setup Node.js, Git & Clone Project
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install git curl -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
git clone https://github.com/YOUR_GITHUB/habit-life.git
cd habit-life
```

### 3. 🖥 Backend Setup (Node.js)
```bash
cd backend
npm install
cp .env.example .env    # Edit DB credentials
npm run dev             # Or: pm2 start server.js --name habit-server
```

### 4. 🌐 Frontend Setup (React)
```bash
cd frontend
npm install
npm run build           # Vite production build
```

### 5. 🔁 PM2 Setup (Optional)
```bash
npm install -g pm2
pm2 start server.js --name habit-server
pm2 save
pm2 startup
```

---

## 📊 Prometheus Setup

### 1. Install Prometheus inside Ubuntu
```bash
wget https://github.com/prometheus/prometheus/releases/download/v2.51.1/prometheus-2.51.1.linux-amd64.tar.gz
tar -xvzf prometheus-2.51.1.linux-amd64.tar.gz
cd prometheus-2.51.1.linux-amd64
./prometheus --config.file=prometheus.yml
```

### 2. Add This to server.js backend 
```js
const client = require('prom-client');
client.collectDefaultMetrics();
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
```

Open Prometheus in browser: http://localhost:9090

---

## 🌐 NGINX Setup (WSL2)
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/habitlife
```

**Example Config:**
```nginx
server {
    listen 80;
    server_name localhost;

    location /api {
        proxy_pass http://localhost:5000;
    }

    location / {
        root /home/your-user/habit-life/frontend/dist;
        index index.html;
        try_files $uri /index.html;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/habitlife /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔐 Security

### UFW Firewall (for WSL2)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80,443/tcp
sudo ufw enable
```

### SSH Key Login (recommended for production)
```bash
ssh-keygen -t rsa -b 4096
ssh-copy-id user@localhost  # Or VPS IP
```

---

## 🧪 API Testing

- Use **Postman** or **Thunder Client**
- Import the collection: `HabitLife_API_Collection_With_API_Prefix.json`

Includes:
- Signup/Login
- Habit CRUD
- Task CRUD
- Task check-ins
- Daily metrics

---

## 📘 Author

Developed by **saaif shuvo**  


---

## 📌 License

MIT — Use freely, give credit if inspired! 💚
