import {
  flattenDepth,
  groupBy,
  identity,
  map,
  max,
  min,
  nth,
  sortBy,
  sum,
} from 'lodash';

export default function computeAuxiliaryData(
  _data: [string | number, number][][],
  aggregateType: string,
) {
  // Group data by the first element (x-axis value)
  const data = flattenDepth(_data, 1);
  const key_type = typeof data[0][0];
  const groupedData = groupBy(data, item => item[0]);
  // Perform aggregation on each group
  const result: [string | number, number][] = map(
    groupedData,
    (values, key) => {
      let aggregateValue: number;
      const flattenedValues: number[] = values.map(item => item[1]);
      switch (aggregateType) {
        case 'average':
          aggregateValue = sum(flattenedValues) / flattenedValues.length;
          break;
        case 'median':
          aggregateValue =
            nth(
              sortBy(identity, flattenedValues),
              Math.floor(flattenedValues.length / 2),
            ) ?? 0;
          break;
        case 'max':
          aggregateValue = max(flattenedValues) as number;
          break;
        case 'min':
          aggregateValue = min(flattenedValues) as number;
          break;
        case 'sum':
          aggregateValue = sum(flattenedValues);
          break;
        default:
          throw new Error(`Unsupported aggregate type: ${aggregateType}`);
      }

      return [key_type === 'number' ? parseInt(key, 10) : key, aggregateValue];
    },
  );
  return result;
}
