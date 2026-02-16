console.info("%c BOMBA-CALOR-CARD %c 1.0.0 ", "color: white; background: #2681DC; font-weight: bold;", "color: #2681DC; background: white; font-weight: bold;");

class BombaCalorCard extends HTMLElement {
  setConfig(config) {
    // Cria uma cópia profunda para evitar erros de objeto congelado/não extensível
    this.config = JSON.parse(JSON.stringify(config));
    
    if (!this.config.entities) this.config.entities = [];
    if (!this.config.names) this.config.names = [];
    if (!this.config.colors) this.config.colors = [];
    if (!this.config.icons) this.config.icons = [];
    if (!this.config.badge_colors) this.config.badge_colors = [];
    if (!this.config.icon_colors) this.config.icon_colors = [];
    if (!this.config.font_sizes) this.config.font_sizes = [];
    if (!this.config.visible) this.config.visible = [];
    if (!this.config.show_labels) this.config.show_labels = [];
    if (!this.config.positions) this.config.positions = [];
    if (!this.config.animations) this.config.animations = [];
    if (!this.config.view_box) this.config.view_box = "0 0 100 180";
    if (!this.config.image) this.config.image = "/local/cardbomba.jpg";
    if (this.config.badge_opacity === undefined) this.config.badge_opacity = 0.4;
    if (this.config.image_opacity === undefined) this.config.image_opacity = 1;
    if (this.config.show_grid === undefined) this.config.show_grid = false;
    if (!this.config.water_tanks) this.config.water_tanks = [];
    if (!this.config.fans) this.config.fans = [];
    if (!this.config.pumps) this.config.pumps = [];

    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.content) return;
    this.updateStates();
  }

  render() {
    const root = this.shadowRoot;
    root.innerHTML = `
      <style>
        :host { display: block; }
        ha-card {
          overflow: hidden;
        }
        .container {
          position: relative;
          width: 100%;
          padding-top: 180%;
        }
        .bg-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          z-index: 0;
          pointer-events: none;
        }
        .svg-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }
        .flow-path {
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          transition: opacity 0.3s;
        }
        .flow-active {
          animation: stroke-flow var(--anim-speed, 1.5s) linear infinite;
        }
        @keyframes stroke-flow {
          to { stroke-dashoffset: -400; }
        }
        
        /* Shimmer effect - igual ao HTML */
        .shimmer-path {
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          transition: opacity 0.3s;
        }
        
        .shimmer-gradient-path {
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          transition: opacity 0.3s;
          animation: shimmer-move var(--anim-speed, 1.5s) linear infinite;
        }
        
        @keyframes shimmer-move {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: -100; }
        }
        
        .entity {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          pointer-events: auto;
          cursor: pointer;
          transform: translate(-50%, -50%);
          z-index: 2;
        }
        .entity-label {
          font-size: 0.7rem;
          color: #ddd;
          text-shadow: 1px 1px 2px #000;
          margin-bottom: 2px;
          white-space: nowrap;
        }
        .entity-value {
          font-size: 0.9rem;
          font-weight: bold;
          color: #fff;
          background: rgba(0, 0, 0, ${this.config.badge_opacity});
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 2px 6px;
          border-radius: 10px;
          backdrop-filter: blur(2px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        .switch {
          cursor: pointer;
          pointer-events: auto;
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(0,0,0,0.5);
          color: white;
          text-shadow: 0 0 2px black;
        }
        .flow {
          animation: flow 1.2s linear infinite;
        }
        @keyframes flow {
          0%   { transform: translate(-50%, -55%); opacity: 0.2; }
          50%  { transform: translate(-50%, -45%); opacity: 1; }
          100% { transform: translate(-50%, -55%); opacity: 0.2; }
        }
        .grid-dot {
          fill: rgba(255, 255, 255, 0.5);
          pointer-events: none;
        }
        .spin-active {
          animation: spin var(--spin-speed, 1s) linear infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .bubble {
          animation: bubble-rise 2s infinite ease-in;
          opacity: 0;
        }
        @keyframes bubble-rise {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-20px); opacity: 0; }
        }
      </style>
      <ha-card>
        <div class="container" id="container">
          <div class="bg-image" id="bg-image"></div>
          <svg class="svg-layer" id="svg-layer" viewBox="${this.config.view_box}" preserveAspectRatio="none"></svg>
        </div>
      </ha-card>
    `;

    const bgImg = root.getElementById("bg-image");
    bgImg.style.backgroundImage = `url(${this.config.image})`;
    bgImg.style.opacity = this.config.image_opacity;

    const cont = root.getElementById("container");
    this.content = cont;

    const defaultPositions = [
      { left: 18, top: 8 },
      { left: 82, top: 10 },
      { left: 18, top: 28 },
      { left: 82, top: 30 },
      { left: 18, top: 45 },
      { left: 82, top: 48 },
      { left: 18, top: 62 },
      { left: 82, top: 65 },
      { left: 18, top: 80 },
      { left: 82, top: 82 },
      { left: 50, top: 20 },
    ];

    // Renderizar Animações (Paths)
    const svgLayer = root.getElementById("svg-layer");
    let defs = svgLayer.querySelector("defs");
    if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        svgLayer.prepend(defs);
    }

    if (this.config.show_grid) {
      const vb = this.config.view_box.trim().split(/\s+/).map(Number);
      const minX = vb[0] || 0;
      const minY = vb[1] || 0;
      const width = vb[2] || 100;
      const height = vb[3] || 180;
      const step = 10;

      const gridGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      for (let x = minX; x <= minX + width; x += step) {
        for (let y = minY; y <= minY + height; y += step) {
          const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          circle.setAttribute("cx", x);
          circle.setAttribute("cy", y);
          circle.setAttribute("r", 0.5);
          circle.classList.add("grid-dot");
          gridGroup.appendChild(circle);
        }
      }
      svgLayer.appendChild(gridGroup);
    }

    this.animEls = [];
    (this.config.animations || []).forEach((anim, i) => {
      if (!anim.path) return;
      const style = anim.style || 'dashes';
      
      let strokeColor = anim.color || "#2681DC";
      if (anim.color_end) {
        const gradId = `anim-grad-${i}-${Date.now()}`;
        const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        grad.setAttribute("id", gradId);
        
        // Tenta extrair coordenadas para alinhar o gradiente com o início e fim do caminho
        const coords = anim.path.match(/[-+]?\d*\.?\d+/g);
        if (coords && coords.length >= 4) {
            grad.setAttribute("gradientUnits", "userSpaceOnUse");
            grad.setAttribute("x1", coords[0]);
            grad.setAttribute("y1", coords[1]);
            grad.setAttribute("x2", coords[coords.length - 2]);
            grad.setAttribute("y2", coords[coords.length - 1]);
        } else {
            grad.setAttribute("x1", "0%");
            grad.setAttribute("y1", "0%");
            grad.setAttribute("x2", "100%");
            grad.setAttribute("y2", "0%");
        }
        
        const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop1.setAttribute("offset", "0%");
        stop1.setAttribute("stop-color", strokeColor);
        grad.appendChild(stop1);

        const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop2.setAttribute("offset", "100%");
        stop2.setAttribute("stop-color", anim.color_end);
        grad.appendChild(stop2);

        defs.appendChild(grad);
        strokeColor = `url(#${gradId})`;
      }

      if (style === 'shimmer') {
        const baseStrokeWidth = anim.width || 2;
        const pathLength = 100; // Usamos pathLength=100 para facilitar a animação
        
        // Criar caminho base (fino, baixa opacidade) - igual ao HTML
        const basePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        basePath.setAttribute("d", anim.path);
        basePath.setAttribute("stroke", strokeColor);
        basePath.setAttribute("stroke-width", baseStrokeWidth);
        basePath.setAttribute("fill", "none");
        basePath.setAttribute("pathLength", pathLength);
        basePath.classList.add("shimmer-path");
        basePath.style.opacity = "0.2";
        svgLayer.appendChild(basePath);
        
        // Criar máscara para o efeito shimmer
        const maskId = `shimmer-mask-${i}-${Date.now()}`;
        const filterId = `shimmer-blur-${i}-${Date.now()}`;
        
        // Filter para blur (bordas suaves)
        const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        filter.setAttribute("id", filterId);
        filter.setAttribute("x", "-50%");
        filter.setAttribute("y", "-50%");
        filter.setAttribute("width", "250%");
        filter.setAttribute("height", "250%");
        
        const blur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
        blur.setAttribute("stdDeviation", "2");
        filter.appendChild(blur);
        defs.appendChild(filter);
        
        // Máscara com stroke animado
        const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
        mask.setAttribute('id', maskId);
        
        const maskPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        maskPath.setAttribute("d", anim.path);
        maskPath.setAttribute("fill", "none");
        maskPath.setAttribute("stroke", "white");
        maskPath.setAttribute("stroke-width", "8");
        maskPath.setAttribute("stroke-linecap", "round");
        maskPath.setAttribute("pathLength", pathLength);
        const dashVis = parseFloat(anim.mask_dash || "30");
        maskPath.setAttribute("stroke-dasharray", `${dashVis} ${100 - dashVis}`);
        maskPath.setAttribute("filter", `url(#${filterId})`);
        maskPath.classList.add("shimmer-gradient-path");
        maskPath.style.setProperty('--anim-speed', `${anim.speed || 1.5}s`);
        
        mask.appendChild(maskPath);
        defs.appendChild(mask);
        
        // Grupo com as camadas de brilho (igual ao HTML)
        const shimmerGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        shimmerGroup.setAttribute("mask", `url(#${maskId})`);
        shimmerGroup.classList.add("shimmer-path");
        shimmerGroup.style.opacity = "0.1";
        
        // Múltiplas camadas para efeito mais rico
        const layers = [
          { width: baseStrokeWidth + 2, color: strokeColor, opacity: 0.6 },
          { width: baseStrokeWidth + 1, color: strokeColor, opacity: 0.8 },
          { width: baseStrokeWidth - 0.5, color: '#ffffff', opacity: 0.7 }
        ];
        
        layers.forEach(layer => {
          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("d", anim.path);
          path.setAttribute("stroke", layer.color);
          path.setAttribute("stroke-width", layer.width);
          path.setAttribute("stroke-linecap", "round");
          path.setAttribute("fill", "none");
          path.style.opacity = layer.opacity;
          shimmerGroup.appendChild(path);
        });
        
        svgLayer.appendChild(shimmerGroup);
        
        this.animEls.push({ 
          config: anim, 
          type: 'shimmer', 
          groupEl: shimmerGroup, 
          maskPathEl: maskPath,
          basePath: basePath
        });
        
      } else {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", anim.path);
        path.setAttribute("stroke", strokeColor);
        path.setAttribute("stroke-width", anim.width || 2);
        path.setAttribute("stroke-dasharray", style === 'dots' ? (anim.dash || "2 8") : (anim.dash || "10 5"));
        path.setAttribute("stroke-linecap", "round");
        path.classList.add("flow-path");
        path.style.opacity = "0.1";
        svgLayer.appendChild(path);
        this.animEls.push({ config: anim, type: 'dash', el: path });
      }
    });

    // Renderizar Tanques de Água
    this.tankEls = [];
    (this.config.water_tanks || []).forEach((tank, i) => {
        if (!tank.width || !tank.height) return;
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("transform", `translate(${tank.x}, ${tank.y})`);
        group.style.opacity = tank.opacity || 0.5;

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("width", tank.width);
        rect.setAttribute("height", tank.height);
        rect.setAttribute("fill", "none"); // Apenas bolhas visíveis
        rect.setAttribute("stroke", "none");
        rect.setAttribute("rx", "2");
        group.appendChild(rect);

        // Bolhas
        const bubbleGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        for (let b = 0; b < 5; b++) {
            const bubble = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            bubble.setAttribute("cx", Math.random() * tank.width);
            bubble.setAttribute("cy", tank.height - 2);
            bubble.setAttribute("r", Math.random() * 1.5 + 0.5);
            bubble.setAttribute("fill", tank.bubble_color || "rgba(255,255,255,0.7)");
            bubble.classList.add("bubble");
            bubble.style.animationDelay = `${Math.random() * 2}s`;
            bubble.style.animationDuration = `${1.5 + Math.random()}s`;
            bubbleGroup.appendChild(bubble);
        }
        group.appendChild(bubbleGroup);
        svgLayer.appendChild(group);
        this.tankEls.push({ config: tank, group: bubbleGroup });
    });

    // Renderizar Ventiladores
    this.fanEls = [];
    (this.config.fans || []).forEach((fan, i) => {
        const size = fan.size || 20;
        const tilt = fan.tilt !== undefined ? fan.tilt : 0; // 0 a 1 (0 = redondo, 0.8 = muito achatado)
        const rotate = fan.rotate || 0;
        const skew = fan.skew || 0;
        const scaleY = 1 - Math.min(Math.max(tilt, 0), 0.9);
        
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("transform", `translate(${fan.x}, ${fan.y}) rotate(${rotate}) skewX(${skew})`);
        group.style.opacity = fan.opacity || 1;

        // Grupo interno para aplicar a escala (inclinação) sem afetar a posição
        const tiltGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        tiltGroup.setAttribute("transform", `scale(1, ${scaleY})`);
        
        const blades = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const r = size / 2;
        blades.setAttribute("d", `M0,0 
            C${r*0.5},${-r} ${r},${-r*0.5} 0,0 
            C${r},${r*0.5} ${r*0.5},${r} 0,0 
            C${-r*0.5},${r} ${-r},${r*0.5} 0,0 
            C${-r},${-r*0.5} ${-r*0.5},${-r} 0,0 Z`);
        blades.setAttribute("fill", fan.color || "#ffffff");
        if (fan.stroke_color) {
            blades.setAttribute("stroke", fan.stroke_color);
            blades.setAttribute("stroke-width", fan.stroke_width || 1);
        }
        blades.style.setProperty('--spin-speed', `${fan.speed || 1}s`);
        if (fan.reverse) {
            blades.style.animationDirection = "reverse";
        }
        
        tiltGroup.appendChild(blades);
        group.appendChild(tiltGroup);
        svgLayer.appendChild(group);
        this.fanEls.push({ config: fan, el: blades });
    });

    // Renderizar Bombas
    this.pumpEls = [];
    (this.config.pumps || []).forEach((pump, i) => {
        const size = pump.size || 15;
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("transform", `translate(${pump.x}, ${pump.y})`);
        group.style.opacity = pump.opacity || 1;

        let animEl;
        
        if (pump.image) {
            const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
            img.setAttribute("href", pump.image);
            img.setAttribute("x", -size/2);
            img.setAttribute("y", -size/2);
            img.setAttribute("width", size);
            img.setAttribute("height", size);
            group.appendChild(img);
            animEl = img;
        } else {
            const body = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            body.setAttribute("r", size / 2);
            body.setAttribute("fill", pump.color || "#ffffff");
            group.appendChild(body);
            const rotor = document.createElementNS("http://www.w3.org/2000/svg", "path");
            rotor.setAttribute("d", `M-${size/4},0 L${size/4},0 M0,-${size/4} L0,${size/4}`);
            rotor.setAttribute("stroke", "black");
            rotor.setAttribute("stroke-width", "2");
            group.appendChild(rotor);
            animEl = rotor;
        }
        animEl.style.setProperty('--spin-speed', `${pump.speed || 1}s`);
        if (pump.reverse) {
            animEl.style.animationDirection = "reverse";
        }
        svgLayer.appendChild(group);
        this.pumpEls.push({ config: pump, el: animEl });
    });

    this.entityEls = [];
    (this.config.entities || []).forEach((ent, idx) => {
      // Se não houver entidade definida, ignoramos
      // Verifica também se está visível (padrão true se undefined)
      if (!ent || this.config.visible[idx] === false) return;
      
      const p = this.config.positions[idx] || defaultPositions[idx];
      const name = this.config.names[idx] || `Nome ${idx + 1}`;
      const color = this.config.colors[idx] || "#ffffff";
      const icon = this.config.icons[idx] || "";
      const badgeColor = this.config.badge_colors[idx];
      const iconColor = this.config.icon_colors[idx] || "#ffffff";
      const fontSize = this.config.font_sizes[idx] || "";
      const showLabel = this.config.show_labels[idx] !== false;
      const defPos = defaultPositions[idx] || { left: 5, top: 90 };

      // Calcula a cor de fundo com a opacidade configurada
      let bgStyle = `rgba(0, 0, 0, ${this.config.badge_opacity})`;
      if (badgeColor && /^#[0-9A-F]{6}$/i.test(badgeColor)) {
        const r = parseInt(badgeColor.substring(1, 3), 16);
        const g = parseInt(badgeColor.substring(3, 5), 16);
        const b = parseInt(badgeColor.substring(5, 7), 16);
        bgStyle = `rgba(${r}, ${g}, ${b}, ${this.config.badge_opacity})`;
      } else if (badgeColor) {
        // Fallback para cores nomeadas ou outras, usando color-mix se suportado ou apenas a cor
        bgStyle = badgeColor; 
      }

      const div = document.createElement("div");
      div.classList.add("entity");
      div.style.left = (p?.left ?? defPos.left) + "%";
      div.style.top = (p?.top ?? defPos.top) + "%";
      
      // Estrutura: Label (Nome) + Valor
      div.innerHTML = `
        ${showLabel ? `<div class="entity-label">${name}</div>` : ""}
        <div class="entity-value" style="color: ${color}; background: ${bgStyle}; ${fontSize ? `font-size: ${fontSize};` : ''}">
          ${icon ? `<ha-icon icon="${icon}" style="--mdc-icon-size: 14px; color: ${iconColor};"></ha-icon>` : ""}
          <span class="state-value">--</span>
        </div>
      `;
      
      div.addEventListener("click", (e) => this._handleEntityClick(e, ent, idx));
      
      cont.appendChild(div);
      // Guardamos referência para o elemento do valor para atualizar depois
      const valEl = div.querySelector(".state-value");
      const labelEl = div.querySelector(".entity-label");
      this.entityEls.push({ ent, el: valEl, labelEl, idx });
    });

    // switch
    if (this.config.switch) {
      const p = this.config.switch_position || { left: 10, top: 50 };
      const swDiv = document.createElement("div");
      swDiv.classList.add("entity", "switch");
      swDiv.style.left = p.left + "%";
      swDiv.style.top = p.top + "%";
      swDiv.addEventListener("click", () => {
        if (!this._hass) return;
        this._hass.callService("switch", "toggle", {
          entity_id: this.config.switch,
        });
      });
      cont.appendChild(swDiv);
      this.switchEl = swDiv;
    }

    // animação de fluxo
    const flowPos = this.config.flow_position || { left: 40, top: 55 };
    const flow = document.createElement("div");
    flow.classList.add("entity");
    flow.style.left = flowPos.left + "%";
    flow.style.top = flowPos.top + "%";
    flow.innerHTML = "⬇";
    cont.appendChild(flow);
    this.flowEl = flow;

    this.updateStates();
  }

  _isActive(config, stateObj) {
    if (!stateObj) return false;
    if (config.threshold !== undefined && config.threshold !== null && config.threshold !== "") {
      const val = parseFloat(stateObj.state);
      if (!isNaN(val)) {
        return val > Number(config.threshold);
      }
    }
    const targetState = config.state_on || "on";
    return stateObj.state === targetState;
  }

  _handleEntityClick(e, entityId, index) {
    e.stopPropagation();
    
    // Detecção manual robusta de modo de edição percorrendo a árvore DOM
    let isEditing = false;
    let el = this;
    while (el) {
      if (el.tagName && (
        el.tagName.toUpperCase() === "HUI-CARD-PREVIEW" || 
        el.tagName.toUpperCase() === "HUI-DIALOG-EDIT-CARD"
      )) {
        isEditing = true;
        break;
      }
      if (el.parentNode) {
        el = el.parentNode;
      } else if (el.getRootNode && el.getRootNode() instanceof ShadowRoot) {
        el = el.getRootNode().host;
      } else {
        break;
      }
    }

    if (!isEditing) {
      // 1. Abrir Histórico (More Info)
      const event = new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId },
      });
      this.dispatchEvent(event);
    }

    // 2. Focar no Editor (se estiver aberto)
    const focusEvent = new CustomEvent("bomba-calor-card-focus", {
      bubbles: true,
      composed: true,
      detail: { index },
    });
    window.dispatchEvent(focusEvent);
  }

  updateStates() {
    if (!this._hass || !this.entityEls) return;

    this.entityEls.forEach(({ ent, el, labelEl, idx }) => {
      const st = this._hass.states[ent];
      if (!st) {
        el.textContent = ent;
        return;
      }

      let value = st.state;

      // número -> 1 casa decimal
      const num = Number(value);
      if (!Number.isNaN(num)) {
        value = num.toFixed(1);
      }

      const unit = st.attributes.unit_of_measurement || "";
      el.textContent = `${value} ${unit}`.trim();
    });

    // Atualizar Animações
    this.animEls.forEach(({ config, el, type, groupEl, maskPathEl, basePath }) => {
      const stateObj = this._hass.states[config.entity];
      const isActive = this._isActive(config, stateObj);
      
      if (type === 'shimmer') {
        // Controlar opacidade do grupo de brilho
        groupEl.style.opacity = isActive ? "1" : "0.1";
        // O caminho base fica sempre visível com baixa opacidade
        if (basePath) basePath.style.opacity = isActive ? "0.2" : "0.1";
        
        // Controlar animação da máscara
        if (isActive) {
          maskPathEl.style.animation = `shimmer-move ${config.speed || 1.5}s linear infinite`;
        } else {
          maskPathEl.style.animation = 'none';
          maskPathEl.style.strokeDashoffset = '100'; // Reset para início
        }
        
        maskPathEl.style.setProperty('--anim-speed', `${config.speed || 1.5}s`);
      } else { // dash and dots
        el.style.opacity = isActive ? "1" : "0.1";
        el.style.setProperty('--anim-speed', `${config.speed || 1.5}s`);
        isActive ? el.classList.add("flow-active") : el.classList.remove("flow-active");
      }
    });

    // Atualizar Tanques
    this.tankEls.forEach(({ config, group }) => {
        const stateObj = this._hass.states[config.entity];
        const isActive = this._isActive(config, stateObj);
        group.style.display = isActive ? "block" : "none";
    });

    // Atualizar Ventiladores
    this.fanEls.forEach(({ config, el }) => {
        const stateObj = this._hass.states[config.entity];
        const isActive = this._isActive(config, stateObj);
        isActive ? el.classList.add("spin-active") : el.classList.remove("spin-active");
    });

    // Atualizar Bombas
    this.pumpEls.forEach(({ config, el }) => {
        const stateObj = this._hass.states[config.entity];
        const isActive = this._isActive(config, stateObj);
        isActive ? el.classList.add("spin-active") : el.classList.remove("spin-active");
    });

    if (this.config.switch && this.switchEl) {
      const sw = this._hass.states[this.config.switch];
      if (sw) {
        this.switchEl.textContent = sw.state === "on" ? "ON" : "OFF";
        this.switchEl.style.background =
          sw.state === "on" ? "rgba(0,150,0,0.7)" : "rgba(100,0,0,0.7)";
        if (this.flowEl) {
          if (sw.state === "on") this.flowEl.classList.add("flow");
          else this.flowEl.classList.remove("flow");
        }
      }
    }
  }

  getCardSize() {
    return 6;
  }

  static getConfigElement() {
    return document.createElement("bomba-calor-card-editor");
  }

  static getStubConfig() {
    return {
      image: "/local/cardbomba.jpg",
      entities: [],
      names: [],
      positions: [],
      switch: "",
      switch_position: { left: 10, top: 50 },
      flow_position: { left: 40, top: 55 },
    };
  }
}

