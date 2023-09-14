<template>
  <div>
    <div style="position:relative; height: 70px;">
      <img src="/logo_h.png" style="height:50px; margin-top:5px; margin-left:10px" />
      <span @click="page = 'contribute'" v-if="page === 'map'" class="menu-btn">
        CONTRIBUISCI
      </span>
      <span @click="page = 'map'" v-if="page === 'contribute'" class="menu-btn">
        MAPPA
      </span>
    </div>
    <div id="map" v-show="page === 'map'"></div>
    <div class="content" v-if="page === 'privacy'">
      <h1>Privacy Policy</h1>
      <p>
        We don't collect any data, period.<br><br>
        We don't use cookies, period.<br><br>
        We don't use Google Analytics, period.<br><br>
        We don't use any other tracking software, period.<br><br>
        Check by your own at <a
          href="https://github.com/yomi-digital/munnizza-land/tree/master/website">https://github.com/yomi-digital/munnizza-land</a>
      </p>
    </div>
    <div class="content" v-if="page === 'contribute'" style="padding: 30px">
      <h1>Come funziona?</h1>
      Scegli la tua applicazione di messaggistica preferita e aggiungi il bot.<br><br>Invia una foto 📸 della discarica,
      invia la posizione 📍 subito dopo e aspetta la conferma, dopo massimo 24h vedrai la segnalazione!<br><br><br>
      <a class="btn" href="https://wa.me/393312296579"><i class="fa-brands fa-whatsapp"></i> WHATSAPP</a><br><br>
      <a class="btn" href="https://t.me/munnizzaland_bot"><i class="fa-brands fa-telegram"></i> TELEGRAM</a>
    </div>
    <div style="text-align: center; margin-top: 10px; font-size: 9px; position:fixed; bottom:0;left:0;width:100%;padding:20px 0">
      Munnizza.Land è un progetto
      <a href="https://github.com/yomi-digital/munnizza-land" target="_blank">open-source</a>
      realizzato da <a href="https://yomi.digital" target="_blank">YOMI</a>
    </div>
  </div>
</template>
<style>
body,
html {
  background: #499643;
  height: 100vh;
  overflow: hidden;
  font-family: "Roboto Mono", monospace !important;
  color: #fff;
}

.content {
  text-align: center;
  padding: 20px;
  height: calc(100vh - 170px);
}

a {
  color: #eee;
  text-decoration: underline;
}

.btn {
  padding: 20px;
  text-decoration: none;
  border: 1px solid #fff;
  border-radius: 30px;
  display: inline-block;
}

.btn:hover {
  background-color: #fff;
  color: #499643;
}

.menu-btn {
  position: absolute;
  top: 0;
  right: 0;
  padding: 23px;
  cursor: pointer;
  font-size: 13px;
  text-decoration: none;
  font-weight: bold;
}

.button {
  font-family: "Roboto Mono", monospace !important;
}

#map {
  height: calc(100vh - 125px);
  border-radius: 10px;
}
</style>
<script>
import axios from "axios";
import { Loader } from "@googlemaps/js-api-loader"

export default {
  name: "Home",
  async mounted() {
    // Get URL
    const url = new URL(window.location.href);
    console.log(url);
    if (url.hash === "#/privacy" || url.hash === "#/terms") {
      this.page = "privacy";
    }
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
  data() {
    return {
      page: "map",
    };
  },
};
</script>
