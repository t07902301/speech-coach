import SpeechGenerator from "./RandomSpeechGenerator";
import SampleRecorder from "./SampleRecorder";
import AudioWorkspace from "./AudioWorkspace";
import React from 'react';
import logger from "../utils/logger";

const SampleReader = () => {
    const [reference_speech_url, setReferenceSpeechURL] = React.useState("");
    const upliftReferenceSpeechURL = (reference_speech_url) => {
        setReferenceSpeechURL(reference_speech_url);
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100vh', paddingTop: '20px' }}>
            <SpeechGenerator upliftReferenceSpeechURL={upliftReferenceSpeechURL} />
            <h2>Let me Try!</h2>
            <AudioWorkspace mainAudioUrl={reference_speech_url}/>
        </div>
    );
};

export default SampleReader;