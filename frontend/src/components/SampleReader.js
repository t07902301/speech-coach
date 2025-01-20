import SpeechGenerator from "./RandomSpeechGenerator";
import VoiceRecorder from "./VoiceRecorder";
import React from 'react';
const SampleReader = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100vh', paddingTop: '20px' }}>
            <SpeechGenerator />
            <h2>Let me Try!</h2>
            <VoiceRecorder/>
        </div>
    );
};

export default SampleReader;