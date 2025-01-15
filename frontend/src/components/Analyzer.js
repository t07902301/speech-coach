import Transcription from "./Transcription";
import AcousticsOperator from "./AcousticsOperator";
import React from "react";
import "../styles/Analyzer.css";
const Analyzer = ({ audioBlob, image }) => {
    return (
        <div className="analyzer-container" >
            <div className="transcription-container" style={{ position: "absolute", left: 0}}>
                <Transcription audioBlob={audioBlob} image={image} />
            </div>
            <div className="acoustics-operator-container" style={{ position: "absolute", right: 0}}>
                <AcousticsOperator audioData={audioBlob} />
            </div>
        </div>
    );
};

export default Analyzer;