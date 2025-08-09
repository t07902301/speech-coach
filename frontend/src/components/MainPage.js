import React, { useState } from "react";
import VoiceRecorder from './VoiceRecorder';
import ImageOperator from "./ImageOperator";
import Analyzer from "./MainAnalyzer";
import logger from "../utils/logger";
import QuestionGenerator from "./QuestionGenerator";
const MainPage = () => {
    const [audioBlob, setAudioBlob] = useState(null);
    const [image, setImage] = useState(null);
    const upliftImage = (image) => {
        setImage(image);
        logger.log("Image uplifted to MainPage: ", image);
    }
    const upliftAudioBlob = (audioBlob) => {
        setAudioBlob(audioBlob);
        logger.log("Audio Blob uplifted to MainPage: ", audioBlob);
    }
    return (
        <div>
            <VoiceRecorder upliftAudioBlob={upliftAudioBlob} displayTimer={true}/> 
            <div className="prompt-generator" style={{ position: "absolute", top: "25%", 
                right: 0, width: "20%"}}>
                <QuestionGenerator/>
                <ImageOperator upliftImage={upliftImage}/>
            </div>
            {/* <ImageOperator upliftImage={upliftImage}/> */}
            {/* <Transcription audioBlob= {audioBlob} image={image}/> */}
            <Analyzer audioBlob={audioBlob} image={image}/>
        </div>
    );
};

export default MainPage;