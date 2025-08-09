import React, { useState } from 'react';
import AcousticsVisual from './AcousticsVisual';

const SpeechGenerator = ( {transcription = "", upliftGeneratedBlob = () => {} }) => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const [audioBlob, setAudioBlob] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const generateSpeech = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(BACKEND_URL + '/speeches/generate/synthesis', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ text: transcription })
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const data = await response.arrayBuffer();
            let GeneratedBlob = new Blob([data], { type: 'audio/wav' });
            setAudioBlob(GeneratedBlob);
            upliftGeneratedBlob(GeneratedBlob);
        } catch (error) {
            alert('Error generating speech: ' + error.message);
            setAudioBlob(null);
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
        <div>
            <button 
                onClick={handleButtonClick} 
                style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', location: 'center' }}
            >
                {isLoading ? 'Loading...' : 'Sample Reading'}
            </button>
            <AcousticsVisual audioBlob={audioBlob} waveform_id="speech-synthesis"/>
        </div>
    );
};

export default SpeechGenerator;