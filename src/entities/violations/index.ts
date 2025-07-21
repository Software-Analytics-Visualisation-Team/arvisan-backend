import { DependencyCycleRender } from './DependencyCycle';
import { LayerViolation } from './LayerViolation';
import { ExtendedSimpleEdgeData } from '../Edge';

export { DependencyCycle } from './DependencyCycle';

export default interface Violations {
  dependencyCycles: DependencyCycleRender[];
  subLayers: LayerViolation[];
  directViolations: ExtendedSimpleEdgeData[];
}
