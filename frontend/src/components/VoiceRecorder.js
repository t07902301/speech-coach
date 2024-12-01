import React, { useState, useRef, useEffect } from "react";

// Transcription Component
function Transcription({ audioBlob }) {
    const [transcription, setTranscription] = useState("");

    const transcribeAudio = async () => {
        if (!audioBlob) {
            alert("No audio available for transcription.");
            return;
        }

        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");

        try {
            const response = await fetch("/fake_transcribe", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Transcription failed");
            }

            const data = await response.json();
            setTranscription(data.transcription);
        } catch (error) {
            console.error("Error transcribing audio:", error);
            alert("Error transcribing audio.");
        }
    };

    return (
        <div style={{ marginTop: "20px" }}>
            <button onClick={transcribeAudio} disabled={!audioBlob}>
                Transcribe Recording
            </button>
            {transcription && (
                <div style={{ marginTop: "10px" }}>
                    <h3>Transcription</h3>
                    <p>{transcription}</p>
                </div>
            )}
        </div>
    );
}
// TimerInput Component
function TimerInput({ timerDuration, setTimerDuration, isRecording }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <label>
        Set Timer (optional, in seconds):{" "}
        <input
          type="number"
          value={timerDuration}
          onChange={(e) => setTimerDuration(Number(e.target.value))}
          disabled={isRecording}
        />
      </label>
    </div>
  );
}

// RecorderControls Component
function RecorderControls({ isRecording, isPaused, onStart, onStop, onTogglePauseResume }) {
  return (
    <div>
      <button onClick={onStart} disabled={isRecording}>
        Start
      </button>
      <button onClick={onStop} disabled={!isRecording}>
        Stop
      </button>
      <button onClick={onTogglePauseResume} disabled={!isRecording}>
        {isPaused ? "Resume" : "Pause"}
      </button>
    </div>
  );
}

// CanvasVisualizer Component
function CanvasVisualizer({ analyser, canvasRef }) {

  useEffect(() => {
    let animationId;
    if (analyser && canvasRef.current) {
      console.log('ready to draw')
      const canvas = canvasRef.current;
      const canvasContext = canvas.getContext("2d");
      // const analyser = analyserRef.current;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const draw = () => {
        analyser.getByteTimeDomainData(dataArray);

        canvasContext.fillStyle = "rgb(200, 200, 200)";
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);

        canvasContext.lineWidth = 2;
        canvasContext.strokeStyle = "rgb(0, 0, 0)";
        canvasContext.beginPath();

        const sliceWidth = (canvas.width * 1.0) / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) {
            canvasContext.moveTo(x, y);
          } else {
            canvasContext.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasContext.lineTo(canvas.width, canvas.height / 2);
        canvasContext.stroke();

        animationId = requestAnimationFrame(draw);
      };

      draw();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      width="600"
      height="200"
      style={{
        display: "block",
        margin: "20px auto",
        border: "1px solid #ccc",
      }}
    ></canvas>
  );
}

// AudioPlayer Component
function AudioPlayer({ audioUrl }) {
  return (
    audioUrl && (
      <div style={{ marginTop: "20px" }}>
        <h3>Recorded Audio</h3>
        <audio controls src={audioUrl}></audio>
      </div>
    )
  );
}

// Main VoiceRecorder Component
export default function VoiceRecorder() {
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
        audioChunksRef.current = [];
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

  const togglePauseResume = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
      } else {
        mediaRecorderRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Voice Recorder with Timer</h2>
      <TimerInput timerDuration={timerDuration} setTimerDuration={setTimerDuration} isRecording={isRecording} />
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
      {/*ref.current is mutable. If the ref object isn't attached to a DOM node, read and write this value outside rendering. */}
      <CanvasVisualizer analyser={analyserRef.current} canvasRef={canvasRef} /> 
      <AudioPlayer audioUrl={audioUrl} />
      {/* <Transcription audioBlob={audioChunksRef.current.length > 0 ? new Blob(audioChunksRef.current, { type: "audio/webm" }) : null} /> */}
    </div>
  );
}
