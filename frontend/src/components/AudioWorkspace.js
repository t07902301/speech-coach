import React, { useState, useEffect, useRef } from 'react';
import Multitrack from 'wavesurfer-multitrack';
import AudioRecorder from "./AudioRecorder";

const bufferToWavBlob = (audioBuffer) => {
  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  const sampleRate = audioBuffer.sampleRate;
  let pos = 0;

  const setUint16 = (data) => { view.setUint16(pos, data, true); pos += 2; };
  const setUint32 = (data) => { view.setUint32(pos, data, true); pos += 4; };

  // RIFF header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1);  // PCM format
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16); // 16-bit
  setUint32(0x61746164); // "data" chunk
  setUint32(length - pos - 4);

  for (let i = 0; i < numOfChan; i++) {
      channels.push(audioBuffer.getChannelData(i));
  }

  let offset = 0;
  while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
          let sample = Math.max(-1, Math.min(1, channels[i][offset]));
          sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
          view.setInt16(pos, sample, true);
          pos += 2;
      }
      offset++;
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

// Helper to crop an AudioBuffer in memory
const sliceAudioBuffer = (buffer, start, end) => {
  if (!buffer || start >= end) return null;

  const sampleRate = buffer.sampleRate;
  const startSample = Math.floor(start * sampleRate);
  const endSample = Math.floor(end * sampleRate);
  const frameCount = Math.max(0, endSample - startSample);

  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const sliced = ctx.createBuffer(buffer.numberOfChannels, frameCount, sampleRate);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
      sliced.getChannelData(i).set(buffer.getChannelData(i).subarray(startSample, endSample));
  }
  return sliced;
};

const AudioWorkspace = ({ referenceBuffer, timeRange }) => {
  // --- States ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [offset, setOffset] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState('');

  // --- Refs ---
  const multitrackRef = useRef(null);
  const containerRef = useRef(null);


  // NEW: State for API submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  // --------------------------------------------------
  // 2. Multitrack Initialization
  // --------------------------------------------------
  useEffect(() => {

    if (!containerRef.current || !referenceBuffer) return;
    // 1. Slice reference AudioBuffer in client memory
    const slicedBuffer = sliceAudioBuffer(referenceBuffer, timeRange.start, timeRange.end);
    if (!slicedBuffer) return;

    // 2. Convert sliced buffer to an in-memory WAV Blob URL
    const refWavBlob = bufferToWavBlob(slicedBuffer);
    const refBlobUrl = URL.createObjectURL(refWavBlob);

    // 3. Create Blob URL for user recording (if available)
    const userBlobUrl = userAudioBlob ? URL.createObjectURL(userAudioBlob) : null;

    // Clean up previous instance
    if (multitrackRef.current) {
        multitrackRef.current.destroy();
    }

    // 4. Build tracks array using Blob URLs
    const tracks = [
        {
            id: 'reference-segment',
            url: refBlobUrl,
            startPosition: 0,
            draggable: false,
            options: {
              waveColor: 'hsl(210, 90%, 60%)',
              progressColor: 'hsl(210, 90%, 30%)'
            }
        },
    ];

    if (userBlobUrl) {
        tracks.push({
            id: 'user-recording',
            url: userBlobUrl,
            startPosition: 0,
            draggable: true,
            options: {
              waveColor: 'hsl(340, 90%, 60%)',
              progressColor: 'hsl(340, 90%, 30%)'
            }
        });
    }

    // 5. Initialize wavesurfer-multitrack
    const multitrack = Multitrack.create(tracks, 
      {
        container: containerRef.current,
        minPxPerSec: 50,
        cursorColor: '#333',
        cursorWidth: 2,
        trackBorderColor: '#ccc',
      }
    );

    multitrackRef.current = multitrack;

    // 6. Memory Cleanup: Revoke Blob URLs when component unmounts or inputs change
    return () => {
        multitrack.destroy();
        URL.revokeObjectURL(refBlobUrl);
        if (userBlobUrl) URL.revokeObjectURL(userBlobUrl);
        setIsPlaying(false);
        setOffset(0);
    };
  },  [referenceBuffer, timeRange.start, timeRange.end]); 

  // // --- Helper Controls ---
  const playMultitrack = () => {
    if (multitrackRef.current) {
      isPlaying ? multitrackRef.current.pause() : multitrackRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };
  const handleEvaluation = async () => {
    // 1. Validate that we have both files
    if (!mainAudioUrl || !recordedUrl) {
      setSubmitStatus('Error: Please upload both files before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('Uploading and syncing...');

    // 2. Create the FormData payload
    const formData = new FormData();

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    // Note: Since we only have URLs, we need to fetch the blobs first
    const referenceResponse = await fetch(mainAudioUrl);
    const queryResponse = await fetch(recordedUrl);
    if (!referenceResponse.ok || !queryResponse.ok) {
      throw new Error('Failed to fetch audio files from URLs.');
    }
    const referenceBlob = await referenceResponse.blob();
    const queryBlob = await queryResponse.blob();

    // Append the files
    formData.append('reference_audio', referenceBlob);
    formData.append('query_audio', queryBlob);
    
    // Append the final offset. (Backend usually expects strings or numbers)
    formData.append('query_start', -offset); 
try {
    const response = await fetch(BACKEND_URL + "/speeches/acoustic_evaluation", {
        method: "POST",
        body: formData,
    });

    if (response.ok) {
        const result = await response.json();
        setSubmitStatus(`✅ Successfully processed! Audio Discrepancy: ${result.score}`);
    } else {
        let errorMessage = response.statusText;
        
        try {
            const errorData = await response.json();
            
            // Extract the message based on the global handler keys:
            // errorData.description contains your specific Python str(e)
            if (errorData && errorData.description) {
                errorMessage = errorData.description;
            } else if (errorData && errorData.message) {
                errorMessage = errorData.message;
            }
        } catch (jsonErr) {
            // Fallback if the response isn't JSON
        }

        console.error('Acoustic Evaluation Error:', errorMessage);
        alert(`Error ${response.status}: ${errorMessage}`);
        setSubmitStatus(`❌ Failed: ${errorMessage}`);
    }
} catch (error) {
    console.error('Error:', error);
    alert(`An error occurred: ${error.message || error}`);
} finally {
    setIsSubmitting(false);
}
  };

  return (
    <div>
      {/* Recording Area */}

      <AudioRecorder upliftQueryAudioUrl={setRecordedUrl}/>

      <hr />

      {/* Multitrack Area */}
      <h3>Multitrack Editor</h3>
      {!recordedUrl && <p>Record some audio to see the multitrack effect!</p>}
      <div ref={containerRef} style={{ width: '100%', minHeight: '200px' }}></div>
      
      {recordedUrl && (
          <button
            onClick={playMultitrack}
            style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
      )}
      
      <p>Offset: {-offset.toFixed(2)} seconds</p>
      <button
            onClick={handleEvaluation}
            disabled={isSubmitting || !mainAudioUrl || !recordedUrl}
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
            {isSubmitting ? 'Processing...' : 'Evaluate Audio Discrepancy'}
          </button>
      {/* Status Message */}
      {submitStatus && (
        <p style={{ marginTop: '15px', fontWeight: 'bold', color: submitStatus.includes('❌') ? 'red' : 'green' }}>
          {submitStatus}
        </p>
      )}
  </div>
  );
};

export default AudioWorkspace;