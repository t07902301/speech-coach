import os
import tempfile
from dotenv import load_dotenv
from openai import OpenAI
from flask import Flask, abort, request, jsonify, render_template
app = Flask(__name__)
from flask_cors import CORS

# Set your OpenAI API key
# Load environment variables from .env
load_dotenv()
API_KEY = os.getenv('API_KEY')
cors = CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

from flask import json
from werkzeug.exceptions import HTTPException

def transcribe_voice(audio_location: str):
    client = OpenAI(api_key=API_KEY)
    audio_file= open(audio_location, "rb")
    try:
        transcript = client.audio.transcriptions.create(model="whisper-1", file=audio_file)
        return transcript.text
    except Exception as e:
        raise Exception(str(e))

def chat_completion_call(text):
    client = OpenAI(api_key=API_KEY)
    system_prompt = "You are an IELTS English tutor. Please refine a user's talk to make them sound more natural and grammarly correct."
    messages = [{"role": "system", "content": system_prompt}, {"role": "user", "content": text}]
    try:
        response = client.chat.completions.create(model="gpt-3.5-turbo-1106", messages=messages)
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(str(e))


def text_to_speech_ai(api_response):
    client = OpenAI(api_key=API_KEY)
    response = client.audio.speech.create(model="tts-1",voice="nova",input=api_response)
    return response

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    audio_file = request.files['audio']
    audio_file = request.files['audio']

    temp_input_audio_path = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.filename)[1])
    audio_file.save(temp_input_audio_path.name)

    transcript = transcribe_voice(temp_input_audio_path.name)
    os.remove(temp_input_audio_path.name)
    return jsonify({'transcript': transcript})

@app.route('/revise_transcript', methods=['POST'])
def revise_transcript():
    data = request.get_json()
    response_text = chat_completion_call(data['transcript'])
    return jsonify({
        'revisedTranscript': response_text,
    })

# Serve the audio file
@app.route('/audio/<filename>')
def serve_audio(filename):
    return app.send_static_file(f"audio/{filename}")

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

    
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/fake_transcribe', methods=['POST'])
def fake_transcribe():
    return jsonify({
        'transcript': 'This is a fake transcript',
    })

@app.errorhandler(HTTPException)
def handle_exception(e):
    response = e.get_response()
    response.data = json.dumps({
        "code": e.code,
        "name": e.name,
        "description": e.description,
    })
    response.content_type = "application/json"
    return response

@app.route('/save_audio', methods=['POST'])
def save_audio_file():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    audio_file = request.files['audio']
    app.logger.info(audio_file.filename)
    save_path = os.path.join('tests', 'audio', audio_file.filename)
    audio_file.save(save_path)
    return jsonify({'message': 'File saved successfully', 'file_path': save_path}), 200
    