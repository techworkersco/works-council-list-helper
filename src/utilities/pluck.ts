type GenericObject = Record<string, unknown>;

export function pluck(
  obj: Record<string | number | symbol, GenericObject>,
  prop: string
): GenericObject {
  return Object.entries(obj).reduce((result, [key, entry]) => {
    result[key] = entry[prop] as GenericObject;
    return result;
  }, {} as GenericObject);
}
