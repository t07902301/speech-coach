import AcousticsEvaluator from "./AcousticsEvaluator";
import React from 'react';
const AcousticsOperator = ({ audioData }) => {
    return (
        <div className="acoustics-operator-container">
            <AcousticsEvaluator audioData={audioData}/>
        </div>
    );
};

export default AcousticsOperator;