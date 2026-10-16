import type { LessonDefinition } from '@awotech/content-types';

export type WatchedRange = [number, number];
export type LessonEvidence = {
  user_id: string;
  course_id: string;
  lesson_id: string;
  video_id: string;
  duration_seconds: number;
  watched_ranges: WatchedRange[];
  activities: string[];
  updated_at: string;
};
export function mergeWatchedRanges(
  ranges: WatchedRange[],
  duration: number,
): WatchedRange[] {
  const sorted = ranges
    .filter(
      ([a, b]) =>
        Number.isFinite(a) &&
        Number.isFinite(b) &&
        a >= 0 &&
        b > a &&
        b <= duration,
    )
    .sort((a, b) => a[0] - b[0]);
  const merged: WatchedRange[] = [];
  for (const [a, b] of sorted) {
    const last = merged.at(-1);
    if (last && a <= last[1] + 0.05) last[1] = Math.max(last[1], b);
    else merged.push([a, b]);
  }
  return merged;
}
export function videoCoverage(
  evidence:
    Pick<LessonEvidence, 'duration_seconds' | 'watched_ranges'> | undefined,
) {
  const duration = evidence?.duration_seconds ?? 0;
  const seconds =
    duration > 0
      ? mergeWatchedRanges(evidence!.watched_ranges, duration).reduce(
          (sum, [a, b]) => sum + b - a,
          0,
        )
      : 0;
  return {
    seconds,
    percent:
      duration > 0 ? Math.min(100, Math.floor((seconds / duration) * 100)) : 0,
    complete:
      duration > 0 && seconds >= duration - Math.min(2, duration * 0.02),
  };
}
export function getCompletionChecklist(
  lesson: LessonDefinition,
  evidence: LessonEvidence | undefined,
) {
  if (
    evidence?.course_id !== lesson.courseId ||
    evidence.lesson_id !== lesson.id
  )
    evidence = undefined;
  const video =
    evidence?.video_id === lesson.video?.videoId
      ? videoCoverage(evidence)
      : { seconds: 0, percent: 0, complete: false };
  const activities =
    lesson.completion?.activities ??
    (lesson.hasLab
      ? [
          {
            id: 'practice-pending',
            title: 'Atividade prática em preparação',
            available: false,
          },
        ]
      : []);
  return {
    video,
    activities: activities.map((a) => ({
      ...a,
      complete: a.available && (evidence?.activities.includes(a.id) ?? false),
    })),
    ready:
      !!lesson.video &&
      video.complete &&
      activities.every(
        (a) => a.available && evidence?.activities.includes(a.id),
      ),
  };
}

/** Uma amostra descontínua indica seek; só intervalos contínuos em reprodução contam. */
export class PlaybackCoverage {
  private previous:
    { time: number; wall: number; playing: boolean; rate: number } | undefined;
  ranges: WatchedRange[] = [];
  sample(
    time: number,
    duration: number,
    wall: number,
    playing: boolean,
    rate: number,
    visible: boolean,
  ) {
    const last = this.previous;
    if (last && last.playing && visible && Number.isFinite(rate) && rate > 0) {
      const real = (wall - last.wall) / 1000,
        delta = time - last.time;
      if (
        real > 0 &&
        real <= 2 &&
        delta > 0 &&
        delta <= real * Math.max(last.rate, rate) + 0.35
      )
        this.ranges = mergeWatchedRanges(
          [...this.ranges, [last.time, time]],
          duration,
        );
    }
    this.previous = { time, wall, playing: playing && visible, rate };
    return this.ranges;
  }
  resetSample() {
    this.previous = undefined;
  }
}