customElements.define("bomba-calor-card", BombaCalorCard);

class BombaCalorCardEditor extends HTMLElement {
  constructor() {
    super();
    this._focusHandler = this._handleFocusEvent.bind(this);
  }

  setConfig(config) {
    this._config = JSON.parse(JSON.stringify(config));
    
    if (!this._config.image) this._config.image = "/local/cardbomba.jpg";
    if (!this._config.entities) this._config.entities = [];
    if (!this._config.names) this._config.names = [];
    if (!this._config.colors) this._config.colors = [];
    if (!this._config.icons) this._config.icons = [];
    if (!this._config.badge_colors) this._config.badge_colors = [];
    if (!this._config.icon_colors) this._config.icon_colors = [];
    if (!this._config.font_sizes) this._config.font_sizes = [];
    if (!this._config.visible) this._config.visible = [];
    if (!this._config.show_labels) this._config.show_labels = [];
    if (!this._config.positions) this._config.positions = [];
    if (!this._config.animations) this._config.animations = [];
    if (!this._config.view_box) this._config.view_box = "0 0 100 180";
    if (!this._config.switch_position) this._config.switch_position = { left: 10, top: 50 };
    if (!this._config.flow_position) this._config.flow_position = { left: 40, top: 55 };
    if (this._config.badge_opacity === undefined) this._config.badge_opacity = 0.4;
    if (this._config.image_opacity === undefined) this._config.image_opacity = 1;
    if (this._config.show_grid === undefined) this._config.show_grid = false;
    if (!this._config.water_tanks) this._config.water_tanks = [];
    if (!this._config.fans) this._config.fans = [];
    if (!this._config.pumps) this._config.pumps = [];

    // Garante mínimo de 11 itens
    while (this._config.entities.length < 11) {
      this._config.entities.push("");
      this._config.names.push("");
      this._config.colors.push("#ffffff");
      this._config.icons.push("");
      this._config.badge_colors.push("");
      this._config.icon_colors.push("#ffffff");
      this._config.font_sizes.push("");
      this._config.visible.push(true);
      this._config.show_labels.push(true);
      this._config.positions.push({});
    }

    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
    this.render();
  }

