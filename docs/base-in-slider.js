document.addEventListener('DOMContentLoaded', function () {

  const target = document.getElementById("EmissionYear");

  if (!target) {
    console.warn("⚠️ EmissionYear slider container not found.");
    return;
  }

  const irs_observer = new MutationObserver(() => {
    const labelClasses = ["irs-min", "irs-from", "irs-single", "irs-to"];
    labelClasses.forEach(cls => {
      const els = target.getElementsByClassName(cls);
      if (els.length > 0 && els[0].textContent.includes("1989")) {
        els[0].textContent = els[0].textContent.replace("1989", "Base year");
      }
    });

    const gridLabels = target.getElementsByClassName("irs-grid-text");
    for (let i = 0; i < gridLabels.length; i++) {
      if (gridLabels[i].textContent === "1989") {
        gridLabels[i].textContent = "Base";
      }
    }
  });

  irs_observer.observe(target, {
    childList: true,
    subtree: true
  });

});