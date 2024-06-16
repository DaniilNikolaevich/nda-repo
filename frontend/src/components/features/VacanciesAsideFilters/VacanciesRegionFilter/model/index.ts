import { createStore } from '@/shared/store';
import { CityModel } from '@/shared/types/common-models';

export const [useCitiesList, { set: setCitiesList }] = createStore<CityModel[]>([]);
