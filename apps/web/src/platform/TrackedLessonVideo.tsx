import { useEffect, useRef, useState } from 'react';
import { PlaybackCoverage, videoCoverage } from '@awotech/course-engine';
import type { LessonDefinition } from '@awotech/content-types';
import { useStudent } from './StudentProvider';

interface Player {
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  getPlaybackRate(): number;
  destroy(): void;
}
interface YouTubeAPI {
  Player: new (
    element: HTMLIFrameElement,
    options: {
      events: {
        onReady: () => void;
        onStateChange: () => void;
        onError: () => void;
      };
    },
  ) => Player;
}
declare global {
  interface Window {
    YT?: YouTubeAPI;
    onYouTubeIframeAPIReady?: () => void;
  }
}
let apiPromise: Promise<YouTubeAPI> | undefined;
function loadAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YouTubeAPI>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    const timer = window.setTimeout(() => {
      apiPromise = undefined;
      reject(new Error('player_timeout'));
    }, 15000);
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      clearTimeout(timer);
      if (window.YT) resolve(window.YT);
    };
    const old = document.getElementById('awotech-youtube-api');
    old?.remove();
    const script = document.createElement('script');
    script.id = 'awotech-youtube-api';
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      clearTimeout(timer);
      apiPromise = undefined;
      reject(new Error('player_load'));
    };
    document.head.append(script);
  });
  return apiPromise;
}

export function TrackedLessonVideo({ lesson }: { lesson: LessonDefinition }) {
  const { recordEvidence, evidence } = useStudent();
  const initial = evidence.find(
    (e) =>
      e.course_id === lesson.courseId &&
      e.lesson_id === lesson.id &&
      e.video_id === lesson.video?.videoId,
  );
  const [tracker] = useState(() => {
    const value = new PlaybackCoverage();
    value.ranges = initial?.watched_ranges.map((r) => [...r]) ?? [];
    return value;
  });
  const holder = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [percent, setPercent] = useState(() => videoCoverage(initial).percent);
  const [retry, setRetry] = useState(0);
  const video = lesson.video!;
  useEffect(() => {
    let active = true,
      player: Player | undefined,
      timer: number | undefined,
      lastSave = 0,
      saving = false,
      dirty = false,
      failed = false,
      completedSaved = false;
    const coverage = tracker;
    dirty = coverage.ranges.length > 0;
    coverage.resetSample();
    let duration = 0;
    const save = (force = false) => {
      if (!dirty || (!force && (saving || failed)) || duration <= 0) return;
      saving = true;
      dirty = false;
      const ranges = coverage.ranges.map((r) => [...r] as [number, number]);
      void recordEvidence(lesson.courseId, lesson.id, {
        video: { id: video.videoId, duration, ranges },
      })
        .then(() => {
          lastSave = performance.now();
          completedSaved = videoCoverage({
            duration_seconds: duration,
            watched_ranges: ranges,
          }).complete;
          if (active) setError('');
        })
        .catch(() => {
          dirty = true;
          failed = true;
          if (active)
            setError(
              'Não foi possível salvar o vídeo assistido. Use Tentar novamente para reenviar.',
            );
        })
        .finally(() => {
          saving = false;
        });
    };
    function sample() {
      if (!player || !active) return;
      duration = player.getDuration();
      const state = player.getPlayerState();
      if (duration <= 0 || !Number.isFinite(duration)) return;
      const before = JSON.stringify(coverage.ranges);
      coverage.sample(
        player.getCurrentTime(),
        duration,
        performance.now(),
        state === 1,
        player.getPlaybackRate(),
        document.visibilityState === 'visible',
      );
      if (JSON.stringify(coverage.ranges) !== before) dirty = true;
      const result = videoCoverage({
        duration_seconds: duration,
        watched_ranges: coverage.ranges,
      });
      setPercent(result.percent);
      if (
        dirty &&
        (performance.now() - lastSave > 10000 ||
          (result.complete && !completedSaved) ||
          state !== 1)
      )
        save();
    }
    function hidden() {
      sample();
      coverage.resetSample();
      save();
    }
    document.addEventListener('visibilitychange', hidden);
    void loadAPI()
      .then((api) => {
        if (!active || !holder.current) return;
        const frame = document.createElement('iframe');
        frame.className = 'aspect-video w-full rounded-2xl border-0';
        frame.src = `https://www.youtube-nocookie.com/embed/${video.videoId}?enablejsapi=1&origin=${encodeURIComponent(location.origin)}&playsinline=1`;
        frame.title = `Videoaula: ${lesson.title}`;
        frame.allow =
          'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
        frame.allowFullscreen = true;
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        holder.current.replaceChildren(frame);
        player = new api.Player(frame, {
          events: {
            onReady: () => {
              if (active) {
                setError('');
                timer = window.setInterval(sample, 500);
              }
            },
            onStateChange: sample,
            onError: () => {
              if (active)
                setError(
                  'Não foi possível reproduzir esta videoaula. Tente novamente.',
                );
            },
          },
        });
      })
      .catch(() => {
        if (active)
          setError(
            'Não foi possível carregar o player do YouTube. Verifique bloqueadores e a conexão, depois tente novamente.',
          );
      });
    return () => {
      sample();
      save(true);
      active = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', hidden);
      player?.destroy();
    };
  }, [
    tracker,
    lesson.courseId,
    lesson.id,
    lesson.title,
    video.videoId,
    recordEvidence,
    retry,
  ]);
  return (
    <figure className="lesson-video">
      <div className="tracked-video-container" ref={holder} />
      <figcaption>
        {video.isPlaceholder && (
          <p>
            <strong>Vídeo temporário.</strong> Este vídeo será substituído pela
            videoaula definitiva.
          </p>
        )}
        <p>
          Assista ao vídeo aqui para registrar sua conclusão. Trechos pulados
          não contam. Reprodução registrada: {percent}%.
        </p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {error && (
          <button
            type="button"
            onClick={() => {
              setError('');
              setRetry((r) => r + 1);
            }}
          >
            Tentar novamente
          </button>
        )}
      </figcaption>
    </figure>
  );
}
