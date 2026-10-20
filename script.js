// ---------- Elementos principais ----------
const paletteEl = document.getElementById('palette');
const generateBtn = document.getElementById('generateBtn');
const actionsEl = document.getElementById('actions');
const exportWrap = document.getElementById('exportWrap');
const exportBtn = document.getElementById('exportBtn');
const exportMenu = document.getElementById('exportMenu');
const toast = document.getElementById('toast');
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
 * Gera um código de cor hexadecimal aleatório, ex: "#3A86FF".
 * Multiplica por 0x1000000 (uma a mais que 0xFFFFFF) para o branco também poder sair.
 */
function getRandomHexColor() {
  const hex = Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0');
  return `#${hex}`.toUpperCase();
}

/**
 * Converte um hex ("#3A86FF") nos seus canais RGB, de 0 a 255.
 */
function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

/**
 * Converte RGB (0–255) em HSL: matiz em graus, saturação e luminosidade em %.
 */
function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  // Cinzas (delta 0) não têm matiz nem saturação
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;

    h *= 60;
    if (h < 0) h += 360;
  }

  return {
    h: Math.round(h) % 360,
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Textos prontos para exibir e copiar, ex: "rgb(58, 134, 255)" e "hsl(217, 100%, 61%)".
 */
function formatRgb(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${r}, ${g}, ${b})`;
}

function formatHsl(hex) {
  const { h, s, l } = rgbToHsl(hexToRgb(hex));
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Calcula o brilho de uma cor hex para decidir se o texto
 * sobre ela deve ser claro ou escuro (contraste legível).
 */
function isColorLight(hex) {
  const { r, g, b } = hexToRgb(hex);
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

    // RGB e HSL, em fonte menor, logo abaixo do hex
    const formats = document.createElement('div');
    formats.className = 'color-formats';

    const rgbCode = document.createElement('span');
    rgbCode.className = 'color-format rgb-code';

    const hslCode = document.createElement('span');
    hslCode.className = 'color-format hsl-code';

    formats.appendChild(rgbCode);
    formats.appendChild(hslCode);

    const copiedMsg = document.createElement('span');
    copiedMsg.className = 'copied-msg';
    copiedMsg.textContent = 'Copiado!';

    info.appendChild(lockBtn);
    info.appendChild(hexCode);
    info.appendChild(formats);
    column.appendChild(info);
    column.appendChild(copiedMsg);
    paletteEl.appendChild(column);

    // Clicar em qualquer código (hex, RGB ou HSL) copia aquele formato
    [hexCode, rgbCode, hslCode].forEach((code) => {
      code.addEventListener('click', () => copyToClipboard(code.textContent, code, copiedMsg));
    });

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
    column.querySelector('.rgb-code').textContent = formatRgb(newColor);
    column.querySelector('.hsl-code').textContent = formatHsl(newColor);

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
 * Mede a altura real da barra de botões flutuante e reserva esse espaço na última
 * coluna (apenas no layout mobile, onde as colunas ficam empilhadas). Isso evita que
 * os botões sobreponham os códigos, mesmo se a barra quebrar em duas linhas
 * em telas muito estreitas.
 */
function adjustBottomSpace() {
  const isMobileLayout = window.innerWidth <= 700;

  if (isMobileLayout) {
    const buffer = 24; // respiro extra entre os códigos e os botões
    const spaceNeeded = actionsEl.offsetHeight + buffer;
    document.documentElement.style.setProperty('--btn-space', `${spaceNeeded}px`);
  } else {
    document.documentElement.style.setProperty('--btn-space', '0px');
  }
}

// ---------- Exportar ----------

/**
 * Lista os hex atuais da paleta, na ordem das colunas.
 */
function getPaletteColors() {
  return Array.from(document.querySelectorAll('.hex-code'), (hexCode) => hexCode.textContent);
}

/**
 * Mostra um aviso rápido acima dos botões (ex: "CSS copiado!").
 */
function showToast(text) {
  toast.textContent = text;
  clearTimeout(toast.hideTimer);
  toast.classList.add('show');
  toast.hideTimer = setTimeout(() => toast.classList.remove('show'), 1600);
}

function openExportMenu() {
  exportMenu.classList.add('open');
  exportBtn.setAttribute('aria-expanded', 'true');
  exportMenu.querySelector('.export-option').focus();
}

function closeExportMenu({ returnFocus = false } = {}) {
  if (!exportMenu.classList.contains('open')) return;

  exportMenu.classList.remove('open');
  exportBtn.setAttribute('aria-expanded', 'false');
  if (returnFocus) exportBtn.focus();
}

/**
 * Desenha a paleta num canvas (5 faixas com o hex de cada uma, no mesmo
 * estilo da página) e baixa como "paleta.png".
 */
async function exportPng() {
  const colors = getPaletteColors();
  const width = 1500;
  const height = 900;
  const stripeWidth = width / colors.length;
  const font = '700 34px "Space Mono", monospace';

  // O canvas só usa a Space Mono se ela já estiver carregada
  if (document.fonts) await document.fonts.load(font);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  colors.forEach((hex, i) => {
    const x = i * stripeWidth;
    const centerX = x + stripeWidth / 2;
    const centerY = height / 2;

    ctx.fillStyle = hex;
    ctx.fillRect(x, 0, stripeWidth, height);

    // "Pílula" translúcida atrás do código, como na página
    const pillWidth = ctx.measureText(hex).width + 56;
    const pillHeight = 68;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(centerX - pillWidth / 2, centerY - pillHeight / 2, pillWidth, pillHeight, pillHeight / 2);
    } else {
      ctx.rect(centerX - pillWidth / 2, centerY - pillHeight / 2, pillWidth, pillHeight);
    }
    ctx.fill();

    ctx.fillStyle = isColorLight(hex) ? '#1a1a1a' : '#f5f5f5';
    ctx.fillText(hex, centerX, centerY);
  });

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'paleta.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Imagem baixada!');
  }, 'image/png');
}

/**
 * Copia a paleta como variáveis CSS, ex: ":root { --cor-1: #3A86FF; … }".
 */
function exportCss() {
  const variables = getPaletteColors().map((hex, i) => `  --cor-${i + 1}: ${hex};`);
  const css = `:root {\n${variables.join('\n')}\n}`;

  navigator.clipboard.writeText(css)
    .then(() => showToast('CSS copiado!'))
    .catch(() => showToast('Não foi possível copiar'));
}

// ---------- Eventos ----------
generateBtn.addEventListener('click', generatePalette);

exportBtn.addEventListener('click', () => {
  if (exportMenu.classList.contains('open')) {
    closeExportMenu();
  } else {
    openExportMenu();
  }
});

exportMenu.addEventListener('click', (event) => {
  const option = event.target.closest('.export-option');
  if (!option) return;

  closeExportMenu({ returnFocus: true });
  if (option.dataset.format === 'png') exportPng();
  if (option.dataset.format === 'css') exportCss();
});

// Setas navegam entre as opções; Tab fecha o menu e volta para o botão "Exportar"
exportMenu.addEventListener('keydown', (event) => {
  const options = Array.from(exportMenu.querySelectorAll('.export-option'));
  const current = options.indexOf(document.activeElement);

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const step = event.key === 'ArrowDown' ? 1 : -1;
    options[(current + step + options.length) % options.length].focus();
  } else if (event.key === 'Tab') {
    event.preventDefault();
    closeExportMenu({ returnFocus: true });
  }
});

// Clicar fora do menu fecha
document.addEventListener('click', (event) => {
  if (!exportWrap.contains(event.target)) closeExportMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeExportMenu({ returnFocus: exportWrap.contains(document.activeElement) });
    return;
  }

  if (event.code === 'Space') {
    // Dentro do menu de exportar, o Espaço ativa a opção em foco em vez de gerar
    if (exportMenu.contains(document.activeElement)) return;

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
// a largura/altura dos botões depois da primeira medição. Recalcula quando terminam.
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
