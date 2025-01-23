import SpeechGenerator from "./RandomSpeechGenerator";
import SampleRecorder from "./SampleRecorder";
import React from 'react';
const SampleReader = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100vh', paddingTop: '20px' }}>
            <SpeechGenerator />
            <h2>Let me Try!</h2>
            <SampleRecorder />
        </div>
    );
};

export default SampleReader;