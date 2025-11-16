import { useEffect, useRef, FC } from 'react';
import { PuiBox } from 'piche.ui';

interface VideoPlayerProps {
  stream: MediaStream | null;
  isLocal?: boolean;
  muted?: boolean;
}

export const VideoPlayer: FC<VideoPlayerProps> = ({ stream, isLocal = false, muted = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !stream) {
      return;
    }

    // Check if stream has tracks
    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();
    
    if (videoTracks.length === 0 && audioTracks.length === 0) {
      console.log('VideoPlayer: Stream has no tracks');
      return;
    }

    console.log(`VideoPlayer: Setting stream with ${videoTracks.length} video tracks and ${audioTracks.length} audio tracks`);

    videoElement.setAttribute('playsinline', 'true');
    videoElement.playsInline = true;
    videoElement.srcObject = stream;
    videoElement.muted = muted || isLocal;

    const onLoaded = () => {
      console.log('VideoPlayer: Metadata loaded, attempting to play');
      videoElement.play().catch((error) => {
        console.error('VideoPlayer: Error playing video:', error);
      });
    };

    const onCanPlay = () => {
      console.log('VideoPlayer: Can play, attempting to play');
      videoElement.play().catch((error) => {
        console.error('VideoPlayer: Error playing video:', error);
      });
    };

    videoElement.addEventListener('loadedmetadata', onLoaded);
    videoElement.addEventListener('canplay', onCanPlay);

    // Try to play immediately if ready
    if (videoElement.readyState >= 2) {
      videoElement.play().catch((error) => {
        console.error('VideoPlayer: Error playing video (readyState >= 2):', error);
      });
    }

    // Monitor track changes
    const handleTrackEnded = () => {
      console.log('VideoPlayer: Track ended');
    };

    videoTracks.forEach(track => {
      track.addEventListener('ended', handleTrackEnded);
    });

    return () => {
      videoElement.removeEventListener('loadedmetadata', onLoaded);
      videoElement.removeEventListener('canplay', onCanPlay);
      videoTracks.forEach(track => {
        track.removeEventListener('ended', handleTrackEnded);
      });
      videoElement.srcObject = null;
    };
  }, [stream, muted, isLocal]);

  useEffect(() => {
    const videoRefSelf = videoRef.current;
    return () => {
      if (videoRefSelf) {
        videoRefSelf.srcObject = null;
      }
    };
  }, []);

  if (!stream) {
    return null;
  }

  return (
    <PuiBox
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '8px',
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted || isLocal}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: isLocal ? 'scaleX(-1)' : 'none',
        }}
      />
    </PuiBox>
  );
};
