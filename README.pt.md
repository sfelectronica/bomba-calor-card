<div align="right">
  <a href="README.md">🇺🇸 English</a> | <b>🇵🇹 Português</b>
</div>

# Bomba de Calor Card

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=sfelectronica&repository=bomba-calor-card&category=plugin)

Um cartão personalizado para Home Assistant focado na visualização de sistemas de Bomba de Calor, com animações de fluxo, ventiladores e tubagens.

<p align="center">
  <img src="https://github.com/sfelectronica/bomba-calor-card/blob/main/docs/preview.gif?raw=true" alt="Preview Cartão em Funcionamento Bomba de Calor" width="48%">
  &nbsp;
  <img src="https://github.com/sfelectronica/bomba-calor-card/blob/main/docs/previewp.gif?raw=true" alt="Preview Cartão Caldeira Pellets" width="48%">
</p>

## Instalação via HACS

Clique no botão acima "Open in HACS" ou siga os passos manuais:

1. Certifique-se de que tem o [HACS](https://hacs.xyz/) instalado.
2. Vá a **HACS** > **Frontend**.
3. Clique no menu de 3 pontos no canto superior direito -> **Custom repositories**.
4. Adicione o URL deste repositório GitHub: `https://github.com/sfelectronica/bomba-calor-card`
5. Categoria: **Lovelace**.
6. Clique em **Add** e depois instale o cartão.

## Instalação Manual

1. Descarregue o ficheiro `bomba-calor-card.js` deste repositório.
2. Copie o ficheiro para a pasta `/config/www/community/bomba-calor-card/` no seu Home Assistant (crie a pasta se não existir).
3. Adicione o recurso ao seu Dashboard.

Se usar o modo YAML (`configuration.yaml`), adicione o seguinte:

```yaml
lovelace:
  resources:
    - url: /local/community/bomba-calor-card/bomba-calor-card.js
      type: module
```

## Imagem de Fundo

Por defeito, o cartão procura uma imagem em `/local/cardbomba.jpg`.
Deverá fazer upload da sua imagem de fundo para a pasta `www` do seu Home Assistant e configurar o caminho no editor visual do cartão.

### Download das Imagens
Pode descarregar as imagens de exemplo diretamente do repositório:
- Imagem de Fundo Principal (BombaGold.png)
- Imagem da Bomba (pumpgold.png)

## Funcionalidades

Este cartão oferece um conjunto robusto de ferramentas para criar esquemas hidráulicos e térmicos animados:

### 1. Editor Visual Integrado
*   **Configuração "Point-and-Click":** Clique diretamente na imagem de pré-visualização para posicionar sensores, bombas e ventiladores.
*   **Ferramenta de Desenho de Tubos:** Desenhe caminhos complexos e curvos (Curvas de Bézier) clicando na imagem, com ajuste de tensão das curvas.
*   **Drag-and-Drop:** Reordene as entidades na lista arrastando-as.
*   **Grelha de Guias:** Grelha auxiliar para alinhamento preciso dos elementos.
*   **Backup e Restauro:** Exporte e importe a configuração completa do cartão em formato JSON.
*   **Multi-Idioma:** Interface disponível em Português, Inglês, Espanhol, Francês e Alemão.

### 2. Gestão de Entidades
*   Suporte para múltiplos sensores (temperaturas, pressões, consumos).
*   **Personalização Visual:** Nome, Ícone, Cor do Texto, Cor do Ícone e Cor de Fundo (Badge).
*   **Ações de Clique (Tap Actions):** Configure o que acontece ao clicar numa entidade: abrir mais informações, alternar o estado (`toggle`), navegar para outra página do Home Assistant ou chamar um serviço.
*   **Visibilidade Condicional:** Esconda ou mostre uma entidade com base no estado de outra (ex: mostrar temperatura dos painéis apenas se a bomba solar estiver ligada).
*   **Formatação de Valores:**
    *   **Unidade Personalizada:** Substitua a unidade de medida original (ex: de `W` para `Watts`) ou remova-a.
    *   **Multiplicador:** Aplique um fator de multiplicação ao valor do sensor (útil para conversões como W -> kW).
    *   **Casas Decimais:** Defina o número de casas decimais a exibir.
*   **Ocultar Estado:** Mostre apenas o ícone da entidade, escondendo o valor numérico, para um visual mais limpo.
*   **Alerta Visual:** Ative um efeito de piscar (blink) no badge da entidade quando o seu valor ultrapassa os limiares definidos.
*   **Cores Dinâmicas:** Altere a cor do ícone automaticamente com base em valores limite (ex: Azul se < 10º, Vermelho se > 60º).
*   **Estilo de Fonte:** Ajuste individual do tamanho e peso da fonte (Normal ou Negrito).

### 3. Switches e Botões
*   **Switch Principal:** Botão dedicado para ligar/desligar um atuador principal (ex: bomba de recirculação).
*   **Switches Adicionais:** Adicione múltiplos botões de controlo em qualquer parte do diagrama.
*   **Personalização Completa:**
    *   Defina textos, ícones e cores para os estados `ligado` e `desligado`.
    *   Ajuste o tamanho do botão e do ícone.
    *   Escolha o estilo do botão: **Padrão**, **Quadrado**, **Redondo** ou **Transparente** (neste modo, apenas o ícone/texto assume a cor do estado).
    *   Adicione um rótulo de texto opcional acima de cada switch.

### 4. Animações de Fluxo (Tubagens)
Crie representações visuais do fluido a passar nos tubos:
*   **Estilos de Linha:** Tracejado (`Dashes`), Pontos (`Dots`), Brilho (`Shimmer`), Pulsação (`Pulse`) e Cometa (`Comet`).
*   **Gradientes:** Defina cor inicial e final para simular aquecimento ou arrefecimento ao longo do tubo.
*   **Lógica de Ativação:** As animações podem ser ativadas pelo estado da entidade (ex: "on") ou por um **Limiar Numérico** (ex: ativar apenas se potência > 20W).
*   Controlo de velocidade, largura e tamanho do rastro.
*   **Modo Baixo Desempenho:** Opção para desativar efeitos pesados (blur) para maior fluidez em dispositivos antigos.

### 5. Componentes Dinâmicos
*   **Ventiladores:**
    *   Simulação 3D com ajuste de inclinação (Tilt) e perspetiva (Skew).
    *   Rotação animada com velocidade ajustável.
    *   Opção de rotação inversa.
*   **Bombas Circuladoras:**
    *   Animação de rotor giratório.
    *   Suporte para **Imagens Personalizadas** (carregue a sua própria imagem de bomba, que irá rodar).
*   **Tanques de Água:**
    *   **Estilos Visuais:** Bolhas (`Bubbles`), Ondas (`Waves`), Ondulação (`Ripple`), **Fogo** (`Fire`) e **Jato** (`Jet`).
    *   **Efeito de Fogo (GIF):**
        *   Suporte para GIFs animados com transparência.
        *   **Coloração Dinâmica:** O fogo muda de cor (ex: Azul -> Vermelho) com base na temperatura definida.
        *   **Chama Interativa:** Opção para **redimensionar automaticamente** a animação (aumentar/diminuir o tamanho da chama) proporcionalmente à temperatura.
    *   **Efeito Jato (Jet):** Simula partículas a fluir (ex: enchimento de silos ou fluxo de ar).
        *   Suporta modo inverso (efeito de funil/sucção).
        *   Densidade de partículas ajustável.
    *   **Rotação:** Permite rodar o tanque e o seu conteúdo (útil para tubos horizontais ou inclinados).
    *   Cores, opacidade e dimensões configuráveis.

## Licença

Este projeto está licenciado sob a licença MIT - veja o ficheiro LICENSE para mais detalhes.
Basicamente: pode usar, modificar e distribuir livremente, mas sem garantias de funcionamento ou responsabilidade por parte do autor.