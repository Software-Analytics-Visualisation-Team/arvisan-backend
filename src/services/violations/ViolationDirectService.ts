import { Record } from 'neo4j-driver';
import { Neo4jDependencyRelationship } from '../../entities';
import ElementParserService from '../processing/ElementParserService';
import { Neo4jClient } from '../../database/Neo4jClient';
import { Neo4jViolation } from '../../entities/violations/Neo4jViolation';
import { MapSet } from '../../entities/MapSet';
import { ExtendedSimpleEdgeData } from '../../entities/Edge';


export class DirectViolationService {
  private violatingRelationships: MapSet<Neo4jDependencyRelationship> = new MapSet();
  private queriedDirectViolations: Set<string> = new Set();

  constructor(private client: Neo4jClient = new Neo4jClient()) {}

  /**
   * Format the fetched records into a Set of "startNode|endNode" strings for fast lookup.
   */
  private formatDirectViolations(records: Record<Neo4jViolation>[]): Set<string> {
    return new Set(
      records.map((r) =>
        `${r.get('source').properties.simpleName}|${r.get('target').properties.simpleName}`
      )
    );
  }

  /**
   * Fetch all relationships with the VIOLATES label from the database.
   */
  private async getViolatingEdges(): Promise<void> {
    try {
      const query = 'MATCH (source)-[r:VIOLATES]->(target) RETURN source, target';
      const records = await this.client.executeQuery<Neo4jViolation>(query);
      this.queriedDirectViolations = this.formatDirectViolations(records);
    } catch (error) {
      // Handle/log error appropriately
      console.error('Error fetching violating edges:', error);
      this.queriedDirectViolations = new Set();
    }
  }

  /**
   * Mark and store all violating relationships.
   */
  public async markAndStoreViolations(dependencies: MapSet<Neo4jDependencyRelationship>): Promise<void> {
    await this.getViolatingEdges();

    this.violatingRelationships = dependencies.filter((e) => {
      const key = `${e.originalStartNode.properties.simpleName}|${e.originalEndNode.properties.simpleName}`;
      if (this.queriedDirectViolations.has(key)) {
        e.violations.directViolation = true;
        return true;
      }
      return false;
    });
  }

  /**
   * Extract the marked violations.
   */
  public extractDirectViolations(): ExtendedSimpleEdgeData[] {
    return this.violatingRelationships
      .filter((r) => r.violations.directViolation)
      .map((r) => ({
        id: r.elementId,
        source: r.originalStartNode.elementId,
        target: r.originalEndNode.elementId,
        interaction: r.type.toLowerCase(),
        sourceNode: ElementParserService.toNodeData(r.originalStartNode),
        targetNode: ElementParserService.toNodeData(r.originalEndNode),
      }));
  }
}