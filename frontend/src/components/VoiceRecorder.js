import React, { useState, useRef } from "react";
import CanvasVisualizer from "./CanvasVisualizer";
import TimerInput from "./TimerInput";
import RecorderControls from "./RecorderControls";
import AudioPlayer from "./AudioPlayer";

// Main VoiceRecorder Component
export default function VoiceRecorder({ setAudioBlob = () => {}, displayTimer = false }) {
  // if setAudioBlob is not passed, it will be undefined
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null); // For the optional timer
  const [timerDuration, setTimerDuration] = useState(""); // User-input duration
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null); // Ref for the countdown timer

  const startRecording = async () => {
    console.log("startRecording");

    audioChunksRef.current = []; // Reset audio chunks

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support audio recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(audioBlob));
        setAudioBlob(audioBlob);
      };
    
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      analyser.fftSize = 2048;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);

      if (timerDuration) {
        setRemainingTime(timerDuration);
        timerRef.current = setInterval(() => {
          setRemainingTime((prevTime) => {
            if (prevTime === 1) {
              clearInterval(timerRef.current);
              stopRecording();
              return null;
            }
            return prevTime - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
    setIsPaused(false);

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
    }

    clearInterval(timerRef.current);
    setRemainingTime(null);
  };

  const togglePauseResume = async () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        if (audioContextRef.current && analyserRef.current === null) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const source = audioContextRef.current.createMediaStreamSource(stream);
          const analyser = audioContextRef.current.createAnalyser();
          source.connect(analyser);
          analyser.fftSize = 2048;
          analyserRef.current = analyser;
        }
        // Resume the timer
        if (remainingTime !== null) {
          timerRef.current = setInterval(() => {
            setRemainingTime((prevTime) => {
              if (prevTime === 1) {
                clearInterval(timerRef.current);
                stopRecording();
                return null;
              }
              return prevTime - 1;
            });
          }, 1000);
        }
      } else {
        mediaRecorderRef.current.pause();
        analyserRef.current = null;
        // Pause the timer
        clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      {/* <h2>Let's Practice</h2> */}
      {displayTimer && <TimerInput timerDuration={timerDuration} setTimerDuration={setTimerDuration} isRecording={isRecording} />}
      
      <RecorderControls
        isRecording={isRecording}
        isPaused={isPaused}
        onStart={startRecording}
        onStop={stopRecording}
        onTogglePauseResume={togglePauseResume}
      />
      {remainingTime !== null && (
        <div style={{ marginTop: "10px", fontSize: "18px" }}>
          Time Remaining: {remainingTime}s
        </div>
      )}
      <CanvasVisualizer analyser={analyserRef.current} canvasRef={canvasRef} /> 
      <AudioPlayer audioUrl={audioUrl} audioCategory="Recorded Audio"/>
      {/* <Transcription audioBlob={audioChunksRef.current.length > 0 ? new Blob(audioChunksRef.current, { type: "audio/wav" }) : null} /> */}
    </div>
  );
}
