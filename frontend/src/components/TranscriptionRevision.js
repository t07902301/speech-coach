import React, { useState } from 'react';
import SyncLoader from "react-spinners/SyncLoader";
import '../styles/Transcription.css';

function TranscriptionRevision({ transcript, image}) {
    const BACKEND_URL = "http://localhost:5000"; // Replace with your backend URL

    const [revisedTranscript, setRevisedTranscript] = useState("");
    const [loading, setLoading] = useState(false);
    const [revisionScore, setRevisionScore] = useState(0);

    const reviseTranscript = async () => {
        if (!transcript) {
            alert("No transcript available for revision.");
            return;
        }

        setLoading(true);

        try {
            const prompt = document.querySelector(".promptInput").value;
            const imageInput = image;
            const formData = new FormData();

            formData.append("payload", JSON.stringify({ transcript, customized_prompt: prompt }));
            if (imageInput) {
                formData.append("image", imageInput);
            }

            const response = await fetch(BACKEND_URL + "/speeches/revisions", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Revision failed");
            }

            const data = await response.json();
            console.log(data);
            setRevisedTranscript(data.revisedTranscript);
            setRevisionScore(data.revisionScore);
        } catch (error) {
            console.error("Error revising transcript:", error);
            alert("Error revising transcript.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="inputContainer">
                <textarea
                    className="promptInput"
                    rows="4"
                    cols="50"
                    defaultValue="You are an English coach. Please refine a user's talk to make them sound more natural and grammarly correct."
                ></textarea>
                {/* <input type="file" className="imageInput" accept="image/*" /> */}
            </div>
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
                        <p className="revisionScore">Your Transcription Covers <strong>{revisionScore}</strong>% of the Revision. </p>
                    </div>
                )
            )}
        </div>
    );
}


export default TranscriptionRevision;