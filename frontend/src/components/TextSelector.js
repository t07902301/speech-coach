import React from 'react';
// KMP Implementation
const getFirstMatchIndex = (text, pattern) => {
    if (!pattern) return 0;
    const lps = new Array(pattern.length).fill(0);
    let prevLPS = 0, i = 1;
    while (i < pattern.length) {
      if (pattern[i] === pattern[prevLPS]) {
        lps[i++] = ++prevLPS;
      } else if (prevLPS === 0) {
        lps[i++] = 0;
      } else {
        prevLPS = lps[prevLPS - 1];
      }
    }
    i = 0; let j = 0;
    while (i < text.length) {
      if (text[i] === pattern[j]) { i++; j++; }
      else {
        if (j === 0) i++;
        else j = lps[j - 1];
      }
      if (j === pattern.length) return i - pattern.length;
    }
    return -1;
  };

function TextSelector({ timestamps, onRangeSelected }) {
  // Combine individual character objects back into a cohesive string
  const fullSentence = timestamps.map(item => item.text).join('');

  // Mock button mimicking what your KMP algorithm would trigger
  const handleTextSelection = () => {

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const textString = selection.toString();
    if (!textString.trim()) return;

    const matchIndex = getFirstMatchIndex(fullSentence, textString);

    if (matchIndex !== -1 && timestamps) {
      const startTime = timestamps[matchIndex].start;
      const endTime = timestamps[matchIndex + textString.length - 1].end;
      // Pass the precise times back up to the parent
      onRangeSelected({ start: startTime, end: endTime, text: textString });
    }
  };
  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h4>Highlight any part of the text below with your mouse:</h4>
      <p 
        onMouseUp={handleTextSelection}
        style={{ 
          fontSize: '24px', 
          userSelect: 'text', 
          cursor: 'text',
          backgroundColor: '#f9f9f9',
          padding: '10px',
          borderRadius: '4px',
          display: 'inline-block'
        }}
      >
        {fullSentence}
      </p>
    </div>
  );
}

export default TextSelector;