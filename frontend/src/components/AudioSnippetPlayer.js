import React, { useRef, useEffect } from 'react';

function AudioSnippetPlayer({ audio_url, timeRange }) {
  const audioRef = useRef(null);

  const playSnippet = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // 1. Seek immediately to the selection's start time
    audio.currentTime = timeRange.start;
    
    // 2. Play the audio
    audio.play().catch(err => console.error("Playback failed:", err));
  };

  // Listen to the audio updates to enforce the "end" boundary
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      // 3. If the audio passes the end time, pause it immediately
      if (audio.currentTime >= timeRange.end) {
        audio.pause();
        // Optional: Reset back to start or keep it at the end
        audio.currentTime = timeRange.start; 
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [timeRange]);

  return (
    <div style={{ marginTop: '20px' }}>
      <audio 
        ref={audioRef} 
        src={audio_url} 
        controls
        style={styles.audioPlayer}
      />
      <button 
        onClick={playSnippet}
        disabled={timeRange.start === timeRange.end}
        style={{ padding: '10px 15px', cursor: 'pointer' }}
      >
        Play Selected Snippet ({timeRange.start}s - {timeRange.end}s)
      </button>
    </div>
  );
}
const styles = {
  container: { maxWidth: '600px', margin: '20px auto', fontFamily: 'sans-serif' },
  playerContainer: { margin: '20px 0', padding: '15px', background: '#4caf50', borderRadius: '8px' },
  audioPlayer: { width: '100%' },
};
export default AudioSnippetPlayer;