import React from 'react';
import '../styles/RecorderControls.css';

// RecorderControls.js

function RecorderControls({ isRecording, isPaused, onStart, onStop, onTogglePauseResume }) {
    return (
      <div className="recorder-controls">
        <button className="recorder-button" onClick={onStart} disabled={isRecording}>
          Start Recording
        </button>
        <button className="recorder-button" onClick={onStop} disabled={!isRecording}>
          Stop
        </button>
        <button className="recorder-button" onClick={onTogglePauseResume} disabled={!isRecording}>
          {isPaused ? "Resume" : "Pause"}
        </button>
      </div>
    );
}

export default RecorderControls;
