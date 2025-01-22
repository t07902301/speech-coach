import Wavesurfer from "wavesurfer.js";
import { useEffect, useRef } from "react";
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js'
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js'

const AcousticsVisual = ( { audioBlob, waveform_id } ) => {
    const waveform = useRef(null);
    const contaienr_id = "waveform-" + waveform_id;
    // const handleFileUpload = (event) => {
    //     const file = event.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onload = (e) => {
    //             const audioData = e.target.result;
    //             const local_audioBlob = new Blob([audioData], { type: 'audio/wav' });
    //             console.log("Local Audio Blob: ", local_audioBlob);
    //             waveform.current.loadBlob(local_audioBlob);
    //         };
    //         reader.readAsArrayBuffer(file);
    //     }
    // };

    useEffect(() => {
      // Check if wavesurfer object is already created.
      if (!waveform.current) {
        // Create a wavesurfer object
        // More info about options here https://wavesurfer-js.org/docs/options.html
        waveform.current = Wavesurfer.create({
          container: "#" + contaienr_id,
          waveColor: "#567FFF",
          barGap: 2,
          barWidth: 3,
          barRadius: 3,
          cursorWidth: 3,
          cursorColor: "#567FFF",
          minPxPerSec: 100,
          progressColor: 'rgb(100, 0, 100)',
          plugins: [
            TimelinePlugin.create({
                height: 10,
                timeInterval: 0.1,
                primaryLabelInterval: 1,
                style: {
                  fontSize: '10px',
                  color: '#6A3274',
                },
              }),
            Hover.create({
              lineColor: '#ff0000',
              lineWidth: 2,
              labelBackground: '#555',
              labelColor: '#fff',
              labelSize: '11px',
            }),
          ],          
        });
      }
    }, []);

    const playAudio = () => {
        // Check if the audio is already playing
        if (waveform.current.isPlaying()) {
            waveform.current.pause();
        } else {
            waveform.current.play();
        }
        };

    useEffect(() => {
        if (audioBlob) {
            waveform.current.loadBlob(audioBlob);
        }
    }, [audioBlob]);
    return (
        <div className="visual-acoustics" style={{display: audioBlob? "block": "none"}}>
            <div id={contaienr_id}></div>
            <button onClick={playAudio} style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#567FFF', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Play/Pause</button>
        </div>
    );
}
export default AcousticsVisual
