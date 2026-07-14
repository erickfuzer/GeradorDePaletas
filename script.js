// ---------- Elementos principais ----------
const paletteEl = document.getElementById('palette');
const generateBtn = document.getElementById('generateBtn');
const NUM_COLORS = 5;

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

    const hexCode = document.createElement('span');
    hexCode.className = 'hex-code';

    const copiedMsg = document.createElement('span');
    copiedMsg.className = 'copied-msg';
    copiedMsg.textContent = 'Copiado!';

    column.appendChild(hexCode);
    column.appendChild(copiedMsg);
    paletteEl.appendChild(column);

    // Clicar no código copia a cor para a área de transferência
    hexCode.addEventListener('click', () => copyToClipboard(hexCode, copiedMsg));
  }
}

/**
 * Gera 5 novas cores aleatórias e atualiza cada coluna.
 */
function generatePalette() {
  const columns = document.querySelectorAll('.color-column');

  columns.forEach((column) => {
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
 * Copia o código hex para a área de transferência e mostra o feedback visual.
 */
function copyToClipboard(hexCode, copiedMsg) {
  navigator.clipboard.writeText(hexCode.textContent).then(() => {
    copiedMsg.classList.add('show');
    setTimeout(() => copiedMsg.classList.remove('show'), 1000);
  });
}

// ---------- Eventos ----------
generateBtn.addEventListener('click', generatePalette);

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault(); // evita rolar a página
    generatePalette();
  }
});

// ---------- Inicialização ----------
createColumns();
generatePalette();
