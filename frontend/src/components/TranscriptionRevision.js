import React, { useState } from 'react';
import SyncLoader from "react-spinners/SyncLoader";
import '../styles/Transcription.css';

function TranscriptionRevision({ transcript }) {
    const BACKEND_URL = "http://localhost:5000"; // Replace with your backend URL

    const [revisedTranscript, setRevisedTranscript] = useState("");
    const [loading, setLoading] = useState(false);

    const reviseTranscript = async () => {
        if (!transcript) {
            alert("No transcript available for revision.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(BACKEND_URL + "/revise_transcript", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ transcript, key: "transcript" }),
            });

            if (!response.ok) {
                throw new Error("Revision failed");
            }

            const data = await response.json();
            setRevisedTranscript(data.revisedTranscript);
            console.log(data.revisedTranscript);
        } catch (error) {
            console.error("Error revising transcript:", error);
            alert("Error revising transcript.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={reviseTranscript} disabled={!transcript} className="button">
                Revise Transcript
            </button>
            {loading ? (
                <div className="loaderContainer">
                    <SyncLoader color={"#007BFF"} loading={loading} size={15} />
                </div>
            ) : (
                revisedTranscript && (
                    <div className="transcriptionContainer">
                        <h3 className="heading">Revised Transcription</h3>
                        <p className="transcriptionText">{revisedTranscript}</p>
                    </div>
                )
            )}
        </div>
    );
}


export default TranscriptionRevision;