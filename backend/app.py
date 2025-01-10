import tempfile
from flask import Flask, abort, request, jsonify, render_template
app = Flask(__name__)
from flask_cors import CORS
from utils import transcribe_voice, chat_completion_call, text_to_speech
import os

cors = CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

from flask import json
from werkzeug.exceptions import HTTPException

@app.route('/speeches/transcriptions', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    audio_file = request.files['audio']

    temp_input_audio_path = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.filename)[1]) # Create a temporary file sharing the same extension as the input audio file
    audio_file.save(temp_input_audio_path.name) # Save the FileStorage Object to the temporary file

    try:
        transcript = transcribe_voice(temp_input_audio_path.name)
    except Exception as e:
        abort(500, str(e))
    finally:
        os.remove(temp_input_audio_path.name)
    return jsonify({'transcript': transcript})

@app.route('/speeches/revisions', methods=['POST'])
def revise_transcript():
    data = request.get_json()
    response_text = chat_completion_call(data['transcript'])
    return jsonify({
        'revisedTranscript': response_text,
    })

@app.route('/speeches/generate/synthesis', methods=['POST'])
def generate_speech():
    data = request.get_json()
    response = text_to_speech(data['text'])
    return jsonify({
        'audio': response.audio,
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
    save_path = os.path.join('tests', 'audios', audio_file.filename)
    audio_file.save(save_path)
    return jsonify({'message': 'File saved successfully', 'file_path': save_path}), 200
    