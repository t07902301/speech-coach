import React, { useState } from "react";
import VoiceRecorder from './VoiceRecorder';
import ImageOperator from "./ImageOperator";
import Analyzer from "./MainAnalyzer";
const MainPage = () => {
    const [audioBlob, setAudioBlob] = useState(null);
    const [image, setImage] = useState(null);
    const upliftImage = (image) => {
        setImage(image);
        console.log("Image uplifted to MainPage");
    }
    const upliftAudioBlob = (audioBlob) => {
        setAudioBlob(audioBlob);
        console.log("Audio Blob uplifted to MainPage");
    }
    return (
        <div>
            <VoiceRecorder upliftAudioBlob={upliftAudioBlob} displayTimer={true}/> 
            <ImageOperator upliftImage={upliftImage}/>
            {/* <Transcription audioBlob= {audioBlob} image={image}/> */}
            <Analyzer audioBlob={audioBlob} image={image}/>
        </div>
    );
};

export default MainPage;