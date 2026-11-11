// FaceCamera.tsx
import { useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { useFaceModels } from '../models/useFaceModels';
import type { Descriptor } from '../type';

interface FaceCameraProps {
  onDescriptor: (descriptor: Descriptor) => void;
}

export default function FaceCamera({ onDescriptor }: FaceCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const latest = useRef<Float32Array | null>(null);
  const modelsLoaded = useFaceModels();

  // webcam
  useEffect(() => {
    let stream: MediaStream | undefined;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop()); // unmounted before it resolved
          return;
        }
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch((err) => console.error('Camera access failed', err));

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // detection loop
  useEffect(() => {
    if (!modelsLoaded) return;
    let busy = false;

    const id = window.setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (busy || !video || !canvas || video.readyState < 2) return;
      busy = true;

      try {
        const result = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        const dims = { width: video.videoWidth, height: video.videoHeight };
        faceapi.matchDimensions(canvas, dims);
        canvas.getContext('2d')?.clearRect(0, 0, dims.width, dims.height);

        if (result) {
          faceapi.draw.drawDetections(canvas, faceapi.resizeResults(result, dims));
          latest.current = result.descriptor;
        } else {
          latest.current = null;
        }
      } finally {
        busy = false;
      }
    }, 200);

    return () => window.clearInterval(id);
  }, [modelsLoaded]);

  const handleCapture = () => {
    if (latest.current) onDescriptor(Array.from(latest.current));
  };

  return (
    <div style={{ position: 'relative', width: 640 }}>
      <video ref={videoRef} autoPlay muted playsInline width={640} />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <button onClick={handleCapture} disabled={!modelsLoaded}>
        Capture
      </button>
    </div>
  );
}