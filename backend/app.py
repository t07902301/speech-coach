import os
import random

from flask import Flask, abort, json, jsonify, render_template, request
from flask_cors import CORS
# from flask_limiter import Limiter
# from flask_limiter.errors import RateLimitExceeded
# from flask_limiter.util import get_remote_address
from utils import (
    clip_speech_to_text,
    speech_to_text_group_sentence,
    eval_revision,
    evaluate_audio_discrepancy,
    load_fileStorage,
    speech_to_text,
    text_to_text,
    text_to_speech_multilingual
)

import redis  # noqa

app = Flask(__name__)

# limiter = Limiter(
#     get_remote_address,
#     app=app,
#     default_limits=["10 per day"],
#     storage_uri=os.getenv("REDIS_URL", "redis://localhost:6379"),
# )

cors = CORS(
    app,
    resources={
        r"/*": {"origins": os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")}
    },
)


@app.route("/api/speeches/audios", methods=["POST"])
def save_audio():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    audio = request.files["audio"]
    try:
        storage_path = os.path.join("database/audios", audio.filename)
        load_fileStorage(audio, storage_path)
    except Exception as e:
        abort(500, str(e))
    # app.logger.info(audio.filename)
    # # save_path = cache_audios(audio, '../api_tests/audios')
    # # TODO external database
    # audio_path = os.path.join('../api_tests/audios', audio.filename)
    # audio.save(audio_path)
    return jsonify(
        {"message": "File saved successfully", "file_path": storage_path}
    ), 200


@app.route("/api/speeches/transcriptions", methods=["POST"])
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


@app.route("/api/speeches/revisions", methods=["POST"])
def revise_transcript():
    image = None if "image" not in request.files else request.files["image"]
    payload = request.form["payload"]
    payload = json.loads(payload)
    try:
        response_text = text_to_text(
            payload["transcript"], image, payload["customized_prompt"]
        )
        revision_score = eval_revision(payload["transcript"], response_text)
    except Exception as e:
        abort(500, str(e))
    return jsonify(
        {
            "revisedTranscript": response_text,
            "revisionScore": revision_score,
        }
    )


@app.route("/api/speeches/transcription_clips", methods=["POST"])
def transcribe_audio_clip():
    # 1. Check if the file is part of the request
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]

    clip_option = request.form.get("clip_option", "sentence")  # default to sentence if not provided

    try:
        if clip_option == "sentence":
            transcript_clips = speech_to_text_group_sentence(audio_file)
        else:
            transcript_clips = clip_speech_to_text(audio_file)
        return jsonify({"transcription": transcript_clips}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/speeches/generate/synthesis", methods=["POST"])
def generate_speech():
    data = json.loads(request.data)
    app.logger.info(f"Received synthesis request with data: {data}")
    try:
        synthesis_result = text_to_speech_multilingual(data["text"], data["language"])
        audio_data = synthesis_result["audio"]
        characters = synthesis_result["characters"]
        return jsonify({
                "audio": audio_data,
                "characters": characters
            })

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/api/speeches/acoustic_evaluation", methods=["POST"])
def predict_acoustics_scores():
    # audio_path = cache_audios(request.files['audio'])
    try:
        query_audio = request.files["query_audio"]
        reference_audio = request.files["reference_audio"]
        # # load audios for local testing 
        # load_fileStorage(query_audio, '../database/audios/query_audio.wav')
        # load_fileStorage(reference_audio, '../database/audios/reference_audio.wav')
        # # reset file pointer to the beginning after saving
        # query_audio.seek(0)
        # reference_audio.seek(0)
        score = evaluate_audio_discrepancy(
            query_audio,
            reference_audio,
            float(request.form.get("query_start", 0)),
        )
    except Exception as e:
        abort(500, str(e))
    return jsonify({"score": score})


@app.route("/api/sample-questions", methods=["GET"])
def sample_questions():
    sample_questions = [
        "What kind of TV programmes do you like to watch?",
        "Do you like reading books? Why?",
    ]
    return jsonify(
        {"question": sample_questions[random.randint(0, len(sample_questions) - 1)]}
    )


@app.route("/api/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/fake_transcribe", methods=["POST"])
def fake_transcribe():
    return jsonify(
        {
            "transcript": "This is a fake transcript",
        }
    )


# @app.errorhandler(RateLimitExceeded)
# def ratelimit_handler(e):
#     return jsonify({"error": "Rate limit exceeded", "message": str(e.description)}), 429
