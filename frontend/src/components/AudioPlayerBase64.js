import React, { useState, useRef } from 'react';

function AudioPlayerBase64({ base64Audio, characters }) {
  // If your API doesn't include the prefix, add it here
  const audioSrc = `data:audio/wav;base64,${base64Audio}`;
  
  const audioRef = useRef(null);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Text-to-Speech Output</h3>
      

      <div style={styles.playerContainer}>
        {/* Hidden or visible HTML5 Audio element */}
        <audio 
          ref={audioRef} 
          src={audioSrc} 
          // onEnded={() => setIsPlaying(false)} 
          controls
          style={styles.audioPlayer}
        />        
          {/* <audio src={audioUrl} controls style={styles.audioPlayer} /> */}
      </div>

      {/* Bonus: Displaying the characters you passed along */}
      <div style={{ marginTop: '15px', display: 'flex', gap: '5px' }}>
        {characters && characters.map((char, index) => (
          <span key={index} style={{ border: '1px solid #ddd', padding: '5px' }}>
            {char.text}
          </span>
        ))}
      </div>
    </div>
  );
};
const styles = {
  container: { maxWidth: '600px', margin: '20px auto', fontFamily: 'sans-serif' },
  playerContainer: { margin: '20px 0', padding: '15px', background: '#f0f0f0', borderRadius: '8px' },
  audioPlayer: { width: '100%' },
};
export default AudioPlayerBase64;