import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {entries}=JSON.parse(await fs.readFile('portfolio/assets/data/research-evidence.json','utf8'));
const {cases}=JSON.parse(await fs.readFile('portfolio/assets/data/case-studies.json','utf8'));
const by=Object.fromEntries(entries.map(e=>[e.id,e]));
assert.equal(entries.length,11);assert.deepEqual(new Set(entries.map(e=>e.id)),new Set(cases.map(c=>c.id)));
for(const e of entries){
 assert(e.title&&e.caption&&e.source&&e.equation&&e.equationNote,e.id);
 assert.equal(e.method.length,3,e.id+' method layers');
 if(e.labels&&e.values)assert.equal(e.labels.length,e.values.length,e.id+' count');
 if(e.notes&&e.labels)assert.equal(e.notes.length,e.labels.length,e.id+' explanations');
 for(const ext of ['svg','png'])assert((await fs.stat('portfolio/assets/figures/'+e.id+'.'+ext)).size>1000,e.id+' export');
}
assert.deepEqual(by['ev-choice'].groups.map(g=>g.values),cases.find(c=>c.id==='ev-choice').visual.states.map(s=>s.values));
assert.deepEqual(by['ev-choice'].groups[0].intervals,[[65.3,202.5],[-6.7,198.7],[-26.4,113.8],[-21.8,108.4]]);
assert.deepEqual(by['ev-choice'].groups[1].intervals,[[100.2,259.8],[19.4,191.2],[21.8,99.2],[-24.8,160.7]]);
assert.deepEqual(by['hotel-prca'].penalty,cases.find(c=>c.id==='hotel-prca').visual.states[0].values);
assert.deepEqual(by['hotel-prca'].reward,cases.find(c=>c.id==='hotel-prca').visual.states[1].values);
assert.deepEqual(by['hotel-segmentation'].values,cases.find(c=>c.id==='hotel-segmentation').visual.items.map(i=>i[1]));
assert.deepEqual(by['nutrition-diet'].regression.map(r=>r.estimate),[.1284,-.0129,.1102,.0029]);
assert.deepEqual(by['nutrition-diet'].domains.map(d=>d.correct),[85.5,69.7,46.1]);
assert.deepEqual(by['motorbike-phaseout'].values,[-68450,-135220,51780,84150,34260,76920,102550,153830,17110,59840,85470,188120,68410,102550]);
assert.deepEqual(by['buffet-nudging'].studies.map(s=>[s.before,s.after]),[[1573,1427],[1668,1445]]);
assert.equal(by['buffet-nudging'].premium.oddsRatio,.52);
assert.equal(by['arts-workshop'].inputs.filter(i=>'coefficient' in i).length,1);
assert.equal(by['arts-workshop'].inputs[0].coefficient,.35);assert.equal(by['arts-workshop'].end.coefficient,.59);
assert(by['psych-ownership'].inputs.every(i=>!('coefficient' in i)));
assert(by['influencer-strategy'].inputs.every(i=>!('coefficient' in i)));
console.log('Source-bound figure values, 11 case mappings and 22 exports validated.');
