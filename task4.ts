export type Group<T, K extends keyof T> = {
  key: T[K];
  items: T[];
};

interface Step<In, Out, Tag extends string> {
  (data: In): Out;
  _tag: Tag;
}

export type WhereOp<T> = <K extends keyof T>(key: K, value: T[K]) => Step<T[], T[], 'where'>;
export type GroupByOp<T> = <K extends keyof T>(key: K) => Step<T[], Group<T, K>[], 'groupBy'>;
export type HavingOp<T> = <K extends keyof T>(predicate: (group: Group<T, K>) => boolean) => Step<Group<T, K>[], Group<T, K>[], 'having'>;
export type SortOp<T> = <K extends keyof T>(key: K) => Step<T[], T[], 'sort'>;

export const where: WhereOp<any> = (key, value) => {
  const fn = (data: any[]) => data.filter(item => item[key] === value);
  return Object.assign(fn, { _tag: 'where' as const });
};

export const groupBy: GroupByOp<any> = <K extends string | number | symbol>(key: K) => {
  const fn = (data: any[]) => {
    const map = data.reduce((acc, item) => {
      const k = item[key];
      if (!acc[k]) acc[k] = { key: k, items: [] };
      acc[k].items.push(item);
      return acc;
    }, {} as Record<any, Group<any, any>>);
    return Object.values(map) as Group<any, K>[]; 
  };
  return Object.assign(fn, { _tag: 'groupBy' as const });
};

export const having: HavingOp<any> = (predicate) => {
  const fn = (groups: any[]) => groups.filter(predicate);
  return Object.assign(fn, { _tag: 'having' as const });
};

export const sort: SortOp<any> = (key) => {
  const fn = (data: any[]) => [...data].sort((a, b) => (a[key] > b[key] ? 1 : -1));
  return Object.assign(fn, { _tag: 'sort' as const });
};
              

type ValidSequence<T extends any[]> = 
  T extends [infer First, ...infer Rest]
    ? First extends { _tag: infer Tag }
      ? Tag extends 'where' ? ValidSequence<Rest>
      : Tag extends 'groupBy' ? ValidAfterGroupBy<Rest>
      : Tag extends 'having' ? ValidAfterHaving<Rest>
      : Tag extends 'sort' ? ValidAfterSort<Rest>
      : never
    : never
  : true;

type ValidAfterGroupBy<T extends any[]> = T extends [infer First, ...infer Rest] 
  ? First extends { _tag: 'groupBy' | 'having' } ? ValidAfterGroupBy<Rest> : never : true;

type ValidAfterHaving<T extends any[]> = T extends [infer First, ...infer Rest]
  ? First extends { _tag: 'having' | 'sort' } ? ValidAfterHaving<Rest> : never : true;

type ValidAfterSort<T extends any[]> = T extends [infer First, ...infer Rest]
  ? First extends { _tag: 'sort' } ? ValidAfterSort<Rest> : never : true;

export function query<T, Args extends any[] = any[]>(
  ...steps: Args & (ValidSequence<Args> extends true ? Args : ["Ошибка: Нарушен порядок (Where -> GroupBy -> Having -> Sort)"])
): (data: T[]) => any {
  return (data: T[]) => steps.reduce((acc, step) => step(acc), data);
}