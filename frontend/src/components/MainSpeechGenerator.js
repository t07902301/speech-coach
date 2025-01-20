import React, { useState } from 'react';
import AudioPlayer from "./AudioPlayer";

const SpeechGenerator = ( {transcription = ""}) => {
    const [audioUrl, setAudioUrl] = useState(null);
    const BACKEND_URL = "http://localhost:5000"; // Replace with your backend URL
    const [isLoading, setIsLoading] = useState(false);

    const generateSpeech = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(BACKEND_URL + '/speeches/generate/synthesis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: transcription })
            });
            const data = await response.arrayBuffer();
            const audioBlob = new Blob([data], { type: 'audio/wav' });
            setAudioUrl(URL.createObjectURL(audioBlob));
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleButtonClick = () => {
        if (transcription.length === 0) {
            alert('No transcription available.');
            return;
        } else {
            generateSpeech();
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button 
                onClick={handleButtonClick} 
                style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
                {isLoading ? 'Loading...' : 'Sample Reading'}
            </button>
            <AudioPlayer audioUrl={audioUrl} audioCategory="Sample Audio" />
        </div>
    );
};

export default SpeechGenerator;