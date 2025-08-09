import React, { useState } from 'react';
import SyncLoader from "react-spinners/SyncLoader";
import '../styles/Transcription.css';
import TranscriptionRevision from './TranscriptionRevision';
import { useEffect } from 'react';

// Transcription Component
function Transcription({ audioBlob, image, upliftTranscription = () => {} }) {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const [transcription, setTranscription] = useState("");
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        upliftTranscription(transcription);
    }, [transcription]);
    const transcribeAudio = async () => {
        if (!audioBlob) {
            alert("Record before transcribing");
            return;
        }
        
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.wav");
        setTranscription("Transcribing...");
        setLoading(true);

        try {
            const response = await fetch(BACKEND_URL + "/speeches/transcriptions", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const data = await response.json();
            setTranscription(data.transcript);
        } catch (error) {
            alert("Error transcribing audio: " + error.message);
            setTranscription("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button onClick={transcribeAudio} className="button">
                Transcribe Recording
            </button>
            {loading ? (
                <div className="loaderContainer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader color={"#007BFF"} loading={loading} size={15} />
                </div>
            ) : (
                transcription && (
                    <div className="transcriptionContainer" style={{ textAlign: 'center' }}>
                        <h3 className="heading">Transcription</h3>
                        <p className="transcriptionText">{transcription}</p>
                        <br />
                        <TranscriptionRevision transcript={transcription} image={image}/>
                    </div>
                )
            )}
        </div>

    );
}

export default Transcription;

