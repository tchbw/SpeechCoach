export const ListUtil = {
  filterOutNull<T>(items: Array<T | null>): T[] {
    return items.filter((item): item is T => item !== null);
  },
};
