# Speech Coach

While preparing for English speaking tests, I noticed that most existing AI-powered tools were too recreational, distracting, and overpriced. So, I decided to create a simple but powerful alternative for people who want to improve their speech skills more efficiently. 

Right now, this app allows you to review your voice recordings, transcribe your talks, and get those transcriptions polished with OpenAI's models. These features are super handy for English tests and even job interviews, since good fluency and clear content are usually all you need to shine with your talks! 🌟🗣️📚  


## Features

- [x] Replay your voice recordings 🔁
- [x] Display refined versions from LLM ✨
- [x] Timer to limit speech length ⏲️
- [ ] Shadow reading 📖
- [ ] Pronunciation assessment 💯
- [ ] Multilingual 🌍
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

1. Configure `API_KEY` after copying the example environment file in the `backend` folder:
    ```sh
    cd backend
    cp .env.example .env
    ```
    Add your OpenAI API key to the `.env` file.

2. Deploy the application from the root directory of this project:
    ```sh
    docker compose up -d --build
    ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser. 🌐
