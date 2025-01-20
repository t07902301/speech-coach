import React from 'react';
import SpeechGenerator from './MainSpeechGenerator';
const AcousticsOperator = ({transcription}) => {
    return (
        <div className="acoustics-operator-container" style={{ width: '100%', height: '100%' }}>
            <SpeechGenerator transcription={transcription}/>
        </div>
    );
};

export default AcousticsOperator;