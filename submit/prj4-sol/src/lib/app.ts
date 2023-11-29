import { Errors } from "cs544-js-utils";
import { PagedValues, makeSensorsWs, SensorsWs } from "./sensors-ws.js";

import init from "./init.js";
import { makeElement, getFormData } from "./utils.js";
import { checkField } from "cs544-js-utils/dist/lib/checkers.js";

export default function makeApp(wsUrl: string) {
  const ws = makeSensorsWs(wsUrl);
  init();
  //TODO: add call to select initial tab and calls to set up
  //form submit listeners
  defaultTab("addSensorType");

  // Event for addingSensorType
  const addSensorType = document.querySelector("#addSensorType-form") as HTMLFormElement;
  addSensorType?.addEventListener("submit", async (eve: SubmitEvent) => {
    eve.preventDefault();
    clearErrors("addSensorType");
    clearResults("addSensorType");
    const formdata = getFormData(addSensorType);
    const responseFromAPI = await ws.addSensorType(formdata);
    if (responseFromAPI.isOk) {
      displayResultSingle("addSensorType", responseFromAPI.val);
    } else {
      displayErrors("addSensorType", responseFromAPI.errors);
    }
  });

  // Event for addingSensor
  const addSensor = document.querySelector("#addSensor-form") as HTMLFormElement;
  addSensor?.addEventListener("submit", async (eve: SubmitEvent) => {
    eve.preventDefault();
    clearErrors("addSensor");
    clearResults("addSensor");
    const formdata = getFormData(addSensor);
    const responseFromAPI = await ws.addSensor(formdata);
    if (responseFromAPI.isOk) {
      displayResultSingle("addSensor", responseFromAPI.val);
    } else {
      displayErrors("addSensor", responseFromAPI.errors);
    }
  });

  // FindSensor Type
  const findSensorType = document.querySelector("#findSensorTypes-form") as HTMLFormElement;
  findSensorType.addEventListener("submit", async (eve: SubmitEvent) => {
    eve.preventDefault();
    clearErrors("findSensorTypes");
    clearResults("findSensorTypes");
    const formdata = getFormData(findSensorType);
    const responseFromAPI = await ws.findSensorTypesByReq(formdata);
    if (responseFromAPI.isOk) {
      displayResultMulti("findSensorTypes", responseFromAPI.val, ws.findSensorTypesByRelLink.bind(ws));
    } else {
      displayErrors("findSensorTypes", responseFromAPI.errors);
    }
  });

  // Find Sensor
  const findSensor = document.querySelector("#findSensors-form") as HTMLFormElement;
  findSensor.addEventListener("submit", async (eve: SubmitEvent) => {
    eve.preventDefault();
    clearErrors("findSensors");
    clearResults("findSensors");
    const formdata = getFormData(findSensor);
    const responseFromAPI = await ws.findSensorsByReq(formdata);
    if (responseFromAPI.isOk) {
      displayResultMulti("findSensors", responseFromAPI.val, ws.findSensorsByRelLink.bind(ws));
    } else {
      displayErrors("findSensors", responseFromAPI.errors);
    }
  });
}

/** clear out all errors within tab specified by rootId */
function clearErrors(rootId: string) {
  document.querySelectorAll(`.${rootId}-errors`).forEach((el) => {
    el.innerHTML = "";
  });
}
/** Display errors for rootId.  If an error has a widget widgetId such
 *  that an element having ID `${rootId}-${widgetId}-error` exists,
 *  then the error message is added to that element; otherwise the
 *  error message is added to the element having to the element having
 *  ID `${rootId}-errors` wrapped within an `<li>`.
 */
function displayErrors(rootId: string, errors: Errors.Err[]) {
  for (const err of errors) {
    const id = err.options.widget;
    const widget = id && document.querySelector(`#${rootId}-${id}-error`);
    if (widget) {
      widget.append(err.message);
    } else {
      const li = makeElement("li", { class: "error" }, err.message);
      document.querySelector(`#${rootId}-errors`)!.append(li);
    }
  }
}

// Function to populate Single Result
function displayResultSingle(rootId: string, results: Record<string, string>) {
  const elementSelected = document.querySelector(`#${rootId}-results`);
  const e = makeElement("dl", { class: "result" }, "");
  for (let key in results) {
    e.appendChild(makeElement("dt", {}, key));
    e.appendChild(makeElement("dd", {}, results[key]));
  }
  elementSelected?.appendChild(e);
}

// Function to populate multiple results
function displayResultMulti(id: string, results: PagedValues, linkFn: (relLink: string) => Promise<Errors.Result<PagedValues>>) {
  const elementSelected = document.querySelector(`#${id}-results`);
  results.values.forEach((element) => {
    const e = makeElement("dl", { class: "result" }, "");

    Object.entries(element).forEach(([key, value]) => {
      e.appendChild(makeElement("dt", {}, key));
      e.appendChild(makeElement("dd", {}, value));
    });

    elementSelected?.appendChild(e);
  });

  const pagedata = document.querySelector(`#${id}-content`);
  const nextScrollOG = pagedata?.querySelector('[rel="next"]')!;
  const prevScrollOG = pagedata?.querySelector('[rel="prev"]')!;
  const nextScroll = nextScrollOG.cloneNode(true) as HTMLElement;
  const prevScroll = prevScrollOG.cloneNode(true) as HTMLElement;

  // This is set up for next link
  if (results && results.next) {
    setVisibility(nextScroll, true);
    nextScroll.addEventListener("click", async (eve: Event) => {
      clearResults(id);
      const responseFromAPI = await linkFn(results.next!);
      if (responseFromAPI && responseFromAPI.isOk) {
        displayResultMulti(id, responseFromAPI.val, linkFn);
      } else {
        responseFromAPI && displayErrors(id, responseFromAPI.errors);
      }
    });
  } else {
    setVisibility(nextScroll, false);
  }
  // Once is setup for previous link 
  if (results && results.prev) {
    setVisibility(prevScroll, true);
    prevScroll.addEventListener("click", async (eve: Event) => {
      clearResults(id);
      const responseFromAPI = await linkFn(results.prev!);
      if (responseFromAPI && responseFromAPI.isOk) {
        displayResultMulti(id, responseFromAPI.val, linkFn);
      } else {
        responseFromAPI && displayErrors(id, responseFromAPI.errors);
      }
    });
  } else {
    setVisibility(prevScroll, false);
  }
  const nextScrollOgParent = nextScrollOG.parentNode!;
  const prevScrollOgParent = prevScrollOG.parentNode!;
  nextScrollOgParent.replaceChild(nextScroll, nextScrollOG);
  prevScrollOgParent.replaceChild(prevScroll, prevScrollOG);
}

// Function to clear
function clearResults(id: string) {
  const widget = document.querySelector(`#${id}-results`);
  while (widget?.hasChildNodes()) {
    widget.firstChild && widget?.removeChild(widget.firstChild);
  }
}

/** Turn visibility of element on/off based on isVisible.  This
 *  is done by adding class "show" or "hide".  It presupposes
 *  that "show" and "hide" are set up with appropriate CSS styles.
 */
function setVisibility(element: HTMLElement, isVisible: boolean) {
  element.classList.add(isVisible ? "show" : "hide");
  element.classList.remove(isVisible ? "hide" : "show");
}

// select tab function for initial selection
function defaultTab(id: string) {
  const selectedelement = document.querySelector(`#${id}-tab`);
  if (selectedelement) {
    selectedelement.setAttribute("checked", "checked");
  }
}
