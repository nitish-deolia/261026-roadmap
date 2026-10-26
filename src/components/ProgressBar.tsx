type ProgressBarProps = {
  percent: number;
  label?: string;
};

export function ProgressBar({ percent, label = "Roadmap progress" }: ProgressBarProps) {
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
