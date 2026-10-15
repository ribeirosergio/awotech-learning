export function Progress({
  completed,
  total,
  percent,
}: {
  completed: number;
  total: number;
  percent: number;
}) {
  return (
    <div className="learning-progress">
      <p>
        {completed} de {total} aulas <strong>{percent}%</strong>
      </p>
      <progress
        value={completed}
        max={total || 1}
        aria-label={`${completed} de ${total} aulas concluídas`}
      />
    </div>
  );
}
