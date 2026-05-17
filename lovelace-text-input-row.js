import { LitElement, html } from "https://unpkg.com/lit@2/index.js?module";

class TextInputRow extends LitElement {
  static get properties() {
    return {
      label: { type: String },
      value: { type: String },
      minlength: { type: Number },
      maxlength: { type: Number },
      pattern: { type: String },
      mode: { type: String },
      stateObj: { type: Object },
      _config: { type: Object },
      _hass: { type: Object },
    };
  }

  constructor() {
    super();
    this.label = '';
    this.value = '';
    this.minlength = 0;
    this.maxlength = Infinity;
    this.pattern = '';
    this.mode = 'text';
    this.stateObj = null;
    this._config = null;
    this._hass = null;
  }

  render() {
    return html`
      <ha-input
        label="${this.label}"
        style="width: 100%"
        .value="${this.value || ''}"
        minlength="${this.minlength}"
        maxlength="${this.maxlength}"
        pattern="${this.pattern}"
        type="${this.mode}"
        @change="${this.valueChanged}"
        id="textinput"
      ></ha-input>
    `;
  }

  firstUpdated() {
    const input = this.shadowRoot.getElementById("textinput");
    if (input) {
      input.addEventListener('click', (ev) => ev.stopPropagation());
    }
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Du musst eine Entity angeben (z.B. input_text.mein_text)");
    }
    this._config = config;
  }

  valueChanged(ev) {
    if (!this._hass || !this._config?.entity) return;

    const newValue = ev.target.value;

    this._hass.callService('input_text', 'set_value', {
      entity_id: this._config.entity,
      value: newValue
    });
  }

  computeObjectId(entityId) {
    return entityId ? entityId.substr(entityId.indexOf(".") + 1) : '';
  }

  computeStateName(stateObj) {
    if (!stateObj) return '';
    return stateObj.attributes.friendly_name || 
           this.computeObjectId(stateObj.entity_id).replace(/_/g, " ");
  }

  set hass(hass) {
    this._hass = hass;

    if (!this._config?.entity || !hass) return;

    this.stateObj = hass.states[this._config.entity];

    if (this.stateObj) {
      this.value = this.stateObj.state || '';
      this.minlength = this.stateObj.attributes.min || 0;
      this.maxlength = this.stateObj.attributes.max || Infinity;
      this.pattern = this.stateObj.attributes.pattern || '';
      this.mode = this.stateObj.attributes.mode || 'text';
      this.label = this._config.name || this.computeStateName(this.stateObj);
    }
  }
}

customElements.define('text-input-row', TextInputRow);
