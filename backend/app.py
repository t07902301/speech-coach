import tempfile
from flask import Flask, abort, request, jsonify, render_template
from flask_cors import CORS
from utils import text_to_speech, speech_to_text, acoustic_assess, text_to_text, store_audio

from flask import json
from werkzeug.exceptions import HTTPException
import os
app = Flask(__name__)


cors = CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})


# cache = {}


# def cache_audios(audio: FileStorage, dir: str = None) -> str:
#     if audio.filename not in cache:
#         save_path = os.path.join(dir, audio.filename)
#         audio.save(save_path)
#         cache[audio.filename] = save_path
#     else:
#         save_path = cache[audio.filename]
#     return save_path


@app.route("/speeches/audios", methods=["POST"])
def save_audio():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    audio = request.files["audio"]
    try:
        audio_path = store_audio(audio)
    except Exception as e:
        abort(500, str(e))
    # app.logger.info(audio.filename)
    # # save_path = cache_audios(audio, '../api_tests/audios')
    # # TODO external database
    # audio_path = os.path.join('../api_tests/audios', audio.filename)
    # audio.save(audio_path)
    return jsonify({"message": "File saved successfully", "file_path": audio_path}), 200


@app.route("/speeches/transcriptions", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    audio = request.files["audio"]
    # audio_path = cache_audios(audio)

    try:
        transcript = speech_to_text(audio)
    except Exception as e:
        abort(500, str(e))
    return jsonify({"transcript": transcript})


@app.route("/speeches/revisions", methods=["POST"])
def revise_transcript():
    image = None if "image" not in request.files else request.files["image"]
    payload = request.files["payload"]
    payload = json.loads(payload.read())
    try:
        response_text = text_to_text(payload["transcript"], image, payload["customized_prompt"])
    except Exception as e:
        abort(500, str(e))
    return jsonify(
        {
            "revisedTranscript": response_text,
        }
    )


@app.route("/speeches/generate/synthesis", methods=["POST"])
def generate_speech():
    data = request.get_json()
    try:
        text_to_speech(data["text"])
    except Exception as e:
        abort(500, str(e))
    return jsonify(
        {
            "message": "Speech generated successfully",
        }
    )


@app.route("/speeches/acoustics_scores", methods=["POST"])
def predict_acoustics_scores():
    # audio_path = cache_audios(request.files['audio'])
    try:
        score = acoustic_assess(request.files["audio"])
    except Exception as e:
        abort(500, str(e))
    return jsonify({"score": score})


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/fake_transcribe", methods=["POST"])
def fake_transcribe():
    return jsonify(
        {
            "transcript": "This is a fake transcript",
        }
    )


@app.errorhandler(HTTPException)
def handle_exception(e):
    response = e.get_response()
    response.data = json.dumps(
        {
            "code": e.code,
            "name": e.name,
            "description": e.description,
        }
    )
    response.content_type = "application/json"
    return response
