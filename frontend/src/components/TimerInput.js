import React, { useState } from 'react';

const styles = {
    container: {
        marginBottom: "10px",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: "#333",
    },
    label: {
        display: "block",
        marginBottom: "5px",
        fontSize: "14px",
        fontWeight: "bold",
    },
    input: {
        padding: "8px",
        fontSize: "14px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        // width: "100%",
        boxSizing: "border-box",
    },
};

function TimerInput({ timerDuration, setTimerDuration, isRecording }) {
    const [useTimer, setUseTimer] = useState(false);

    return (
        <div style={{ position: "absolute", top: "25%", left: 0, transform: "translateY(-25%)" }}>
            <button 
                onClick={() => setUseTimer(!useTimer)}
                style={{
                    padding: "8px 16px",
                    fontSize: "14px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    backgroundColor: useTimer ? "#f44336" : "#4CAF50",
                    color: "#fff",
                    cursor: "pointer",
                    marginBottom: "10px",
                }}
            >
                {useTimer ? 'Disable Timer' : 'Enable Timer'}
            </button>    
            {useTimer && (
                <div>
                    <label style={styles.label}>Set Timer (seconds):</label>
                    <input
                        type="number"
                        value={timerDuration}
                        onChange={(e) => setTimerDuration(Number(e.target.value))}
                        disabled={isRecording}
                        style={styles.input}
                    />
                </div>
            )}                    
        </div>
    );
}
export default TimerInput;
