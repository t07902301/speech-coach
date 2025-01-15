import React, { useState, useRef } from 'react';
import AudioPlayer from "./AudioPlayer";

const SpeechGenerator = () => {
    const [selectedText, setSelectedText] = useState('');
    const [audioUrl, setAudioUrl] = useState(null);
    const textAreaRef = useRef(null);
    const BACKEND_URL = "http://localhost:5000"; // Replace with your backend URL

    const handleButtonClick = () => {
        let textToSend = selectedText;
        if (!textToSend && textAreaRef.current) {
            textToSend = textAreaRef.current.value;
        }
        if (textToSend) {
            // const formdata = new FormData();
            // formdata.append("text", textToSend);
            fetch( BACKEND_URL + '/speeches/generate/synthesis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToSend})
            })
            .then(response => response.arrayBuffer())
            .then(data => {
                const audioBlob = new Blob([data], { type: 'audio/wav' });
                setAudioUrl(URL.createObjectURL(audioBlob));
                })
            .catch(error => {
                console.error('Error:', error);
            });
        }
        else {
            alert('Please select some text to send.');
        }
    };

    const handleTextSelect = (event) => {
        const text = window.getSelection().toString();
        setSelectedText(text);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100vh', paddingTop: '20px' }}>
            <textarea ref={textAreaRef} onMouseUp={handleTextSelect} rows="10" cols="50" />
            <br />
            <button onClick={handleButtonClick} style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Sample Reading
            </button>
            <AudioPlayer audioUrl={audioUrl} audioCategory="Sample Audio"/>
        </div>
    );
};

export default SpeechGenerator;