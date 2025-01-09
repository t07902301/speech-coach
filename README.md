# Speech Tutor

While preparing for English speaking tests, I noticed that most AI-powered speaking practice tools out there were too recreational, distracting, and overpriced. So, I decided to create my own tool that’s more personalized for people with different needs.

Right now, it lets you review your voice recordings, transcribe your talks, and get those transcriptions polished with OpenAI's models. These features are super handy for English tests or even job interviews, since good fluency and clear content are usually all you need to shine in most situations. 🌟🗣️📚  


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
