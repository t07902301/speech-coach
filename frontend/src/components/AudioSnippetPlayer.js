import React, { useState, useRef, useEffect } from 'react';

export const AudioSnippetPlayer = ({ audioBuffer, timeRange }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioCtxRef = useRef(null);
    const activeSourceRef = useRef(null);

    // Stop playback if user updates segment selection while playing
    useEffect(() => {
        stopAudio();
    }, [timeRange]);

    const playSegment = () => {
        if (!audioBuffer) return;

        // Reuse or create AudioContext instance
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }

        // Stop any currently playing audio node
        stopAudio();

        // Create buffer source node
        const source = audioCtxRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtxRef.current.destination);

        const start = timeRange.start;
        const duration = Math.max(0, timeRange.end - timeRange.start);

        // Reset playing state when audio snippet ends naturally
        source.onended = () => {
            setIsPlaying(false);
        };

        // start(whenToPlay, offsetInSeconds, durationInSeconds)
        source.start(0, start, duration);
        activeSourceRef.current = source;
        setIsPlaying(true);
    };

    const stopAudio = () => {
        if (activeSourceRef.current) {
            try {
                activeSourceRef.current.stop();
            } catch (e) {
                // Ignore if already stopped
            }
            activeSourceRef.current = null;
        }
        setIsPlaying(false);
    };

    return (
        <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <p>
                <strong>Selected Range:</strong> {timeRange.start.toFixed(2)}s – {timeRange.end.toFixed(2)}s
            </p>
            <button 
                onClick={isPlaying ? stopAudio : playSegment}
                style={{
                    padding: '8px 16px',
                    backgroundColor: isPlaying ? '#DC3545' : '#28A745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                {isPlaying ? 'Stop Segment' : 'Play Selected Segment'}
            </button>
        </div>
    );
};