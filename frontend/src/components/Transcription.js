import React, { useState } from 'react';
import SyncLoader from "react-spinners/SyncLoader";

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
        <div style={styles.container}>
            <button onClick={transcribeAudio} disabled={!audioBlob} style={styles.button}>
                Transcribe Recording
            </button>
            {loading ? (
                <div style={styles.loaderContainer}>
                    <SyncLoader color={"#007BFF"} loading={loading} size={15} />
                </div>
            ) : (
                transcription && (
                    <div style={styles.transcriptionContainer}>
                        <h3 style={styles.heading}>Transcription</h3>
                        <p style={styles.transcriptionText}>{transcription}</p>
                    </div>
                )
            )}
        </div>
    );
}

export default Transcription;

const styles = {
    container: {
        marginTop: "20px",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: "#333",
    },
    button: {
        padding: "10px 20px",
        backgroundColor: "#007BFF",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "16px",
    },
    loaderContainer: {
        marginTop: "10px",
        display: "flex",
        justifyContent: "center",
    },
    transcriptionContainer: {
        marginTop: "10px",
        padding: "10px",
        backgroundColor: "#fff",
        borderRadius: "4px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    heading: {
        margin: "0 0 10px 0",
        fontSize: "18px",
        fontWeight: "bold",
    },
    transcriptionText: {
        margin: "0",
        fontSize: "16px",
        lineHeight: "1.5",
    },
};
