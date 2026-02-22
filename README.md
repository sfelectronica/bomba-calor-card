<div align="right">
  <a href="README.pt.md">PT Portugues</a> | <b>EN English</b>
</div>

# Heat Pump Card

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=sfelectronica&repository=bomba-calor-card&category=plugin)

A custom card for Home Assistant focused on visualizing Heat Pump systems, featuring flow animations, fans, and piping.

<p align="center">
  <img src="https://github.com/sfelectronica/bomba-calor-card/blob/main/preview.gif?raw=true" alt="Preview Card - Heat Pump" width="48%">
  &nbsp;
  <img src="https://github.com/sfelectronica/bomba-calor-card/blob/main/previewp.gif?raw=true" alt="Preview Card - Pellet Boiler" width="48%">
</p>

## Installation via HACS

Click the "Open in HACS" button above or follow the manual steps:

1. Make sure you have [HACS](https://hacs.xyz/) installed.
2. Go to **HACS** > **Frontend**.
3. Click the 3-dot menu in the top right corner -> **Custom repositories**.
4. Add this GitHub repository URL: `https://github.com/sfelectronica/bomba-calor-card`
5. Category: **Lovelace**.
6. Click **Add** and then install the card.

## Manual Installation

1. Download the `bomba-calor-card.js` file from this repository.
2. Copy the file to the `/config/www/community/bomba-calor-card/` folder in your Home Assistant (create the folder if it doesn't exist).
3. Add the resource to your Dashboard.

If using YAML mode (`configuration.yaml`), add the following:

```yaml
lovelace:
  resources:
    - url: /local/community/bomba-calor-card/bomba-calor-card.js
      type: module
```

## Background Image

By default, the card looks for an image at `/local/cardbomba.jpg`.
You should upload your background image to the `www` folder in your Home Assistant and configure the path in the card's visual editor.

### Downloading Images
You can download example images directly from the repository:
- Main Background Image (BombaGold.png)
- Pump Image (pumpgold.png)

## Features

This card offers a robust set of tools to create animated hydraulic and thermal schematics:

### 1. Integrated Visual Editor
* **"Point-and-Click" Configuration:** Click directly on the preview image to position sensors, pumps, and fans.
* **Pipe Drawing Tool:** Draw complex curved paths (Bézier Curves) by clicking on the image, with adjustable curve tension.
* **Drag-and-Drop:** Reorder entities in the list by dragging them.
* **Guide Grid:** An auxiliary grid for precise alignment of elements.
* **Backup and Restore:** Export and import the complete card configuration in JSON format.
* **Multi-language:** Interface available in Portuguese, English, Spanish, French, and German.

### 2. Entity Management
* Support for multiple sensors (temperatures, pressures, consumption).
* **Visual Customization:** Name, Icon, Text Color, Icon Color, and Background Color (Badge).
* **Tap Actions:** Configure what happens when clicking an entity: show more info, toggle state, navigate to another Home Assistant page, or call a service.
* **Conditional Visibility:** Hide or show an entity based on the state of another (e.g., show panel temperature only if the solar pump is on).
* **Value Formatting:**
  * **Custom Unit:** Override the original unit of measurement (e.g., from `W` to `Watts`) or remove it entirely.
  * **Multiplier:** Apply a multiplication factor to the sensor value (useful for conversions like W -> kW).
  * **Decimals:** Set the number of decimal places to display.
* **Hide State:** Show only the entity's icon, hiding the numerical value for a cleaner look.
* **Visual Alert:** Activate a blinking effect on the entity's badge when its value exceeds defined thresholds.
* **Dynamic Colors:** Automatically change the icon color based on threshold values (e.g., Blue if < 10°, Red if > 60°).
* **Font Style:** Adjust individual font size and weight (Normal or Bold).

### 3. Switches and Buttons
* **Main Switch:** Dedicated button to turn a primary actuator on/off (e.g., recirculation pump).
* **Additional Switches:** Add multiple control buttons anywhere in the diagram.
* **Complete Customization:**
  * Define texts, icons, and colors for the `on` and `off` states.
  * Adjust the button and icon size.
  * Choose the button style: **Default**, **Square**, **Round**, or **Transparent** (in this mode, only the icon/text takes the state color).
  * Add an optional text label above each switch.

### 4. Flow Animations (Pipes)
Create visual representations of fluid moving through pipes:
* **Line Styles:** Dashes, Dots, Shimmer, Pulse, and Comet.
* **Gradients:** Define start and end colors to simulate heating or cooling along the pipe.
* **Activation Logic:** Animations can be triggered by the entity state (e.g., "on") or by a **Numeric Threshold** (e.g., activate only if power > 20W).
* Control over speed, width, and trail size.
* **Low-Performance Mode:** Option to disable heavy effects (blur) for better smoothness on older devices.

### 5. Dynamic Components
* **Fans:**
  * 3D simulation with adjustable Tilt and Skew.
  * Animated rotation with adjustable speed.
  * Option for reverse rotation.
* **Circulator Pumps:**
  * Spinning rotor animation.
  * Support for **Custom Images** (upload your own pump image, which will rotate).
* **Water Tanks:**
  * **Visual Styles:** Bubbles, Waves, Ripple, **Fire**, and **Jet**.
  * **Fire Effect (GIF):**
    * Support for animated GIFs with transparency.
    * **Dynamic Coloring:** The fire changes color (e.g., Blue -> Red) based on the defined temperature.
    * **Interactive Flame:** Option to **automatically resize** the animation (increase/decrease flame size) proportionally to the temperature.
  * **Jet Effect:** Simulates flowing particles (e.g., filling silos or airflow).
    * Supports reverse mode (funnel/suction effect).
    * Adjustable particle density.
  * **Rotation:** Allows rotating the tank and its contents (useful for horizontal or inclined pipes).
  * Configurable colors, opacity, and dimensions.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
Basically: you can freely use, modify, and distribute it, but with no warranties of functionality or liability from the author.
