<template>
  <div class="home">
    <header style="height: 70px">
      <div class="logo-cnt">
        <img src="/logo_h.png" style="margin-top: 5px; margin-left: 10px" draggable="false" class="logo" />
      </div>
      <div class="btn-cnt">
        <button class="flag-btn" v-if="page === 'map'" @click="page = 'contribute'">
          <img src="../src/assets/img/flag_green.svg" draggable="false" />
          <span class="menu-btn" style="margin-left: -12px">CONTRIBUISCI</span>
        </button>
        <button class="flag-btn" v-if="page === 'contribute'" @click="page = 'map'">
          <img src="../src/assets/img/flag_black.svg" draggable="false" />
          <span class="menu-btn" style="color: #afec00; margin-left: 16px">MAPPA</span>
        </button>
      </div>
    </header>

    <div class="title-cnt" v-if="page === 'map'">
      <h1>
        Lottiamo insieme<br />
        contro le discariche
      </h1>
      <p>
        Segnala la discarica abusiva, invia la tua posizione e delle foto, in
        modo completamente anonimo, tramite WhatsApp o Telegram.<br /><br />
        Sii parte della soluzione, non del problema!
      </p>

      <div class="search-cnt">
        <input type="text" placeholder="Cerca un indirizzo..." v-model="searcher" /><br />
        <div v-if="searching" style="
            position: absolute;
            top: 10px;
            right: 10px;
            color: #000;
            font-size: 10px;
          ">
          ...
        </div>
        <div v-if="searcher.length > 0" @click="
          initMap();
        searcher = '';
        results = [];
        " style="
            cursor: pointer;
            position: absolute;
            right: 0;
            padding: 1rem 2rem;
            color: white;
          ">
          X
        </div>

        <div v-if="results" class="results-cnt">
          <div v-for="result in results" :key="result.id" @click="searchMarkers(result.center)" class="city-item"
            style="cursor: pointer">
            {{ result.place_name }}
          </div>
        </div>
      </div>
    </div>
    <div class="content-cnt">
      <div id="map" v-show="page === 'map'"></div>
      <div v-if="page === 'map'" @click="locateUser" class="locate-btn">
        <i class="fa-solid fa-location-arrow"></i>
      </div>
      <div class="content" v-if="page === 'privacy'">
        <h1>Privacy Policy</h1>
        <p>
          We don't collect any data, period.<br /><br />
          We don't use cookies, period.<br /><br />
          We don't use Google Analytics, period.<br /><br />
          We don't use any other tracking software, period.<br /><br />
          Check by your own at
          <a
            href="https://github.com/yomi-digital/munnizza-land/tree/master/website">https://github.com/yomi-digital/munnizza-land</a>
        </p>
      </div>
      <div class="content" v-if="page === 'contribute'">
        <h1>Come funziona?</h1>
        <p>
          <span class="num">1.</span> Scegli la tua applicazione di
          messaggistica preferita e clicca per iniziare la chat.
          <span class="icon">
            <img src="./assets/img/howto_txt.svg" alt="" />
          </span>
        </p>

        <p>
          <span class="icon">
            <img src="./assets/img/howto_ph.svg" alt="" class="ph-icon" />
          </span>
          <span class="num">2.</span>Tramite la chat potrai inviare la foto e la
          posizione della segnalazione!
        </p>
        <p>
          <span class="num">3.</span> Entro massimo 24h vedrai aggiunta la
          posizione sulla mappa!
          <span class="icon">
            <img src="./assets/img/howto_mark.svg" alt="" />
          </span>
          <br /><br /><br />
        </p>
        <div class="contact-btns">
          <a class="flag-btn" href="https://wa.me/393312296579">
            <img src="./assets/img/flag_green.svg" alt="" draggable="false" />
            <span style="margin-left: -12px">WHATSAPP </span>
          </a>
          <a class="flag-btn" href="https://t.me/munnizzaland_bot">
            <img src="./assets/img/flag_green.svg" alt="" draggable="false" />
            <span style="margin-left: -12px">TELEGRAM</span>
          </a>
        </div>
      </div>
    </div>
    <footer>
      Munnizza.Land è un progetto
      <a href="https://github.com/yomi-digital/munnizza-land" target="_blank">open-source</a>
      realizzato da <a href="https://yomi.digital" target="_blank">YOMI</a>
    </footer>
  </div>
</template>

<script>
import axios from "axios";
import { Loader } from "@googlemaps/js-api-loader"

