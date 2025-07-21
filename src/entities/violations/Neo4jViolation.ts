import { INeo4jComponentNode } from '../../database/entities';
// This file defines the Neo4jViolation interface, which represents a violation

export interface Neo4jViolation {
  source: INeo4jComponentNode;
  target: INeo4jComponentNode;
}