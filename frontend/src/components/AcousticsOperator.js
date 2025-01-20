import React from 'react';
const AcousticsOperator = ({ }) => {
    return (
        <div className="acoustics-operator-container" style={{ width: '100%', height: '100%' }}>
            <button onClick={() => window.location.href = '/sample_reading'}>Improve My Vocal Quality</button>
        </div>
    );
};

export default AcousticsOperator;