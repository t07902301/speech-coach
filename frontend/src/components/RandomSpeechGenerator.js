import React, { useState, useRef, useEffect } from 'react';
import AcousticsVisual from './AcousticsVisual';
import AudioSnippetPlayer from './AudioSnippetPlayer';
import TextSelector from './TextSelector';

const SpeechGenerator = ({ upliftReferenceSpeechURL = () => {} }) => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const [audioUrl, setAudioUrl] = useState('');
    const textAreaRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [characters, setCharacters] = useState([]); // For character-level timing metadata
    const [timeRange, setTimeRange] = useState({ start: 0, end: 0 });

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
            
            // Initialize time range to full length
            let endTime = data.characters.length > 0 ? data.characters[data.characters.length - 1].end : 0;
            setTimeRange({ start: 0, end: endTime });

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

    // Resets the range back to the beginning and final character timestamp
    const resetToFullRange = () => {
        if (characters.length > 0) {
            const maxDuration = characters[characters.length - 1].end;
            setTimeRange({ start: 0, end: maxDuration });
        }
    };

    // Helper to check if the current selection is already looking at the entire clip
    const isFullRangeSelected = characters.length > 0 && 
        timeRange.start === 0 && 
        timeRange.end === characters[characters.length - 1].end;

    return (
        <div style={{ width: '80%' }}>
            <p>Enter the text you'd like to practice reading.</p>
            <textarea ref={textAreaRef} rows="10" cols="50" style={{ width: '100%' }} />
            <br />
            <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
                <button 
                    onClick={handleButtonClick} 
                    style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    {isLoading ? 'Loading...' : 'Sample Reading'}
                </button>

                {audioUrl && !isFullRangeSelected && (
                    <button 
                        onClick={resetToFullRange} 
                        style={{ padding: '10px 20px', backgroundColor: '#6C757D', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        Reset to Play the Whole Audio
                    </button>
                )}
            </div>

            <TextSelector timestamps={characters} onRangeSelected={setTimeRange} />
            {audioUrl && <AudioSnippetPlayer audioUrl={audioUrl} timeRange={timeRange} />}
        </div>
    );
};

export default SpeechGenerator;