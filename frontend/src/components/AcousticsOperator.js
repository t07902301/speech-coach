import React from 'react';
import SpeechGenerator from './MainSpeechGenerator';
import AcousticsVisual from './AcousticsVisual';
const AcousticsOperator = ({transcription, recordedBlob}) => {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            {(recordedBlob && <p style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}>Waveform of the Recording</p>)}
            <AcousticsVisual audioBlob={recordedBlob} waveform_id="recording"/>
            <br />
            <SpeechGenerator transcription={transcription}/>
        </div>
    );
};

export default AcousticsOperator;