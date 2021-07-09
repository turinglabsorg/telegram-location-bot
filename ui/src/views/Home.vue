<template>
  <div>
    <div id="map"></div>
    <div style="text-align:center; margin-top:10px; font-size:12px;">
      MunnizzaLand è un progetto <a href="https://github.com/yomi-digital/munnizza-land" target="_blank">open-source</a> realizzato da <a href="https://yomi.digital" target="_blank">YOMI</a>
    </div>
  </div>
</template>
<style>
body,
html {
  background: #bbdba9;
  height:100vh;
  overflow-x:hidden;
}
#map {
  height: calc(100vh - 150px);
}
</style>
<script>
const axios = require('axios')
export default {
  name: "Home",
  async mounted() {
    // Downloading data from API
    const markersDB = await axios.get('http://localhost:3000/markers')
    // Init map object
    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 36.925935, lng: 14.739502 },
      zoom: 13,
    });
    // Init map markers
    const markers = []
    for(let k in markersDB.data){
      const marker = markersDB.data[k]
      markers[marker._id] = new window.google.maps.Marker({
          position: { lat: marker.location.coordinates[1], lng: marker.location.coordinates[0] },
          map: map,
        });
    }
  },
};
</script>
