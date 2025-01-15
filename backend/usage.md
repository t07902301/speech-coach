# API Endpoints

## Transcribe Audio Files to Text

**URL:** `/speeches/transcriptions`  
**Method:** `POST`

### Request
- **Content-Type:** `multipart/form-data`
- **Form Data:**
    - `audio`: The audio file to be transcribed.

### Responses
- **200 OK:**
    - **JSON:** `{"transcript": "<transcribed_text>"}`
- **400 Bad Request:**
    - **JSON:** `{"error": "No audio file provided"}`
- **500 Internal Server Error:**
    - **JSON:** `{"error": "<error_message>"}`

### Example
```sh
curl -X POST -F "audio=@path_to_audio_file" http://<host>:<port>/speeches/transcriptions
```

## Revise Transcript

**URL:** `/speeches/revisions`  
**Method:** `POST`

### Request
- **Content-Type:** `multipart/form-data`
- **Form Data:**
    - `payload`: A JSON file with the following structure:
        ```json
        {
            "transcript": "string",  // The original transcript text to be revised.
            "customized_prompt": "string | null"  // A custom prompt to guide the revision process.
        }
        ```
    - `image` (optional): An image file that may be used to assist in the revision process.

### Responses
- **200 OK:**
    - **JSON:** `{"revisedTranscript": "string"}`  // The revised transcript text.
- **500 Internal Server Error:**
    - **JSON:** `{"error": "<error_message>"}`

## Predict Acoustic Scores

**URL:** `/speeches/acoustics_scores`  
**Method:** `POST`

### Request
- **Content-Type:** `multipart/form-data`
- **Form Data:**
    - `audio`: The audio file for which the acoustic score is to be predicted.

### Responses
- **200 OK:**
    - **JSON:** `{"score": "<predicted_score>"}`
- **500 Internal Server Error:**
    - **JSON:** `{"error": "<error_message>"}`

### Example
```sh
curl -X POST -F "audio=@path_to_audio_file" http://<host>:<port>/speeches/acoustics_scores
```
## Generate Speech Synthesis from Text

**URL:** `/speeches/generate/synthesis`  
**Method:** `POST`

### Request
- **Content-Type:** `application/json`
- **Body:**
    ```json
    {
        "text": "string"  // The text to be converted to speech.
    }
    ```

### Responses
- **200 OK:**
    - **Content-Type:** `audio/wav`
    - **Body:** The generated audio data in WAV format.
- **500 Internal Server Error:**
    - **JSON:** `{"error": "<error_message>"}`

### Example
```sh
curl -X POST -H "Content-Type: application/json" -d '{"text": "Hello, world!"}' http://<host>:<port>/speeches/synthesis --output output.wav
```
