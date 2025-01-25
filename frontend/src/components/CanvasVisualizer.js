import React, { useEffect } from "react";
import logger from "../utils/logger";
// CanvasVisualizer Component
function CanvasVisualizer({ analyser, canvasRef }) {

    useEffect(() => {
      let animationId;
      if (analyser && canvasRef.current) {
        logger.log("ready to draw");
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
    }, [analyser, canvasRef]);
  
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
  
export default CanvasVisualizer;