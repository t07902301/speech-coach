import React from "react";

// TimerInput Component
function TimerInput({ timerDuration, setTimerDuration, isRecording }) {
    return (
      <div style={{ marginBottom: "10px" }}>
        <label>
          Set Timer (optional, in seconds):{" "}
          <input
            type="number"
            value={timerDuration}
            onChange={(e) => setTimerDuration(Number(e.target.value))}
            disabled={isRecording}
          />
        </label>
      </div>
    );
  }
export default TimerInput;