export default {
  name: "Home",
  async mounted() {
    // Get URL
    const app = this;
    const url = new URL(window.location.href);
    if (url.hash === "#/privacy" || url.hash === "#/terms") {
      this.page = "privacy";
    } else if (url.hash === "#/contribuisci") {
      this.page = "contribute";
    } else {
      this.page = "map";
    }
  },
  watch: {
    page: function (val) {
      if (val === "map") {
        this.initMap();
      }
    },
    searcher: function () {
      clearTimeout(this.searchDelay)
      this.initSearch()
    }
  },
  data() {
    return {
      page: "",
      searcher: "",
      searching: false,
      searchDelay: null,
      markers: [],
      results: [],
      map: null
    };
  },
  methods: {
    locateUser() {
      const app = this
      const successCallback = (position) => {
        console.log("Position accepted", position.coords)
        app.initMap([position.coords.latitude, position.coords.longitude])
      };
      const errorCallback = (error) => {
        console.log(error);
      };
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    },
    showBig(photo) {
      window.open(photo, '_blank');
    },
    async initMap(userLocation = null) {
      // Downloading data from API
      // Init map object
      const maps = new Loader({
        apiKey: import.meta.env.VITE_MAPS_KEY,
        version: "weekly",
        mapTypeId: 'satellite'
      });
      maps.load().then(async (google) => {
        let center = { lat: 37.5107216, lng: 13.8660002 }
        let zoom = 7.3
        console.log("User location is:", userLocation)
        if (userLocation !== null) {
          center = { lat: userLocation[0], lng: userLocation[1] }
          zoom = 13
        }
        app.map = new google.maps.Map(document.getElementById("map"), { center, zoom });
        const markersDB = await axios.get(import.meta.env.VITE_API_URL + "/markers");
        // Init map markers
        app.markers = [];
        const infoWindows = [];
        for (let k in markersDB.data) {
          const marker = markersDB.data[k];
          // Creating info window
          const data =
            new Date(marker.timestamp).getDate() +
            "/" +
            (new Date(marker.timestamp).getMonth() + 1) +
            "/" +
            new Date(marker.timestamp).getFullYear();
          infoWindows[marker.photo] = new google.maps.InfoWindow({
            content:
              `<div class="info-window">
          <img src="` +
              marker.photo +
              `" width="100%"><br><br>
              ` +
              data +
              `
              <div class="open-photo">
              <a href="https://www.google.com/maps/search/?api=1&query=${marker.location.coordinates[1]},${marker.location.coordinates[0]}" target="_blank">
                <i class="fa-solid fa-location-dot"></i>
              </a>
              <a href="${marker.photo}" target="_blank"><i class="fa-solid fa-camera"></i></a>
              </div></div>`,
          });
          // Init marker
          app.markers[marker.photo] = new google.maps.Marker({
            position: {
              lat: marker.location.coordinates[1],
              lng: marker.location.coordinates[0],
            },
            map: app.map,
          });
          // Attach info window
          app.markers[marker.photo].addListener("click", () => {
            for (let k in infoWindows) {
              infoWindows[k].close();
            }
            infoWindows[marker.photo].open({
              anchor: app.markers[marker.photo],
              map,
            });
          });
        }
      })
    },
    async initSearch() {
      const app = this
      if (app.searcher.length > 3 && !app.searching) {
        app.searching = true
        const search = await axios.post(import.meta.env.VITE_API_URL + "/search", {
          search: app.searcher + ", Sicily, Italy"
        });
        app.searching = false
        console.log("Search results:", search.data)
        if (search.data.results.features !== undefined) {
          app.results = search.data.results.features
        }
      } else {
        app.searchDelay = setTimeout(function () {
          app.initSearch()
        }, 500)
      }
    },
    async searchMarkers(location) {
      const app = this
      app.results = []
      const markersDB = await axios.post(import.meta.env.VITE_API_URL + "/search", {
        location: location,
        distance: 50000
      });
      const maps = new Loader({
        apiKey: import.meta.env.VITE_MAPS_KEY,
        version: "weekly",
        mapTypeId: 'satellite'
      });
      maps.load().then(async (google) => {
        app.map = new google.maps.Map(document.getElementById("map"), {
          center: { lat: location[1], lng: location[0] },
          zoom: 13,
        });
        // Init map markers
        app.markers = [];
        const infoWindows = [];
        for (let k in markersDB.data.markers) {
          const marker = markersDB.data.markers[k];
          // Creating info window
          const data =
            new Date(marker.timestamp).getDate() +
            "/" +
            (new Date(marker.timestamp).getMonth() + 1) +
            "/" +
            new Date(marker.timestamp).getFullYear();
          infoWindows[marker.photo] = new google.maps.InfoWindow({
            content:
              `<div class="info-window">
          <img src="` +
              marker.photo +
              `" width="100%"><br><br>
              ` +
              data +
              `
              <div class="open-photo">
              <a href="https://www.google.com/maps/search/?api=1&query=${marker.location.coordinates[1]},${marker.location.coordinates[0]}" target="_blank">
                <i class="fa-solid fa-location-dot"></i>
              </a>
              <a href="${marker.photo}" target="_blank"><i class="fa-solid fa-camera"></i></a>
              </div></div>`,
          });
          // Init marker
          app.markers[marker.photo] = new google.maps.Marker({
            position: {
              lat: marker.location.coordinates[1],
              lng: marker.location.coordinates[0],
            },
            map: app.map,
          });
          // Attach info window
          app.markers[marker.photo].addListener("click", () => {
            for (let k in infoWindows) {
              infoWindows[k].close();
            }
            infoWindows[marker.photo].open({
              anchor: app.markers[marker.photo],
              map,
            });
          });
        }
      })
    }
  }
};
</script>

