import os
import tempfile
from dotenv import load_dotenv
from openai import OpenAI
import logging
import base64
from pydantic import BaseModel
import requests
from werkzeug.datastructures import FileStorage
from datetime import datetime
from collections import Counter
import string

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


def speech_to_text_timestamps(audio_location: str):
    client = OpenAI(api_key=API_KEY)
    audio_file = open(audio_location, "rb")
    try:
        transcription = client.audio.transcriptions.create(
            file=audio_file,
            model="whisper-1",
            response_format="verbose_json",
            timestamp_granularities=["word"],
        )
        return transcription.text, transcription.words
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



def acoustic_assess(query_audio: FileStorage, ref_audio: FileStorage) -> float:
    """
    Get the similarity score between two audio files. \n
    """
    # url = "http://localhost:6000/api/similarity_scores"
    # url = "http://speech_assessment-models-1:6000/api/similarity_scores"
    url = f"{ACOUSTIC_URL}/api/similarity_scores"
    logger.info(url)
    headers = {}

    response = requests.request(
        "POST", url, headers=headers, \
        files= {'query_audio': (query_audio.filename, query_audio), 'reference_audio': (ref_audio.filename, ref_audio)}
    )

    return round(response.json()["score"], 2)


def store_audio(audio: FileStorage) -> str:
    """
    Save the audio file to the database. \n

    """
    audio_path = f"../database/audios/{audio.filename}"
    audio.save(audio_path)
    return audio_path

def eval_revision(transcript: str, revision: str) -> float:
    """
    Use ROUGE to calculate how many words in revision are in the transcription \n
    """
    # Remove punctuation from the transcript and revision
    translator = str.maketrans('', '', string.punctuation)
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
    return round(recall* 100, 4)
