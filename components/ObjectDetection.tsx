import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { drawPredictions } from '../utils/canvasUtils';
import { CameraIcon, StopIcon, ArrowPathIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

export const ObjectDetection: React.FC = () => {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Load Model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);
        await tf.ready();
        const loadedModel = await cocoSsd.load({
            base: 'lite_mobilenet_v2' // Use lite version for better browser performance
        });
        setModel(loadedModel);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load model:", err);
        setError("Failed to load TensorFlow model. Please try refreshing.");
        setIsLoading(false);
      }
    };
    loadModel();
  }, []);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsCameraActive(false);
    
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Detection Loop
  const detectFrame = useCallback(async () => {
    if (!model || !videoRef.current || !canvasRef.current) return;

    if (videoRef.current.readyState === 4) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Match canvas dimensions to video dimensions
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
      }

      const predictions = await model.detect(video);
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawPredictions(predictions, ctx);
      }
    }
    
    if (isCameraActive) {
        animationRef.current = requestAnimationFrame(detectFrame);
    }
  }, [model, isCameraActive]);

  // Start Camera
  const startCamera = async () => {
    setError(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: 'user',
            // Requesting ideal resolution for performance/quality balance
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current!.play();
            setIsCameraActive(true);
          };
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setError("Camera permission denied or camera not available.");
      }
    } else {
        setError("Your browser does not support camera access.");
    }
  };

  // Trigger detection when camera state changes
  useEffect(() => {
    if (isCameraActive && model) {
      detectFrame();
    } else {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    }
    // Cleanup function
    return () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    };
  }, [isCameraActive, model, detectFrame]);


  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6">
      
      {/* Status / Controls */}
      <div className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Object Detection</h2>
          <p className="text-sm text-gray-400 mt-1">
            {isLoading 
              ? "Initializing AI model..." 
              : isCameraActive 
                ? "Analyzing video stream..." 
                : "Ready to start"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="flex items-center gap-2 px-6 py-3 bg-gray-800 rounded-lg text-gray-400 cursor-not-allowed">
               <ArrowPathIcon className="w-5 h-5 animate-spin" />
               <span>Loading Model...</span>
            </div>
          ) : !isCameraActive ? (
            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-emerald-600/20"
            >
              <CameraIcon className="w-5 h-5" />
              Start Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-red-600/20"
            >
              <StopIcon className="w-5 h-5" />
              Stop Camera
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="w-full p-4 bg-red-900/30 border border-red-800 rounded-xl text-red-200 text-center">
          {error}
        </div>
      )}

      {/* Video Container */}
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-800">
        {!isCameraActive && !isLoading && !error && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="text-center text-gray-600">
                <VideoCameraIcon className="w-20 h-20 mx-auto mb-4 opacity-20" />
                <p>Camera feed is inactive</p>
             </div>
           </div>
        )}

        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain"
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
      </div>
      
      {/* Legend */}
      {isCameraActive && (
          <div className="flex gap-6 text-sm">
             <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-[#00FF00]/20 border border-[#00FF00] rounded"></div>
                 <span className="text-gray-300">Person</span>
             </div>
             <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-[#00FFFF]/20 border border-[#00FFFF] rounded"></div>
                 <span className="text-gray-300">Other Objects</span>
             </div>
          </div>
      )}
    </div>
  );
};