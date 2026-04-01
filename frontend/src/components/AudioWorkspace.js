import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';
import Multitrack from 'wavesurfer-multitrack';

const AudioWorkspace = ({ mainAudioUrl='' }) => {
  // --- States ---
  const [record, setRecord] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [offset, setOffset] = useState(0);
  // Hold both URLs here. We prepopulate the main one from props.
  const [audioUrls, setAudioUrls] = useState({
    main: mainAudioUrl,
    // delayed: null, // This will hold the recorded audio
    delayed: mainAudioUrl, // For testing, we can start with the same URL. Change to null when ready to test recording.
  });

  // --- Refs ---
  const wavesurferRef = useRef(null);
  const multitrackRef = useRef(null);
  const containerRef = useRef(null);

  // --------------------------------------------------
  // 1. Recorder Initialization
  // --------------------------------------------------
//   useEffect(() => {
//     createWaveSurfer();
    
//     return () => {
//       if (wavesurferRef.current) {
//         wavesurferRef.current.destroy();
//       }
//     };
//   }, []);

  const createWaveSurfer = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const newWaveSurfer = WaveSurfer.create({
      container: '#mic',
      waveColor: 'rgb(200, 0, 200)',
      progressColor: 'rgb(100, 0, 100)',
    });

    const newRecord = newWaveSurfer.registerPlugin(
      RecordPlugin.create({
        renderRecordedAudio: false,
        scrollingWaveform: true, // Assuming true based on your variables
        continuousWaveform: true,
        continuousWaveformDuration: 30,
      })
    );

    // 🔥 This is the bridge!
    newRecord.on('record-end', (blob) => {
      const recordedUrl = URL.createObjectURL(blob);
      
      // Update the state so the Multitrack useEffect triggers
      setAudioUrls((prev) => ({
        ...prev,
        delayed: recordedUrl,
      }));
    });

    newRecord.on('record-progress', (time) => {
      // updateProgress(time); // implement your progress UI here if needed
    });

    wavesurferRef.current = newWaveSurfer;
    setRecord(newRecord);
  };


  // --------------------------------------------------
  // 2. Multitrack Initialization
  // --------------------------------------------------
  useEffect(() => {
    console.log('Audio URLs updated:', audioUrls);
    // Only run when WE HAVE BOTH URLs and the container is ready
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
          url: audioUrls.delayed, // Now populated by the recording!
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
  }, [audioUrls]); // Triggers when audioUrls changes

  // --- Helper Controls ---
  const startRecording = () => record && record.startRecording();
  const stopRecording = () => record && record.stopRecording();
  const playMultitrack = () => multitrackRef.current && multitrackRef.current.play();

  return (
    <div>
      {/* Recording Area */}
      <div id="mic" style={{ border: '1px solid #ccc', marginBottom: '10px' }}></div>
      <button onClick={startRecording}>Start Record</button>
      <button onClick={stopRecording}>Stop Record</button>

      <hr />

      {/* Multitrack Area */}
      <h3>Multitrack Editor</h3>
      {!audioUrls.delayed && <p>Record some audio to see the multitrack effect!</p>}
      <div ref={containerRef} style={{ width: '100%', minHeight: '200px' }}></div>
      
      {audioUrls.delayed && (
        <button onClick={playMultitrack}>Play Combined Tracks</button>
      )}
      
      <p>Offset: {offset.toFixed(2)} seconds</p>
    </div>
  );
};

export default AudioWorkspace;