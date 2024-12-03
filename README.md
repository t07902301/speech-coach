# Language Tutor

A virtual language tutor that helps you achieve English C1 level proficiency in coherence, cohesion, vocabulary/grammar, and pronunciation! 🌟

## Features

- [x] Replay your voice recordings 🔁
- [x] Display refined versions from LLM ✨
- [x] Timer to limit answer length ⏲️
- [ ] Shadow reading 📖
- [ ] Pronunciation assessment 🗣️

## Demo

![Demo Screenshot](app-demo.gif)

## How It Works

### Frontend

- [x] HTML/JS 🌐
- [x] React ⚛️

### Backend

- [x] Flask 🐍
- [ ] Java + Spring Boot ☕
- [x] API design 📡
- [ ] Database 🗄️
- [ ] Message Queue and Redis for scalability 📬

### Model Endpoints

- [x] OpenAI 🤖
- [ ] Self-hosted models 🏠

### Infrastructure

- [x] Docker 🐳
- [ ] Cloud deployment ☁️

## Usage

1. Configure `API_KEY` after copying the example environment file:
    ```sh
    cp .env.example .env
    ```
    Add your OpenAI API key to the `.env` file.

2. Deploy the application from the root directory of this project:
    ```sh
    docker compose up -d --build
    ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser. 🌐
