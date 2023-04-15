export function getColor({
  isPopularlyElected,
  isOverflowElected,
  isGenderQuotaElected,
}: {
  isPopularlyElected?: boolean;
  isOverflowElected?: boolean;
  isGenderQuotaElected?: boolean;
}) {
  if (isPopularlyElected) {
    return "hsl(135, 98%, 45%)";
  }
  if(isGenderQuotaElected) {
    return "hsl(170, 98%, 45%)"
  }
  if (isOverflowElected) {
    return "hsl(62, 98%, 45%)"
  }
  return undefined;
}
