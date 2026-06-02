import { insertHeader, insertFooter, insertHead, insertNavButtons } from "./utils/page-layout.js";
import { config } from "./config/config.js"

window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("Information");
    insertHeader();
    insertNavButtons();
    insertFooter();

    document.getElementById("dp-link").href = `${config.portal_url}product/EVAWG`

})