import React, { useState } from 'react';
import SyncLoader from "react-spinners/SyncLoader";

function QuestionGenerator (){
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const fetchQuestion = async () => {
        setLoading(true);
        try {
            const response = await fetch(BACKEND_URL + "/sample-questions", {method: "GET"});
            if (response.ok) {
                const data = await response.json();
                setQuestion(data.question);
            } else {
                console.error('Failed to fetch question');
            }
        } catch (error) {
            console.error('Error fetching question:', error);
        }
        setLoading(false);
    }

    return (
        <div className='question-generator'>
            <button 
                onClick={fetchQuestion} 
                style={{
                    padding: "8px 16px",
                    fontSize: "14px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    backgroundColor: "#4CAF50",
                    color: "#fff",
                    cursor: "pointer",
                    marginBottom: "10px",
                }}
            >
                Sample Question
            </button>
            {loading ? (
                <div className="loaderContainer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <SyncLoader color={"#007BFF"} loading={loading} size={15} />
                </div>
            ) : (
                question && (
                    <div className="question-box" style={{ textAlign: 'center' }}>
                        <p className="question">{question}</p>
                    </div>
                )
            )}
        </div>
    );
}

export default QuestionGenerator;