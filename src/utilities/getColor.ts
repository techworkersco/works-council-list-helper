export function getColor({
  isPopularlyElected,
  isOverflowElected
}: {
  isPopularlyElected?: boolean;
  isOverflowElected?: boolean
}) {
  if (isPopularlyElected) {
    return "hsl(135, 98%, 45%)";
  }
  if (isOverflowElected) {
    return "hsl(62, 98%, 45%)"
  }
  return undefined;
}
