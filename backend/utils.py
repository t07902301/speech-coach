import base64
import io
import logging
import os
import string
import tempfile
from collections import Counter
from typing import List

import requests
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from openai import OpenAI
from pydantic import BaseModel
from pydub import AudioSegment
from werkzeug.datastructures import FileStorage

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set your OpenAI API key
# Load environment variables from .env
load_dotenv()
API_KEY = os.getenv("API_KEY")
ACOUSTIC_URL = os.getenv("ACOUSTIC_URL", "http://localhost:6000")


def speech_to_text(audio: FileStorage):
    client = OpenAI(api_key=API_KEY)
    audio_path = tempfile.NamedTemporaryFile(
        delete=False, suffix=os.path.splitext(audio.filename)[1]
    ).name  # Create a temporary file sharing the same extension as the input audio file
    audio.save(audio_path)  # Save the FileStorage Object to the temporary file

    audio_file = open(audio_path, "rb")

    try:
        transcript = client.audio.transcriptions.create(
            model="whisper-1", file=audio_file
        )
        return transcript.text
    except Exception as e:
        raise Exception(str(e))
    finally:
        os.remove(audio_path)


def clip_speech_to_text(audio: FileStorage) -> List[dict]:
    elevenlabs = ElevenLabs(
        api_key=os.getenv("ELEVENLABS_API_KEY"),
    )
    audio_path = tempfile.NamedTemporaryFile(
        delete=False, suffix=os.path.splitext(audio.filename)[1]
    ).name  # Create a temporary file sharing the same extension as the input audio file
    audio.save(audio_path)  # Save the FileStorage Object to the temporary file

    audio_file = open(audio_path, "rb")

    try:
        transcription = elevenlabs.speech_to_text.convert(
            file=audio_file,
            model_id="scribe_v1",  # Model to use
            tag_audio_events=True,  # Tag audio events like laughter, applause, etc.
            timestamps_granularity="character",
            diarize=True,
        ).model_dump(mode="json")

        words = transcription.get("words", [])
        diarization_segments = []

        # Iterate through the words and group them by speaker_id
        if words:
            # Initialize the current "buffer" with the first word
            current_segment_words = [words[0]]

            # Iterate starting from the second word
            for word in words[1:]:
                # If speaker changes, commit the buffer and start a new one
                if word["speaker_id"] != current_segment_words[-1]["speaker_id"]:
                    # -- Commit Logic --
                    diarization_segments.append(
                        {
                            "start": current_segment_words[0]["start"],
                            "end": current_segment_words[-1]["end"],
                            "text": "".join(w["text"] for w in current_segment_words),
                            "characters": [
                                c
                                for w in current_segment_words
                                for c in w["characters"]
                            ],
                        }
                    )

                    # Reset buffer with the new word
                    current_segment_words = [word]
                else:
                    # Same speaker, just add to buffer
                    current_segment_words.append(word)

            # -- Commit Final Segment --
            if current_segment_words:
                diarization_segments.append(
                    {
                        "start": current_segment_words[0]["start"],
                        "end": current_segment_words[-1]["end"],
                        "text": "".join(w["text"] for w in current_segment_words),
                        "characters": [
                            c for w in current_segment_words for c in w["characters"]
                        ],
                    }
                )
            return diarization_segments
        else:
            raise Exception("No words are found in the transcription.")
    except Exception as e:
        raise Exception(str(e))
    finally:
        os.remove(audio_path)

def fake_clip_speech_to_text(audio: FileStorage, result_file: str = 'char_ts-diarization.pkl') -> List[dict]:
    import pickle as pkl
    try:
        with open(result_file, 'rb') as file:
            # 2. Load the data from the file
            loaded_data = pkl.load(file)
        return loaded_data['diarization_segments']
    except Exception as e:
        raise Exception(str(e))


class TextRevision(BaseModel):
    content: str


# Function to encode the image
def encode_image(image: FileStorage):
    return base64.b64encode(image.stream.read()).decode("utf-8")
    # with open(image_path, "rb") as image_file:
    #     return base64.b64encode(image_file.read()).decode("utf-8")


def text_to_text(text, image: FileStorage = None, customized_prompt=None):
    client = OpenAI(api_key=API_KEY)
    if customized_prompt is None:
        system_prompt = "You are an English tutor. Please refine a user's talk to make them sound more natural and grammarly correct."
    else:
        system_prompt = customized_prompt
    if image is None:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text},
        ]
    else:
        base64_image = encode_image(image)
        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": text},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}",
                        },
                    },
                ],
            },
        ]
    try:
        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=300,
            response_format=TextRevision,
        )
        return response.choices[0].message.parsed.content
    except Exception as e:
        logger.info(response)
        raise Exception(str(e))