  connectedCallback() {
    this._loadRequiredComponents();
    window.addEventListener("bomba-calor-card-focus", this._focusHandler);
  }

  disconnectedCallback() {
    window.removeEventListener("bomba-calor-card-focus", this._focusHandler);
  }

  async _loadRequiredComponents() {
    if (!customElements.get("ha-entity-picker")) {
      const entitiesCard = customElements.get("hui-entities-card");
      if (entitiesCard) {
        await entitiesCard.getConfigElement();
      }
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (this.shadowRoot) {
      this.shadowRoot.querySelectorAll("ha-entity-picker").forEach((picker) => {
        picker.hass = hass;
      });
      this.shadowRoot.querySelectorAll("ha-icon-picker").forEach((picker) => {
        picker.hass = hass;
      });
    }
  }

  render() {
    if (!this.shadowRoot) return;

    // Se já existe a estrutura, apenas atualiza os valores (evita recriar o DOM)
    // VERIFICAÇÃO MELHORADA: Usa data-version para forçar atualização da estrutura
    const container = this.shadowRoot.querySelector(".card-config");
    const currentEntities = this.shadowRoot.querySelectorAll(".entity-block").length;
    const currentVersion = container ? container.getAttribute("data-version") : "0";
    const currentAnims = this.shadowRoot.querySelectorAll(".anim-block").length;
    const currentTanks = this.shadowRoot.querySelectorAll(".tank-block").length;
    const currentFans = this.shadowRoot.querySelectorAll(".fan-block").length;
    const currentPumps = this.shadowRoot.querySelectorAll(".pump-block").length;
    
    // +2 blocos estáticos (Switch/Fluxo). Versão 3 adiciona preview e radios.
    if (container && currentVersion === "14" && currentEntities === this._config.entities.length + 2 && currentAnims === this._config.animations.length && currentTanks === this._config.water_tanks.length && currentFans === this._config.fans.length && currentPumps === this._config.pumps.length) {
      this._updateValues();
      return;
    }

    // Salvar estado do scroll e acordeões abertos
    let scrollTop = 0;
    const openIds = new Set();
    if (container) {
      scrollTop = container.scrollTop;
      this.shadowRoot.querySelectorAll("details").forEach(el => {
        if (el.open && el.id) openIds.add(el.id);
      });
    }

    // Renderização Inicial (Criação do DOM)
    this.shadowRoot.innerHTML = `
      <style>
        .row { margin: 4px 0; }
        label { display:block; font-size: 0.8rem; margin-bottom: 2px; }
        input, ha-entity-picker, ha-icon-picker { width: 100%; box-sizing: border-box; }
        ha-entity-picker, ha-icon-picker { display: block; margin-top: 8px; }
        .inline { display:flex; gap:6px; }
        .inline input { width:100%; }
        .section-title { font-weight: bold; margin-top: 16px; border-bottom: 1px solid #ccc; }
        .entity-block { margin-bottom: 8px; background: rgba(0,0,0,0.1); border-radius: 4px; }
        .anim-block { margin-bottom: 8px; background: rgba(0,0,0,0.1); border-radius: 4px; border-left: 4px solid #e6b800; }
        .tank-block, .fan-block, .pump-block { margin-bottom: 8px; background: rgba(0,0,0,0.1); border-radius: 4px; border-left: 4px solid #00bcd4; }
        .card-config { max-height: 80vh; overflow-y: auto; padding-right: 4px; }
        .item-title { 
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #2681DC; 
          color: white; 
          padding: 8px; 
          font-weight: bold; 
          border-radius: 4px; 
          cursor: pointer;
          list-style: none;
          user-select: none;
        }
        .item-title::after {
          content: "▼";
          font-size: 0.8em;
          transition: transform 0.2s;
        }
        details[open] .item-title::after {
          transform: rotate(180deg);
        }
        details[open] .item-title { border-bottom-left-radius: 0; border-bottom-right-radius: 0; }
        details > summary::-webkit-details-marker { display: none; }
        .entity-content { padding: 10px; border: 1px solid #2681DC; border-top: none; border-radius: 0 0 4px 4px; background: var(--primary-background-color); }
        .anim-content { padding: 10px; border: 1px solid #e6b800; border-top: none; border-radius: 0 0 4px 4px; background: var(--primary-background-color); }
        .entity-block[draggable="true"] { cursor: grab; }
        .entity-block.dragging { opacity: 0.5; border: 2px dashed #ccc; }
        .modal {
            display: none;
            position: fixed;
            z-index: 9999;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.8);
        }
        .modal-content {
            background-color: #1c1c1c;
            color: #e0e0e0;
            margin: 2% auto;
            padding: 20px;
            border: 1px solid #444;
            width: fit-content;
            max-width: 96%;
            max-height: 96%;
            display: flex;
            flex-direction: column;
        }
        .close { color: #aaa; align-self: flex-end; font-size: 28px; font-weight: bold; cursor: pointer; }
        .close:hover { color: #fff; }
        .modal-image-container { 
            position: relative; 
            cursor: crosshair; 
            overflow: auto; 
            width: fit-content; 
            align-self: center; 
        }
        .modal-image-container img { display: block; max-height: 85vh; width: auto; }
        .pos-btn { width: 100%; padding: 8px; background-color: #2681DC; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 8px; }
        .pos-btn:hover { background-color: #1e6bb8; }
        .modal-svg-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
        .modal-controls { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
        .modal-btn { padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
        .btn-confirm { background-color: #28a745; color: white; }
        .btn-cancel { background-color: #dc3545; color: white; }
        .btn-undo { background-color: #ffc107; color: black; }
        .preview-point { fill: red; stroke: white; stroke-width: 1px; }
        .preview-line { stroke: yellow; stroke-width: 2px; fill: none; stroke-dasharray: 4 2; }
      </style>
      <div class="card-config" data-version="14">
        <div class="row">
          <label>Imagem</label>
          <input id="image">
        </div>
        <div class="row">
          <label>Opacidade da Imagem (0-1)</label>
          <input id="image_opacity" type="number" min="0" max="1" step="0.1">
        </div>
        
        <div class="row">
          <label>View Box (Coordenadas SVG: min-x min-y width height)</label>
          <input id="view_box">
          <div style="font-size: 0.7rem; color: #888; margin-top: 2px;">
            Define a área de coordenadas do SVG. Ex: "0 0 100 180" cria uma grelha de 100x180 unidades sobre a imagem.
          </div>
        </div>
        <div class="row inline" style="align-items: center;">
            <label style="width: auto; margin-right: 10px;">Mostrar Grelha de Guias</label>
            <input id="show_grid" type="checkbox" style="width: auto;">
        </div>

        <div id="posModal" class="modal">
          <div class="modal-content">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <p id="modalTitle" style="margin: 0; font-weight: bold;">Clique na imagem para definir a posição</p>
              <span class="close">&times;</span>
            </div>
            <div class="modal-image-container">
              <img id="modalImg" src="">
              <svg id="modalSvg" class="modal-svg-overlay"></svg>
            </div>
            <div id="pathControls" class="modal-controls" style="display: none;">
              <div style="display: flex; align-items: center; gap: 10px; margin-right: auto;">
                  <label style="color: #e0e0e0; font-size: 12px; margin: 0; display: flex; align-items: center; gap: 4px;">
                    <input type="checkbox" id="modalShowGrid" checked> Grelha
                  </label>
                  <label style="color: #e0e0e0; font-size: 12px; margin: 0; display: flex; align-items: center; gap: 4px;">
                    <input type="checkbox" id="modalShowImage" checked> Imagem
                  </label>
              </div>
              <div style="display: flex; align-items: center; gap: 5px; margin-right: 10px;">
                  <label style="color: #e0e0e0; font-size: 12px; margin: 0;">Tensão:</label>
                  <input type="range" id="pathTension" min="0" max="1" step="0.05" value="0.2" style="width: 80px;">
              </div>
              <button class="modal-btn btn-undo" id="btnUndo">Desfazer</button>
              <button class="modal-btn" id="btnClear" style="background-color: #dc3545; color: white;">Limpar Tudo</button>
              <button class="modal-btn btn-cancel" id="btnCancel">Cancelar</button>
              <button class="modal-btn btn-confirm" id="btnConfirm">Confirmar</button>
            </div>
          </div>
        </div>

        <div class="row">
          <label>Transparência do Badge (0-1)</label>
          <input id="badge_opacity" type="number" min="0" max="1" step="0.1">
        </div>
        
        <details class="entity-block" id="details_switch">
          <summary class="item-title">Configuração do Switch</summary>
          <div class="entity-content">
            <div class="row">
               <button class="pos-btn" id="btn_switch">Selecionar Posição na Imagem</button>
            </div>
            <div class="row">
              <ha-entity-picker id="switch" label="Switch da bomba" domain-filter="switch"></ha-entity-picker>
            </div>
            <div class="row inline">
              <div>
                <label>Switch Left (%)</label>
                <input id="switch_left" type="number" min="0" max="100">
              </div>
              <div>
                <label>Switch Top (%)</label>
                <input id="switch_top" type="number" min="0" max="100">
              </div>
            </div>
          </div>
        </details>

        <details class="entity-block" id="details_flow">
          <summary class="item-title">Configuração do Fluxo</summary>
          <div class="entity-content">
            <div class="row">
               <button class="pos-btn" id="btn_flow">Selecionar Posição na Imagem</button>
            </div>
            <div class="row inline">
              <div>
                <label>Fluxo Left (%)</label>
                <input id="flow_left" type="number" min="0" max="100">
              </div>
              <div>
                <label>Fluxo Top (%)</label>
                <input id="flow_top" type="number" min="0" max="100">
              </div>
            </div>
          </div>
        </details>
        
        <div class="section-title">Entidades</div>
        ${this._config.entities.map((_, i) => {
          const name = this._config.names[i];
          const label = name || `Nome ${i + 1}`;
          const fontSize = this._config.font_sizes[i] || "";
          return `
          <details class="entity-block" id="details_ent_${i}" draggable="true" data-index="${i}">
            <summary class="item-title" id="summary${i}">Item ${i + 1} - ${label}</summary>
            <div class="entity-content">
              <div class="row">
                 <button class="pos-btn" id="btn_${i}">Selecionar Posição na Imagem</button>
              </div>
              <div class="row">
                <ha-entity-picker id="ent${i}" label="Entidade ${i + 1}" allow-custom-entity></ha-entity-picker>
              </div>
              <div class="row inline" style="align-items: flex-end;">
                <div style="width: auto; padding-right: 8px;">
                  <label>Ver</label>
                  <input id="vis${i}" type="checkbox" style="width: auto;">
                </div>
                <div style="width: auto; padding-right: 8px;">
                  <label>Rótulo</label>
                  <input id="show_label${i}" type="checkbox" style="width: auto;">
                </div>
                <div style="flex-grow: 2;">
                  <label>Nome</label>
                  <input id="name${i}">
                </div>
                <div>
                  <label>Cor</label>
                  <input id="color${i}" type="color" style="height: 30px; width: 30px; padding: 0; border: 0;">
                </div>
                <div>
                  <label>Fundo</label>
                  <input id="badge_color${i}" type="color" style="height: 30px; width: 30px; padding: 0; border: 0;">
                </div>
              </div>
              <div class="row inline" style="align-items: flex-end;">
                <div style="flex-grow: 1;">
                  <ha-icon-picker id="icon${i}" label="Ícone"></ha-icon-picker>
                </div>
                <div>
                  <label>Cor Icon</label>
                  <input id="icon_color${i}" type="color" style="height: 30px; width: 30px; padding: 0; border: 0;">
                </div>
                <div style="width: 80px; margin-left: 4px;">
                  <label>Tamanho</label>
                  <input id="font_size${i}" placeholder="Ex: 12px">
                </div>
              </div>
              <div class="row inline">
                <div>
                  <label>Left ${i + 1} (%)</label>
                  <input id="left${i}" type="number" min="0" max="100">
                </div>
                <div>
                  <label>Top ${i + 1} (%)</label>
                  <input id="top${i}" type="number" min="0" max="100">
                </div>
              </div>
              <div class="row" style="text-align: right; margin-top: 8px;">
                 <button id="remove${i}" style="color: red;">Remover Item</button>
              </div>
            </div>
          </details>
        `;}).join("")}
        <div class="row">
          <button id="add_entity">Adicionar Entidade</button>
        </div>

        <div class="section-title">Animações (Flows)</div>
        ${this._config.animations.map((anim, i) => `
          <details class="anim-block" id="details_anim_${i}">
            <summary class="item-title" style="background: #e6b800; color: black;">Anim ${i + 1}</summary>
            <div class="anim-content" style="border-color: #e6b800;">
              <div class="row">
                <ha-entity-picker id="anim_ent${i}" label="Entidade Gatilho" allow-custom-entity></ha-entity-picker>
              </div>
              <div class="row inline">
                <div style="flex-grow: 1;">
                  <label>Estado Ativo (ex: on)</label>
                  <input id="anim_state${i}" placeholder="on">
                </div>
                <div style="width: 80px;">
                  <label>Limiar (>W)</label>
                  <input id="anim_threshold${i}" type="number" step="any">
                </div>
                <div>
                  <label>Cor Início</label>
                  <input id="anim_color${i}" type="color" style="height: 30px; width: 30px; padding: 0; border: 0;">
                </div>
                <div>
                  <label>Cor Fim</label>
                  <input id="anim_color_end${i}" type="color" style="height: 30px; width: 30px; padding: 0; border: 0;">
                </div>
                <div style="width: 60px;">
                  <label>Largura</label>
                  <input id="anim_width${i}" type="number" min="1">
                </div>
                <div style="width: 80px;">
                  <label>Velocidade (s)</label>
                  <input id="anim_speed${i}" type="number" min="0.1" step="0.1">
                </div>
                <div style="flex-grow: 1;">
                  <label>Estilo</label>
                  <ha-select id="anim_style${i}" label="Estilo">
                      <mwc-list-item value="dashes">Dashes</mwc-list-item>
                      <mwc-list-item value="dots">Dots</mwc-list-item>
                      <mwc-list-item value="shimmer">Shimmer</mwc-list-item>
                  </ha-select>
                </div>
              </div>
              <div class="row">
                <label>Path SVG (d)</label>
                <div class="row">
                   <button class="pos-btn" id="btn_path_${i}" style="background-color: #e6b800; color: black;">Definir Caminho na Imagem</button>
                </div>
                <textarea id="anim_path${i}" rows="3" style="width: 100%; font-family: monospace;"></textarea>
              </div>
              <div class="row">
                <label>Dash Array (ex: 10 5)</label>
                <input id="anim_dash${i}">
              </div>
              <div class="row">
                <label>Tamanho do Brilho (%)</label>
                <input id="anim_mask_dash${i}" type="number" min="1" max="100">
              </div>
              <div class="row" style="text-align: right; margin-top: 8px;">
                 <button id="remove_anim${i}" style="color: red;">Remover Animação</button>
              </div>
            </div>
          </details>
        `).join("")}
        <div class="row">
          <button id="add_anim">Adicionar Animação</button>
        </div>

        <div class="section-title">Tanques de Água</div>
        ${this._config.water_tanks.map((tank, i) => `
          <details class="tank-block" id="details_tank_${i}">
            <summary class="item-title" style="background: #00bcd4; color: white;">Tanque ${i + 1}</summary>
            <div class="anim-content" style="border-color: #00bcd4;">
              <div class="row">
                <ha-entity-picker id="tank_ent${i}" label="Entidade Gatilho" allow-custom-entity></ha-entity-picker>
              </div>
              <div class="row inline">
                <div><label>X</label><input id="tank_x${i}" type="number"></div>
                <div><label>Y</label><input id="tank_y${i}" type="number"></div>
                <div><label>W</label><input id="tank_w${i}" type="number"></div>
                <div><label>H</label><input id="tank_h${i}" type="number"></div>
              </div>
              <div class="row inline">
                <div><label>Cor Bolhas</label><input id="tank_bubble_color${i}" type="color" style="height: 30px; width: 30px; padding: 0; border: 0;"></div>
                <div><label>Opacidade</label><input id="tank_opacity${i}" type="number" min="0" max="1" step="0.1"></div>
                <div><label>Estado</label><input id="tank_state${i}" placeholder="on"></div>
                <div><label>Limiar (>W)</label><input id="tank_threshold${i}" type="number" step="any"></div>
              </div>
              <div class="row" style="text-align: right; margin-top: 8px;">
                 <button id="remove_tank${i}" style="color: red;">Remover Tanque</button>
              </div>
            </div>
          </details>
        `).join("")}
        <div class="row"><button id="add_tank">Adicionar Tanque</button></div>

        <div class="section-title">Ventiladores</div>
        ${this._config.fans.map((fan, i) => `
          <details class="fan-block" id="details_fan_${i}">
            <summary class="item-title" style="background: #00bcd4; color: white;">Ventilador ${i + 1}</summary>
            <div class="anim-content" style="border-color: #00bcd4;">
              <div class="row">
                <ha-entity-picker id="fan_ent${i}" label="Entidade Gatilho" allow-custom-entity></ha-entity-picker>
              </div>
              <div class="row">
                 <button class="pos-btn" id="btn_fan_${i}" style="background-color: #00bcd4; color: white;">Definir Posição</button>
              </div>
              <div class="row inline">
                <div><label>X</label><input id="fan_x${i}" type="number"></div>
                <div><label>Y</label><input id="fan_y${i}" type="number"></div>
                <div><label>Tamanho</label><input id="fan_size${i}" type="number"></div>
                <div><label>Inclinação (0-1)</label><input id="fan_tilt${i}" type="number" min="0" max="1" step="0.1"></div>
                <div><label>Rotação</label><input id="fan_rotate${i}" type="number"></div>
                <div><label>Skew</label><input id="fan_skew${i}" type="number"></div>
              </div>
              <div class="row inline">
                <div><label>Cor</label><input id="fan_color${i}" type="color" style="height: 30px; width: 30px; padding: 0; border: 0;"></div>
                <div><label>Cor Traço</label><input id="fan_stroke_color${i}" type="color" style="height: 30px; width: 30px; padding: 0; border: 0;"></div>
                <div><label>Largura Traço</label><input id="fan_stroke_width${i}" type="number" min="0" step="0.5"></div>
              </div>
              <div class="row inline">
                <div><label>Opacidade</label><input id="fan_opacity${i}" type="number" min="0" max="1" step="0.1"></div>
                <div><label>Velocidade (s)</label><input id="fan_speed${i}" type="number" min="0.1" step="0.1"></div>
                <div><label>Estado</label><input id="fan_state${i}" placeholder="on"></div>
                <div><label>Limiar (>W)</label><input id="fan_threshold${i}" type="number" step="any"></div>
              </div>
              <div class="row inline" style="align-items: center;">
                  <label style="width: auto; margin-right: 10px;">Inverter Rotação</label>
                  <input id="fan_reverse${i}" type="checkbox" style="width: auto;">
              </div>
              <div class="row" style="text-align: right; margin-top: 8px;">
                 <button id="remove_fan${i}" style="color: red;">Remover Ventilador</button>
              </div>
            </div>
          </details>
        `).join("")}
        <div class="row"><button id="add_fan">Adicionar Ventilador</button></div>

        <div class="section-title">Bombas</div>
        ${this._config.pumps.map((pump, i) => `
          <details class="pump-block" id="details_pump_${i}">
            <summary class="item-title" style="background: #00bcd4; color: white;">Bomba ${i + 1}</summary>
            <div class="anim-content" style="border-color: #00bcd4;">
              <div class="row">
                <ha-entity-picker id="pump_ent${i}" label="Entidade Gatilho" allow-custom-entity></ha-entity-picker>
              </div>
              <div class="row">
                 <button class="pos-btn" id="btn_pump_${i}" style="background-color: #00bcd4; color: white;">Definir Posição</button>
              </div>
              <div class="row inline">
                <div><label>X</label><input id="pump_x${i}" type="number"></div>
                <div><label>Y</label><input id="pump_y${i}" type="number"></div>
                <div><label>Tamanho</label><input id="pump_size${i}" type="number"></div>
              </div>
              <div class="row">
                <label>Imagem URL (Opcional)</label>
                <input id="pump_image${i}" placeholder="/local/fan.png">
              </div>
              <div class="row inline">
                <div><label>Cor</label><input id="pump_color${i}" type="color" style="height: 30px; width: 30px; padding: 0; border: 0;"></div>
                <div><label>Opacidade</label><input id="pump_opacity${i}" type="number" min="0" max="1" step="0.1"></div>
                <div><label>Velocidade (s)</label><input id="pump_speed${i}" type="number" min="0.1" step="0.1"></div>
                <div><label>Estado</label><input id="pump_state${i}" placeholder="on"></div>
                <div><label>Limiar (>W)</label><input id="pump_threshold${i}" type="number" step="any"></div>
              </div>
              <div class="row inline" style="align-items: center;">
                  <label style="width: auto; margin-right: 10px;">Inverter Rotação</label>
                  <input id="pump_reverse${i}" type="checkbox" style="width: auto;">
              </div>
              <div class="row" style="text-align: right; margin-top: 8px;">
                 <button id="remove_pump${i}" style="color: red;">Remover Bomba</button>
              </div>
            </div>
          </details>
        `).join("")}
        <div class="row"><button id="add_pump">Adicionar Bomba</button></div>

      </div>
    `;

    // Restaurar estado
    const newContainer = this.shadowRoot.querySelector(".card-config");
    if (newContainer) {
      newContainer.scrollTop = scrollTop;
      openIds.forEach(id => {
        const el = this.shadowRoot.getElementById(id);
        if (el) el.open = true;
      });
    }

    this._addListeners();
    this._updateValues();
    this._setupAccordionExclusivity();
  }

  _addListeners() {
    const root = this.shadowRoot;

    // Imagem
    root.getElementById("image").addEventListener("change", (e) => {
      this._config = { ...this._config, image: e.target.value };
      this._updateConfig();
    });
    root.getElementById("image_opacity").addEventListener("change", (e) => {
      this._config = { ...this._config, image_opacity: Number(e.target.value) };
      this._updateConfig();
    });

    root.getElementById("view_box").addEventListener("change", (e) => {
      this._config = { ...this._config, view_box: e.target.value };
      this._updateConfig();
    });
    root.getElementById("show_grid").addEventListener("change", (e) => {
      this._config = { ...this._config, show_grid: e.target.checked };
      this._updateConfig();
    });

    // Modal
    root.querySelector(".close").addEventListener("click", () => this._closeModal());
    root.getElementById("btnCancel").addEventListener("click", () => this._closeModal());
    root.getElementById("btnUndo").addEventListener("click", () => this._undoPathPoint());
    root.getElementById("btnClear").addEventListener("click", () => this._clearPathPoints());
    root.getElementById("btnConfirm").addEventListener("click", () => this._confirmPath());
    
    root.getElementById("pathTension").addEventListener("input", (e) => {
        this._currentTension = Number(e.target.value);
        this._drawModalPath();
    });

    root.getElementById("modalShowGrid").addEventListener("change", (e) => {
        this._drawModalPath();
    });

    root.getElementById("modalShowImage").addEventListener("change", (e) => {
        const img = root.getElementById("modalImg");
        img.style.opacity = e.target.checked ? "1" : "0";
    });
    
    // Dragging logic for path points
    const modalContainer = root.querySelector(".modal-image-container");
    
    modalContainer.addEventListener("mousedown", (e) => {
        if (e.target.classList.contains("preview-point")) {
            this._draggingPoint = parseInt(e.target.dataset.index);
            e.preventDefault();
        }
        if (e.target.classList.contains("badge-point")) {
            this._draggingBadge = true;
            e.preventDefault();
        }
        if (this._drawMode === 'rect') {
            e.preventDefault();
            const img = root.getElementById("modalImg");
            const rect = img.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const vb = this._config.view_box.trim().split(/\s+/).map(Number);
            const minX = vb[0] || 0;
            const minY = vb[1] || 0;
            const width = vb[2] || 100;
            const height = vb[3] || 180;
            
            const svgX = minX + (x / rect.width) * width;
            const svgY = minY + (y / rect.height) * height;
            
            this._rectStart = { x: svgX, y: svgY };
            this._rectCurrent = { x: svgX, y: svgY };
            
            // Create preview rect
            const svg = this.shadowRoot.getElementById("modalSvg");
            const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            r.setAttribute("id", "previewRect");
            r.setAttribute("fill", "rgba(0, 255, 255, 0.3)");
            r.setAttribute("stroke", "cyan");
            r.setAttribute("stroke-width", "1");
            svg.appendChild(r);
        }
    });

    modalContainer.addEventListener("mousemove", (e) => {
        if (this._draggingPoint !== undefined && this._draggingPoint !== null) {
            e.preventDefault();
            const img = root.getElementById("modalImg");
            const rect = img.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const vb = this._config.view_box.trim().split(/\s+/).map(Number);
            const minX = vb[0] || 0;
            const minY = vb[1] || 0;
            const width = vb[2] || 100;
            const height = vb[3] || 180;
            
            const svgX = minX + (x / rect.width) * width;
            const svgY = minY + (y / rect.height) * height;
            
            this._pathPoints[this._draggingPoint] = { x: svgX, y: svgY };
            this._drawModalPath();
            
            const tooltip = this.shadowRoot.getElementById("coordsTooltip");
            if (tooltip) {
                tooltip.setAttribute("x", svgX + 5);
                tooltip.setAttribute("y", svgY - 5);
                tooltip.textContent = `${Math.round(svgX)},${Math.round(svgY)}`;
                tooltip.style.display = "block";
            }
        } else if (this._draggingBadge) {
            e.preventDefault();
            const img = root.getElementById("modalImg");
            const rect = img.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const vb = this._config.view_box.trim().split(/\s+/).map(Number);
            const minX = vb[0] || 0;
            const minY = vb[1] || 0;
            const width = vb[2] || 100;
            const height = vb[3] || 180;
            
            const svgX = minX + (x / rect.width) * width;
            const svgY = minY + (y / rect.height) * height;
            
            const circle = this.shadowRoot.querySelector(".badge-point");
            if (circle) {
                circle.setAttribute("cx", svgX);
                circle.setAttribute("cy", svgY);
                circle.style.cursor = "grabbing";
            }
            this._currentBadgeSvgPos = { x: svgX, y: svgY };

            const tooltip = this.shadowRoot.getElementById("coordsTooltip");
            if (tooltip) {
                tooltip.setAttribute("x", svgX + 5);
                tooltip.setAttribute("y", svgY - 5);
                tooltip.textContent = `${Math.round(svgX)},${Math.round(svgY)}`;
                tooltip.style.display = "block";
            }
        } else if (this._drawMode === 'rect' && this._rectStart) {
            e.preventDefault();
            const img = root.getElementById("modalImg");
            const rect = img.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const vb = this._config.view_box.trim().split(/\s+/).map(Number);
            const minX = vb[0] || 0;
            const minY = vb[1] || 0;
            const width = vb[2] || 100;
            const height = vb[3] || 180;
            
            const svgX = minX + (x / rect.width) * width;
            const svgY = minY + (y / rect.height) * height;
            
            this._rectCurrent = { x: svgX, y: svgY };
            this._updatePreviewRect();
        }
    });

    const stopDrag = () => {
        if (this._draggingPoint !== null && this._draggingPoint !== undefined) {
            this._draggingPoint = null;
            this._drawModalPath();
            const tooltip = this.shadowRoot.getElementById("coordsTooltip");
            if (tooltip) tooltip.style.display = "none";
        }
        if (this._draggingBadge) {
            this._draggingBadge = false;
            if (this._currentBadgeSvgPos) {
                const vb = this._config.view_box.trim().split(/\s+/).map(Number);
                const minX = vb[0] || 0;
                const minY = vb[1] || 0;
                const width = vb[2] || 100;
                const height = vb[3] || 180;
                
                const left = ((this._currentBadgeSvgPos.x - minX) / width) * 100;
                const top = ((this._currentBadgeSvgPos.y - minY) / height) * 100;
                this._updateBadgePosition(left, top);
                this._currentBadgeSvgPos = null;
            }
            const tooltip = this.shadowRoot.getElementById("coordsTooltip");
            if (tooltip) tooltip.style.display = "none";
        }
        if (this._drawMode === 'rect' && this._rectStart) {
            // Finish rect
            const x = Math.min(this._rectStart.x, this._rectCurrent.x);
            const y = Math.min(this._rectStart.y, this._rectCurrent.y);
            const w = Math.abs(this._rectCurrent.x - this._rectStart.x);
            const h = Math.abs(this._rectCurrent.y - this._rectStart.y);
            
            if (w > 1 && h > 1) {
                const idx = parseInt(this._posTarget.replace("tank_", ""));
                const tanks = [...this._config.water_tanks];
                tanks[idx] = { ...tanks[idx], x: Math.round(x), y: Math.round(y), width: Math.round(w), height: Math.round(h) };
                this._config = { ...this._config, water_tanks: tanks };
                this._updateConfig();
                this._closeModal();
            }
            
            this._rectStart = null;
            this._rectCurrent = null;
            this._drawMode = null;
        }
    };

    modalContainer.addEventListener("dblclick", (e) => {
        if (e.target.classList.contains("preview-point")) {
            const index = parseInt(e.target.dataset.index);
            this._deletePathPoint(index);
        }
    });

    modalContainer.addEventListener("mouseup", stopDrag);
    modalContainer.addEventListener("mouseleave", stopDrag);

    root.getElementById("modalImg").addEventListener("click", (e) => {
      if (this._posTarget === undefined) return;

      const rect = e.target.getBoundingClientRect();
      const left = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const top = Math.round(((e.clientY - rect.top) / rect.height) * 100);

      if (typeof this._posTarget === "string" && this._posTarget.startsWith("path_")) {
        this._addPathPoint(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
        return;
      }

      if (typeof this._posTarget === "string" && this._posTarget.startsWith("fan_")) {
        const idx = parseInt(this._posTarget.replace("fan_", ""));
        const fans = [...this._config.fans];
        fans[idx] = { ...fans[idx], x: Math.round(left), y: Math.round(top) };
        this._config = { ...this._config, fans };
        this._updateConfig();
        this._closeModal();
        return;
      }
      if (typeof this._posTarget === "string" && this._posTarget.startsWith("pump_")) {
        const idx = parseInt(this._posTarget.replace("pump_", ""));
        const pumps = [...this._config.pumps];
        pumps[idx] = { ...pumps[idx], x: Math.round(left), y: Math.round(top) };
        this._config = { ...this._config, pumps };
        this._updateConfig();
        this._closeModal();
        return;
      }

      this._updateBadgePosition(left, top);
    });

    root.getElementById("badge_opacity").addEventListener("change", (e) => {
      this._config = { ...this._config, badge_opacity: Number(e.target.value) };
      this._updateConfig();
    });

    // Switch
    root.getElementById("switch").addEventListener("value-changed", (e) => {
      this._config = { ...this._config, switch: e.detail.value };
      this._updateConfig();
    });
    root.getElementById("btn_switch").addEventListener("click", () => this._openModal("switch"));
    root.getElementById("switch_left").addEventListener("change", (e) => {
      this._config.switch_position = { ...this._config.switch_position, left: Number(e.target.value) };
      this._updateConfig();
    });
    root.getElementById("switch_top").addEventListener("change", (e) => {
      this._config.switch_position = { ...this._config.switch_position, top: Number(e.target.value) };
      this._updateConfig();
    });

    // Flow
    root.getElementById("btn_flow").addEventListener("click", () => this._openModal("flow"));
    root.getElementById("flow_left").addEventListener("change", (e) => {
      this._config.flow_position = { ...this._config.flow_position, left: Number(e.target.value) };
      this._updateConfig();
    });
    root.getElementById("flow_top").addEventListener("change", (e) => {
      this._config.flow_position = { ...this._config.flow_position, top: Number(e.target.value) };
      this._updateConfig();
    });

    // Entidades
    for (let i = 0; i < this._config.entities.length; i++) {
      root.getElementById(`btn_${i}`).addEventListener("click", () => this._openModal(i));

      root.getElementById(`name${i}`).addEventListener("change", (e) => {
          const names = [...(this._config.names || [])];
          names[i] = e.target.value;
          this._config = { ...this._config, names };
          this._updateConfig();
        });

      root.getElementById(`color${i}`).addEventListener("change", (e) => {
          const colors = [...(this._config.colors || [])];
          colors[i] = e.target.value;
          this._config = { ...this._config, colors };
          this._updateConfig();
        });

      root.getElementById(`badge_color${i}`).addEventListener("change", (e) => {
          const badge_colors = [...(this._config.badge_colors || [])];
          badge_colors[i] = e.target.value;
          this._config = { ...this._config, badge_colors };
          this._updateConfig();
        });

      root.getElementById(`icon_color${i}`).addEventListener("change", (e) => {
          const icon_colors = [...(this._config.icon_colors || [])];
          icon_colors[i] = e.target.value;
          this._config = { ...this._config, icon_colors };
          this._updateConfig();
        });

      root.getElementById(`font_size${i}`).addEventListener("change", (e) => {
          const font_sizes = [...(this._config.font_sizes || [])];
          font_sizes[i] = e.target.value;
          this._config = { ...this._config, font_sizes };
          this._updateConfig();
        });

      root.getElementById(`icon${i}`).addEventListener("value-changed", (e) => {
          const icons = [...(this._config.icons || [])];
          icons[i] = e.detail.value;
          this._config = { ...this._config, icons };
          this._updateConfig();
        });

      root.getElementById(`ent${i}`).addEventListener("value-changed", (e) => {
          const entities = [...(this._config.entities || [])];
          entities[i] = e.detail.value;
          this._config = { ...this._config, entities };
          this._updateConfig();
        });

      root.getElementById(`left${i}`).addEventListener("change", (e) => {
          const positions = [...(this._config.positions || [])];
          const p = positions[i] || {};
          p.left = Number(e.target.value);
          positions[i] = p;
          this._config = { ...this._config, positions };
          this._updateConfig();
        });

      root.getElementById(`vis${i}`).addEventListener("change", (e) => {
          const visible = [...(this._config.visible || [])];
          visible[i] = e.target.checked;
          this._config = { ...this._config, visible };
          this._updateConfig();
        });

      root.getElementById(`show_label${i}`).addEventListener("change", (e) => {
          const show_labels = [...(this._config.show_labels || [])];
          show_labels[i] = e.target.checked;
          this._config = { ...this._config, show_labels };
          this._updateConfig();
        });

      root.getElementById(`top${i}`).addEventListener("change", (e) => {
          const positions = [...(this._config.positions || [])];
          const p = positions[i] || {};
          p.top = Number(e.target.value);
          positions[i] = p;
          this._config = { ...this._config, positions };
          this._updateConfig();
        });

      root.getElementById(`remove${i}`).addEventListener("click", () => {
          const entities = [...(this._config.entities || [])];
          const names = [...(this._config.names || [])];
          const positions = [...(this._config.positions || [])];
          const colors = [...(this._config.colors || [])];
          const badge_colors = [...(this._config.badge_colors || [])];
          const icons = [...(this._config.icons || [])];
          const icon_colors = [...(this._config.icon_colors || [])];
          const font_sizes = [...(this._config.font_sizes || [])];
          const visible = [...(this._config.visible || [])];
          const show_labels = [...(this._config.show_labels || [])];

          entities.splice(i, 1);
          names.splice(i, 1);
          positions.splice(i, 1);
          colors.splice(i, 1);
          badge_colors.splice(i, 1);
          icons.splice(i, 1);
          font_sizes.splice(i, 1);
          icon_colors.splice(i, 1);
          visible.splice(i, 1);
          show_labels.splice(i, 1);
          
          this._config = { ...this._config, entities, names, positions, colors, badge_colors, icons, icon_colors, font_sizes, visible, show_labels };
          this._updateConfig();
        });
    }

    // Animações Listeners
    for (let i = 0; i < this._config.animations.length; i++) {
      root.getElementById(`anim_ent${i}`).addEventListener("value-changed", (e) => {
        const animations = [...this._config.animations];
        animations[i] = { ...animations[i], entity: e.detail.value };
        this._config = { ...this._config, animations };
        this._updateConfig();
      });
      root.getElementById(`anim_state${i}`).addEventListener("change", (e) => {
        const animations = [...this._config.animations];
        animations[i] = { ...animations[i], state_on: e.target.value };
        this._config = { ...this._config, animations };
        this._updateConfig();
      });
      root.getElementById(`anim_threshold${i}`).addEventListener("change", (e) => {
        const animations = [...this._config.animations];
        animations[i] = { ...animations[i], threshold: e.target.value };
        this._config = { ...this._config, animations };
        this._updateConfig();
      });
      root.getElementById(`anim_color${i}`).addEventListener("change", (e) => {
        const animations = [...this._config.animations];
        animations[i] = { ...animations[i], color: e.target.value };
        this._config = { ...this._config, animations };
        this._updateConfig();
      });
      root.getElementById(`anim_color_end${i}`).addEventListener("change", (e) => {
        const animations = [...this._config.animations];
        animations[i] = { ...animations[i], color_end: e.target.value };
        this._config = { ...this._config, animations };
        this._updateConfig();
      });
      root.getElementById(`anim_width${i}`).addEventListener("change", (e) => {
        const animations = [...this._config.animations];
        animations[i] = { ...animations[i], width: Number(e.target.value) };
        this._config = { ...this._config, animations };
        this._updateConfig();
      });
      root.getElementById(`anim_speed${i}`).addEventListener("change", (e) => {
        const animations = [...this._config.animations];
        animations[i] = { ...animations[i], speed: Number(e.target.value) };
        this._config = { ...this._config, animations };
        this._updateConfig();
      });
      root.getElementById(`anim_style${i}`).addEventListener("selected", (e) => {
        if (!e.target.value) return;
        const animations = [...this._config.animations];
        animations[i] = { ...animations[i], style: e.target.value };
        this._config = { ...this._config, animations };
        this._updateConfig();
      });
      root.getElementById(`anim_style${i}`).addEventListener("closed", (e) => {
        e.stopPropagation();
      });
      root.getElementById(`btn_path_${i}`).addEventListener("click", () => {
        this._openModal(`path_${i}`);
      });
      root.getElementById(`anim_path${i}`).addEventListener("change", (e) => {
        const animations = [...this._config.animations];
        animations[i] = { ...animations[i], path: e.target.value };
        this._config = { ...this._config, animations };
        this._updateConfig();
      });
      root.getElementById(`anim_dash${i}`).addEventListener("change", (e) => {
        const animations = [...this._config.animations];
        animations[i] = { ...animations[i], dash: e.target.value };
        this._config = { ...this._config, animations };
        this._updateConfig();
      });
      root.getElementById(`anim_mask_dash${i}`).addEventListener("change", (e) => {
        const animations = [...this._config.animations];
        animations[i] = { ...animations[i], mask_dash: e.target.value };
        this._config = { ...this._config, animations };
        this._updateConfig();
      });
      root.getElementById(`remove_anim${i}`).addEventListener("click", () => {
        const animations = [...this._config.animations];
        animations.splice(i, 1);
        this._config = { ...this._config, animations };
        this._updateConfig();
      });
    }

    // Listeners para Tanques
    root.getElementById("add_tank").addEventListener("click", () => {
        const tanks = [...this._config.water_tanks, { x: 50, y: 50, width: 20, height: 20, opacity: 0.5 }];
        this._config = { ...this._config, water_tanks: tanks };
        this._updateConfig();
    });
    for (let i = 0; i < this._config.water_tanks.length; i++) {
        root.getElementById(`tank_x${i}`).addEventListener("change", (e) => {
            const tanks = [...this._config.water_tanks];
            tanks[i] = { ...tanks[i], x: Number(e.target.value) };
            this._config = { ...this._config, water_tanks: tanks };
            this._updateConfig();
        });
        root.getElementById(`tank_y${i}`).addEventListener("change", (e) => {
            const tanks = [...this._config.water_tanks];
            tanks[i] = { ...tanks[i], y: Number(e.target.value) };
            this._config = { ...this._config, water_tanks: tanks };
            this._updateConfig();
        });
        root.getElementById(`tank_w${i}`).addEventListener("change", (e) => {
            const tanks = [...this._config.water_tanks];
            tanks[i] = { ...tanks[i], width: Number(e.target.value) };
            this._config = { ...this._config, water_tanks: tanks };
            this._updateConfig();
        });
        root.getElementById(`tank_h${i}`).addEventListener("change", (e) => {
            const tanks = [...this._config.water_tanks];
            tanks[i] = { ...tanks[i], height: Number(e.target.value) };
            this._config = { ...this._config, water_tanks: tanks };
            this._updateConfig();
        });
        root.getElementById(`tank_ent${i}`).addEventListener("value-changed", (e) => {
            const tanks = [...this._config.water_tanks];
            tanks[i] = { ...tanks[i], entity: e.detail.value };
            this._config = { ...this._config, water_tanks: tanks };
            this._updateConfig();
        });
        root.getElementById(`tank_opacity${i}`).addEventListener("change", (e) => {
            const tanks = [...this._config.water_tanks];
            tanks[i] = { ...tanks[i], opacity: Number(e.target.value) };
            this._config = { ...this._config, water_tanks: tanks };
            this._updateConfig();
        });
        root.getElementById(`tank_bubble_color${i}`).addEventListener("change", (e) => {
            const tanks = [...this._config.water_tanks];
            tanks[i] = { ...tanks[i], bubble_color: e.target.value };
            this._config = { ...this._config, water_tanks: tanks };
            this._updateConfig();
        });
        root.getElementById(`tank_state${i}`).addEventListener("change", (e) => {
            const tanks = [...this._config.water_tanks];
            tanks[i] = { ...tanks[i], state_on: e.target.value };
            this._config = { ...this._config, water_tanks: tanks };
            this._updateConfig();
        });
        root.getElementById(`tank_threshold${i}`).addEventListener("change", (e) => {
            const tanks = [...this._config.water_tanks];
            tanks[i] = { ...tanks[i], threshold: e.target.value };
            this._config = { ...this._config, water_tanks: tanks };
            this._updateConfig();
        });
        root.getElementById(`remove_tank${i}`).addEventListener("click", () => {
            const tanks = [...this._config.water_tanks];
            tanks.splice(i, 1);
            this._config = { ...this._config, water_tanks: tanks };
            this._updateConfig();
        });
    }

    // Listeners para Ventiladores
    root.getElementById("add_fan").addEventListener("click", () => {
        const fans = [...this._config.fans, { x: 50, y: 50, size: 20, color: "#ffffff", opacity: 1 }];
        this._config = { ...this._config, fans };
        this._updateConfig();
    });
    for (let i = 0; i < this._config.fans.length; i++) {
        root.getElementById(`btn_fan_${i}`).addEventListener("click", () => this._openModal(`fan_${i}`));
        root.getElementById(`fan_x${i}`).addEventListener("change", (e) => {
            const fans = [...this._config.fans];
            fans[i] = { ...fans[i], x: Number(e.target.value) };
            this._config = { ...this._config, fans };
            this._updateConfig();
        });
        root.getElementById(`fan_y${i}`).addEventListener("change", (e) => {
            const fans = [...this._config.fans];
            fans[i] = { ...fans[i], y: Number(e.target.value) };
            this._config = { ...this._config, fans };
            this._updateConfig();
        });
        root.getElementById(`fan_ent${i}`).addEventListener("value-changed", (e) => {
            const fans = [...this._config.fans];
            fans[i] = { ...fans[i], entity: e.detail.value };
            this._config = { ...this._config, fans };
            this._updateConfig();
        });
        root.getElementById(`fan_size${i}`).addEventListener("change", (e) => {
            const fans = [...this._config.fans];
            fans[i] = { ...fans[i], size: Number(e.target.value) };
            this._config = { ...this._config, fans };
            this._updateConfig();
        });
        root.getElementById(`fan_tilt${i}`).addEventListener("change", (e) => {
            const fans = [...this._config.fans];
            fans[i] = { ...fans[i], tilt: Number(e.target.value) };
            this._config = { ...this._config, fans };
            this._updateConfig();
        });
        root.getElementById(`fan_rotate${i}`).addEventListener("change", (e) => {
            const fans = [...this._config.fans];
            fans[i] = { ...fans[i], rotate: Number(e.target.value) };
            this._config = { ...this._config, fans };
            this._updateConfig();
        });
        root.getElementById(`fan_skew${i}`).addEventListener("change", (e) => {
            const fans = [...this._config.fans];
            fans[i] = { ...fans[i], skew: Number(e.target.value) };
            this._config = { ...this._config, fans };
            this._updateConfig();
        });
        root.getElementById(`fan_color${i}`).addEventListener("change", (e) => {
            const fans = [...this._config.fans];
            fans[i] = { ...fans[i], color: e.target.value };
            this._config = { ...this._config, fans };
            this._updateConfig();
        });
        root.getElementById(`fan_stroke_color${i}`).addEventListener("change", (e) => {
            const fans = [...this._config.fans];
            fans[i] = { ...fans[i], stroke_color: e.target.value };
            this._config = { ...this._config, fans };
            this._updateConfig();
        });
        root.getElementById(`fan_stroke_width${i}`).addEventListener("change", (e) => {
            const fans = [...this._config.fans];
            fans[i] = { ...fans[i], stroke_width: Number(e.target.value) };
            this._config = { ...this._config, fans };
            this._updateConfig();
        });
        root.getElementById(`fan_opacity${i}`).addEventListener("change", (e) => {
            const fans = [...this._config.fans];
            fans[i] = { ...fans[i], opacity: Number(e.target.value) };
            this._config = { ...this._config, fans };
            this._updateConfig();
        });
        root.getElementById(`fan_speed${i}`).addEventListener("change", (e) => {
            const fans = [...this._config.fans];
            fans[i] = { ...fans[i], speed: Number(e.target.value) };
            this._config = { ...this._config, fans };
            this._updateConfig();
        });
        root.getElementById(`fan_threshold${i}`).addEventListener("change", (e) => {
            const fans = [...this._config.fans];
            fans[i] = { ...fans[i], threshold: e.target.value };
            this._config = { ...this._config, fans };
            this._updateConfig();
        });
        root.getElementById(`fan_reverse${i}`).addEventListener("change", (e) => {
            const fans = [...this._config.fans];
            fans[i] = { ...fans[i], reverse: e.target.checked };
            this._config = { ...this._config, fans };
            this._updateConfig();
        });
        root.getElementById(`remove_fan${i}`).addEventListener("click", () => {
            const fans = [...this._config.fans];
            fans.splice(i, 1);
            this._config = { ...this._config, fans };
            this._updateConfig();
        });
    }

    // Listeners para Bombas
    root.getElementById("add_pump").addEventListener("click", () => {
        const pumps = [...this._config.pumps, { x: 50, y: 50, size: 15, color: "#ffffff", opacity: 1 }];
        this._config = { ...this._config, pumps };
        this._updateConfig();
    });
    for (let i = 0; i < this._config.pumps.length; i++) {
        root.getElementById(`btn_pump_${i}`).addEventListener("click", () => this._openModal(`pump_${i}`));
        root.getElementById(`pump_x${i}`).addEventListener("change", (e) => {
            const pumps = [...this._config.pumps];
            pumps[i] = { ...pumps[i], x: Number(e.target.value) };
            this._config = { ...this._config, pumps };
            this._updateConfig();
        });
        root.getElementById(`pump_y${i}`).addEventListener("change", (e) => {
            const pumps = [...this._config.pumps];
            pumps[i] = { ...pumps[i], y: Number(e.target.value) };
            this._config = { ...this._config, pumps };
            this._updateConfig();
        });
        root.getElementById(`pump_ent${i}`).addEventListener("value-changed", (e) => {
            const pumps = [...this._config.pumps];
            pumps[i] = { ...pumps[i], entity: e.detail.value };
            this._config = { ...this._config, pumps };
            this._updateConfig();
        });
        root.getElementById(`pump_size${i}`).addEventListener("change", (e) => {
            const pumps = [...this._config.pumps];
            pumps[i] = { ...pumps[i], size: Number(e.target.value) };
            this._config = { ...this._config, pumps };
            this._updateConfig();
        });
        root.getElementById(`pump_image${i}`).addEventListener("change", (e) => {
            const pumps = [...this._config.pumps];
            pumps[i] = { ...pumps[i], image: e.target.value };
            this._config = { ...this._config, pumps };
            this._updateConfig();
        });
        root.getElementById(`pump_color${i}`).addEventListener("change", (e) => {
            const pumps = [...this._config.pumps];
            pumps[i] = { ...pumps[i], color: e.target.value };
            this._config = { ...this._config, pumps };
            this._updateConfig();
        });
        root.getElementById(`pump_opacity${i}`).addEventListener("change", (e) => {
            const pumps = [...this._config.pumps];
            pumps[i] = { ...pumps[i], opacity: Number(e.target.value) };
            this._config = { ...this._config, pumps };
            this._updateConfig();
        });
        root.getElementById(`pump_speed${i}`).addEventListener("change", (e) => {
            const pumps = [...this._config.pumps];
            pumps[i] = { ...pumps[i], speed: Number(e.target.value) };
            this._config = { ...this._config, pumps };
            this._updateConfig();
        });
        root.getElementById(`pump_reverse${i}`).addEventListener("change", (e) => {
            const pumps = [...this._config.pumps];
            pumps[i] = { ...pumps[i], reverse: e.target.checked };
            this._config = { ...this._config, pumps };
            this._updateConfig();
        });
        root.getElementById(`pump_threshold${i}`).addEventListener("change", (e) => {
            const pumps = [...this._config.pumps];
            pumps[i] = { ...pumps[i], threshold: e.target.value };
            this._config = { ...this._config, pumps };
            this._updateConfig();
        });
        root.getElementById(`remove_pump${i}`).addEventListener("click", () => {
            const pumps = [...this._config.pumps];
            pumps.splice(i, 1);
            this._config = { ...this._config, pumps };
            this._updateConfig();
        });
    }

    root.getElementById("add_entity").addEventListener("click", () => {
      const newConfig = { ...this._config };
      newConfig.entities = [...newConfig.entities, ""];
      newConfig.names = [...newConfig.names, ""];
      newConfig.colors = [...newConfig.colors, "#ffffff"];
      newConfig.badge_colors = [...newConfig.badge_colors, ""];
      newConfig.icons = [...newConfig.icons, ""];
      newConfig.icon_colors = [...newConfig.icon_colors, "#ffffff"];
      newConfig.font_sizes = [...newConfig.font_sizes, ""];
      newConfig.visible = [...newConfig.visible, true];
      newConfig.show_labels = [...newConfig.show_labels, true];
      newConfig.positions = [...newConfig.positions, { left: 5, top: 90 }];
      
      this._config = newConfig;
      this._updateConfig();
    });

    root.getElementById("add_anim").addEventListener("click", () => {
      const animations = [...this._config.animations, { entity: "", path: "", color: "#2681DC", width: 2, dash: "10 5", style: "dashes", speed: 1.5 }];
      this._config = { ...this._config, animations };
      this._updateConfig();
    });

    root.querySelectorAll(".entity-block").forEach((block) => {
      block.addEventListener("dragstart", this._handleDragStart.bind(this));
      block.addEventListener("dragover", this._handleDragOver.bind(this));
      block.addEventListener("drop", this._handleDrop.bind(this));
      block.addEventListener("dragend", this._handleDragEnd.bind(this));
    });
  }

  _setupAccordionExclusivity() {
    const entDetails = this.shadowRoot.querySelectorAll(".entity-block[data-index]");
    const animDetails = this.shadowRoot.querySelectorAll(".anim-block");

    const closeAll = (list) => list.forEach(el => el.open = false);

    entDetails.forEach(el => {
      el.addEventListener("toggle", (e) => {
        if (el.open) closeAll(animDetails);
      });
    });

    animDetails.forEach(el => {
      el.addEventListener("toggle", (e) => {
        if (el.open) closeAll(entDetails);
      });
    });
  }

  _openModal(target) {
    this._posTarget = target;
    this._pathPoints = []; // Reset path points
    this._currentTension = 0.2; // Reset tension
    this._draggingPoint = null; // Reset dragging
    this._drawMode = null;
    this._draggingBadge = false;
    const modal = this.shadowRoot.getElementById("posModal");
    const title = this.shadowRoot.getElementById("modalTitle");
    const controls = this.shadowRoot.getElementById("pathControls");
    const svg = this.shadowRoot.getElementById("modalSvg");
    
    this.shadowRoot.getElementById("modalImg").src = this._config.image;
    svg.innerHTML = ""; // Clear SVG

    if (typeof target === "string" && target.startsWith("path_")) {
      title.textContent = "Clique para adicionar pontos ao caminho";
      controls.style.display = "flex";
      const tensionSlider = this.shadowRoot.getElementById("pathTension");
      if (tensionSlider) tensionSlider.value = "0.2";
      
      const idx = parseInt(target.replace("path_", ""));
      const anim = this._config.animations[idx];
      if (anim && anim.path) {
          this._pathPoints = this._parsePath(anim.path);
      }
      
      // Reset toggles
      const gridCheck = this.shadowRoot.getElementById("modalShowGrid");
      if (gridCheck) gridCheck.checked = true;
      const imgCheck = this.shadowRoot.getElementById("modalShowImage");
      if (imgCheck) imgCheck.checked = true;
      this.shadowRoot.getElementById("modalImg").style.opacity = "1";
      
      this._drawModalPath();
    } else {
      title.textContent = "Clique na imagem para definir a posição";
      controls.style.display = "none";
      this._drawModalBadge();
    }

    modal.style.display = "block";
  }

  _parsePath(d) {
    const points = [];
    const commands = d.match(/[a-df-z][^a-df-z]*/ig) || [];
    
    for (const cmd of commands) {
        const type = cmd[0].toUpperCase();
        const coords = cmd.slice(1).trim().split(/[\s,]+/).map(Number);
        
        if (type === 'M' || type === 'L') {
            if (coords.length >= 2) points.push({x: coords[0], y: coords[1]});
        } else if (type === 'C') {
            if (coords.length >= 6) points.push({x: coords[coords.length-2], y: coords[coords.length-1]});
        }
    }
    return points;
  }

  _closeModal() {
    this.shadowRoot.getElementById("posModal").style.display = "none";
    this._posTarget = undefined;
    this._pathPoints = [];
  }

  _addPathPoint(x, y, width, height) {
    const vb = this._config.view_box.trim().split(/\s+/).map(Number);
    const minX = vb[0] || 0;
    const minY = vb[1] || 0;
    const vbW = vb[2] || 100;
    const vbH = vb[3] || 100;
    
    const svgX = minX + (x / width) * vbW;
    const svgY = minY + (y / height) * vbH;

    // Verificar se o clique foi perto de um segmento existente para inserir
    let insertIndex = -1;
    let minDistance = Infinity;
    const threshold = 5; // Distância em unidades SVG para considerar inserção

    for (let i = 0; i < this._pathPoints.length - 1; i++) {
        const p1 = this._pathPoints[i];
        const p2 = this._pathPoints[i+1];
        const dist = this._distanceToSegment({x: svgX, y: svgY}, p1, p2);
        if (dist < threshold && dist < minDistance) {
            minDistance = dist;
            insertIndex = i + 1;
        }
    }

    if (insertIndex !== -1) {
        this._pathPoints.splice(insertIndex, 0, { x: svgX, y: svgY });
    } else {
        this._pathPoints.push({ x: svgX, y: svgY });
    }
    this._drawModalPath();
  }

  _distanceToSegment(p, v, w) {
    const l2 = (v.x - w.x)**2 + (v.y - w.y)**2;
    if (l2 === 0) return Math.sqrt((p.x - v.x)**2 + (p.y - v.y)**2);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = v.x + t * (w.x - v.x);
    const projY = v.y + t * (w.y - v.y);
    return Math.sqrt((p.x - projX)**2 + (p.y - projY)**2);
  }

  _undoPathPoint() {
    this._pathPoints.pop();
    this._drawModalPath();
  }

  _clearPathPoints() {
    this._pathPoints = [];
    this._drawModalPath();
  }

  _deletePathPoint(index) {
    this._pathPoints.splice(index, 1);
    this._drawModalPath();
  }

  _updateBadgePosition(left, top) {
      // Calcular coordenadas absolutas para elementos que não usam %
      const vb = this._config.view_box.trim().split(/\s+/).map(Number);
      const minX = vb[0] || 0;
      const minY = vb[1] || 0;
      const width = vb[2] || 100;
      const height = vb[3] || 180;
      const absX = minX + (left / 100) * width;
      const absY = minY + (top / 100) * height;

      if (typeof this._posTarget === "string" && this._posTarget.startsWith("fan_")) {
          const idx = parseInt(this._posTarget.replace("fan_", ""));
          const fans = [...this._config.fans];
          fans[idx] = { ...fans[idx], x: Math.round(absX), y: Math.round(absY) };
          this._config = { ...this._config, fans };
      } else if (typeof this._posTarget === "string" && this._posTarget.startsWith("pump_")) {
          const idx = parseInt(this._posTarget.replace("pump_", ""));
          const pumps = [...this._config.pumps];
          pumps[idx] = { ...pumps[idx], x: Math.round(absX), y: Math.round(absY) };
          this._config = { ...this._config, pumps };
      } else if (this._posTarget === "switch") {
        this._config.switch_position = { left, top };
      } else if (this._posTarget === "flow") {
        this._config.flow_position = { left, top };
      } else {
        const idx = parseInt(this._posTarget);
        if (!isNaN(idx)) {
          const positions = [...(this._config.positions || [])];
          positions[idx] = { left, top };
          this._config = { ...this._config, positions };
        }
      }
      this._updateConfig();
      this._drawModalBadge();
  }

  _drawGrid(svg) {
    const vb = this._config.view_box.trim().split(/\s+/).map(Number);
    const minX = vb[0] || 0;
    const minY = vb[1] || 0;
    const width = vb[2] || 100;
    const height = vb[3] || 180;

    // Desenhar Limite do Mundo
    const border = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    border.setAttribute("x", minX);
    border.setAttribute("y", minY);
    border.setAttribute("width", width);
    border.setAttribute("height", height);
    border.style.fill = "none";
    border.style.stroke = "rgba(255, 255, 255, 0.3)";
    border.style.strokeWidth = "1";
    border.style.pointerEvents = "none";
    svg.appendChild(border);

    // Desenhar Grelha se ativado
    const showGrid = this.shadowRoot.getElementById("modalShowGrid").checked;
    if (showGrid) {
        const step = 10;
        for (let x = minX; x <= minX + width; x += step) {
            for (let y = minY; y <= minY + height; y += step) {
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", x);
                circle.setAttribute("cy", y);
                circle.setAttribute("r", 0.5);
                circle.style.fill = "rgba(255, 255, 255, 0.3)";
                circle.style.pointerEvents = "none";
                svg.appendChild(circle);
            }
        }
    }
  }

  _drawModalPath() {
    const svg = this.shadowRoot.getElementById("modalSvg");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("viewBox", this._config.view_box);
    svg.innerHTML = "";
    
    this._drawGrid(svg);

    // Desenhar linha
    if (this._pathPoints.length > 1) {
      const d = this._getSmoothedPath(this._pathPoints);
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      path.classList.add("preview-line");
      svg.appendChild(path);
    }

    // Desenhar pontos
    this._pathPoints.forEach((p, index) => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", p.x);
      circle.setAttribute("cy", p.y);
      circle.setAttribute("r", 3);
      circle.classList.add("preview-point");
      circle.dataset.index = index;
      circle.style.pointerEvents = "all";
      circle.style.cursor = (this._draggingPoint === index) ? "grabbing" : "grab";
      svg.appendChild(circle);
    });

    // Tooltip de coordenadas
    const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "text");
    tooltip.setAttribute("id", "coordsTooltip");
    tooltip.style.fill = "white";
    tooltip.style.fontSize = "10px";
    tooltip.style.display = "none";
    tooltip.style.pointerEvents = "none";
    svg.appendChild(tooltip);
  }

