// Wait for the load event
window.addEventListener("load", main);

function main() {
  let divStack = [];
  let divIndex = 0;
  let divMoving = false;
  const thickness = 15;
  const surfaceSize = 48;
  const pointerSize = 12;

  const createStackDiv = (posX, posY) => {
    const index = divStack.length;
    const outerBox = document.createElement("div");
    outerBox.id = "square" + index;
    outerBox.classList.add("outer-box");
    outerBox.style.borderWidth = thickness + "px";
    outerBox.style.borderStyle = "solid";
    outerBox.style.left = posX - thickness + "px";
    outerBox.style.top = posY - thickness + "px";
    outerBox.style.right = window.innerWidth - posX + "px";
    outerBox.style.bottom = window.innerHeight - posY + "px";
    outerBox.style.borderRadius = thickness / 2 + "px";
    const innerBox = document.createElement("div");
    innerBox.classList.add("inner-box");
    innerBox.style.borderWidth = thickness / 3 + "px";
    innerBox.style.borderStyle = "solid";

    // Extract the domain from the URL
    const currentDomain = new URL(window.location.href).hostname;

    // Log or use the domain as needed
    // console.log(`Current domain: ${currentDomain}`);
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

  // Move view bar
  // setTimeout(() => {
  //   const viewBar = document.querySelector(".view-bar");
  //   viewBar.remove();
  //   document.getElementById("root").appendChild(viewBar);
  // }, 6000);

  // Create div elements
  const pointerSurface = document.createElement("div");
  pointerSurface.id = "pointer-surface";
  pointerSurface.style.width = surfaceSize + "px";
  pointerSurface.style.height = surfaceSize + "px";
  pointerSurface.innerHTML = `
    <div id="pointer-led"><div>
  `;
  document.body.prepend(pointerSurface); // Add to the <body> element
  pointerSurface.style.pointerEvents = "none"; // Make it transparent to mouse events
  const pointerLED = document.getElementById("pointer-led");
  pointerLED.style.height = pointerSize + "px";
  pointerLED.style.width = pointerSize + "px";
  pointerLED.style.left = surfaceSize / 3 + "px";
  pointerLED.style.top = surfaceSize / 3 + "px";

  // Add a keydown event listener to the element.
  window.addEventListener("keydown", function (event) {
    if (event.key === "Shift") {
      // Prevent the default behavior of the key press.
      event.preventDefault();
      pointerSurface.style.pointerEvents = "all";
      pointerLED.style.backgroundColor = "rgb(255, 61, 90)";
    }
  });

  // Add a keyup event listener to the element.
  window.addEventListener("keyup", function (event) {
    if (event.key === "Shift") {
      // Prevent the default behavior of the key press.
      event.preventDefault();
      pointerLED.style.backgroundColor = "#7777";
      pointerSurface.style.pointerEvents = "none";
    }
  });

  // Add a keyup event listener to the element.
  window.addEventListener("mousemove", function (event) {
    pointerSurface.style.left = event.clientX - surfaceSize / 2 + "px";
    pointerSurface.style.top = event.clientY - surfaceSize / 2 + "px";
  });

  // Add a mousedown event listener to the element.
  pointerSurface.addEventListener("mousedown", function (event) {
    if (!divMoving) {
      event.preventDefault();
      divIndex = createStackDiv(event.clientX, event.clientY);
      document.body.appendChild(divStack[divIndex]);
      divMoving = true;
    }
  });

  // Add a mousemove event listener to the element.
  pointerSurface.addEventListener("mousemove", function (event) {
    if (divMoving) {
      event.preventDefault();
      const element = divStack[divIndex];
      element.style.right = window.innerWidth - event.clientX + "px";
      element.style.bottom = window.innerHeight - event.clientY + "px";
    }
  });

  // Add a mouseup event listener to the element.
  pointerSurface.addEventListener("mouseup", function (event) {
    if (divMoving) {
      event.preventDefault();
      const element = divStack[divIndex];
      element.style.opacity = 0.0;
      divMoving = false;
    }
  });

  // Send a message to the background script to set the zoom level
  chrome.runtime.sendMessage({
    action: "setZoomLevel",
    zoomLevel: 1.3,
  });

  // Dynamically inject a <link> element to apply the CSS rules
  const linkElement = document.createElement("link");
  linkElement.rel = "stylesheet";
  linkElement.type = "text/css";
  linkElement.href = chrome.runtime.getURL("styles.css"); // Use the correct path to your CSS file

  document.head.appendChild(linkElement);
}
