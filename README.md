# Speech Coach

While preparing for English speaking tests, I noticed that most existing AI-powered tools were too recreational, distracting, and overpriced. So, I decided to create a simple but powerful alternative for people who want to improve their speech skills more efficiently. 

Right now, this app allows you to review your voice recordings, transcribe your talks, and get those transcriptions polished with OpenAI's models. These features are super handy for English tests and even job interviews, since good fluency and clear content are usually all you need to shine with your talks! 🌟🗣️📚  


## Features

- [x] Replay your voice recordings 🔁
- [x] Display refined versions from LLM ✨
- [x] Timer to limit speech length ⏲️
- [x] Shadow reading 📖 of Any Audio, Any Text you like!
- [x] Acoustic assessment 💯 based on a sample audio. 
- [x] Multilingual 🌍 for English, French and more to come. 

## Demo

1. Record yourself and have the recording transcribed. You can also evaluate the acoustics quality of your recordings by comparing it to a synthetic audio generated from the same transcription. 
![Recording Transcription Screenshot](readme-images/recording-transcription.gif)
2. Shadow reading on any audio you chose or a syntectic one generated from any text content you like!
![Audio Clip Screenshot](readme-images/audio-clips.png)

## How It Works

### Frontend

- [x] HTML/JS 🌐
- [x] React ⚛️

### Backend

- [x] Flask 🐍
- [x] API design 📡
- [ ] Database 🗄️
- [ ] Message Queue and Redis for scalability 📬

### Model Endpoints

- [x] OpenAI 🤖
- [ ] Self-hosted models 🏠

### Infrastructure

- [x] Docker 🐳
- [x] Cloud deployment ☁️ Free AWS hosting services is expired. A new deployment is on the way!

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
