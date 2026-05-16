import React, { useState, useRef } from 'react';
import AcousticsVisual from './AcousticsVisual';
import { useEffect } from 'react';
import AudioSnippetPlayer from './AudioSnippetPlayer';
import TextSelector from './TextSelector';

const SpeechGenerator = ({upliftReferenceSpeechURL = () => {}}) => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const [audioUrl, setAudioUrl] = useState('');
    const textAreaRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [characters, setCharacters] = useState([]); // For character-level timing metadata
    const [timeRange, setTimeRange] = useState({ start: 0, end: 0, text: "" });

    useEffect(() => {
        if (audioUrl !== '') {
            upliftReferenceSpeechURL(audioUrl);
        }
    }, [audioUrl]);

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
            setAudioUrl(`data:audio/wav;base64,${data.audio}`); // Store the URL for the audio player
            setCharacters(data.characters); // Store character timings for mapping highlights

            console.log('Speech generated successfully');
        } catch (error) {
            alert('Error generating speech: ' + error.message);
            setAudioUrl(''); // Clear audio URL on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleButtonClick = () => {

        let textToSend = textAreaRef.current.value;
        if (textToSend.trim() !== '') {
            generateSpeech(textToSend);
        } else {
            alert('Please write some text to generate speech.');
        }
    };

    return (
        <div style={{ width: '80%' }}>
            <p>Enter the text you'd like to practice reading.</p>
            <textarea ref={textAreaRef} rows="10" cols="50" style={{ width: '100%' }} />
            <br />
            <button onClick={handleButtonClick} style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                {isLoading ? 'Loading...' : 'Sample Reading'}
            </button>
            <TextSelector timestamps={characters} onRangeSelected={setTimeRange} />
            {base64Audio && <AudioSnippetPlayer base64Audio={base64Audio} timeRange={timeRange} />}
        </div>
    );
};
export default SpeechGenerator;