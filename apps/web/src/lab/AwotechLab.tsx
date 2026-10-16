import { lazy, Suspense } from 'react';
import type { LessonDefinition } from '@awotech/content-types';

const ArduinoLab = lazy(() => import('./ArduinoLab'));
const ElectricCircuitLab = lazy(() => import('./ElectricCircuitLab'));

export default function AwotechLab(props: {
  lesson: LessonDefinition;
  userId: string;
}) {
  return (
    <Suspense fallback={<p role="status">Preparando bancada…</p>}>
      {props.lesson.lab?.kind === 'electric-circuits' ? (
        <ElectricCircuitLab {...props} />
      ) : (
        <ArduinoLab {...props} />
      )}
    </Suspense>
  );
}
