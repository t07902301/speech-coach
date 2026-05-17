import React, { useState, useEffect, useRef } from 'react';
import Multitrack from 'wavesurfer-multitrack';
import AudioRecorder from "./AudioRecorder";

const AudioWorkspace = ({ mainAudioUrl='', refTimeRange={'start': 0, 'end': 0} }) => {
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

    // Only run when WE HAVE BOTH URLs and the container is ready
    if (!containerRef.current || !mainAudioUrl || !recordedUrl) return;

    multitrackRef.current = Multitrack.create(
      [
        {
          id: 'main-track',
          url: mainAudioUrl, // From props
          startPosition: 0,
          draggable: false,
          options: {
            waveColor: 'hsl(210, 90%, 60%)',
            progressColor: 'hsl(210, 90%, 30%)'
          }
        },
        {
          id: 'delayed-track',
          url: recordedUrl, // Now populated by the recording!
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
      if (id === 'delayed-track') {
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
  }, [mainAudioUrl, recordedUrl]); // Triggers when audioUrls changes

  // 2. Dynamic Synchronization: This effect fires EVERY TIME refTimeRange changes
  useEffect(() => {
    const multitrack = multitrackRef.current;
    if (!multitrack || !refTimeRange.start && !refTimeRange.end) return;

    // Find our specific track inside the live instance
    const targetTrack = multitrack.tracks.find(t => t.id === 'text-aligned-track');
    
    if (targetTrack) {
      // Direct updates to the track configuration properties
      targetTrack.startCue = refTimeRange.start;
      targetTrack.endCue = refTimeRange.end;

      // Force wavesurfer-multitrack to re-calculate widths and physically redraw the slice
      multitrack.rendering.setMainWidth(
        multitrack.durations, 
        multitrack.maxDuration
      );

      // Optional: Automatically jump the playhead back to the start of the new text selection
      multitrack.setTime(0); 
    }
  }, [refTimeRange]); // 👈 Crucial: React watches this variable for changes

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
    formData.append('reference_audio', referenceBlob, 'reference.wav');
    formData.append('query_audio', queryBlob, 'query.wav');
    
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
          console.error('Acoustic Evaluation Error:', response.statusText);
          alert(`Error ${response.status}: ${response.statusText}`);
          setSubmitStatus('❌ Failed to upload. Check your connection or API.');
      }
  } catch (error) {
      console.error('Error:', error);
      alert(`An error occurred: ${error}`);
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
      <div ref={containerRef} style={{ width: '80%', minHeight: '200px' }}></div>
      
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