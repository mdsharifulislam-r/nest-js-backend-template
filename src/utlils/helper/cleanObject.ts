export const cleanObject = (obj: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => {
      if (value === undefined) return false;
      if (value === null) return false;
      if (value === '') return false;

      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0
      ) {
        return false;
      }

      return true;
    }),
  );
};