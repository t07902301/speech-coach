import React, { useState } from 'react';

const SpeechGenerator = () => {
    const [audioUrl, setAudioUrl] = useState('');
    const BACKEND_URL = "http://localhost:5000"; // Replace with your backend URL

    const handleButtonClick = async () => {
        try {
            const response = await fetch(BACKEND_URL + "/speeches/synthesis");
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
        } catch (error) {
            console.error('Error fetching audio:', error);
        }
    };

    return (
        <div>
            <button onClick={handleButtonClick}>Check Sample Speech!</button>
            {audioUrl && <audio controls src={audioUrl} />}
        </div>
    );
};

export default SpeechGenerator;