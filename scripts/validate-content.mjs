// Checks content/playmuseum_content.json against the delivered JSON Schema
// plus a few cross-reference rules the schema cannot express.
// Usage: npm run validate:content
import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';

const read = (p) => JSON.parse(readFileSync(new URL(`../content/${p}`, import.meta.url), 'utf8'));
const data = read('playmuseum_content.json');
const schema = read('playmuseum_content.schema.json');

const ajv = new Ajv2020({ allErrors: true, strict: false });
const ok = ajv.validate(schema, data);
const errors = ok ? [] : ajv.errors.map((e) => `${e.instancePath || '/'} ${e.message}`);

const artifactIds = new Set(data.artifacts.map((a) => a.id));
const sourceIds = new Set(data.sources.map((s) => s.id));
const courseIds = new Set(data.courses.map((c) => c.id));
for (const a of data.artifacts) {
  for (const s of a.sources) if (!sourceIds.has(s)) errors.push(`${a.id}: unknown source ${s}`);
}
for (const c of data.courses) {
  for (const id of c.artifacts) if (!artifactIds.has(id)) errors.push(`${c.id}: unknown artifact ${id}`);
}
const r = data.course_rule;
for (const k of ['short_course', 'default_long_course', 'music_course']) {
  if (!courseIds.has(r[k])) errors.push(`course_rule.${k}: unknown course ${r[k]}`);
}
for (const t of data.tastes) {
  if (t.maps_to.course && !courseIds.has(t.maps_to.course)) errors.push(`taste ${t.key}: unknown course ${t.maps_to.course}`);
}

if (errors.length) {
  console.error(`콘텐츠 검사 실패 (${errors.length}건)`);
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}
console.log(`콘텐츠 검사 통과: 레코드 ${data.artifacts.length}, 코스 ${data.courses.length}, 출처 ${data.sources.length}`);
