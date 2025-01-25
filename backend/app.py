from flask import Flask, abort, request, jsonify, render_template
from flask_cors import CORS
from utils import text_to_speech, speech_to_text, acoustic_assess, text_to_text, store_audio, eval_revision

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import json
from werkzeug.exceptions import HTTPException
app = Flask(__name__)


limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["2 per day"],
)
cors = CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})


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
    payload = request.form["payload"]
    payload = json.loads(payload)
    try:
        response_text = text_to_text(payload["transcript"], image, payload["customized_prompt"])
        revision_score = eval_revision(payload["transcript"], response_text)
    except Exception as e:
        abort(500, str(e))
    return jsonify(
        {
            "revisedTranscript": response_text,
            "revisionScore": revision_score,
        }
    )


@app.route("/speeches/generate/synthesis", methods=["POST"])
def generate_speech():
    data = json.loads(request.data)
    try:
        audio_data = text_to_speech(data["text"])
    except Exception as e:
        abort(500, str(e))
    return app.response_class(audio_data, mimetype='audio/wav')

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