  _updatePreviewRect() {
      const r = this.shadowRoot.getElementById("previewRect");
      if (r && this._rectStart && this._rectCurrent) {
          const x = Math.min(this._rectStart.x, this._rectCurrent.x);
          const y = Math.min(this._rectStart.y, this._rectCurrent.y);
          const w = Math.abs(this._rectCurrent.x - this._rectStart.x);
          const h = Math.abs(this._rectCurrent.y - this._rectStart.y);
          r.setAttribute("x", x);
          r.setAttribute("y", y);
          r.setAttribute("width", w);
          r.setAttribute("height", h);
      }
  }

  _drawModalTank(target) {
      const idx = parseInt(target.replace("tank_", ""));
      const tank = this._config.water_tanks[idx];
      if (!tank || !tank.width) return;

      const svg = this.shadowRoot.getElementById("modalSvg");
      // Desenhar retângulo existente para referência
      const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      r.setAttribute("x", tank.x);
      r.setAttribute("y", tank.y);
      r.setAttribute("width", tank.width);
      r.setAttribute("height", tank.height);
      r.setAttribute("fill", "rgba(79, 195, 247, 0.5)");
      r.setAttribute("stroke", "blue");
      r.setAttribute("stroke-width", "1");
      svg.appendChild(r);
  }

