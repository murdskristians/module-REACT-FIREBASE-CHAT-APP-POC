import { useState, useEffect, useCallback } from 'react';
import type { FC } from 'react';
import './Onboarding.css';

const testimonials = [
  {
    title: 'Amazing Platform!',
    content:
      "By centralizing data and offering real-time insights with the power of AI, we're on a mission to ensure that businesses not only keep up with change but thrive in it.",
    fullname: 'Katie Waters',
    position: 'Head Resource Management Fintech Company',
  },
  {
    title: 'Incredible Service!',
    content:
      "Their commitment to excellence and innovation is truly commendable. We've seen a significant improvement in our workflow and efficiency since we started using their platform.",
    fullname: 'John Anderson',
    position: 'CEO Tech Solutions Inc.',
  },
  {
    title: 'Revolutionizing!',
    content:
      "The platform has revolutionized the way we approach challenges. It's user-friendly, robust, and the AI-driven insights have been a game-changer for our strategic planning.",
    fullname: 'Emily Rodriguez',
    position: 'Director of Operations',
  },
  {
    title: 'Exceptional!',
    content:
      "Their support team is top-notch! Quick response times and effective solutions. It's reassuring to know that they are dedicated to helping their clients succeed.",
    fullname: 'Michael Carter',
    position: 'Customer Relations Manager',
  },
];

const Onboarding: FC = () => {
  const [progress, setProgress] = useState<number[]>([0, 0, 0, 0]);
  const [activeProgress, setActiveProgress] = useState(0);
  const [className, setClassName] = useState('');

  const updateProgress = useCallback((currentProgress: number[], currentActiveProgress: number) => {
    return currentProgress.map((value, index) => {
      if (index === currentActiveProgress) {
        return value < 100 ? value + 1 : value;
      }
      return value;
    });
  }, []);

  const startProgressInterval = useCallback(() => {
    return setInterval(() => {
      setProgress((prevProgress) => updateProgress(prevProgress, activeProgress));
    }, 50);
  }, [activeProgress, updateProgress]);

  const updateClassName = useCallback((currentProgress: number[], currentActiveProgress: number) => {
    const currentValue = currentProgress[currentActiveProgress];

    if (currentValue > 10) {
      setClassName('');
    }
    if (currentValue > 90) {
      setClassName('fadeInOut');
    }
    if (currentValue === 100) {
      setActiveProgress((prevActive) => (prevActive < 3 ? prevActive + 1 : 0));
    }
  }, []);

  const resetProgress = useCallback(() => {
    setProgress([0, 0, 0, 0]);
    setActiveProgress(0);
  }, []);

  useEffect(() => {
    const intervalId = startProgressInterval();
    return () => clearInterval(intervalId);
  }, [startProgressInterval]);

  useEffect(() => {
    updateClassName(progress, activeProgress);
  }, [progress, activeProgress, updateClassName]);

  useEffect(() => {
    if (progress.every((value) => value === 100)) {
      resetProgress();
    }
  }, [progress, resetProgress]);

  const { title, content, fullname, position } = testimonials[activeProgress];

  return (
    <div className="onboarding">
      <div className={`testimonial-content ${className}`}>
        <h1 className="testimonial-title">{title}</h1>
        <p className="testimonial-text">{content}</p>
      </div>

      <div className="testimonial-footer">
        <div className="progress-bars">
          {progress.map((value, index) => (
            <div key={index} className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${value}%` }}
              />
            </div>
          ))}
        </div>

        <div className={`testimonial-author ${className}`}>
          <div className="author-avatar">
            {fullname.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="author-info">
            <div className="author-name">{fullname}</div>
            <div className="author-position">{position}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
