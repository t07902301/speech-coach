import React, { useState } from "react";
import VoiceRecorder from './VoiceRecorder';
import ImageOperator from "./ImageOperator";
import Analyzer from "./Analyzer";
const MainPage = () => {
    const [audioBlob, setAudioBlob] = useState(null);
    const [image, setImage] = useState(null);
    return (
        <div>
            <VoiceRecorder setAudioBlob={setAudioBlob} displayTimer={true}/> 
            <ImageOperator setImage={setImage}/>
            {/* <Transcription audioBlob= {audioBlob} image={image}/> */}
            <Analyzer audioBlob={audioBlob} image={image}/>
        </div>
    );
};

export default MainPage;