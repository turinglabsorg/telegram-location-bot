<template>
  <div class="home">
    <header style="position: relative; height: 70px">
      <div class="logo-cnt">
        <img
          src="/logo_h.png"
          style="margin-top: 5px; margin-left: 10px"
          draggable="false"
          class="logo"
        />
      </div>
      <div class="btn-cnt">
        <button
          class="flag-btn"
          v-if="page === 'map'"
          @click="page = 'contribute'"
        >
          <img src="../src/assets/img/flag_green.svg" draggable="false" />
          <span class="menu-btn"> CONTRIBUISCI </span>
        </button>
        <button
          class="flag-btn"
          v-if="page === 'contribute'"
          @click="page = 'map'"
        >
          <img src="../src/assets/img/flag_black.svg" draggable="false" />
          <span class="menu-btn" style="color: #afec00"> MAPPA </span>
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
        Contribuisci a mappare e risolvere il problema!
      </p>

      <!-- <div class="search-cnt">
        <input
          v-model="search"
          type="text"
          placeholder="Cerca nella tua zona..."
          @input="handleSearch"
        />
        <button class="search-btn">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 12.3724L9.64799 9.02038C10.4535 8.05336 10.8552 6.81301 10.7695 5.55737C10.6838 4.30173 10.1173 3.12747 9.18782 2.27887C8.25838 1.43028 7.03756 0.972674 5.77932 1.00126C4.52108 1.02985 3.32231 1.54243 2.43237 2.43237C1.54243 3.32231 1.02985 4.52108 1.00126 5.77932C0.972674 7.03756 1.43028 8.25838 2.27887 9.18782C3.12747 10.1173 4.30173 10.6838 5.55737 10.7695C6.81301 10.8552 8.05336 10.4535 9.02038 9.64799L12.3724 13L13 12.3724ZM1.90359 5.89829C1.90359 5.10822 2.13787 4.33588 2.57682 3.67895C3.01576 3.02203 3.63965 2.51001 4.36959 2.20766C5.09952 1.90531 5.90273 1.82621 6.67762 1.98034C7.45252 2.13448 8.16431 2.51494 8.72298 3.07361C9.28165 3.63228 9.66211 4.34407 9.81625 5.11897C9.97038 5.89386 9.89128 6.69707 9.58893 7.427C9.28658 8.15694 8.77456 8.78083 8.11764 9.21977C7.46071 9.65872 6.68837 9.893 5.89829 9.893C4.83919 9.89183 3.82381 9.47058 3.07491 8.72168C2.32601 7.97278 1.90476 6.9574 1.90359 5.89829Z"
              fill="white"
              stroke="white"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div> -->
      <div class="search-cnt">
        <input
          type="text"
          placeholder="Cerca un indirizzo..."
          v-model="searcher"
        /><br />
        <div
          v-if="searching"
          style="
            position: absolute;
            top: 10px;
            right: 10px;
            color: #000;
            font-size: 10px;
          "
        >
          ...
        </div>
        <div
          v-if="searcher.length > 0"
          @click="
            initMap();
            searcher = '';
            results = [];
          "
          style="
            cursor: pointer;
            position: absolute;
            right: 0;
            padding: 1rem 2rem;
            color: #white;
          "
        >
          X
        </div>
        <div v-if="results">
          <div
            v-for="result in results"
            :key="result.id"
            @click="searchMarkers(result.center)"
          >
            {{ result.place_name }}
          </div>
        </div>
      </div>
    </div>

    <div class="content-cnt">
      <div id="map" v-show="page === 'map'"></div>
      <div class="content" v-if="page === 'privacy'">
        <h1>Privacy Policy</h1>
        <p>
          We don't collect any data, period.<br /><br />
          We don't use cookies, period.<br /><br />
          We don't use Google Analytics, period.<br /><br />
          We don't use any other tracking software, period.<br /><br />
          Check by your own at
          <a
            href="https://github.com/yomi-digital/munnizza-land/tree/master/website"
            >https://github.com/yomi-digital/munnizza-land</a
          >
        </p>
      </div>
      <div class="content" v-if="page === 'contribute'" style="padding: 30px">
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
            <img src="./assets/img/howto_ph.svg" alt="" />
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
            <span>WHATSAPP </span>
          </a>
          <a class="flag-btn" href="https://t.me/munnizzaland_bot">
            <img src="./assets/img/flag_green.svg" alt="" draggable="false" />
            <span>TELEGRAM</span>
          </a>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
//import axios from "axios";
import Footer from "./components/Footer.vue";
import mapboxgl from "mapbox-gl";

export default {
  name: "Home",

  components: {
    Footer,
  },

  async mounted() {
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
  },

  data() {
    return {
      page: "",
      searcher: "",
      searching: false,
      searchDelay: null,
      markers: [],
      results: [],
      map: null,
    };
  },

  methods: {
    async initMap() {
      mapboxgl.accessToken =
        "pk.eyJ1IjoieW9taS1kaWdpdGFsIiwiYSI6ImNsbWtkanR3ZjAxajUyaXRiZm93c2Vwb3kifQ.Tb-um50l1Y8rNByYuBs9ZA";

      const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/light-v10", // Set the map style URL
        center: [14.739502, 36.925935], // Set the initial center coordinates
        zoom: 8, // Set the initial zoom level
        pixelRatio: window.devicePixelRatio || 1,
      });
      const navigationControl = new mapboxgl.NavigationControl();
      map.addControl(navigationControl, "top-right");

      // Add geolocation control
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      });
      /* map.addControl(geolocateControl, "top-right"); */
      this.addMarkers(map);
    },
    addMarkers(map) {
      // Example marker data (replace with your own data)
      const markerData = [
        {
          coordinates: [14.721916, 36.920323], // Marker coordinates [longitude, latitude]
          title: "RAGUSA",
          description: "RAGUSA DESC TEST",
        },
        {
          coordinates: [14.552107, 36.794543], // Marker coordinates [longitude, latitude]
          title: "MARINA",
          description: "MARINA TEST",
        },
        // Add more markers as needed
      ];

      markerData.forEach((markerInfo) => {
        const popup = new mapboxgl.Popup().setHTML(
          `<h3>${markerInfo.title}</h3><p>${markerInfo.description}</p>`
        );

        // Create a new marker
        new mapboxgl.Marker()
          .setLngLat(markerInfo.coordinates)
          .setPopup(popup) // Attach the popup
          .addTo(map); // Add the marker to the map
      });
    },
    /*  async initSearch() {
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
    } */
  },
};
</script>