def text_to_speech(input_text):
    client = OpenAI(api_key=API_KEY)
    response = client.audio.speech.create(model="tts-1", voice="nova", input=input_text)
    # request_timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    # audio_path = f"../database/audios/{request_timestamp}.wav"
    # response.write_to_file(audio_path)
    # logging.info(f"Generated audio file saved at {audio_path}")
    return response.read()




def trim_audio(
    input_file: str, output_file: str, start_sec: float, end_sec: float = None
):
    """
    Trim the input audio file from start_sec to end_sec and save it as output_file. \n
    """
    # Load the audio file
    audio = AudioSegment.from_file(input_file)
    # Pydub works in milliseconds
    start_time = start_sec * 1000

    if end_sec is None:
        trimmed_audio = audio[start_time:]

    else:
        end_time = end_sec * 1000

        # Slice the audio
        trimmed_audio = audio[start_time:end_time]

    # Export the result
    trimmed_audio.export(output_file, format="wav")
    print(f"Saved: {output_file}")




def generateFileStorage(name: str) -> FileStorage:
    # Read the audio file as bytes
    with open(name, "rb") as audio_file:
        audio_bytes = audio_file.read()

    # Create a FileStorage object
    audio_file_storage = FileStorage(
        stream=io.BytesIO(audio_bytes), filename="good.wav", content_type="audio/wav"
    )
    return audio_file_storage


def evaluate_audio_discrepancy(
    query_audio: FileStorage, ref_audio: FileStorage, query_start: float = None
) -> float:
    """
    Get the discrepancy score between a query and a reference audio.\n Trim the query audio when query_start is indicated. \n
    """
    # url = "http://localhost:6000/api/discrepancy_score"
    # url = "http://speech_assessment-models-1:6000/api/discrepancy_score"
    url = f"{ACOUSTIC_URL}/api/discrepancy_score"
    headers = {}
    temp_query_audio_path = ""
    try:
        if query_start is not None and query_start > 0:
            logger.info(f"Trimming query audio from {query_start} seconds.")
            temp_query_audio_path = tempfile.NamedTemporaryFile(
                delete=False, suffix=os.path.splitext(query_audio.filename)[1]
            ).name  # Create a temporary file sharing the same extension as the input audio file

            trim_audio(query_audio, temp_query_audio_path, query_start)

            query_audio = generateFileStorage(temp_query_audio_path)

        response = requests.request(
            "POST",
            url,
            headers=headers,
            files={
                "query_audio": (query_audio.filename, query_audio),
                "reference_audio": (ref_audio.filename, ref_audio),
            },
        )
        if response.status_code != 200:
            raise Exception(f"Acoustic evaluation API error: {response.text}")
        return round(response.json()["score"], 2)

    except Exception as e:
        raise Exception(str(e))
    finally:
        if query_start is not None and os.path.exists(temp_query_audio_path):
            os.remove(temp_query_audio_path)
            logger.info(f"Removed temporary query audio file: {temp_query_audio_path}")


def load_fileStorage(audio: FileStorage, path: str) -> str:
    # Read the file data into memory
    file_bytes = audio.read()

    # Load the audio data regardless of the input format
    # This automatically detects if it's webm, ogg, wav, etc.
    audio_segment = AudioSegment.from_file(io.BytesIO(file_bytes))

    # Export as a standardized WAV
    audio_segment.export(path, format="wav")

    logger.info(f"Audio file saved to {path}")


def eval_revision(transcript: str, revision: str) -> float:
    """
    Use ROUGE to calculate how many words in revision are in the transcription \n
    """
    # Remove punctuation from the transcript and revision
    translator = str.maketrans("", "", string.punctuation)
    transcript = transcript.translate(translator)
    revision = revision.translate(translator)
    # Convert both transcript and revision to lowercase
    transcript = transcript.lower()
    revision = revision.lower()
    # Turn into unigrams
    reference_words = revision.split()
    candidate_words = transcript.split()

    # Compute the number of overlapping words
    reference_count = Counter(reference_words)
    candidate_count = Counter(candidate_words)
    overlap = sum(min(candidate_count[w], reference_count[w]) for w in candidate_count)

    # Compute precision, recall, and F1 score
    recall = overlap / len(reference_words)
    return round(recall * 100, 4)
