import React, { useState } from 'react';
import SpeechGenerator from './RandomSpeechGenerator';
import AudioWorkspace from './AudioWorkspaceTest';

const SampleReader = () => {
    // Store master audio buffer and the user's selected segment range
    const [referenceBuffer, setReferenceBuffer] = useState(null);
    const [timeRange, setTimeRange] = useState({ start: 0, end: 0 });

    const handleSpeechGenerated = (buffer, initialTimeRange) => {
        setReferenceBuffer(buffer);
        setTimeRange(initialTimeRange);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100vh', paddingTop: '20px' }}>
            <SpeechGenerator 
                onSpeechGenerated={handleSpeechGenerated} 
            />
            
            <h2>Let me Try!</h2>
            
            {/* Pass the buffer and selected range down for visualization & comparison */}
            <AudioWorkspace 
                referenceBuffer={referenceBuffer}
                timeRange={timeRange}
            />
        </div>
    );
};

export default SampleReader;