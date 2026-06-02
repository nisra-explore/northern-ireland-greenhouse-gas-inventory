export function populateInfoBoxes(labels, content) {
  const info_boxes = document.getElementById("info-boxes");

  let buttons = "";
  for (let i = 0; i < labels.length; i++) {
    let button_style = "";
    if (i === labels.length - 1) {
      button_style += "border-right: 2px solid #00205B; border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem;";
    }
    if (i === 0) {
      button_style += "border-top-left-radius: 0.5rem; border-bottom-left-radius: 0.5rem;";
    }

    buttons += `
      <div class="col p-0">
        <h2 class="accordion-header h-100" role="heading">
          <button
            class="accordion-button collapsed h-100 info-tab-btn"
            type="button"
            style="${button_style}"
            data-index="${i}"
            aria-expanded="false"
            aria-controls="infoCollapse"
          >
            ${labels[i]}
          </button>
        </h2>
      </div>
    `;
  }

  info_boxes.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-12 col-xl-8 accordion py-4" id="infoAccordion">
        <div class="row g-3">
          ${buttons}
        </div>

        <div class="info-card-wrap">
          <div id="info-card" class="card my-3">

            <div id="infoCollapse" class="accordion-collapse collapse" data-active-index="">
              <div class="accordion-body">
                <h2 id="infoTitle" style="color:#00205B;"></h2>
                <div id="infoBody"></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  `;

  // Hook up behaviour
  const collapseEl = document.getElementById("infoCollapse");
  const titleEl = document.getElementById("infoTitle");
  const bodyEl = document.getElementById("infoBody");
  const btns = info_boxes.querySelectorAll(".info-tab-btn");

  // Bootstrap Collapse controller
  const bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapseEl, { toggle: false });

  function setActiveButton(activeIdx) {
    btns.forEach((b, idx) => {
      const isActive = idx === activeIdx;
      b.classList.toggle("collapsed", !isActive);
      b.setAttribute("aria-expanded", String(isActive));
    });
  }

  function setContent(idx) {
    titleEl.textContent = labels[idx];
    bodyEl.innerHTML = content[idx];
    collapseEl.dataset.activeIndex = String(idx);
  }

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      const isOpen = collapseEl.classList.contains("show");
      const activeIdx = collapseEl.dataset.activeIndex === "" ? null : Number(collapseEl.dataset.activeIndex);

      // If closed: open with animation (Bootstrap handles animation)
      if (!isOpen) {
        setContent(idx);
        setActiveButton(idx);
        bsCollapse.show();
        return;
      }

      // If open and clicking same header: close with animation
      if (activeIdx === idx) {
        setActiveButton(-1); // mark all collapsed
        bsCollapse.hide();
        collapseEl.dataset.activeIndex = "";
        return;
      }

      // If open and clicking different header: NO animation, just swap content
      setContent(idx);
      setActiveButton(idx);
    });
  });

  // When collapse fully hides, make sure buttons reflect state
  collapseEl.addEventListener("hidden.bs.collapse", () => {
    btns.forEach((b) => {
      b.classList.add("collapsed");
      b.setAttribute("aria-expanded", "false");
    });
  });
}
