import { PuiBox } from 'piche.ui';
import { FC, useCallback, useMemo } from 'react';

interface VoiceVolumeTimelineProps {
  duration: number;
  currentTime: number;
  volumeLevels: number[];
  onBarClick?: (index: number) => void;
}

const WAVE_PEAKS_COUNT = 67;
const MIN_VOLUME_BAR_HEIGHT = 5;
const VOLUME_SCALING_FACTOR = 10;
const ONE_SEC = 1000;

const normalizeVolumeLevels = (levels: number[], count: number): number[] => {
  if (!levels.length) {
    return Array(count).fill(0);
  }

  const minVolume = Math.min(...levels);
  const maxVolume = Math.max(...levels);
  const volumeRange = maxVolume - minVolume;

  const result: number[] = new Array(count);

  const pointsPerInput = count / levels.length;

  for (let i = 0; i < count; i++) {
    const inputIndex = Math.min(Math.floor(i / pointsPerInput), levels.length - 1);
    const nextInputIndex = Math.min(inputIndex + 1, levels.length - 1);

    const progress = i / pointsPerInput - inputIndex;

    const currentValue = levels[inputIndex];
    const nextValue = levels[nextInputIndex];
    const interpolatedValue = currentValue + (nextValue - currentValue) * progress;

    const normalizedValue =
      volumeRange === 0
        ? MIN_VOLUME_BAR_HEIGHT
        : ((interpolatedValue - minVolume) / volumeRange) * VOLUME_SCALING_FACTOR;

    result[i] = Math.round(normalizedValue);
  }

  return result;
};

export const VoiceVolumeTimeline: FC<VoiceVolumeTimelineProps> = ({ duration, volumeLevels, currentTime, onBarClick }) => {
  const normalizedLevels = useMemo(
    () => normalizeVolumeLevels(volumeLevels ?? [], WAVE_PEAKS_COUNT),
    [volumeLevels]
  );

  const getCurrentSegment = useCallback(
    (time: number): number => {
      if (!duration || !isFinite(duration) || isNaN(duration) || duration <= 0) {
        return 0;
      }
      if (!isFinite(time) || isNaN(time) || time < 0) {
        return 0;
      }
      const timeInMS = time * ONE_SEC;
      const segmentDuration = duration / WAVE_PEAKS_COUNT;

      return Math.min(Math.ceil(timeInMS / segmentDuration), WAVE_PEAKS_COUNT);
    },
    [duration]
  );

  const currentSegment = getCurrentSegment(currentTime);

  return (
    <PuiBox
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '15px',
        flexGrow: 1,
        gap: '2px',
      }}
    >
      {normalizedLevels.map((level, index) => {
        const isActive = index < currentSegment;
        return (
          <PuiBox
            key={`volume-${index}-${level}`}
            onClick={(e) => {
              e.stopPropagation();
              onBarClick?.(index);
            }}
            sx={{
              width: '2px',
              cursor: onBarClick ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              '&:last-child': {
                width: '2px',
              },
            }}
          >
            <PuiBox
              sx={{
                width: '2px',
                height: `${MIN_VOLUME_BAR_HEIGHT + level}px`,
                backgroundColor: isActive ? '#3398DB' : '#D1D5DB',
                opacity: isActive ? 1 : 0.5,
                borderRadius: '1px',
                transition: 'background-color 0.2s ease',
                cursor: onBarClick ? 'pointer' : 'default',
                '&:hover': {
                  backgroundColor: '#3398DB',
                },
              }}
            />
          </PuiBox>
        );
      })}
    </PuiBox>
  );
};

