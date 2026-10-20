const menu = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); mobileNav.hidden = !open; menu.textContent = open ? '×' : '☰'; });
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { mobileNav.hidden = true; menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Open navigation'); menu.textContent = '☰'; }));
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-filter]').forEach(b => { const active = b === button; b.classList.toggle('selected',active); b.setAttribute('aria-pressed',String(active)); }); document.querySelectorAll('.product').forEach(card => card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter); }));
const products = {
 overthinking: {name:'Probably Overthinking.',description:'For the mind with 37 tabs open. A washed-black graphic concept that says the quiet part out loud.',colour:'Washed black',scene:'black-tee'},
 battery: {name:'Social Battery: 1%.',description:'Available for meaningful conversations. Temporarily unavailable for everything else. An off-white graphic concept for the selectively social.',colour:'Off-white',scene:'white-tee'},
 essential: {name:'The Unbothered Essential.',description:'Minimal words. Maximum you. A quiet sage-green concept for days when the brand name says enough.',colour:'Sage',scene:'green-tee'}
};
const dialog = document.querySelector('#product-dialog');
const sizeNames = {S:'Small',M:'Medium',L:'Large',XL:'Extra large',XXL:'XXL'};
let opener;
function selectSize(button) { dialog.querySelectorAll('.sizes button').forEach(b => {b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed',String(b === button)); }); document.querySelector('#size-feedback').textContent = `${sizeNames[button.textContent]} selected. Final measurements coming at launch.`; }
document.querySelectorAll('[data-product]').forEach(button => button.addEventListener('click', () => {opener = button; const product=products[button.dataset.product]; document.querySelector('#dialog-title').textContent=product.name; document.querySelector('#dialog-description').textContent=product.description; document.querySelector('#dialog-colour').textContent=product.colour; const artwork=button.querySelector('.tee-scene').cloneNode(true); artwork.querySelectorAll('[id]').forEach(el=>{const original=el.id; el.id=`modal-${original}`; artwork.querySelectorAll('*').forEach(child=>Array.from(child.attributes).forEach(attr=>{if(attr.value.includes(`url(#${original})`)) child.setAttribute(attr.name,attr.value.replace(`url(#${original})`,`url(#modal-${original})`));}));}); document.querySelector('#dialog-art').replaceChildren(artwork); selectSize(dialog.querySelectorAll('.sizes button')[1]); dialog.querySelectorAll('details').forEach(el=>el.open=false); dialog.showModal(); document.body.style.overflow='hidden'; }));
dialog.querySelectorAll('.sizes button').forEach(button=>button.addEventListener('click',()=>selectSize(button)));
function closeDialog(){dialog.close();}
dialog.querySelector('.dialog-close').addEventListener('click',closeDialog);
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog();}});
dialog.addEventListener('close',()=>{document.body.style.overflow='';opener?.focus();});
