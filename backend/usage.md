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

## Generate Speech Synthesis from Text

**URL:** `/speeches/synthesis`  
**Method:** `POST`
This endpoint accepts a POST request with an audio file and returns the
predicted acoustic score for the audio.

### Request
- **URL:** `/speeches/acoustics_scores`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Form Data:**
    - `audio`: The audio file to be assessed.

### Responses
- **200 OK:**
    - **JSON:** `{"score": <predicted_score>}`
- **500 Internal Server Error:**
    - **JSON:** `{"error": "<error_message>"}`

### Example
```sh
curl -X POST -F "audio=@path_to_audio_file" http://<host>:<port>/speeches/acoustics_scores
```