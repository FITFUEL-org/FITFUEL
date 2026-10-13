import "./styles/main.css";
import { U, IMG } from "./state.js";
import { load } from "./storage.js";
import { $ } from "./ui/dom.js";
import { bindDietForm } from "./ui/diet.js";
import { bindWizard, draw1 } from "./ui/wizard.js";
import { bindTabs, enter } from "./ui/tabs.js";
import { fillSub } from "./ui/exercises.js";

// App start-up, in the same order as the original single-file script.
function init() {
  bindDietForm();   // planner form listeners + first render (empty profile)
  bindWizard();     // onboarding wizard events
  bindTabs();       // bottom nav + global click/change delegation
  load();           // restore saved profile from localStorage
  if (U.theme) document.documentElement.dataset.theme = U.theme;
  if (U.img) ["wiz", "home", "ex", "rep", "me"].forEach(k => IMG[k] = U.img);
  fillSub();
  if (U.done) enter(); else { $("wiz").hidden = false; draw1(); }
}

init();
