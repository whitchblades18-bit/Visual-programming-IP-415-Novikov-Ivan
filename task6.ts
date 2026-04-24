export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends (...args: any[]) => any
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K];
};


export type PickedByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

export type EventHandlers<T> = {
  [K in keyof T as K extends string ? `on${Capitalize<K>}` : never]: (event: T[K]) => void;
};