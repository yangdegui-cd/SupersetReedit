// eslint-disable-next-line import/no-extraneous-dependencies
import { indexOf, map, omit, values } from 'lodash';

export function transformData(data: any[], xAxis: string) {
  const allKeys = Object.keys(data[0]).filter(key => key !== xAxis);
  const keyValues = {};

  data.forEach(row => {
    keyValues[row[xAxis]] = values(omit(row, xAxis)).sort((a, b) => b - a);
  });


  console.log(JSON.stringify(keyValues, null, 2));

  const newData = map(data, (row, k) => {
    const newRow = {};
    newRow[xAxis] = row[xAxis];
    allKeys.forEach(key => {
      newRow[key] = indexOf(keyValues[row[xAxis]], row[key]) + 1;
    });
    return newRow;
  });
  console.log(newData);
  return newData;
}
