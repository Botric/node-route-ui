export default class NodeRouteUI {
  constructor(options = {}) {
    this.options = {
      target: "body",

      startColor: "#00c853",
      endColor: "#d50000",
      middleColor: "#ffffff",

      lineColor: "#000000",
      cardBackground: "#f7f7f7",
      cardBorderColor: "#222222",

      cardGap: 18,
      width: "850px",

      editable: true,
      removable: true,
      sortable: true,

      emptyText: "No locations added yet",
      items: [],

      onChange: null,

      ...options
    };

    this.items = Array.isArray(this.options.items)
      ? this.options.items.map(normaliseItem)
      : [];

    this.dragFromIndex = null;

    this.container =
      typeof this.options.target === "string"
        ? document.querySelector(this.options.target)
        : this.options.target;

    if (!this.container) {
      throw new Error("NodeRouteUI target was not found.");
    }

    this.container.classList.add("nru-root");
    this.render();
  }

  addBlank() {
    this.addItem({});
  }

  addItem(item = {}) {
    this.items.push(normaliseItem(item));
    this.render();
    this.emitChange();
  }

  removeItem(index) {
    if (!this.items[index]) return;

    this.items.splice(index, 1);
    this.render();
    this.emitChange();
  }

  moveItem(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    if (!this.items[fromIndex]) return;
    if (toIndex < 0 || toIndex >= this.items.length) return;

    const [item] = this.items.splice(fromIndex, 1);
    this.items.splice(toIndex, 0, item);

    this.render();
    this.emitChange();
  }

  setItems(items = []) {
    this.items = Array.isArray(items) ? items.map(normaliseItem) : [];
    this.render();
    this.emitChange();
  }

  getItems() {
    return this.items.map(item => ({ ...item }));
  }

  clear() {
    this.items = [];
    this.render();
    this.emitChange();
  }

  updateOptions(options = {}) {
    this.options = {
      ...this.options,
      ...options
    };

    this.render();
  }

  emitChange() {
    if (typeof this.options.onChange === "function") {
      this.options.onChange(this.getItems());
    }
  }

  updateItemField(index, field, value) {
    if (!this.items[index]) return;
    this.items[index][field] = value;
    this.emitChange();
  }

  render() {
    this.container.innerHTML = "";
    this.container.style.setProperty("--nru-width", this.options.width);
    this.container.style.setProperty("--nru-start-color", this.options.startColor);
    this.container.style.setProperty("--nru-end-color", this.options.endColor);
    this.container.style.setProperty("--nru-middle-color", this.options.middleColor);
    this.container.style.setProperty("--nru-line-color", this.options.lineColor);
    this.container.style.setProperty("--nru-card-bg", this.options.cardBackground);
    this.container.style.setProperty("--nru-card-border", this.options.cardBorderColor);
    this.container.style.setProperty("--nru-card-gap", `${Number(this.options.cardGap)}px`);

    if (this.items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "nru-empty";
      empty.textContent = this.options.emptyText;
      this.container.appendChild(empty);
      return;
    }

    const timeline = document.createElement("div");
    timeline.className = "nru-timeline";

    this.items.forEach((item, index) => {
      const stop = document.createElement("div");
      stop.className = "nru-stop";
      stop.dataset.index = String(index);

      if (index === 0) stop.classList.add("nru-first");
      if (index === this.items.length - 1) stop.classList.add("nru-last");
      if (this.items.length === 1) stop.classList.add("nru-only");

      if (this.options.sortable) {
        stop.draggable = true;
      }

      stop.appendChild(this.createTrack());
      stop.appendChild(this.createConnector());
      stop.appendChild(this.createCard(item, index));

      this.addDragEvents(stop, index);

      timeline.appendChild(stop);
    });

    this.container.appendChild(timeline);
  }

  createTrack() {
    const track = document.createElement("div");
    track.className = "nru-track";

    const dot = document.createElement("div");
    dot.className = "nru-dot";

    track.appendChild(dot);
    return track;
  }

  createConnector() {
    const connector = document.createElement("div");
    connector.className = "nru-connector";
    return connector;
  }

  createCard(item, index) {
    const card = document.createElement("div");
    card.className = "nru-card";

    const address = document.createElement("div");
    address.className = "nru-address";

    address.appendChild(this.createField(index, "house", item.house, "[House Name / No]"));
    address.appendChild(this.createField(index, "street", item.street, "[Street]"));
    address.appendChild(this.createField(index, "postcode", item.postcode, "[Postcode]"));

    const side = document.createElement("div");
    side.className = "nru-side";

    side.appendChild(this.createField(index, "order", item.order, "[Order]", "nru-order"));

    if (this.options.removable) {
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "nru-remove";
      removeButton.textContent = "×";
      removeButton.title = "Remove location";
      removeButton.addEventListener("click", () => this.removeItem(index));
      side.appendChild(removeButton);
    }

    if (this.options.sortable) {
      const handle = document.createElement("div");
      handle.className = "nru-drag-handle";
      handle.textContent = "↕";
      handle.title = "Drag to move";
      side.appendChild(handle);
    }

    card.appendChild(address);
    card.appendChild(side);

    return card;
  }

  createField(index, field, value, placeholder, className = "") {
    const el = document.createElement("div");

    if (className) {
      el.className = className;
    }

    if (this.options.editable) {
      el.contentEditable = "true";
      el.dataset.placeholder = placeholder;
      el.textContent = value || "";
      el.classList.add("nru-editable");

      el.addEventListener("input", () => {
        this.updateItemField(index, field, el.textContent.trim());
      });

      el.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          el.blur();
        }
      });
    } else {
      el.textContent = value || placeholder;
    }

    return el;
  }

  addDragEvents(stop, index) {
    if (!this.options.sortable) return;

    stop.addEventListener("dragstart", event => {
      this.dragFromIndex = index;
      stop.classList.add("nru-dragging");

      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(index));
      }
    });

    stop.addEventListener("dragend", () => {
      this.dragFromIndex = null;
      this.container.querySelectorAll(".nru-stop").forEach(el => {
        el.classList.remove("nru-dragging", "nru-drop-target");
      });
    });

    stop.addEventListener("dragover", event => {
      event.preventDefault();
      stop.classList.add("nru-drop-target");

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }
    });

    stop.addEventListener("dragleave", () => {
      stop.classList.remove("nru-drop-target");
    });

    stop.addEventListener("drop", event => {
      event.preventDefault();
      stop.classList.remove("nru-drop-target");

      const fromIndex = this.dragFromIndex;
      const toIndex = Number(stop.dataset.index);

      this.dragFromIndex = null;

      if (Number.isInteger(fromIndex) && Number.isInteger(toIndex)) {
        this.moveItem(fromIndex, toIndex);
      }
    });
  }
}

function normaliseItem(item = {}) {
  return {
    house: item.house || "",
    street: item.street || "",
    postcode: item.postcode || "",
    order: item.order || ""
  };
}
