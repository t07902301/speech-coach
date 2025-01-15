import React, { useState } from 'react';

const AcousticsEvaluator = ({audioData}) => {
    const [score, setScore] = useState(null);
    const BACKEND_URL = "http://localhost:5000"; // Replace with your backend URL

    const handleButtonClick = async () => {

        const formData = new FormData();
        formData.append('audio', audioData, 'user_speech.wav');

        try {
            const response = await fetch(BACKEND_URL + "/speeches/acoustics_scores", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                setScore(result.score); // Assuming the backend returns a JSON object with a 'score' field
            } else {
                console.error('Error:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button 
                style={{ 
                    backgroundColor: '#4CAF50', 
                    color: 'white', 
                    padding: '15px 32px', 
                    textAlign: 'center', 
                    textDecoration: 'none', 
                    display: 'inline-block', 
                    fontSize: '16px', 
                    margin: '4px 2px', 
                    cursor: 'pointer', 
                    border: 'none', 
                    borderRadius: '4px' 
                }} 
                disabled={!audioData} 
                onClick={handleButtonClick}
            >
                Evaluate the Naturalness of Your Speech
            </button>
            {score !== null && <p>Score: {score}</p>}
        </div>
    );
};

export default AcousticsEvaluator;