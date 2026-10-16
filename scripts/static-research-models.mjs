const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function modelMarkup(c,model,capability){
 const conceptual=['hotel-value-framework','psych-ownership'].includes(c.id),g=model.study;
 return `<section class="case-models" id="models" aria-labelledby="models-title"><div class="methods-toolbox"><h2 id="models-title">${conceptual?'Research design':'Methods & tools'}</h2><ul class="method-tags">${capability.methods.map(method=>`<li>${esc(method)}</li>`).join('')}</ul></div><figure class="inline-model"><img src="assets/models/${model.id}-study.svg" alt="${esc(g.title)}" width="1000" height="700" loading="lazy"/><figcaption>${conceptual?'Proposed framework · Not yet tested':'Study diagram'}</figcaption></figure></section>`;
}
