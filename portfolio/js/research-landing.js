// The full distribution remains visible. A selection changes only the readout.
for (const preview of document.querySelectorAll('.research-preview')) {
 const buttons=[...preview.querySelectorAll('[data-segment]')];
 for (const button of buttons) button.addEventListener('click',()=>{
  for (const peer of buttons) peer.setAttribute('aria-pressed',String(peer===button));
  preview.querySelector('[data-segment-value]').textContent=button.dataset.value;
  preview.querySelector('[data-segment-label]').textContent=button.querySelector('[data-segment-name]').textContent;
  preview.querySelectorAll('.preview-donut circle').forEach((circle,i)=>{circle.style.opacity=i===Number(button.dataset.segment)?'1':'.38';});
 });
}