  _drawModalBadge() {
    const svg = this.shadowRoot.getElementById("modalSvg");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("viewBox", this._config.view_box);
    svg.innerHTML = "";
    
    this._drawGrid(svg);

    let pos = { left: 50, top: 50 };
    if (this._posTarget === "switch") {
        pos = this._config.switch_position || pos;
    } else if (this._posTarget === "flow") {
        pos = this._config.flow_position || pos;
    } else if (typeof this._posTarget === "string" && this._posTarget.startsWith("fan_")) {
        const idx = parseInt(this._posTarget.replace("fan_", ""));
        const fan = this._config.fans[idx];
        // Converter coordenadas SVG para % para usar a lógica existente se necessário, ou desenhar direto
        // Aqui vamos desenhar direto no SVG
        this._drawElementMarker(svg, fan.x, fan.y, "blue");
        this._appendTooltip(svg);
        return;
    } else if (typeof this._posTarget === "string" && this._posTarget.startsWith("pump_")) {
        const idx = parseInt(this._posTarget.replace("pump_", ""));
        const pump = this._config.pumps[idx];
        this._drawElementMarker(svg, pump.x, pump.y, "orange");
        this._appendTooltip(svg);
        return;
    } else {
        const idx = parseInt(this._posTarget);
        if (!isNaN(idx)) {
             pos = (this._config.positions && this._config.positions[idx]) || pos;
        }
    }

    const vb = this._config.view_box.trim().split(/\s+/).map(Number);
    const minX = vb[0] || 0;
    const minY = vb[1] || 0;
    const width = vb[2] || 100;
    const height = vb[3] || 180;
    
    const cx = minX + (pos.left / 100) * width;
    const cy = minY + (pos.top / 100) * height;

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", 6);
    circle.classList.add("badge-point");
    circle.style.fill = "#00ff00";
    circle.style.stroke = "white";
    circle.style.strokeWidth = "2px";
    circle.style.cursor = "grab";
    circle.style.pointerEvents = "all";
    svg.appendChild(circle);

    // Tooltip
    this._appendTooltip(svg);
  }

