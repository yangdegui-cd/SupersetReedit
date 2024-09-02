// eslint-disable-next-line no-restricted-syntax
import React, { Dispatch } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeApi } from '@superset-ui/core';
import { Select } from 'antd-v5';
import { RootState } from '../../dashboard/types';
import { setProject } from '../../views/ProjectReducer';
import { ProjectObject } from '../../types/bootstrapTypes';
import { searchStrIncludes } from '../../utils/searchFilterStr';

export function useChoiceProject(value: number, dispatch: Dispatch<any>) {
  const api = makeApi<void, any>({
    method: 'GET',
    endpoint: `/api/v1/project/change_project/${value}`,
    headers: { 'Content-Type': 'application/json' },
  });
  api().then(() => {
    dispatch(setProject(value));
  });
}

export default function ProjectPicker() {
  const projects: ProjectObject[] = useSelector(
    (state: RootState) => state.projects,
  );
  const current_project = useSelector(
    (state: RootState) => state.current_project,
  );
  const dispatch = useDispatch();
  const choiceProject = useChoiceProject;
  const onSelect = (value: number) => choiceProject(value, dispatch);
  const filterOption = (
    value: string,
    option: { value: number; label: string },
  ) => searchStrIncludes(option.label, value);
  return (
    <Select
      style={{ width: 120 }}
      value={current_project}
      showSearch
      onSelect={onSelect}
      filterOption={filterOption}
      options={projects.map(v => ({
        value: v.id ?? -1,
        label: v.project_name,
      }))}
    />
  );
}
