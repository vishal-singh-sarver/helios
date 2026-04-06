// src/renderer/src/types/project.ts
export interface FormValues {
  projectName: string
  latitude: string
  longitude: string
}

export const INITIAL_VALUES: FormValues = {
  projectName: '',
  latitude: '',
  longitude: ''
}