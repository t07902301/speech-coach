import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js'
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js'
const SampleRecorder = () => {
  const [record, setRecord] = useState(null);
  const [scrollingWaveform, setScrollingWaveform] = useState(false);
  const [continuousWaveform, setContinuousWaveform] = useState(true);
  const [progress, setProgress] = useState('00:00');
  const pauseButtonRef = useRef(null);
  const recButtonRef = useRef(null);
  const wavesurfer = useRef(null);

  useEffect(() => {
    createWaveSurfer();
    }, []);

  const createWaveSurfer = () => {
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }

    const newWaveSurfer = WaveSurfer.create({
      container: '#mic',
      waveColor: 'rgb(200, 0, 200)',
      progressColor: 'rgb(100, 0, 100)',
    });

    const newRecord = newWaveSurfer.registerPlugin(
      RecordPlugin.create({
        renderRecordedAudio: false,
        scrollingWaveform,
        continuousWaveform,
        continuousWaveformDuration: 30,
      })
    );

    newRecord.on('record-end', (blob) => {
      const container = document.querySelector('#recordings');
      const recordedUrl = URL.createObjectURL(blob);

      const recordedWaveSurfer = WaveSurfer.create({
        container,
        waveColor: 'rgb(200, 100, 0)',
        progressColor: 'rgb(100, 50, 0)',
        url: recordedUrl,
        plugins: [
            TimelinePlugin.create({
                height: 10,
                timeInterval: 0.1,
                primaryLabelInterval: 1,
                style: {
                  fontSize: '10px',
                  color: '#6A3274',
                },
              }),
            

            Hover.create({
              lineColor: '#ff0000',
              lineWidth: 2,
              labelBackground: '#555',
              labelColor: '#fff',
              labelSize: '11px',
            }),
          ],    
      });

      const button = document.createElement('button');
      button.textContent = 'Play';
      button.onclick = () => recordedWaveSurfer.playPause();
      recordedWaveSurfer.on('pause', () => (button.textContent = 'Play'));
      recordedWaveSurfer.on('play', () => (button.textContent = 'Pause'));
      container.appendChild(button);

      const link = document.createElement('a');
      Object.assign(link, {
        href: recordedUrl,
        download: 'recording.' + blob.type.split(';')[0].split('/')[1] || 'webm',
        textContent: 'Download recording',
      });
      container.appendChild(link);
    });

    newRecord.on('record-progress', (time) => {
      updateProgress(time);
    });

    // setWaveSurfer(newWaveSurfer);
    wavesurfer.current = newWaveSurfer;
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

//   const handleScrollingWaveformChange = (e) => {
//     setScrollingWaveform(e.target.checked);
//     if (continuousWaveform && e.target.checked) {
//       setContinuousWaveform(false);
//       document.querySelector('#continuousWaveform').checked = false;
//     }
//     createWaveSurfer();
//   };

//   const handleContinuousWaveformChange = (e) => {
//     setContinuousWaveform(e.target.checked);
//     if (scrollingWaveform && e.target.checked) {
//       setScrollingWaveform(false);
//       document.querySelector('#scrollingWaveform').checked = false;
//     }
//     createWaveSurfer();
//   };

return (
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
    <div id="progress" style={{ margin: '10px 0' }}>{progress}</div>
    <br />
    <div id="mic" style={{ width: '100%', height: '30%', borderStyle:'dotted' }}></div>
    <div id="recordings" style={{ width: '100%', height: '30%' }}></div>


    {/* <input
      type="checkbox"
      id="scrollingWaveform"
      onChange={handleScrollingWaveformChange}
    />
    <label htmlFor="scrollingWaveform">Scrolling Waveform</label>
    <input
      type="checkbox"
      id="continuousWaveform"
      onChange={handleContinuousWaveformChange}
    />
    <label htmlFor="continuousWaveform">Continuous Waveform</label> */}
  </div>
);
};

export default SampleRecorder;