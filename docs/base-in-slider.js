document.addEventListener('DOMContentLoaded', function () {
  
  const irs_observer = new MutationObserver(() => {
    let irs_min = document.getElementsByClassName("irs-min")[0];
    let irs_from = document.getElementsByClassName("irs-from")[0];
    let irs_single = document.getElementsByClassName("irs-single")[0];
    let irs_to = document.getElementsByClassName("irs-to")[0];
    
    let labels = [irs_min, irs_from, irs_single, irs_to];
    
    for (let i = 0; i < labels.length; i ++) {
      labels[i].textContent = labels[i].textContent.replace("1989", "Base year");
    }
    
    let irs_grid_text = document.getElementsByClassName("irs-grid-text");
    for (let i = 0; i < irs_grid_text.length; i ++) {
      if (irs_grid_text[i].textContent == "1989") {
        irs_grid_text[i].innerHTML = "Base"
      }
    }
    
  })
  
  irs_observer.observe(document, { childList: true, subtree: true });

  
});