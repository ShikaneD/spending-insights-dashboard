import type { ReactNode } from 'react';

export interface QueryLike<T> {
  data: T | undefined;
  isPending: boolean;
  isError: boolean;
  refetch: () => unknown;
}

interface Props<T> {
  id: string;
  title: string;
  query: QueryLike<T>;
  isEmpty?: (data: T) => boolean;
  actions?: ReactNode;
  children: (data: T) => ReactNode;
}

/** Gives every dashboard section its own loading, error, empty and content states. */
export function Section<T>({ id, title, query, isEmpty, actions, children }: Props<T>) {
  const { data } = query;
  let body: ReactNode;
  if (data !== undefined) {
    body = isEmpty?.(data) ? <p className="muted">No data for this selection. Try a different date range.</p> : children(data);
  } else if (query.isPending) {
    body = <div className="skeleton" role="status" aria-label={`Loading ${title}`} />;
  } else {
    body = (
      <div role="alert">
        <p className="error">We couldn&apos;t load {title.toLowerCase()}.</p>
        <button type="button" onClick={() => query.refetch()}>Try again</button>
      </div>
    );
  }
  return (
    <section className="card" aria-labelledby={`${id}-title`}>
      <div className="card-head">
        <h2 id={`${id}-title`}>{title}</h2>
        {actions}
      </div>
      {body}
    </section>
  );
}
