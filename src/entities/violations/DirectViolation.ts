import { ExtendedSimpleEdgeData } from '../Edge';

export interface DirectViolation extends ExtendedSimpleEdgeData {
  // List, because an abstraction may include multiple "real" edges
  actualEdges: ExtendedSimpleEdgeData[];
}