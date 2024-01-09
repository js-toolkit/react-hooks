import appEnv from '@js-toolkit/configs/appEnv';

export function useTestId(id: string | undefined): { 'data-testid': typeof id } | undefined {
  return appEnv.ifTest({ 'data-testid': id }, undefined);
}
