import React from 'react';
import SpeechGenerator from './MainSpeechGenerator';
import AcousticsVisual from './AcousticsVisual';
import logger from '../utils/logger';
const AcousticsOperator = ({transcription, recordedBlob}) => {
    const [GeneratedBlob, setGeneratedBlob] = React.useState(null);
    const upliftGeneratedBlob = (GeneratedBlob) => {
        setGeneratedBlob(GeneratedBlob);
        logger.log("Generated Blob uplifted to AcousticsOperator");
    }
    const [distance, setDistance] = React.useState(null);
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    React.useEffect(() => {
        if (recordedBlob && GeneratedBlob) {
            const formData = new FormData();
            formData.append("query_audio", recordedBlob, "recording.wav");
            formData.append("reference_audio", GeneratedBlob, "generated.wav");
            fetch(BACKEND_URL + "/speeches/acoustics_scores", {
                method: "POST",
                body: formData,
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(response.statusText);
                    }
                    return response.json();
                })
                .then((data) => {
                    setDistance(data.score);
                })
                .catch((error) => {
                    alert("Error comparing audio: " + error.message);
                });
        }
    }, [recordedBlob, GeneratedBlob]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            {(recordedBlob && <p style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}>Waveform of the Recording</p>)}
            <AcousticsVisual audioBlob={recordedBlob} waveform_id="recording"/>
            <br />
            <SpeechGenerator transcription={transcription} upliftGeneratedBlob={upliftGeneratedBlob}/>
            {GeneratedBlob && distance === null && (
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '20px', fontWeight: 'bold' }}>Calculating the difference between your recording and sample reading ...</p>
                </div>
            )}
            {distance !== null && (
                <p style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}> Difference: {distance} </p>
            )}
        </div>
    );
};

export default AcousticsOperator;