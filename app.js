const BOOKS = [
  {title:'Dom Casmurro', subject:'Romance brasileiro', price:29.90, stock:8},
  {title:'Memórias Póstumas de Brás Cubas', subject:'Literatura brasileira', price:34.50, stock:5},
  {title:'O Cortiço', subject:'Realismo e sociedade', price:25.00, stock:10},
  {title:'Iracema', subject:'Romance histórico', price:22.90, stock:4},
  {title:'A Moreninha', subject:'Romance brasileiro', price:27.00, stock:6}
];
const USER='aluno@catalogo.local', PASS='123456';
const app=document.querySelector('#app'), nav=document.querySelector('#nav'), dialog=document.querySelector('#dialog');
const currency=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const initialStock=BOOKS.map(b=>b.stock);
let stock=[...initialStock], cart=BOOKS.map(()=>0), current='catalog', signedIn=false, searchTerm='';
const escapeHtml=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fold=s=>s.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const count=()=>cart.reduce((a,b)=>a+b,0);
function clock(){document.querySelector('#clock').textContent=new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date());}
clock();setInterval(clock,30000);
function showDialog(html){document.querySelector('#dialog-content').innerHTML=html;dialog.showModal();}
document.querySelector('#dialog-close').onclick=()=>dialog.close();
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
function renderNav(){
 nav.hidden=!signedIn;if(!signedIn)return;
 nav.innerHTML=[['catalog','Catálogo','▤'],['cart','Carrinho','▣'],['contact','Atendimento','✉'],['about','Sobre','ⓘ']]
  .map(([id,label,icon])=>`<button type="button" data-view="${id}" ${current===id?'aria-current="page"':''}><span class="nav-icon" aria-hidden="true">${icon}</span>${label}${id==='cart'&&count()?` (${count()})`:''}</button>`).join('');
 nav.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>navigate(b.dataset.view));
}
function navigate(view){if(!signedIn)return renderLogin();current=view;render()}
function render(){renderNav();({catalog:renderCatalog,cart:renderCart,contact:renderContact,about:renderAbout}[current]||renderCatalog)()}
function renderLogin(){
 signedIn=false;nav.hidden=true;
 app.innerHTML=`<section class="login"><h2>Acesso ao catálogo</h2><p class="intro">Use o acesso de demonstração para consultar os livros.</p>
 <form id="login-form"><label class="field" for="email">E-mail</label><input class="text-input" id="email" type="email" autocomplete="username" required>
 <label class="field" for="password">Senha</label><input class="text-input" id="password" type="password" autocomplete="current-password" required>
 <p class="small muted">Teste: ${USER} / ${PASS}</p><p class="error" id="login-error" role="alert" hidden>E-mail ou senha incorretos.</p><button class="primary" type="submit">Entrar</button></form></section>`;
 app.querySelector('form').onsubmit=e=>{e.preventDefault();const email=app.querySelector('#email').value.trim().toLowerCase(),password=app.querySelector('#password').value;if(email===USER&&password===PASS){signedIn=true;navigate('catalog')}else app.querySelector('#login-error').hidden=false};
}
function bookCard(book,i){const available=stock[i]-cart[i];return `<article class="card"><div class="row"><div><h3>${escapeHtml(book.title)}</h3><span class="tag">${escapeHtml(book.subject)}</span></div><div class="price">${currency.format(book.price)}</div></div>
 <p class="stock">Disponível: ${available} de ${stock[i]}</p><div class="actions"><button type="button" class="secondary" data-details="${i}">Detalhes</button><button type="button" class="primary" data-add="${i}" ${available? '':'disabled'}>Adicionar</button></div></article>`}
