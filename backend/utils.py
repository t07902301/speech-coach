import os
from dotenv import load_dotenv
from openai import OpenAI
import logging
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set your OpenAI API key
# Load environment variables from .env
load_dotenv()
API_KEY = os.getenv('API_KEY')

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

def text_to_speech(input_text):
    client = OpenAI(api_key=API_KEY)
    response = client.audio.speech.create(model="tts-1",voice="nova",input=input_text)
    return response.write_to_file("output_audio.wav")