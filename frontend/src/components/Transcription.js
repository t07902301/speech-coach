import React, { useState } from 'react';

// Transcription Component
function Transcription({ audioBlob }) {
    const BACKEND_URL = "http://localhost:5000"; // Replace with your backend URL

    const [transcription, setTranscription] = useState("");
    console.log('audioBlob', audioBlob)

    const transcribeAudio = async () => {
        if (!audioBlob) {
            alert("No audio available for transcription.");
            return;
        }
        
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");

        try {
            const response = await fetch(BACKEND_URL + "/transcribe", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Transcription failed");
            }

            const data = await response.json();
            setTranscription(data.transcript);
        } catch (error) {
            console.error("Error transcribing audio:", error);
            alert("Error transcribing audio.");
        }
    };

    return (
        <div style={{ marginTop: "20px" }}>
            <button onClick={transcribeAudio} disabled={!audioBlob}>
                Transcribe Recording
            </button>
            {transcription && (
                <div style={{ marginTop: "10px" }}>
                    <h3>Transcription</h3>
                    <p>{transcription}</p>
                </div>
            )}
        </div>
    );
}

export default Transcription;