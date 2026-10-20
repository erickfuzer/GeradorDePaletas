<div align="center">

# 🎨 Gerador de Paletas

Gere paletas de **5 cores aleatórias** com um clique (ou com a barra de espaço) e copie o código de qualquer cor na hora.

[![Testar online](https://img.shields.io/badge/▶_Testar_online-264653?style=for-the-badge)](https://erickfuzer.github.io/GeradorDePaletas/)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

<img src="assets/preview.png" alt="Gerador de Paletas mostrando cinco colunas de cor com seus códigos hexadecimais" width="760">

</div>

---

## Funcionalidades

- **5 cores aleatórias** a cada geração, com transição suave entre uma paleta e outra
- **Copiar com um clique:** toque no código hex e ele vai para a área de transferência, com o aviso *"Copiado!"*
- **Atalho de teclado:** aperte <kbd>Espaço</kbd> para gerar uma nova paleta
- **Texto sempre legível:** a cor do código muda entre claro e escuro conforme o brilho do fundo
- **Responsivo:** no celular as colunas viram faixas empilhadas e o botão nunca cobre o último código

<details>
<summary>Ver no celular</summary>
<br>
<img src="assets/preview-mobile.png" alt="Versão mobile com as cores empilhadas" width="260">
</details>

## Como usar

**Online:** acesse **[erickfuzer.github.io/GeradorDePaletas](https://erickfuzer.github.io/GeradorDePaletas/)**.

**No seu computador:**

```bash
git clone https://github.com/erickfuzer/GeradorDePaletas.git
```

Depois é só abrir o `index.html` no navegador. Não precisa instalar nada.

> O botão de copiar usa a Clipboard API, que só funciona em `https://` ou `localhost`. Se abrir o arquivo direto e a cópia falhar, use a versão online.

## Estrutura

```
GeradorDePaletas/
├── index.html    # estrutura da página
├── style.css     # layout das colunas, botão e versão mobile
├── script.js     # geração das cores, cópia e atalho de teclado
└── assets/       # imagens do README
```

## Como funciona

- Cada cor é um número aleatório entre `0x000000` e `0xFFFFFF`, convertido para hexadecimal.
- Para decidir a cor do texto, o script calcula o **brilho percebido** da cor com a fórmula `(R × 299 + G × 587 + B × 114) / 1000`. Acima de 150, o texto fica escuro; abaixo, claro.

## Próximas ideias

- [ ] Travar uma cor para ela não mudar na próxima geração
- [ ] Mostrar também os valores em RGB e HSL
- [ ] Exportar a paleta como imagem ou CSS

## Licença

Distribuído sob a licença [MIT](LICENSE). Use, modifique e compartilhe à vontade.

<div align="center">
<sub>Feito por <a href="https://github.com/erickfuzer">Erick Fuzer</a></sub>
</div>
