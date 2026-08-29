import SpeechGenerator from "./RandomSpeechGenerator";
import AudioWorkspace from "./AudioWorkspace";
import React, { useState } from 'react';

const SampleReader = () => {
    const [reference_speech_url, setReferenceSpeechURL] = useState('');
    const upliftReferenceSpeechURL = (url) => {
        setReferenceSpeechURL(url);
    };
    const [refTimeRange, setRefTimeRange] = useState(); 
    const upliftReferenceTimeRange = (timeRange) => {
        setRefTimeRange(timeRange);
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100vh', paddingTop: '20px' }}>
            <SpeechGenerator upliftReferenceSpeechURL={upliftReferenceSpeechURL} upliftReferenceTimeRange={upliftReferenceTimeRange}/>
            <h2>Let me Try!</h2>
            <AudioWorkspace mainAudioUrl={reference_speech_url} refTimeRange={refTimeRange}/>
        </div>
    );
};

export default SampleReader;