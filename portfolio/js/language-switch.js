// Static links work without JavaScript. This preserves the current section.
const links=[...document.querySelectorAll('[data-locale-link]')];
function readingAnchor(){
 const existing=document.getElementById(location.hash.slice(1));
 if(existing){const box=existing.getBoundingClientRect();if(box.top<=innerHeight*.5&&box.bottom>=0)return existing.id;}
 const candidates=[...document.querySelectorAll('main section[id],main h2[id],main h3[id]')];
 return candidates.filter(node=>node.getBoundingClientRect().top<=innerHeight*.3).at(-1)?.id||location.hash.slice(1);
}
for(const link of links)link.addEventListener('click',()=>{
 const target=new URL(link.href,location.href),anchor=readingAnchor();
 if(anchor)target.hash=anchor;link.href=target.href;
});
