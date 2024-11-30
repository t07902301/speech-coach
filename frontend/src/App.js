import React, { useState, useRef, useEffect } from 'react';

const VoiceAssistant = () => {
    const [timeLeft, setTimeLeft] = useState(10);
    const [isRecording, setIsRecording] = useState(false);
    const [interactions, setInteractions] = useState([]);
    const timerInputRef = useRef(null);
    const timerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        if (timeLeft === 0 && isRecording) {
            stopRecording();
        }
    }, [timeLeft, isRecording]);

    const startRecording = async () => {
        setTimeLeft(timerInputRef.current.value);
        audioChunksRef.current = [];

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.start();
        setIsRecording(true);

        mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
            audioChunksRef.current.push(event.data);
        });

        timerRef.current = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);
    };

    const stopRecording = () => {
        clearInterval(timerRef.current);
        setTimeLeft(10);
        setIsRecording(false);

        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.addEventListener('stop', async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
            const formData = new FormData();
            formData.append('audio', audioBlob);

            const response = await fetch('/process-audio', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();

            const audioUrl = URL.createObjectURL(audioBlob);
            setInteractions((prevInteractions) => [
                ...prevInteractions,
                { transcript: result.transcript, responseText: result.responseText, audioUrl },
            ]);
        });
    };

    return (
        <div>
            <h1>Voice Assistant</h1>

            <div>
                <label htmlFor="timerInput">Set Timer (seconds): </label>
                <input type="number" id="timerInput" ref={timerInputRef} defaultValue="10" min="1" />
            </div>

            <div>
                <span>Remaining Time: </span>
                <span id="timer">{timeLeft}</span>
            </div>

            <div>
                <button onClick={startRecording} disabled={isRecording}>Start Recording</button>
                <button onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>
            </div>

            <div id="interactions">
                {interactions.map((interaction, index) => (
                    <div key={index} className="interaction">
                        <p><strong>You:</strong> {interaction.transcript}</p>
                        <p><strong>Assistant:</strong> {interaction.responseText}</p>
                        <audio controls src={interaction.audioUrl}></audio>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VoiceAssistant;
