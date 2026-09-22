/**
 * Batch Flow routes — run one workflow template across N input rows.
 *
 * Mounted under /api/workflow/*. Static segments ("batch") take priority over
 * the parametric "/api/workflow/:id" route in find-my-way, so there is no
 * collision with the workflow CRUD routes.
 */
import type { FastifyInstance } from 'fastify';
export declare function registerWorkflowBatchRoutes(app: FastifyInstance): Promise<void>;
//# sourceMappingURL=workflow.batch.routes.d.ts.map