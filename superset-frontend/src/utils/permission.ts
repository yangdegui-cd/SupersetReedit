import { useSelector } from 'react-redux';
import { RootState } from '../views/store';

export function hasPerm(perm: string, source: string) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const permissions = useSelector((state: RootState) => {
    const perms: any[] = [];
    Object.values(state.user?.roles ?? {}).forEach((role: any[]) =>
      perms.push(...role),
    );
    return perms;
  });

  return permissions
    .filter((permission: string[]) => permission[1] === source)
    .map((permission: string[]) => permission[0])
    .includes(perm);
}
