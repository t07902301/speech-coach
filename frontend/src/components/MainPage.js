import React, { useState } from "react";
import VoiceRecorder from './VoiceRecorder';
import Transcription from "./Transcription";
import ImageUploader from "./ImageUploader";

const MainPage = () => {
    const [audioBlob, setAudioBlob] = useState();
    const [image, setImage] = useState(null);
    return (
        <div>
            <VoiceRecorder setAudioBlob={setAudioBlob}/> 
            <ImageUploader setImage={setImage}/>
            <Transcription audioBlob= {audioBlob} image={image}/>
            
        </div>
    );
};

export default MainPage;