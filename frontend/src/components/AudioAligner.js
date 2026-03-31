import React, { useEffect, useRef, useState } from 'react';
import Multitrack from 'wavesurfer-multitrack';

const AudioAligner = () => {
  const containerRef = useRef(null);
  const multitrackRef = useRef(null);
  
  // State for the uploaded files and their generated URLs
  const [mainFile, setMainFile] = useState(null);
  const [delayedFile, setDelayedFile] = useState(null);
  const [audioUrls, setAudioUrls] = useState({ main: null, delayed: null });

  // NEW: State for API submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  // State for UI controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [offset, setOffset] = useState(0);

  // 1. Convert Files to Blob URLs when they are uploaded
  useEffect(() => {
    const newUrls = { main: null, delayed: null };

    if (mainFile) newUrls.main = URL.createObjectURL(mainFile);
    if (delayedFile) newUrls.delayed = URL.createObjectURL(delayedFile);

    setAudioUrls(newUrls);

    // Cleanup function to prevent memory leaks
    return () => {
      if (newUrls.main) URL.revokeObjectURL(newUrls.main);
      if (newUrls.delayed) URL.revokeObjectURL(newUrls.delayed);
    };
  }, [mainFile, delayedFile]);

  // 2. Initialize Wavesurfer ONLY when both URLs are ready
  useEffect(() => {
    if (!containerRef.current || !audioUrls.main || !audioUrls.delayed) return;

    multitrackRef.current = Multitrack.create(
      [
        {
          id: 'main-track',
          url: audioUrls.main, 
          startPosition: 0,
          draggable: false, 
          options: {
            waveColor: 'hsl(210, 90%, 60%)',
            progressColor: 'hsl(210, 90%, 30%)'
          }
        },
        {
          id: 'delayed-track',
          url: audioUrls.delayed, 
          startPosition: 0, 
          draggable: true,  
          options: {
            waveColor: 'hsl(340, 90%, 60%)',
            progressColor: 'hsl(340, 90%, 30%)'
          }
        }
      ],
      {
        container: containerRef.current,
        minPxPerSec: 50,
        cursorColor: '#333',
        cursorWidth: 2,
        trackBorderColor: '#ccc',
      }
    );


    multitrackRef.current.on('start-position-change', ({ id, startPosition }) => {
      if (id === 'delayed-track') { // Use whatever your draggable track ID is
        setOffset(startPosition);
      }
    });


    return () => {
      if (multitrackRef.current) {
        multitrackRef.current.destroy();
        setIsPlaying(false);
        setOffset(0);
      }
    };
  }, [audioUrls]);

  const handlePlayPause = () => {
    if (multitrackRef.current) {
      isPlaying ? multitrackRef.current.pause() : multitrackRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };
  const mockSyncApi = async (formData) => {
    // Extract data just to "see" it in the console
    const offset = formData.get('delayOffset');
    console.log(`Mock API received offset: ${offset}s`);
  
    // Simulate network latency (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));
  
    // Simulate a random success or failure (optional)
    const isSuccess = Math.random() > 0.9; // 10% success rate
  
    if (isSuccess) {
      return {
        ok: true,
        json: async () => ({ message: "Sync successful!", offset: offset, score: 100 })
      };
    } else {
      return {
        ok: false,
        status: 500,
        json: async () => ({ error: "Internal Server Error" })
      };
    }
  };
  const handleSubmitToAPI = async () => {
    // 1. Validate that we have both files
    if (!mainFile || !delayedFile) {
      setSubmitStatus('Error: Please upload both files before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Uploading and syncing...');

    // 2. Create the FormData payload
    const formData = new FormData();
    
    // Append the files
    formData.append('mainAudio', mainFile);
    formData.append('delayedAudio', delayedFile);
    
    // Append the final offset. (Backend usually expects strings or numbers)
    formData.append('delayOffset', -offset); 

    try {
      // 3. Send the POST request to your backend
      // Note: Do NOT manually set the 'Content-Type' header to 'multipart/form-data'. 
      // The browser does this automatically and adds the necessary boundary string.
      // const response = await fetch('https://your-backend-api.com/api/sync', {
      //   method: 'POST',
      //   body: formData, 
      // });

      const response = await mockSyncApi(formData);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json(); // Assuming your API returns JSON
      console.log('Server response:', result);
      
      setSubmitStatus(`✅ Successfully processed! Score: ${result.score}`);

    } catch (error) {
      console.error('Submission failed:', error);
      setSubmitStatus('❌ Failed to upload. Check your connection or API.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px' }}>
      <h2>Audio Sync Tool</h2>
      
      {/* File Upload Controls */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>1. Main Audio (Anchor)</label>
          <input type="file" accept="audio/*" onChange={(e) => setMainFile(e.target.files[0])} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>2. Delayed Audio (Draggable)</label>
          <input type="file" accept="audio/*" onChange={(e) => setDelayedFile(e.target.files[0])} />
        </div>
      </div>

      {/* Only show the editor if both files are uploaded */}
      {audioUrls.main && audioUrls.delayed ? (
        <>
          <div ref={containerRef} style={{ border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }} />
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <button
              onClick={handlePlayPause}
              style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <div style={{ fontSize: '16px' }}>
              <strong>Delay Offset:</strong> {offset.toFixed(3)} seconds
            </div>
          </div>
        </>
      ) : (
        <p style={{ color: '#666' }}>Please upload both audio files to begin syncing.</p>
      )}
      <div style={{ marginTop: '20px', padding: '15px', borderTop: '2px solid #eee' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          
          <button
            onClick={handleSubmitToAPI}
            disabled={isSubmitting || !mainFile || !delayedFile}
            style={{
              padding: '12px 24px',
              backgroundColor: isSubmitting ? '#999' : '#007BFF',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            {isSubmitting ? 'Processing...' : 'Sync & Upload to API'}
          </button>

          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
            Final Offset to send: {offset.toFixed(3)}s
          </span>

        </div>

        {/* Status Message */}
        {submitStatus && (
          <p style={{ marginTop: '15px', fontWeight: 'bold', color: submitStatus.includes('❌') ? 'red' : 'green' }}>
            {submitStatus}
          </p>
        )}
      </div>
    </div>
  );
};

export default AudioAligner;