  _appendTooltip(svg) {
    const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "text");
    tooltip.setAttribute("id", "coordsTooltip");
    tooltip.style.fill = "white";
    tooltip.style.fontSize = "10px";
    tooltip.style.display = "none";
    tooltip.style.pointerEvents = "none";
    svg.appendChild(tooltip);
  }

  _drawElementMarker(svg, x, y, color) {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", y);
      circle.setAttribute("r", 5);
      circle.classList.add("badge-point");
      circle.style.fill = color;
      circle.style.stroke = "white";
      circle.style.strokeWidth = "2px";
      circle.style.cursor = "grab";
      circle.style.pointerEvents = "all";
      svg.appendChild(circle);
  }

  _getSmoothedPath(points) {
    if (points.length < 2) return "";
    if (points.length === 2) {
        return `M ${Math.round(points[0].x)},${Math.round(points[0].y)} L ${Math.round(points[1].x)},${Math.round(points[1].y)}`;
    }

    let d = `M ${Math.round(points[0].x)},${Math.round(points[0].y)}`;
    const tension = this._currentTension !== undefined ? this._currentTension : 0.2;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = i > 0 ? points[i - 1] : points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = i < points.length - 2 ? points[i + 2] : p2;

        const cp1x = p1.x + (p2.x - p0.x) * tension;
        const cp1y = p1.y + (p2.y - p0.y) * tension;

        const cp2x = p2.x - (p3.x - p1.x) * tension;
        const cp2y = p2.y - (p3.y - p1.y) * tension;

        d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${Math.round(p2.x)},${Math.round(p2.y)}`;
    }
    return d;
  }

  _confirmPath() {
    if (this._pathPoints.length < 2) {
      alert("Adicione pelo menos 2 pontos.");
      return;
    }
    const d = this._getSmoothedPath(this._pathPoints);
    
    const idx = parseInt(this._posTarget.replace("path_", ""));
    const animations = [...this._config.animations];
    animations[idx] = { ...animations[idx], path: d };
    this._config = { ...this._config, animations };
    this._updateConfig();
    this._closeModal();
  }

  _updateValues() {
    const root = this.shadowRoot;
    const cfg = this._config;

    // Helper para definir valores
    const setVal = (id, val) => { const el = root.getElementById(id); if (el) el.value = val; };
    const setCheck = (id, val) => { const el = root.getElementById(id); if (el) el.checked = val; };

    setVal("image", cfg.image);
    setVal("image_opacity", cfg.image_opacity);
    setVal("badge_opacity", cfg.badge_opacity);
    setVal("view_box", cfg.view_box);
    setCheck("show_grid", cfg.show_grid);
    
    const swPicker = root.getElementById("switch");
    if (swPicker) {
      swPicker.value = cfg.switch || "";
      if (this._hass) swPicker.hass = this._hass;
    }
    
    setVal("switch_left", cfg.switch_position.left);
    setVal("switch_top", cfg.switch_position.top);
    setVal("flow_left", cfg.flow_position.left);
    setVal("flow_top", cfg.flow_position.top);

    for (let i = 0; i < cfg.entities.length; i++) {
      setCheck(`vis${i}`, cfg.visible[i] !== false);
      setCheck(`show_label${i}`, cfg.show_labels[i] !== false);
      setVal(`name${i}`, cfg.names[i] || "");
      
      const summary = root.getElementById(`summary${i}`);
      if (summary) {
        const label = cfg.names[i] || `Nome ${i + 1}`;
        summary.textContent = `Item ${i + 1} - ${label}`;
      }

      setVal(`color${i}`, cfg.colors[i] || "#ffffff");
      setVal(`badge_color${i}`, cfg.badge_colors[i] || "#000000");
      setVal(`icon_color${i}`, cfg.icon_colors[i] || "#ffffff");
      setVal(`font_size${i}`, cfg.font_sizes[i] || "");
      
      const iconPicker = root.getElementById(`icon${i}`);
      if (iconPicker) {
        iconPicker.value = cfg.icons[i] || "";
        if (this._hass) iconPicker.hass = this._hass;
      }
      
      const entPicker = root.getElementById(`ent${i}`);
      if (entPicker) {
        entPicker.value = cfg.entities[i] || "";
        if (this._hass) entPicker.hass = this._hass;
      }

      const pos = cfg.positions[i] || {};
      setVal(`left${i}`, pos.left ?? "");
      setVal(`top${i}`, pos.top ?? "");
    }

    // Update Animations
    cfg.animations.forEach((anim, i) => {
      const entPicker = root.getElementById(`anim_ent${i}`);
      if (entPicker) {
        entPicker.value = anim.entity || "";
        if (this._hass) entPicker.hass = this._hass;
      }
      setVal(`anim_state${i}`, anim.state_on || "");
      setVal(`anim_color${i}`, anim.color || "#2681DC");
      setVal(`anim_threshold${i}`, anim.threshold || "");
      setVal(`anim_color_end${i}`, anim.color_end || anim.color || "#2681DC");
      setVal(`anim_width${i}`, anim.width || 2);
      setVal(`anim_speed${i}`, anim.speed || 1.5);
      setVal(`anim_path${i}`, anim.path || "");
      setVal(`anim_dash${i}`, anim.dash || "10 5");
      setVal(`anim_mask_dash${i}`, parseFloat(anim.mask_dash || "30"));
      
      const animStylePicker = root.getElementById(`anim_style${i}`);
      if (animStylePicker) {
        animStylePicker.value = anim.style || 'dashes';
      }
    });

    // Update Tanks
    (cfg.water_tanks || []).forEach((tank, i) => {
        const entPicker = root.getElementById(`tank_ent${i}`);
        if (entPicker) {
            entPicker.value = tank.entity || "";
            if (this._hass) entPicker.hass = this._hass;
        }
        setVal(`tank_x${i}`, tank.x);
        setVal(`tank_y${i}`, tank.y);
        setVal(`tank_w${i}`, tank.width);
        setVal(`tank_h${i}`, tank.height);
        setVal(`tank_opacity${i}`, tank.opacity);
        setVal(`tank_bubble_color${i}`, tank.bubble_color || "#ffffff");
        setVal(`tank_state${i}`, tank.state_on || "");
        setVal(`tank_threshold${i}`, tank.threshold || "");
    });

    // Update Fans
    (cfg.fans || []).forEach((fan, i) => {
        const entPicker = root.getElementById(`fan_ent${i}`);
        if (entPicker) {
            entPicker.value = fan.entity || "";
            if (this._hass) entPicker.hass = this._hass;
        }
        setVal(`fan_x${i}`, fan.x);
        setVal(`fan_y${i}`, fan.y);
        setVal(`fan_size${i}`, fan.size);
        setVal(`fan_tilt${i}`, fan.tilt || 0);
        setVal(`fan_rotate${i}`, fan.rotate || 0);
        setVal(`fan_skew${i}`, fan.skew || 0);
        setVal(`fan_color${i}`, fan.color || "#ffffff");
        setVal(`fan_stroke_color${i}`, fan.stroke_color || "");
        setVal(`fan_stroke_width${i}`, fan.stroke_width || 1);
        setVal(`fan_opacity${i}`, fan.opacity);
        setVal(`fan_speed${i}`, fan.speed || 1);
        setVal(`fan_threshold${i}`, fan.threshold || "");
        setCheck(`fan_reverse${i}`, fan.reverse === true);
    });

    // Update Pumps
    (cfg.pumps || []).forEach((pump, i) => {
        const entPicker = root.getElementById(`pump_ent${i}`);
        if (entPicker) {
            entPicker.value = pump.entity || "";
            if (this._hass) entPicker.hass = this._hass;
        }
        setVal(`pump_x${i}`, pump.x);
        setVal(`pump_y${i}`, pump.y);
        setVal(`pump_size${i}`, pump.size);
        setVal(`pump_image${i}`, pump.image || "");
        setVal(`pump_color${i}`, pump.color || "#ffffff");
        setVal(`pump_opacity${i}`, pump.opacity);
        setVal(`pump_speed${i}`, pump.speed || 1);
        setVal(`pump_threshold${i}`, pump.threshold || "");
        setCheck(`pump_reverse${i}`, pump.reverse === true);
    });
  }

  _handleDragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.dataset.index);
    e.dataTransfer.effectAllowed = "move";
    e.target.classList.add("dragging");
  }

  _handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  _handleDragEnd(e) {
    e.target.classList.remove("dragging");
  }

  _handleDrop(e) {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
    const targetBlock = e.target.closest(".entity-block");
    if (!targetBlock) return;
    const toIndex = parseInt(targetBlock.dataset.index);

    if (fromIndex === toIndex) return;

    const move = (arr, from, to) => {
      const newArr = [...(arr || [])];
      const [item] = newArr.splice(from, 1);
      newArr.splice(to, 0, item);
      return newArr;
    };

    this._config = {
      ...this._config,
      entities: move(this._config.entities, fromIndex, toIndex),
      names: move(this._config.names, fromIndex, toIndex),
      colors: move(this._config.colors, fromIndex, toIndex),
      badge_colors: move(this._config.badge_colors, fromIndex, toIndex),
      icons: move(this._config.icons, fromIndex, toIndex),
      icon_colors: move(this._config.icon_colors, fromIndex, toIndex),
      font_sizes: move(this._config.font_sizes, fromIndex, toIndex),
      visible: move(this._config.visible, fromIndex, toIndex),
      show_labels: move(this._config.show_labels, fromIndex, toIndex),
      positions: move(this._config.positions, fromIndex, toIndex),
    };
    
    this._updateConfig();
  }

  _updateConfig() {
    const event = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  _handleFocusEvent(e) {
    const idx = e.detail.index;
    const el = this.shadowRoot.querySelector(`details[data-index="${idx}"]`);
    if (el) {
      el.open = true;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Feedback visual (flash)
      const originalBg = el.style.background;
      el.style.background = "rgba(38, 129, 220, 0.3)";
      setTimeout(() => {
        el.style.background = originalBg || "rgba(0,0,0,0.1)";
      }, 600);
    }
  }
}

customElements.define("bomba-calor-card-editor", BombaCalorCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "bomba-calor-card",
  name: "Bomba de Calor",
  description: "Cartão bomba de calor",
});