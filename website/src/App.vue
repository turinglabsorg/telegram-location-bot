<template>
  <div>
    <img src="/logo.png" height="60px"/>
    <a href="https://t.me/munnizzaland_bot" style="position: absolute; top:0; right:0; padding:28px; font-size:13px; text-decoration: none; font-weight: bold;">CONTRIBUISCI</a>
    <div id="map"></div>
    <div style="text-align: center; margin-top: 10px; font-size: 10px">
      Munnizza.Land è un progetto
      <a href="https://github.com/yomi-digital/munnizza-land" target="_blank">open-source</a>
      realizzato da <a href="https://yomi.digital" target="_blank">YOMI</a>
    </div>
  </div>
</template>
<style>
body,
html {
  background: #bbdba9;
  height: 100vh;
  overflow-x: hidden;
  font-family: "Roboto Mono", monospace !important;
}

.button {
  font-family: "Roboto Mono", monospace !important;
}

#map {
  height: calc(100vh - 105px);
  border-radius: 10px;
}
</style>
<script>
import axios from "axios";
import { Loader } from "@googlemaps/js-api-loader"

export default {
  name: "Home",
  async mounted() {
    // Downloading data from API
    // Init map object
    const maps = new Loader({
      apiKey: import.meta.env.VITE_MAPS_KEY,
      version: "weekly",
      mapTypeId: 'satellite'
    });
    maps.load().then(async (google) => {
      const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 36.925935, lng: 14.739502 },
        zoom: 10,
      });
      const markersDB = await axios.get(import.meta.env.VITE_API_URL + "/markers");
      // Init map markers
      const markers = [];
      for (let k in markersDB.data) {
        const marker = markersDB.data[k];
        // Creating info window
        const data =
          new Date(marker.timestamp).getDate() +
          "/" +
          (new Date(marker.timestamp).getMonth() + 1) +
          "/" +
          new Date(marker.timestamp).getFullYear();
        const infowindow = new google.maps.InfoWindow({
          content:
            `<div>
          <img src="` +
            marker.photo +
            `" width="100%"><br><br>
          Aggiunta in data: ` +
            data +
            `</div>`,
        });
        // Init marker
        markers[marker._id] = new google.maps.Marker({
          position: {
            lat: marker.location.coordinates[1],
            lng: marker.location.coordinates[0],
          },
          map: map,
        });
        // Attach info window
        markers[marker._id].addListener("click", () => {
          infowindow.open({
            anchor: markers[marker._id],
            map,
          });
        });
      }
    })
  },
};
</script>
