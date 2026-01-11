
import React, { useState, useRef } from 'react';

// KMP Implementation
const getFirstMatchIndex = (text, pattern) => {
  if (!pattern) return 0;
  const lps = new Array(pattern.length).fill(0);
  let prevLPS = 0, i = 1;
  while (i < pattern.length) {
    if (pattern[i] === pattern[prevLPS]) {
      lps[i++] = ++prevLPS;
    } else if (prevLPS === 0) {
      lps[i++] = 0;
    } else {
      prevLPS = lps[prevLPS - 1];
    }
  }
  i = 0; let j = 0;
  while (i < text.length) {
    if (text[i] === pattern[j]) { i++; j++; }
    else {
      if (j === 0) i++;
      else j = lps[j - 1];
    }
    if (j === pattern.length) return i - pattern.length;
  }
  return -1;
};

const AudioSelectionPlayer = () => {
  const [selectionData, setSelectionData] = useState(null);
  const audioRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null); // URL for the player
  const [transcription, setTranscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create a local URL so the browser can play the file before/after upload
      setAudioUrl(URL.createObjectURL(file)); 
      setTranscription(null);
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
      setTranscription(data.transcription);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const playClip = (startTime, endTime) => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.currentTime = startTime;
      audio.play();

      const handleStopAtEnd = () => {
        if (audio.currentTime >= endTime) {
          audio.pause();
          audio.removeEventListener('timeupdate', handleStopAtEnd);
        }
      };
      audio.addEventListener('timeupdate', handleStopAtEnd);
    }
  };

  const handleTextSelection = (transcription) => {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    if (!selectedText) {
      setSelectionData(null);
      return;
    }

    const matchIndex = getFirstMatchIndex(transcription.text, selectedText);

    if (matchIndex !== -1 && transcription.characters) {
      const startTimestamp = transcription.characters[matchIndex].start;
      const endTimestamp = transcription.characters[matchIndex + selectedText.length - 1].end;

      setSelectionData({
        start: startTimestamp,
        end: endTimestamp,
        text: selectedText
      });
    }
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

      {/* Floating Action Button for Selection */}
      {selectionData && (
        <div style={styles.popover}>
          <button 
            onClick={() => playClip(selectionData.start, selectionData.end)}
            style={styles.playBtn}
          >
            ▶ Play "{selectionData.text.substring(0, 20)}..."
          </button>
          <button onClick={() => setSelectionData(null)} style={styles.closeBtn}>✕</button>
        </div>
      )}

      { 
        transcription && (<div style={{ marginTop: '30px' }}>
            <p 
                onMouseUp={() => handleTextSelection(transcription)}
                style={styles.textBlock}
                >
                {transcription.text}
            </p>
        </div>)
      }

    </div>
  );
};

const styles = {
  container: { maxWidth: '600px', margin: '20px auto', fontFamily: 'sans-serif' },
  segment: { marginBottom: '15px', borderBottom: '1px solid #eee' },
  textBlock: { fontSize: '18px', lineHeight: '1.6', cursor: 'text', userSelect: 'text' },
  popover: {
    position: 'fixed',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#333',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '30px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    zIndex: 100
  },
  playBtn: { background: 'none', border: 'none', color: '#4dabf7', fontWeight: 'bold', cursor: 'pointer' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', marginLeft: '15px', cursor: 'pointer' }
};

export default AudioSelectionPlayer;