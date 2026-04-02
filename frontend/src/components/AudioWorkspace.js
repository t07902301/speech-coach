import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';
import Multitrack from 'wavesurfer-multitrack';

const AudioWorkspace = ({ mainAudioUrl='' }) => {
  // --- States ---
  const [record, setRecord] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [offset, setOffset] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState('');
  const [progress, setProgress] = useState('00:00');
  const pauseButtonRef = useRef(null);
  const recButtonRef = useRef(null);
  const wavesurfer = useRef(null);

  // --- Refs ---
  const wavesurferRef = useRef(null);
  const multitrackRef = useRef(null);
  const containerRef = useRef(null);

  // --------------------------------------------------
  // 1. Recorder Initialization
  // --------------------------------------------------
  useEffect(() => {
    createWaveSurfer();
    
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, []);

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

    newRecord.on('record-end', (blob) => {
      setRecordedUrl(URL.createObjectURL(blob));
    });

    newRecord.on('record-progress', (time) => {
      updateProgress(time); // implement your progress UI here if needed
    });

    wavesurferRef.current = newWaveSurfer;
    setRecord(newRecord);
  };
  const updateProgress = (time) => {
    const formattedTime = [
      Math.floor((time % 3600000) / 60000),
      Math.floor((time % 60000) / 1000),
    ]
      .map((v) => (v < 10 ? '0' + v : v))
      .join(':');
    setProgress(formattedTime);
  };

  const handlePauseClick = () => {
    if (record.isPaused()) {
      record.resumeRecording();
      pauseButtonRef.current.textContent = 'Pause';
    } else {
      record.pauseRecording();
      pauseButtonRef.current.textContent = 'Resume';
    }
  };

  const handleRecordClick = () => {
    // Record or Stop
    if (record.isRecording() || record.isPaused()) { // if recording started or paused with the button says Stop
      record.stopRecording();
      recButtonRef.current.textContent = 'Record';
      recButtonRef.current.style.backgroundColor = "#28a745";
      pauseButtonRef.current.style.display = 'none';
    } else { 
      recButtonRef.current.disabled = true;
      record.startRecording().then(() => {
        recButtonRef.current.textContent = 'Stop';
        recButtonRef.current.disabled = false;
        recButtonRef.current.style.backgroundColor = "rgb(193, 45, 45)";
        pauseButtonRef.current.style.display = 'inline';
        pauseButtonRef.current.textContent = 'Pause';
      });
    }
  };

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

  // // --- Helper Controls ---
  // const startRecording = () => record && record.startRecording();
  // const stopRecording = () => record && record.stopRecording();
  const playMultitrack = () => multitrackRef.current && multitrackRef.current.play();

  return (
    <div>
      {/* Recording Area */}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '80%' }}>
        <div id="control-buttons" style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          <button
            id="pause"
            ref={pauseButtonRef}
            onClick={handlePauseClick}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'none',
            }}
          >
            Pause
          </button>
          <button
            id="record"
            ref={recButtonRef}
            onClick={handleRecordClick}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'inline',
            }}
          >
            Record
          </button>      
        </div>
        <div id="progress" style={{ margin: '10px 0' }}>Recording Time: {progress}</div>
        <br />
        <div id="mic" style={{ width: '100%', height: '50%'}}></div>
        <div id="recordings" style={{ width: '100%', height: '30%' }}></div>
      </div>

      <hr />

      {/* Multitrack Area */}
      <h3>Multitrack Editor</h3>
      {!recordedUrl && <p>Record some audio to see the multitrack effect!</p>}
      <div ref={containerRef} style={{ width: '100%', minHeight: '200px' }}></div>
      
      {recordedUrl && (
        <button onClick={playMultitrack}>Play Combined Tracks</button>
      )}
      
      <p>Offset: {offset.toFixed(2)} seconds</p>
    </div>
  );
};

export default AudioWorkspace;