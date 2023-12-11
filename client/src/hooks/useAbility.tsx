import { useContext } from 'react';
import { AbilityContext } from 'src/layouts/components/acl/Can';

export const useAbility = () => useContext(AbilityContext);
