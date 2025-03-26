const D = 1000;

function convert(a) {
  return Math.floor(a * D);
}

async function main() {
  let promise = new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
  const positionCurrent = await promise;

  let map = L.map('map').setView([positionCurrent.coords.latitude, positionCurrent.coords.longitude], 18);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  let rects = [];
  let marker = null;

  function drawMap() {
    rects.forEach((rect) => map.removeLayer(rect));

    const bound = map.getBounds();
    for (let x = convert(bound.getSouthWest().lat); x <= convert(bound.getNorthEast().lat); x++) {
      for (let y = convert(bound.getSouthWest().lng); y <= convert(bound.getNorthEast().lng); y++) {
        if (!localStorage.getItem(`${x} ${y}`)) {
          let rect = L.rectangle([[x / D, y / D], [(x + 1) / D, (y + 1) / D]], { weight: 0.0, fillColor: "gray", fillOpacity: 0.99 }).addTo(map);
          rect.getElement().style.pointerEvents = "none";
          rects.push(rect);
        }
      }
    }
  }

  function success(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng]).addTo(map);
    }

    const latConv = convert(lat);
    const lngConv = convert(lng);
    localStorage.setItem(`${latConv} ${lngConv}`, true);

    drawMap()
  }

  navigator.geolocation.watchPosition(success);
  map.on('move', drawMap);
}

main();
