import React, { useState } from 'react';
import SyncLoader from "react-spinners/SyncLoader";
import '../styles/Transcription.css';
import TranscriptionRevision from './TranscriptionRevision';

// Transcription Component
function Transcription({ audioBlob }) {
    const BACKEND_URL = "http://localhost:5000"; // Replace with your backend URL

    const [transcription, setTranscription] = useState("");
    const [loading, setLoading] = useState(false);

    const transcribeAudio = async () => {
        if (!audioBlob) {
            alert("No audio available for transcription.");
            return;
        }
        
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        setTranscription("Transcribing...");
        setLoading(true);

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
            setTranscription("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <button onClick={transcribeAudio} disabled={!audioBlob} className="button">
                Transcribe Recording
            </button>
            {loading ? (
                <div className="loaderContainer">
                    <SyncLoader color={"#007BFF"} loading={loading} size={15} />
                </div>
            ) : (
                transcription && (
                    <div className="transcriptionContainer">
                        <h3 className="heading">Transcription</h3>
                        <p className="transcriptionText">{transcription}</p>
                        <TranscriptionRevision transcript={transcription} />
                    </div>
                )
            )}
        </div>
    );
}

export default Transcription;

