import { Neo4jClient } from '../../database/Neo4jClient';
import { MapSet } from '../../entities/MapSet';
import { Neo4jDependencyRelationship } from '../../entities';
import Neo4jComponentNode from '../../entities/Neo4jComponentNode';
import Violations from '../../entities/violations';
import ViolationCyclicalDependenciesService from './ViolationCyclicalDependenciesService';
import { ViolationLayerService } from './ViolationLayerService';
import { DirectViolationService } from './ViolationDirectService';

export default class ViolationService {
  private readonly client: Neo4jClient;

  public violations: Violations = {
    subLayers: [],
    dependencyCycles: [],
    directViolations: [],
  };

  constructor() {
    this.client = new Neo4jClient();
  }

  public async getGraphViolations(
    dependencies: MapSet<Neo4jDependencyRelationship>,
    nodes: MapSet<Neo4jComponentNode>,
  ): Promise<void> {
    const violationService = new ViolationCyclicalDependenciesService(this.client);

    const cyclicalDependencies = await violationService.getDependencyCycles();
    const formattedCyclDeps = violationService
      .extractAndAbstractDependencyCycles(cyclicalDependencies, dependencies, nodes);

    const layerViolationService = new ViolationLayerService(this.client);
    await layerViolationService.markAndStoreLayerViolations(dependencies);
    const sublayerViolations = layerViolationService.extractLayerViolations();

    const directViolationService = new DirectViolationService(this.client);
    await directViolationService.markAndStoreViolations(dependencies);
    const directViolations = directViolationService.extractDirectViolations();

    this.violations = {
      dependencyCycles: formattedCyclDeps,
      subLayers: sublayerViolations,
      directViolations: directViolations,
    };
  }

  public async destroy() {
    await this.client.destroy();
  }
}
