/* eslint-env node */
/* eslint-disable no-console */
/**
 * Runs the sync action locally without writing to DA.
 * Usage: IMS_ACCESS_TOKEN=<token> node tools/product-sync/test/dry-run.js <fragment path>
 * Prints the result; with a change, writes the would-be page to /tmp/product-sync-dry-run.html.
 */
import { writeFileSync } from 'node:fs';
import { main } from '../actions/sync/index.js';

const result = await main({
  path: process.argv[2],
  dryRun: true,
  GRAPHQL_BASE: 'https://publish-p166217-e1771263.adobeaemcloud.com/graphql/execute.json/ref-demo-eds',
  DA_ORG: 'junsung86',
  DA_REPO: 'lghnh-eds-demo',
  IMS_ACCESS_TOKEN: process.env.IMS_ACCESS_TOKEN,
});

const { html, ...summary } = result.body;
if (html) writeFileSync('/tmp/product-sync-dry-run.html', html);
console.log(JSON.stringify({ statusCode: result.statusCode, ...summary }, null, 2));
