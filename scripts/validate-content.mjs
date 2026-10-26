// 모든 관람지 콘텐츠 팩을 JSON Schema 와 교차 참조 규칙으로 검사한다.
// Usage: npm run validate:content
import { existsSync, readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';

const read = (p) => JSON.parse(readFileSync(new URL(`../content/${p}`, import.meta.url), 'utf8'));
const schema = read('playmuseum_content.schema.json');
const { venues } = read('venues.json');
const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

const errors = [];
const ids = new Set();
for (const v of venues) {
  if (ids.has(v.id)) errors.push(`venues.json: duplicate id ${v.id}`);
  ids.add(v.id);
  if (!['museum', 'art'].includes(v.kind)) errors.push(`${v.id}: kind must be museum|art`);
  const path = `venues/${v.id}/playmuseum_content.json`;
  const hasPack = existsSync(new URL(`../content/${path}`, import.meta.url));
  if (v.status === 'open' && !hasPack) errors.push(`${v.id}: status open but ${path} is missing`);
  if (!hasPack) continue;

  const data = read(path);
  const err = (m) => errors.push(`${v.id}: ${m}`);
  if (!validate(data)) for (const e of validate.errors) err(`${e.instancePath || '/'} ${e.message}`);
  const artifactIds = new Set(data.artifacts.map((a) => a.id));
  const sourceIds = new Set(data.sources.map((s) => s.id));
  const courseIds = new Set(data.courses.map((c) => c.id));
  for (const a of data.artifacts) for (const s of a.sources) if (!sourceIds.has(s)) err(`${a.id}: unknown source ${s}`);
  for (const c of data.courses) for (const id of c.artifacts) if (!artifactIds.has(id)) err(`${c.id}: unknown artifact ${id}`);
  for (const k of ['short_course', 'default_long_course', 'music_course'])
    if (!courseIds.has(data.course_rule[k])) err(`course_rule.${k}: unknown course ${data.course_rule[k]}`);
  for (const t of data.tastes) if (t.maps_to.course && !courseIds.has(t.maps_to.course)) err(`taste ${t.key}: unknown course ${t.maps_to.course}`);
  console.log(`${v.id} (${v.name}): 레코드 ${data.artifacts.length}, 코스 ${data.courses.length}, 출처 ${data.sources.length}`);
}

if (errors.length) {
  console.error(`콘텐츠 검사 실패 (${errors.length}건)`);
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}
console.log(`콘텐츠 검사 통과: 관람지 ${venues.length}곳`);
