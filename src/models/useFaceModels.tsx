import { useEffect, useState } from "react";
import * as faceapi from 'face-api.js';

export function useFaceModels(): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let canceled = false;
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    ]).then(() => {
      if (!canceled) setLoaded(true);
    }).catch((err) => console.error(err));

    return () => {
      canceled = true;
    };
  }, []);

  return loaded;
}