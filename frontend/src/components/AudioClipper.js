import React, { useState, useRef } from 'react';

const AudioClipper = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null); // URL for the player
  const [transcriptionClips, setTranscriptionClips] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioRef = useRef(null); // Reference to the audio element

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create a local URL so the browser can play the file before/after upload
      setAudioUrl(URL.createObjectURL(file)); 
      setTranscriptionClips(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append('audio', selectedFile);

    try {
      const response = await fetch(BACKEND_URL + '/speeches/transcription_clips', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      // Check if status is NOT in the 200-299 range
      if (!response.ok) {
        const errorMessage = data.error;
        console.error("Transcription Error:", errorMessage);
        alert(`Error ${response.status}: ${errorMessage}`); // Or set an error state
        throw new Error(`Error ${response.status}: ${errorMessage}`)
      }
      setTranscriptionClips(data.clips);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Function to play a specific segment with an end time
  const playClip = (startTime, endTime) => {
    if (audioRef.current) {
      const audio = audioRef.current;

      // Jump to start and play
      audio.currentTime = startTime;
      audio.play();

      // Define the stopping logic
      const handleStopAtEnd = () => {
        if (audio.currentTime >= endTime) {
          audio.pause();
          // Remove the listener immediately so it doesn't interfere 
          // with normal playback later
          audio.removeEventListener('timeupdate', handleStopAtEnd);
        }
      };

      // Add the listener
      audio.addEventListener('timeupdate', handleStopAtEnd);
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div style={styles.container}>

      <input type="file" accept="audio/*" onChange={handleFileChange} />
      
      {/* 2. Main Audio Player */}
      {audioUrl && (
        <div style={styles.playerContainer}>
          <audio ref={audioRef} src={audioUrl} controls style={styles.audioPlayer} />
        </div>
      )}

      <button onClick={handleUpload} disabled={!selectedFile || isLoading}>
        {isLoading ? 'Processing...' : 'Transcribe & Clip'}
      </button>

      {transcriptionClips && (
        <div style={styles.results}>
          <h3>Clips (Click to Play)</h3>
          {transcriptionClips.map((segment, index) => (
            <div key={index} style={styles.segmentCard}>
              <div style={styles.segmentHeader}>
                <span style={styles.timeLabel}>
                  {formatTime(segment.start)} - {formatTime(segment.end)}
                </span>
                <button 
                  onClick={() => playClip(segment.start, segment.end)}
                  style={styles.playBtn}
                >
                  ▶ Play Clip
                </button>
              </div>
              <p style={styles.segmentText}>{segment.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '600px', margin: '20px auto', fontFamily: 'sans-serif' },
  playerContainer: { margin: '20px 0', padding: '15px', background: '#f0f0f0', borderRadius: '8px' },
  audioPlayer: { width: '100%' },
  segmentCard: { 
    border: '1px solid #ddd', 
    padding: '10px', 
    margin: '10px 0', 
    borderRadius: '6px',
    backgroundColor: '#fff'
  },
  segmentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  timeLabel: { fontSize: '0.8rem', color: '#666', fontWeight: 'bold' },
  playBtn: { 
    padding: '4px 8px', 
    fontSize: '0.75rem', 
    cursor: 'pointer',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px'
  },
  segmentText: { marginTop: '8px', lineHeight: '1.4' }
};

export default AudioClipper;