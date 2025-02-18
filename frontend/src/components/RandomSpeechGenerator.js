import React, { useState, useRef } from 'react';
import AcousticsVisual from './AcousticsVisual';
const SpeechGenerator = () => {
    const [audioBlob, setAudioBlob] = useState(null);
    const textAreaRef = useRef(null);
    const BACKEND_URL = "http://localhost:5000"; // Replace with your backend URL
    const [isLoading, setIsLoading] = useState(false);
    const selectedTextRef = useRef('');

    const generateSpeech = async (textToSend) => {
        setIsLoading(true);
        try {
            const response = await fetch(BACKEND_URL + '/speeches/generate/synthesis', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ text: textToSend })
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const data = await response.arrayBuffer();
            setAudioBlob(new Blob([data], { type: 'audio/wav' }));
        } catch (error) {
            alert('Error generating speech: ' + error.message);
            setAudioBlob(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleButtonClick = () => {

        let textToSend = selectedTextRef.current;
        if (!textToSend && textAreaRef.current) { // If no text is selected, use the text from the textarea
            textToSend = textAreaRef.current.value;
        }
        if (textToSend) {
            generateSpeech(textToSend);
        } else {
            alert('Please select some text to send.');
        }
    };

    const handleTextSelect = () => {
        const text = window.getSelection().toString();
        selectedTextRef.current = text;
    };

    return (
        <div style={{ width: '80%' }}>
            <textarea ref={textAreaRef} onMouseUp={handleTextSelect} rows="10" cols="50" style={{ width: '100%' }} />
            <br />
            <button onClick={handleButtonClick} style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                {isLoading ? 'Loading...' : 'Sample Reading'}
            </button>

            {/* {selectedTextRef.current && (
                <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: '80%' }}>
                    <strong>Selected Text:</strong> {selectedTextRef.current}
                </div>
            )} */}
            <AcousticsVisual audioBlob={audioBlob} waveform_id="random-speech-synthesis"/>
        </div>
    );
};

export default SpeechGenerator;