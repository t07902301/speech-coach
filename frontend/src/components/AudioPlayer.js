// AudioPlayer Component
function AudioPlayer({ audioUrl, audioCategory}) {
    return (
      audioUrl && (
      <div style={{ marginTop: "20px", textAlign: "center" }}>
      <h3>{audioCategory}</h3>
      <audio controls src={audioUrl}></audio>
      </div>
      )
    );
  }

export default AudioPlayer;