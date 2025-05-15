import {
  buildQueryContext,
  ensureIsArray,
  getXAxisColumn,
  isXAxisSet,
  normalizeOrderBy,
  PostProcessingPivot,
  QueryFormData,
} from '@superset-ui/core';
import {
  contributionOperator,
  extractExtraMetrics,
  flattenOperator,
  isTimeComparison,
  pivotOperator,
  prophetOperator,
  renameOperator,
  resampleOperator,
  rollingWindowOperator,
  sortOperator,
  timeComparePivotOperator,
  timeCompareOperator,
} from '@superset-ui/chart-controls';

export default function buildQuery(formData: QueryFormData) {
  const { groupby } = formData;
  return buildQueryContext(formData, baseQueryObject => {
    const extra_metrics = extractExtraMetrics(formData);

    const pivotOperatorInRuntime: PostProcessingPivot = isTimeComparison(
      formData,
      baseQueryObject,
    )
      ? timeComparePivotOperator(formData, baseQueryObject)
      : pivotOperator(formData, baseQueryObject);

    const columns = [
      ...(isXAxisSet(formData) ? ensureIsArray(getXAxisColumn(formData)) : []),
      ...ensureIsArray(groupby),
    ];

    const time_offsets = isTimeComparison(formData, baseQueryObject)
      ? formData.time_compare
      : [];

    return [
      {
        ...baseQueryObject,
        metrics: [...(baseQueryObject.metrics || []), ...extra_metrics],
        columns,
        series_columns: groupby,
        ...(isXAxisSet(formData) ? {} : { is_timeseries: true }),
        // todo: move `normalizeOrderBy to extractQueryFields`
        orderby: normalizeOrderBy(baseQueryObject).orderby,
        time_offsets,
        /* Note that:
          1. The resample, rolling, cum, timeCompare operators should be after pivot.
          2. the flatOperator makes multiIndex Dataframe into flat Dataframe
        */
        post_processing: [
          pivotOperatorInRuntime,
          rollingWindowOperator(formData, baseQueryObject),
          timeCompareOperator(formData, baseQueryObject),
          resampleOperator(formData, baseQueryObject),
          renameOperator(formData, baseQueryObject),
          contributionOperator(formData, baseQueryObject, time_offsets),
          sortOperator(formData, baseQueryObject),
          flattenOperator(formData, baseQueryObject),
          // todo: move prophet before flatten
          prophetOperator(formData, baseQueryObject),
        ],
      },
    ];
  });
}
