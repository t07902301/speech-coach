import React, { useState, useRef, useEffect } from 'react';
import AudioSnippetPlayer from './AudioSnippetPlayer';
import TextSelector from './TextSelector';

// Manage AudioContext singleton to avoid re-creation warnings
const audioCtxRef = { current: null };
const getAudioContext = () => {
if (!audioCtxRef.current) {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
}
if (audioCtxRef.current.state === 'suspended') {
    audioCtxRef.current.resume();
}
return audioCtxRef.current;
};
const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };
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

    const [audioBuffer, setAudioBuffer] = useState(null);
    const activeSourceRef = useRef(null); // Keep track of active audio source node
    
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
    
        // 1. Convert Base64 to ArrayBuffer
        const arrayBuffer = base64ToArrayBuffer(data.audio);
    
        // 2. Decode ArrayBuffer into an AudioBuffer
        const audioContext = getAudioContext();
        const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
        // 3. Store AudioBuffer in state
        setAudioBuffer(decodedBuffer);
        setCharacters(data.characters);
        
        // 4. Initialize time range using exact audio duration (or character timestamps)
        const duration = decodedBuffer.duration; // Exact audio duration in seconds
        setTimeRange({ start: 0, end: duration });
    
        console.log('Speech generated and decoded successfully');
      } catch (error) {
        alert('Error generating speech: ' + error.message);
        setAudioBuffer(null); // Clear buffer on error
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

    // Check if full audio range is selected
    const isFullRangeSelected = 
        audioBuffer && 
        timeRange.start === 0 && 
        Math.abs(timeRange.end - audioBuffer.duration) < 0.05;

    // Reset time selection to full audio length
    const resetToFullRange = () => {
        if (audioBuffer) {
            setTimeRange({ start: 0, end: audioBuffer.duration });
        }
    };

    return (
        <div style={{ width: '80%' }}>
            <p>Enter the text you'd like to practice reading.</p>
            <textarea ref={textAreaRef} rows="10" cols="50" style={{ width: '100%' }} />
            <br />
            <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
                <button 
                    onClick={handleButtonClick} 
                    style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    disabled={isLoading}
                >
                    {isLoading ? 'Loading...' : 'Sample Reading'}
                </button>
    
                {/* Check audioBuffer instead of audioUrl */}
                {audioBuffer && !isFullRangeSelected && (
                    <button 
                        onClick={resetToFullRange} 
                        style={{ padding: '10px 20px', backgroundColor: '#6C757D', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        Reset to Play Whole Audio
                    </button>
                )}
            </div>
    
            <TextSelector timestamps={characters} onRangeSelected={setTimeRange} />
            
            {/* Pass audioBuffer instead of audioUrl */}
            {audioBuffer && (
                <AudioSnippetPlayer 
                    audioBuffer={audioBuffer} 
                    timeRange={timeRange} 
                />
            )}
        </div>
    );
};

export default SpeechGenerator;