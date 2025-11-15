import { useCallback, useEffect, useRef, useState } from 'react';

const TIME_SLICE = 100; // milliseconds
const MAX_VOICE_DURATION_MS = 60000; // 60 seconds

export interface VoiceRecording {
  audioBlob: Blob | null;
  duration: number;
  isRecording: boolean;
  volumeLevels: number[];
}

export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [volumeLevels, setVolumeLevels] = useState<number[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);

  const processVolume = useCallback((analyser: AnalyserNode): number => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    // Simple volume calculation - average of frequency data
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    return Math.min(average / 255 * 100, 100); // Normalize to 0-100
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const analyserNode = audioContext.createAnalyser();
      analyserNodeRef.current = analyserNode;
      analyserNode.fftSize = 256;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyserNode);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(TIME_SLICE);

      let milliseconds = 0;
      durationIntervalRef.current = setInterval(() => {
        milliseconds += TIME_SLICE;
        setDuration(milliseconds);

        if (milliseconds >= MAX_VOICE_DURATION_MS) {
          // Stop recording directly without calling stopRecording to avoid dependency issues
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              setAudioBlob(audioBlob);
            };
            mediaRecorderRef.current.stop();
          }
          
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
          }

          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }

          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }

          setIsRecording(false);
          return;
        }

        if (analyserNodeRef.current) {
          const volume = processVolume(analyserNodeRef.current);
          setVolumeLevels((prev) => [...prev, volume]);
        }
      }, TIME_SLICE);

      setIsRecording(true);
      setVolumeLevels([]);
      setDuration(0);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  }, [processVolume]);

  const stopRecording = useCallback((createBlob: boolean = true) => {
    return new Promise<void>((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        if (createBlob) {
          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setAudioBlob(audioBlob);
            resolve();
          };
        } else {
          resolve();
        }

        mediaRecorderRef.current.stop();
        
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }

        setIsRecording(false);
      } else {
        resolve();
      }
    });
  }, [isRecording]);

  const reset = useCallback(() => {
    if (isRecording) {
      stopRecording(false);
    }
    setAudioBlob(null);
    setIsRecording(false);
    setDuration(0);
    setVolumeLevels([]);
  }, [isRecording, stopRecording]);

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isRecording,
    audioBlob,
    duration,
    volumeLevels,
    startRecording,
    stopRecording,
    reset,
  };
};

