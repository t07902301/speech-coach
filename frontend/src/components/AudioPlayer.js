// AudioPlayer Component
function AudioPlayer({ audioUrl }) {
    return (
      audioUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>Recorded Audio</h3>
          <audio controls src={audioUrl}></audio>
        </div>
      )
    );
  }

export default AudioPlayer;