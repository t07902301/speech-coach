import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';

export default function AudioRecorder({upliftQueryAudioUrl = () => {}}) {
  const [record, setRecord] = useState(null);
  const [progress, setProgress] = useState('00:00');
  const [recordedUrl, setRecordedUrl] = useState(null);
  
  useEffect(() => {
    if (recordedUrl !== '') {
        upliftQueryAudioUrl(recordedUrl);
    }
}, [recordedUrl]);

  // Track states via React state instead of mutating DOM textContent/styles directly
  const [recordingStatus, setRecordingStatus] = useState('idle'); // 'idle', 'recording', 'paused'
  const [isBtnDisabled, setIsBtnDisabled] = useState(false);

  const wavesurferRef = useRef(null);

  useEffect(() => {
    const createWaveSurfer = () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }

      // Keep WaveSurfer instance minimal since we aren't visualizing live mic input
      const newWaveSurfer = WaveSurfer.create({
        container: '#mic',
        height: 0, // Reduces footprint since we are hiding the container
      });

      const newRecord = newWaveSurfer.registerPlugin(
        RecordPlugin.create({
          renderRecordedAudio: false, // Prevents rendering waveforms post-record
        })
      );

      newRecord.on('record-end', (blob) => {
        setRecordedUrl(URL.createObjectURL(blob));
        setRecordingStatus('idle');
      });

      newRecord.on('record-progress', (time) => {
        updateProgress(time);
      });

      wavesurferRef.current = newWaveSurfer;
      setRecord(newRecord);
    };

    createWaveSurfer();

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, []);

  const updateProgress = (time) => {
    const formattedTime = [
      Math.floor((time % 3600000) / 60000),
      Math.floor((time % 60000) / 1000),
    ]
      .map((v) => (v < 10 ? '0' + v : v))
      .join(':');
    setProgress(formattedTime);
  };

  const handleRecordClick = () => {
    if (!record) return;

    if (record.isRecording() || record.isPaused()) {
      record.stopRecording();
      // WaveSurfer 'record-end' event fires next, switching status back to 'idle'
    } else {
      setIsBtnDisabled(true);
      record.startRecording().then(() => {
        setRecordingStatus('recording');
        setIsBtnDisabled(false);
      }).catch((err) => {
        console.error(err);
        setIsBtnDisabled(false);
      });
    }
  };

  // Dynamic Button Styling Maps
  const recordButtonStyles = {
    idle: { backgroundColor: '#28a745', text: 'Record' },
    recording: { backgroundColor: 'rgb(193, 45, 45)', text: 'Stop' },
    paused: { backgroundColor: 'rgb(193, 45, 45)', text: 'Stop' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '80%' }}>
      <div id="control-buttons" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>

        {/* Start / Stop Button */}
        <button
          id="record"
          disabled={isBtnDisabled}
          onClick={handleRecordClick}
          style={{
            padding: '10px 20px',
            backgroundColor: recordButtonStyles[recordingStatus].backgroundColor,
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {recordButtonStyles[recordingStatus].text}
        </button>
      </div>

      <div id="progress" style={{ margin: '10px 0' }}>
        {recordingStatus === 'idle' ? 'Ready to record' : `Recording Time: ${progress}`}
      </div>
      
      <br />
      
      {/* WaveSurfer needs this node in the DOM to attach its instance, but we keep it hidden */}
      <div id="mic" style={{ display: 'none' }}></div>
      
      {recordedUrl && (
        <div id="recordings" style={{ width: '100%', marginTop: '10px', textAlign: 'center' }}>
          <audio src={recordedUrl} controls style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
}