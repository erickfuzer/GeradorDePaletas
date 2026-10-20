// ---------- Elementos principais ----------
const paletteEl = document.getElementById('palette');
const generateBtn = document.getElementById('generateBtn');
const NUM_COLORS = 5;

// Ícones do cadeado (SVG inline). Usam currentColor para herdar o contraste do texto.
const LOCK_ICONS = `
  <svg class="icon-unlocked" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2"></rect>
    <path d="M8 11V7a4 4 0 0 1 7.75-1.4"></path>
  </svg>
  <svg class="icon-locked" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2"></rect>
    <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
  </svg>`;

/**
 * Gera um código de cor hexadecimal aleatório, ex: "#3A86FF"
 */
function getRandomHexColor() {
  const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  return `#${hex}`.toUpperCase();
}

/**
 * Calcula o brilho de uma cor hex para decidir se o texto
 * sobre ela deve ser claro ou escuro (contraste legível).
 */
function isColorLight(hex) {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150;
}

/**
 * Cria as 5 colunas de cor na tela (uma única vez).
 */
function createColumns() {
  for (let i = 0; i < NUM_COLORS; i++) {
    const column = document.createElement('div');
    column.className = 'color-column';

    // Agrupa cadeado e código, para centralizar tudo junto na coluna
    const info = document.createElement('div');
    info.className = 'color-info';

    const lockBtn = document.createElement('button');
    lockBtn.type = 'button';
    lockBtn.className = 'lock-btn';
    lockBtn.innerHTML = LOCK_ICONS;
    setLocked(column, lockBtn, false);

    const hexCode = document.createElement('span');
    hexCode.className = 'hex-code';

    const copiedMsg = document.createElement('span');
    copiedMsg.className = 'copied-msg';
    copiedMsg.textContent = 'Copiado!';

    info.appendChild(lockBtn);
    info.appendChild(hexCode);
    column.appendChild(info);
    column.appendChild(copiedMsg);
    paletteEl.appendChild(column);

    // Clicar no código copia a cor para a área de transferência
    hexCode.addEventListener('click', () => copyToClipboard(hexCode.textContent, hexCode, copiedMsg));

    // Clicar no cadeado trava/destrava a cor (sem copiar nem gerar paleta)
    lockBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      setLocked(column, lockBtn, !column.classList.contains('locked'));
    });
  }
}

/**
 * Trava ou destrava uma coluna, atualizando o visual e os atributos de acessibilidade.
 */
function setLocked(column, lockBtn, locked) {
  column.classList.toggle('locked', locked);
  lockBtn.setAttribute('aria-pressed', String(locked));
  lockBtn.setAttribute('aria-label', locked ? 'Destravar cor' : 'Travar cor');
  lockBtn.title = locked ? 'Destravar cor' : 'Travar cor';
}

/**
 * Gera novas cores aleatórias e atualiza cada coluna, pulando as travadas.
 */
function generatePalette() {
  const columns = document.querySelectorAll('.color-column');

  columns.forEach((column) => {
    // Cor travada continua a mesma
    if (column.classList.contains('locked')) return;

    const newColor = getRandomHexColor();
    const hexCode = column.querySelector('.hex-code');

    column.style.backgroundColor = newColor;
    hexCode.textContent = newColor;

    // Ajusta a cor do texto conforme o brilho do fundo
    if (isColorLight(newColor)) {
      column.classList.add('dark-text');
      column.classList.remove('light-text');
    } else {
      column.classList.add('light-text');
      column.classList.remove('dark-text');
    }
  });
}

/**
 * Copia um texto para a área de transferência e mostra o aviso "Copiado!"
 * logo acima das informações da cor, alinhado ao elemento clicado.
 */
function copyToClipboard(text, anchorEl, copiedMsg) {
  navigator.clipboard.writeText(text).then(() => {
    const column = copiedMsg.parentElement;
    const columnRect = column.getBoundingClientRect();
    const infoRect = column.querySelector('.color-info').getBoundingClientRect();
    const anchorRect = anchorEl.getBoundingClientRect();
    const gap = 10; // distância entre o aviso e o conteúdo da coluna

    copiedMsg.style.top = `${infoRect.top - columnRect.top - copiedMsg.offsetHeight - gap}px`;
    copiedMsg.style.left = `${anchorRect.left - columnRect.left + anchorRect.width / 2}px`;

    // Reinicia o tempo do aviso se o usuário copiar de novo antes de ele sumir
    clearTimeout(copiedMsg.hideTimer);
    copiedMsg.classList.add('show');
    copiedMsg.hideTimer = setTimeout(() => copiedMsg.classList.remove('show'), 1000);
  });
}

/**
 * Mede a altura real do botão flutuante e reserva esse espaço na última coluna
 * (apenas no layout mobile, onde as colunas ficam empilhadas). Isso evita que o
 * botão sobreponha o código hex, mesmo se o texto do botão quebrar em duas linhas
 * em telas muito estreitas.
 */
function adjustBottomSpace() {
  const isMobileLayout = window.innerWidth <= 700;

  if (isMobileLayout) {
    const buffer = 24; // respiro extra entre o hex code e o botão
    const spaceNeeded = generateBtn.offsetHeight + buffer;
    document.documentElement.style.setProperty('--btn-space', `${spaceNeeded}px`);
  } else {
    document.documentElement.style.setProperty('--btn-space', '0px');
  }
}

// ---------- Eventos ----------
generateBtn.addEventListener('click', generatePalette);

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault(); // evita rolar a página
    generatePalette();
  }
});

// Recalcula o espaço reservado se a tela girar, for redimensionada,
// ou se a barra de endereço do navegador mobile aparecer/sumir
window.addEventListener('resize', adjustBottomSpace);

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', adjustBottomSpace);
}

// As fontes (Space Mono / Inter) carregam de forma assíncrona e podem mudar
// a largura/altura do botão depois da primeira medição. Recalcula quando terminam.
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(adjustBottomSpace);
}

// ---------- Inicialização ----------
createColumns();
generatePalette();
adjustBottomSpace();

// Segunda checagem após um pequeno delay, para garantir que o layout
// já estabilizou (barra do navegador, fontes, etc.) antes da medição final.
setTimeout(adjustBottomSpace, 300);
