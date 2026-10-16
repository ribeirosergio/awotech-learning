import { readFileSync, readdirSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import {
  PlaybackCoverage,
  mergeWatchedRanges,
  videoCoverage,
  getCompletionChecklist,
  type LessonEvidence,
} from '../packages/course-engine/src/completion';
import { lessonSchema } from '../packages/content-types/src';
const lesson = (n: string) =>
  lessonSchema.parse(
    JSON.parse(readFileSync(`content/robotica/${n}/lesson.json`, 'utf8')),
  );
const base: LessonEvidence = {
  user_id: 'a',
  course_id: 'robotica-basico',
  lesson_id: 'robotica-03-circuitos',
  video_id: 'hcuA5wkgUNA',
  duration_seconds: 100,
  watched_ranges: [[0, 100]],
  activities: [],
  updated_at: '',
};
describe('reprodução e requisitos', () => {
  it('une trechos e não soma repetição duas vezes', () => {
    expect(
      mergeWatchedRanges(
        [
          [0, 20],
          [10, 30],
          [90, 100],
        ],
        100,
      ),
    ).toEqual([
      [0, 30],
      [90, 100],
    ]);
    expect(
      videoCoverage({
        ...base,
        watched_ranges: [
          [0, 20],
          [10, 30],
          [90, 100],
        ],
      }).complete,
    ).toBe(false);
  });
  it('não aceita um seek para o fim como reprodução', () => {
    const t = new PlaybackCoverage();
    t.sample(0, 100, 0, true, 1, true);
    t.sample(1, 100, 1000, true, 1, true);
    t.sample(99, 100, 1500, true, 1, true);
    t.sample(100, 100, 2500, false, 1, true);
    expect(t.ranges).toEqual([
      [0, 1],
      [99, 100],
    ]);
    expect(videoCoverage({ ...base, watched_ranges: t.ranges }).complete).toBe(
      false,
    );
  });
  it('não conta pausas, aba oculta ou intervalos longos sem amostras', () => {
    const t = new PlaybackCoverage();
    t.sample(0, 100, 0, true, 1, false);
    t.sample(10, 100, 10000, true, 1, false);
    t.sample(11, 100, 11000, false, 1, false);
    expect(t.ranges).toEqual([]);
  });
  it('acompanha a velocidade e aceita tolerância máxima de 2 segundos', () => {
    const t = new PlaybackCoverage();
    t.sample(0, 100, 0, true, 2, true);
    t.sample(2, 100, 1000, true, 2, true);
    expect(t.ranges).toEqual([[0, 2]]);
    expect(videoCoverage({ ...base, watched_ranges: [[0, 98]] }).complete).toBe(
      true,
    );
    expect(
      videoCoverage({
        ...base,
        duration_seconds: 1000,
        watched_ranges: [[0, 980]],
      }).complete,
    ).toBe(false);
  });
  it('exige as duas montagens na aula 3, vídeo da aula atual e persistência', () => {
    const l = lesson('aula-03-circuitos');
    expect(getCompletionChecklist(l, undefined).ready).toBe(false);
    expect(
      getCompletionChecklist(l, { ...base, activities: ['battery-led'] }).ready,
    ).toBe(false);
    expect(
      getCompletionChecklist(l, {
        ...base,
        activities: ['battery-led', 'button-led'],
      }).ready,
    ).toBe(true);
    expect(
      getCompletionChecklist(l, {
        ...base,
        video_id: 'outro',
        activities: ['battery-led', 'button-led'],
      }).ready,
    ).toBe(false);
  });
  it('bloqueia atividades ainda indisponíveis e aceita teoria apenas com vídeo', () => {
    expect(
      getCompletionChecklist(lesson('aula-01-introducao'), {
        ...base,
        lesson_id: 'robotica-01-introducao',
      }).ready,
    ).toBe(true);
    expect(
      getCompletionChecklist(lesson('aula-01-introducao'), base).ready,
    ).toBe(false);
    expect(
      getCompletionChecklist(lesson('aula-04-controlando-circuitos'), {
        ...base,
        activities: ['blink-led', 'traffic-light'],
      }).ready,
    ).toBe(false);
    expect(
      getCompletionChecklist(lesson('aula-05-ultrassonico'), base).ready,
    ).toBe(false);
  });
  it('mantém requisitos SQL alinhados a vídeos e atividades estáticos', () => {
    const sql = readFileSync(
      'supabase/migrations/202610150002_completion_requirements.sql',
      'utf8',
    );
    const config = JSON.parse(sql.split('$requirements$')[1] ?? 'null');
    const expected = readdirSync('content/robotica', { withFileTypes: true })
      .filter((f) => f.isDirectory())
      .map((f) => {
        const l = lesson(f.name);
        return {
          course_id: l.courseId,
          lesson_id: l.id,
          video_id: l.video!.videoId,
          activities: l.completion!.activities.map(({ id, available }) => ({
            id,
            available,
          })),
        };
      });
    expect(config).toEqual(expected);
  });
});
