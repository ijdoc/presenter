/**
 * Presenting: the pointer and the fading highlights drawn while armed (Shift held).
 *
 * Behaviour is unchanged from the original content script; what is new is that it can be
 * switched off and on again from the popup without a reload.
 */

/**
 * @param {Document} doc - The page document
 * @param {Window} win - The page window
 * @returns {{setEnabled: function(boolean): void}}
 */
export function createPresenting(doc, win) {
  let divStack = [];
  let divIndex = 0;
  let divMoving = false;
  let pointerSurface = null;
  let pointerLED = null;
  const thickness = 15;
  const surfaceSize = 48;
  const pointerSize = 12;
  // The pointer sits under a filter (invert, hue-rotate, contrast 80%, brightness 120%; see
  // presenting.css) that washes any colour out. This input shows as rgb(105, 141, 242):
  // CoreWeave Primary Blue #0541E9 washed by the same ~40% the original red was.
  const ARMED_COLOR = "rgb(103, 141, 246)";

  const createStackDiv = (posX, posY) => {
    const index = divStack.length;
    const outerBox = doc.createElement("div");
    outerBox.id = "square" + index;
    outerBox.classList.add("outer-box");
    outerBox.style.borderWidth = thickness + "px";
    outerBox.style.borderStyle = "solid";
    outerBox.style.left = posX - thickness + "px";
    outerBox.style.top = posY - thickness + "px";
    outerBox.style.right = win.innerWidth - posX + "px";
    outerBox.style.bottom = win.innerHeight - posY + "px";
    outerBox.style.borderRadius = thickness / 2 + "px";
    const innerBox = doc.createElement("div");
    innerBox.classList.add("inner-box");
    innerBox.style.borderWidth = thickness / 3 + "px";
    innerBox.style.borderStyle = "solid";

    const currentDomain = new URL(win.location.href).hostname;
    if (currentDomain.startsWith("workhorse")) {
      innerBox.style.width = "calc(100% + " + (2 * thickness) / 3 + "px)";
      innerBox.style.height = "calc(100% + " + (2 * thickness) / 3 + "px)";
    } else {
      innerBox.style.width = "calc(100% + " + (4 * thickness) / 3 + "px)";
      innerBox.style.height = "calc(100% + " + (4 * thickness) / 3 + "px)";
    }
    innerBox.style.margin = -(2 * thickness) / 3 + "px";
    innerBox.style.borderRadius = thickness / 2 + "px";
    outerBox.appendChild(innerBox);
    // Make sure the box always disappears
    setTimeout(() => {
      outerBox.style.opacity = 0.0;
    }, 5000);
    divStack.push(outerBox);
    return index;
  };

  const onKeyDown = (event) => {
    if (event.key === "Shift") {
      event.preventDefault();
      pointerSurface.style.pointerEvents = "all";
      pointerLED.style.backgroundColor = ARMED_COLOR;
    }
  };

  const onKeyUp = (event) => {
    if (event.key === "Shift") {
      event.preventDefault();
      pointerLED.style.backgroundColor = "#7777";
      pointerSurface.style.pointerEvents = "none";
    }
  };

  const onWindowMouseMove = (event) => {
    pointerSurface.style.left = event.clientX - surfaceSize / 2 + "px";
    pointerSurface.style.top = event.clientY - surfaceSize / 2 + "px";
  };

  const onSurfaceMouseDown = (event) => {
    if (!divMoving) {
      event.preventDefault();
      divIndex = createStackDiv(event.clientX, event.clientY);
      doc.body.appendChild(divStack[divIndex]);
      divMoving = true;
    }
  };

  const onSurfaceMouseMove = (event) => {
    if (divMoving) {
      event.preventDefault();
      const element = divStack[divIndex];
      element.style.right = win.innerWidth - event.clientX + "px";
      element.style.bottom = win.innerHeight - event.clientY + "px";
    }
  };

  const onSurfaceMouseUp = (event) => {
    if (divMoving) {
      event.preventDefault();
      const element = divStack[divIndex];
      element.style.opacity = 0.0;
      divMoving = false;
    }
  };

  const install = () => {
    pointerSurface = doc.createElement("div");
    pointerSurface.id = "pointer-surface";
    pointerSurface.style.width = surfaceSize + "px";
    pointerSurface.style.height = surfaceSize + "px";
    pointerLED = doc.createElement("div");
    pointerLED.id = "pointer-led";
    pointerLED.style.height = pointerSize + "px";
    pointerLED.style.width = pointerSize + "px";
    pointerLED.style.left = surfaceSize / 3 + "px";
    pointerLED.style.top = surfaceSize / 3 + "px";
    pointerSurface.appendChild(pointerLED);
    doc.body.prepend(pointerSurface);
    pointerSurface.style.pointerEvents = "none"; // Make it transparent to mouse events

    win.addEventListener("keydown", onKeyDown);
    win.addEventListener("keyup", onKeyUp);
    win.addEventListener("mousemove", onWindowMouseMove);
    pointerSurface.addEventListener("mousedown", onSurfaceMouseDown);
    pointerSurface.addEventListener("mousemove", onSurfaceMouseMove);
    pointerSurface.addEventListener("mouseup", onSurfaceMouseUp);
  };

  const uninstall = () => {
    win.removeEventListener("keydown", onKeyDown);
    win.removeEventListener("keyup", onKeyUp);
    win.removeEventListener("mousemove", onWindowMouseMove);
    pointerSurface.remove();
    divStack.forEach((box) => box.remove());
    divStack = [];
    divMoving = false;
    pointerSurface = null;
    pointerLED = null;
  };

  const setEnabled = (enabled) => {
    if (enabled && !pointerSurface) {
      install();
    } else if (!enabled && pointerSurface) {
      uninstall();
    }
  };

  return { setEnabled };
}
