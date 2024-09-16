import os
from dotenv import load_dotenv
from openai import OpenAI
import tempfile
from flask import Flask, abort, request, jsonify, render_template
app = Flask(__name__)
import wave
import contextlib
# from pydub import AudioSegment
# from flask_cors import CORS

# Set your OpenAI API key
# Load environment variables from .env
load_dotenv()
API_KEY = os.getenv('API_KEY')
# cors = CORS(app, resources={r"/*": {"origins": "*"}})

# from werkzeug.exceptions import HTTPException

# @app.errorhandler(HTTPException)
def transcribe_voice(audio_location):
    client = OpenAI(api_key=API_KEY)
    audio_file= open(audio_location, "rb")
    try:
        transcript = client.audio.transcriptions.create(model="whisper-1", file=audio_file)
        return transcript.text
    except Exception as e:
        app.logger.error(f"Error transcribing audio: {str(e)}")
        abort(500, description=f"Error transcribing audio: {str(e)}")

def chat_completion_call(text):
    client = OpenAI(api_key=API_KEY)
    system_prompt = "You are an English tutor. Please refine user's talk to make them more natural and grammatically correct."
    messages = [{"role": "system", "content": system_prompt}, {"role": "user", "content": text}]
    response = client.chat.completions.create(model="gpt-3.5-turbo-1106", messages=messages)
    return response.choices[0].message.content


def text_to_speech_ai(api_response):
    client = OpenAI(api_key=API_KEY)
    response = client.audio.speech.create(model="tts-1",voice="nova",input=api_response)
    return response

import ffmpeg

@app.route('/process-audio', methods=['POST'])
def process_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    # Get the audio file from the request
    audio_file = request.files['audio']

    # Convert the uploaded audio file to WAV format using ffmpeg

    temp_input_audio_path = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.filename)[1])
    app.logger.info(temp_input_audio_path.name)
    audio_file.save(temp_input_audio_path.name)
    temp_converted_audio_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    app.logger.info(temp_converted_audio_file.name)
    
    ffmpeg.input(temp_input_audio_path.name).output(temp_converted_audio_file.name, format='wav').overwrite_output().run()


    # Transcribe the audio with OpenAI's Whisper API
    transcript_response = transcribe_voice(temp_converted_audio_file.name)
    app.logger.info(" get transcript_response")

    # Generate an inference/response based on the transcript
    response_text = chat_completion_call(transcript_response)
    app.logger.info(" get response_text")

    # # Generate speech audio from the response
    # audio_response = text_to_speech_ai(response_text)
    # with open(f'static/audio/{gen_audio}', 'wb') as f:
    #     f.write(audio_response.read())
    # app.logger.info(" get audio_response")


    # # Save the speech audio to a temporary file and return its URL
    # temp_gen_audio_file = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
    # with open(temp_gen_audio_file.name, 'wb') as f:
    #     # Generate speech audio from the response text
    #     f.write(audio_response.read())

    # app.logger.info(" get temp_gen_audio_file")

    return jsonify({
        'transcript': transcript_response,
        'responseText': response_text,
        # 'audioUrl': gen_audio
    })

# Serve the audio file
@app.route('/audio/<filename>')
def serve_audio(filename):
    return app.send_static_file(f"audio/{filename}")

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')
