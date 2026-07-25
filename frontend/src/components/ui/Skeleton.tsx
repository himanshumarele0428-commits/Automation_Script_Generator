export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`skeleton rounded-xl bg-surface-200 dark:bg-surface-800 ${className}`}
    />
  );
}
