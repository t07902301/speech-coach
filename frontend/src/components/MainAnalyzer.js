import Transcription from "./Transcription";
import AcousticsOperator from "./AcousticsOperator";
import React from "react";
import "../styles/MainAnalyzer.css";
const Analyzer = ({ audioBlob, image }) => {
    const [transcription, setTranscription] = React.useState("");
    const upliftTranscription = (transcription) => {
        setTranscription(transcription);
        console.log("Transcription uplifted to Analyzer: ", transcription);
    }
    return (
        <div className="analyzer-container" >
            <div className="transcription-container" style={{ position: "absolute", left: 0}}>
                <Transcription audioBlob={audioBlob} image={image} upliftTranscription={upliftTranscription} />
            </div>
            <div className="acoustics-operator-container" style={{ position: "absolute", right: 0}}>
                <AcousticsOperator transcription={transcription}/>
            </div>
        </div>
    );
};

export default Analyzer;