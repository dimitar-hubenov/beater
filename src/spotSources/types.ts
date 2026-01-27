import type { Spot } from '../types/spot';
import type { SpotSource } from '../types/spotSource';

export interface SpotSourceProvider {
    program: SpotSource;
    fetchSpots(): Promise<Spot[]>;
}
