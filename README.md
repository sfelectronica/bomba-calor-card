# Bomba de Calor Card

Um cartão personalizado para Home Assistant focado na visualização de sistemas de Bomba de Calor, com animações de fluxo, ventiladores e tubagens.

## Instalação via HACS

1. Certifique-se de que tem o [HACS](https://hacs.xyz/) instalado.
2. Vá a **HACS** > **Frontend**.
3. Clique no menu de 3 pontos no canto superior direito -> **Custom repositories**.
4. Adicione o URL deste repositório GitHub.
5. Categoria: **Lovelace**.
6. Clique em **Add** e depois instale o cartão.

## Configuração Manual

Adicione o seguinte ao seu `configuration.yaml` se não usar o modo GUI:

```yaml
lovelace:
  resources:
    - url: /hacsfiles/bomba-calor-card/bomba-calor-card.js
      type: module
```

## Imagem de Fundo

Por defeito, o cartão procura uma imagem em `/local/cardbomba.jpg`.
Deverá fazer upload da sua imagem de fundo para a pasta `www` do seu Home Assistant e configurar o caminho no editor visual do cartão.

## Funcionalidades

* Editor Visual completo.
* Animações de fluxo (tubos).
* Animações de ventiladores e bombas.
* Suporte a tanques de água.
* Grelha de posicionamento para facilitar a configuração.