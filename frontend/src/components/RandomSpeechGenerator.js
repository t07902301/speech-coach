import React, { useState, useRef } from 'react';
import AcousticsVisual from './AcousticsVisual';
import { useEffect } from 'react';
import AudioPlayerBase64 from './AudioPlayerBase64';

const SpeechGenerator = ({upliftReferenceSpeechURL = () => {}}) => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const [audioBlob, setAudioBlob] = useState(null);
    const textAreaRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [characters, setCharacters] = useState([]); // For character-level timing metadata
    const [base64Audio, setBase64Audio] = useState(null); // Store base64 audio for the player
    const [audioUrl, setAudioUrl] = useState(null);
    const audioRef = useRef(null); // Reference to the audio element
    const selectedTextRef = useRef(''); // To store the currently selected text

    useEffect(() => {
        if (audioBlob) {
            console.log('Audio blob updated, uplifting URL to Coordinator');
            let ref_audio_url = URL.createObjectURL(audioBlob);
            upliftReferenceSpeechURL(ref_audio_url);
            setAudioUrl(ref_audio_url);
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
            setBase64Audio(data.audio); // Store base64 audio for the player
            setCharacters(data.characters); // Store character timings for mapping highlights

            // const data = await response.arrayBuffer();
            // setAudioBlob(new Blob([data], { type: 'audio/wav' }));   

            console.log('Speech generated successfully');
        } catch (error) {
            alert('Error generating speech: ' + error.message);
            setAudioBlob(null);
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

    const handleTextSelect = () => {
        const text = window.getSelection().toString();
        selectedTextRef.current = text;
        console.log('Selected text: ', text);
    };

    return (
        <div style={{ width: '80%' }}>
            <p>Enter the text you'd like to practice reading.</p>
            <textarea ref={textAreaRef} onMouseUp={handleTextSelect} rows="10" cols="50" style={{ width: '100%' }} />
            <br />
            <button onClick={handleButtonClick} style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                {isLoading ? 'Loading...' : 'Sample Reading'}
            </button>
            {/* 2. Reference Audio Player */}
            {/* {audioUrl && (
                <div style={styles.playerContainer}>
                    <audio src={audioUrl} controls style={styles.audioPlayer} />
                </div>
            )} */}
            <AudioPlayerBase64 base64Audio={base64Audio} characters={characters} />
            {/* {selectedTextRef.current && (
                <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: '80%' }}>
                    {selectedTextRef.current}
                </div>
            )}             */}
        </div>
    );
};
const styles = {
    container: { maxWidth: '600px', margin: '20px auto', fontFamily: 'sans-serif' },
    playerContainer: { margin: '20px 0', padding: '15px', background: '#f0f0f0', borderRadius: '8px' },
    audioPlayer: { width: '100%' },
  };
export default SpeechGenerator;