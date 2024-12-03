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
    return (
        <div style={styles.container}>
            <label style={styles.label}>
                Set Timer (optional, in seconds):
                <input
                    type="number"
                    value={timerDuration}
                    onChange={(e) => setTimerDuration(Number(e.target.value))}
                    disabled={isRecording}
                    style={styles.input}
                />
            </label>
        </div>
    );
}
export default TimerInput;
