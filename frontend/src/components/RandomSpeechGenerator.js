import React, { useState, useRef } from 'react';
import AcousticsVisual from './AcousticsVisual';
const SpeechGenerator = () => {
    const [selectedText, setSelectedText] = useState('');
    const [audioBlob, setAudioBlob] = useState(null);
    const textAreaRef = useRef(null);
    const BACKEND_URL = "http://localhost:5000"; // Replace with your backend URL
    const [isLoading, setIsLoading] = useState(false);

    const generateSpeech = async (textToSend) => {
        setIsLoading(true);
        console.log('Start generating', isLoading);
        try {
            const response = await fetch(BACKEND_URL + '/speeches/generate/synthesis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToSend })
            });
            const data = await response.arrayBuffer();
            setAudioBlob(new Blob([data], { type: 'audio/wav' }));
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
            console.log('Generating finished', isLoading);
        }
    };

    const handleButtonClick = () => {
        console.log('Click the button:', isLoading);

        let textToSend = selectedText;
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
        setSelectedText(text);
    };

    return (
        <div style={{ width: '80%' }}>
            <textarea ref={textAreaRef} onMouseUp={handleTextSelect} rows="10" cols="50" style={{ width: '100%' }} />
            <br />
            <button onClick={handleButtonClick} style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                {isLoading ? 'Loading...' : 'Sample Reading'}
            </button>

            {selectedText && (
                <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: '80%' }}>
                    <strong>Selected Text:</strong> {selectedText}
                </div>
            )}
            <AcousticsVisual audioBlob={audioBlob} waveform_id="random-speech-synthesis"/>
            {/* <AudioPlayer audioUrl={audioUrl} audioCategory="Sample Audio" /> */}
        </div>
    );
};

export default SpeechGenerator;