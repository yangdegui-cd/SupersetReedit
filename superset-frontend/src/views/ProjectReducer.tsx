import { Dispatch } from 'redux';
import { ProjectObject } from '../types/bootstrapTypes';

export interface ProjectConfig {
  projects: ProjectObject[];
  current_project: number | undefined;
}

export const projectsReducer = (state: ProjectObject[] = [], action: any) => {
  switch (action?.type) {
    case 'SET_PROJECTS':
      return action.projects;
    default:
      return state;
  }
};

export const currentProjectReducer = (state = null, action: any) => {
  switch (action?.type) {
    case 'CHANGE_CURRENT_PROJECT':
      return action?.id;
    default:
      return state;
  }
};

export const setProject = (value: number) => (dispatch: Dispatch<any>) => {
  dispatch({ type: 'CHANGE_CURRENT_PROJECT', id: value });
};
