console.log("hello from parcitipate event");

function domReady(fn) {
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

domReady(function () {
  const qr = document.getElementById("qr-result");
  let lastResult;
  let countResults = 0;

  function onScanSuccess(decodeText, decodeResult) {
    if (decodeText !== lastResult) {
      lastResult = decodeText;
      countResults++;
      lastResult = decodeResult;
      alert("your event : " + decodeText, decodeResult);
      //qr.innerHTML = `<div>${decodeText}</div>`;
      qr.textContent = `you scan ${countResults} : ${decodeText}`;
      const eventPageUrl = decodeText;
      window.location.href = eventPageUrl;
    }
  }

  const htmlScanner = new Html5QrcodeScanner("qr-reader", {
    fps: 30,
    qrbox: 250,
    imageSmoothing: false,
    createCanvasFromImage: true,
    qrtype: "IMAGE_ONLY",
  });
  htmlScanner.render(onScanSuccess);
});
