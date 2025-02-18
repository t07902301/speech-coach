import Transcription from "./Transcription";
import AcousticsOperator from "./AcousticsOperator";
import React from "react";
import "../styles/MainAnalyzer.css";
import logger from "../utils/logger";
const Analyzer = ({ audioBlob, image }) => {
    const [transcription, setTranscription] = React.useState("");
    const upliftTranscription = (transcription) => {
        setTranscription(transcription);
        logger.log("Transcription uplifted to Analyzer: ", transcription);
    }
    return (
        <div className="analyzer-container" >
            <div className="transcription-container" style={{ position: "absolute", left: 0}}>
                <Transcription audioBlob={audioBlob} image={image} upliftTranscription={upliftTranscription} />
            </div>
            <div className="acoustics-operator-container" style={{ position: "absolute", right: 0}}>
                <AcousticsOperator transcription={transcription} recordedBlob={audioBlob}/>
            </div>
        </div>
    );
};

export default Analyzer;