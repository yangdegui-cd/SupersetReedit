export function calculateArray(
  array: number[],
  mode: 'max' | 'min' | 'average' | 'median',
) {
  switch (mode) {
    case 'max':
      return Math.max(...array);
    case 'min':
      return Math.min(...array);
    case 'average':
      return calculateAverage(array);
    case 'median':
      return calculateMedian(array);
    default:
      return 'Invalid mode';
  }
}

function calculateAverage(array: number[]) {
  const sum = array.reduce((acc, val) => acc + val, 0);
  return sum / array.length;
}

function calculateMedian(array: number[]) {
  const sortedArray = array.slice().sort((a, b) => a - b);
  const middle = Math.floor(sortedArray.length / 2);
  if (sortedArray.length % 2 === 0) {
    return (sortedArray[middle - 1] + sortedArray[middle]) / 2;
  }
  return sortedArray[middle];
}
