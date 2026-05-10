import React, { useState, useRef } from 'react';
import AcousticsVisual from './AcousticsVisual';
import { useEffect } from 'react';

const SpeechGenerator = ({upliftReferenceSpeechURL = () => {}}) => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const [audioBlob, setAudioBlob] = useState(null);
    const textAreaRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [characters, setCharacters] = useState([]); // For character-level timing metadata

    const selectedTextRef = useRef('');
    useEffect(() => {
        if (audioBlob) {
            console.log('Audio blob updated, uplifting URL to Coordinator');
            upliftReferenceSpeechURL(URL.createObjectURL(audioBlob));
        }
    }, [audioBlob]);
    const generateSpeech = async (textToSend) => {
        setIsLoading(true);
        try {
            const response = await fetch(BACKEND_URL + '/speeches/generate/synthesis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToSend, language: "fr" })
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const data = await response.json();
            // 1. Handle the Characters (Metadata)
            const characterTimings = data.characters; 
            setCharacters(characterTimings); // Store this to map highlights to audio.currentTime
            console.log('Character timings received: ', characterTimings);

            // 2. Handle the Audio (Base64 to Blob)
            const binaryString = atob(data.audio_base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }            
            setAudioBlob(new Blob([data], { type: 'audio/wav' }));         
            console.log('Speech generated successfully');
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
            <p>Enter the text you'd like to practice reading.</p>
            <textarea ref={textAreaRef} onMouseUp={handleTextSelect} rows="10" cols="50" style={{ width: '100%' }} />
            <br />
            <button onClick={handleButtonClick} style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                {isLoading ? 'Loading...' : 'Sample Reading'}
            </button>
            <AcousticsVisual audioBlob={audioBlob} waveform_id="random-speech-synthesis"/>

            {selectedTextRef.current && (
                <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: '80%' }}>
                    {selectedTextRef.current}
                </div>
            )}            
        </div>
    );
};

export default SpeechGenerator;