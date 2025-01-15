import SpeechGenerator from "./SpeechGenerator";
import VoiceRecorder from "./VoiceRecorder";
import React, { useState } from 'react';
const SampleReader = () => {
    const [audioBlob, setAudioBlob] = useState(null);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100vh', paddingTop: '20px' }}>
            <SpeechGenerator />
            <h2>Let me Try!</h2>
            <VoiceRecorder setAudioBlob={setAudioBlob} displayTimer={false}/>
        </div>
    );
};

export default SampleReader;