function listBooks(){
 const hits=BOOKS.map((b,i)=>({b,i})).filter(({b})=>fold(`${b.title} ${b.subject}`).includes(fold(searchTerm)));
 const target=app.querySelector('#books');target.innerHTML=hits.length?hits.map(({b,i})=>bookCard(b,i)).join(''):'<p class="empty">Nenhum livro encontrado. Tente outro título ou assunto.</p>';
 target.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>add(Number(b.dataset.add)));
 target.querySelectorAll('[data-details]').forEach(b=>b.onclick=()=>details(Number(b.dataset.details)));
}
function renderCatalog(){
 app.innerHTML='<h2>Livros disponíveis</h2><p class="intro">Pesquise pelo título ou assunto.</p><label class="field" for="search">Buscar livro</label><input class="text-input" id="search" type="search" placeholder="Ex.: romance brasileiro"><div id="books" class="stack" style="margin-top:20px"></div>';
 const search=app.querySelector('#search');search.value=searchTerm;search.oninput=()=>{searchTerm=search.value;listBooks()};listBooks();
}
function details(i){const b=BOOKS[i];showDialog(`<h2 id="dialog-title">${escapeHtml(b.title)}</h2><p>Assunto: ${escapeHtml(b.subject)}</p><p>Valor: <strong>${currency.format(b.price)}</strong></p><p>Quantidade disponível: ${stock[i]-cart[i]}</p><button type="button" class="primary" id="detail-add" ${stock[i]-cart[i]?'':'disabled'}>Adicionar ao carrinho</button>`);document.querySelector('#detail-add').onclick=()=>{dialog.close();add(i)}}
function add(i){if(cart[i]>=stock[i])return;cart[i]++;renderNav();if(current==='catalog')listBooks();showDialog(`<h2 id="dialog-title">Livro adicionado</h2><p>${escapeHtml(BOOKS[i].title)} está no carrinho.</p><button type="button" class="primary" id="go-cart">Ver carrinho (${count()})</button>`);document.querySelector('#go-cart').onclick=()=>{dialog.close();navigate('cart')}}
function renderCart(){
 const items=BOOKS.map((b,i)=>({b,i})).filter(({i})=>cart[i]);let total=items.reduce((sum,{b,i})=>sum+b.price*cart[i],0);
 app.innerHTML=`<h2>Carrinho de compra</h2>${items.length?`<div class="stack">${items.map(({b,i})=>`<article class="card"><h3>${escapeHtml(b.title)}</h3><p>${cart[i]} × ${currency.format(b.price)} = <strong>${currency.format(b.price*cart[i])}</strong></p><button type="button" class="secondary" data-remove="${i}">Remover uma unidade</button></article>`).join('')}</div><div class="summary"><span>Total</span><span>${currency.format(total)}</span></div><button id="checkout" class="primary">Finalizar simulação</button>`:'<p class="empty">Seu carrinho está vazio.</p>'}`;
 app.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{cart[Number(b.dataset.remove)]--;render()});
 const checkout=app.querySelector('#checkout');if(checkout)checkout.onclick=()=>{stock=stock.map((n,i)=>n-cart[i]);cart=cart.map(()=>0);render();showDialog('<h2 id="dialog-title">Simulação concluída</h2><p>O estoque foi atualizado nesta sessão. Nenhum pagamento ou pedido real foi realizado.</p><button type="button" class="primary" id="finish">Sobre o aplicativo</button>');document.querySelector('#finish').onclick=()=>{dialog.close();navigate('about')}};
}
function renderContact(){app.innerHTML=`<h2>Atendimento</h2><p class="intro">Escolha o aplicativo para compartilhar sua mensagem. O destinatário será escolhido nele.</p><div class="stack"><a class="primary" href="mailto:?subject=Atendimento%20Cat%C3%A1logo%20de%20Livros&body=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20cat%C3%A1logo." style="text-align:center;text-decoration:none">Enviar e-mail</a><a class="secondary" href="https://wa.me/?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20cat%C3%A1logo%20de%20livros." target="_blank" rel="noopener" style="text-align:center;text-decoration:none">Compartilhar pelo WhatsApp</a></div>`}
const ABOUT='Catálogo de Livros · versão 1.0. Desenvolvido por João Carlos de Souza Espinato. Aplicativo acadêmico de consulta por título e assunto, com estoque, preço e carrinho demonstrativos. O acesso é local; não há cobrança, pedido real ou envio de dados a servidor.';
function renderAbout(){app.innerHTML=`<h2>Sobre o aplicativo</h2><p>${escapeHtml(ABOUT)}</p><div class="notice">Os valores e as quantidades são exemplos. A finalização é apenas uma simulação.</div><div class="stack"><button id="notice" class="primary">Ler aviso</button><button id="logout" class="secondary">Sair da sessão</button></div>`;app.querySelector('#notice').onclick=()=>showDialog(`<h2 id="dialog-title">Aviso sobre o aplicativo</h2><p>${escapeHtml(ABOUT)}</p>`);app.querySelector('#logout').onclick=()=>{stock=[...initialStock];cart=cart.map(()=>0);searchTerm='';renderLogin()}}
renderLogin();
