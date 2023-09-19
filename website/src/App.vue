<template>
  <div class="home">
    <header style=" height: 70px">
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
          <span class="menu-btn" style="margin-left: -12px">CONTRIBUISCI</span>
        </button>
        <button
          class="flag-btn"
          v-if="page === 'contribute'"
          @click="page = 'map'"
        >
          <img src="../src/assets/img/flag_black.svg" draggable="false" />
          <span class="menu-btn" style="color: #afec00; margin-left: 16px"
            >MAPPA</span
          >
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
            color: white;
          "
        >
          X
        </div>

        <!-- TEST -->
        <div
          v-if="results"
          style="position: absolute; right: 0; background-color: darkgreen"
        >
          <div
            v-for="result in results"
            :key="result.id"
            @click="selectCity(result)"
            class="city-item"
            style="cursor: pointer"
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
            <img src="./assets/img/howto_ph.svg" alt="" class="ph-icon"/>
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

    <Footer />
  </div>
</template>

<script>
import axios from "axios";
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
    searcher: function () {
      clearTimeout(this.searchDelay);
      this.initSearch();
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
    selectCity(city) {
      this.searchMarkers(city.center);
      this.results = [];
      this.searcher = "";
    },

    locateUser() {
      const app = this;
      const successCallback = (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        app.map.setCenter([longitude, latitude]);
        app.map.setZoom(14);

        console.log("User's location:", latitude, longitude);
      };

      const errorCallback = (error) => {
        console.error("Error getting user's location:", error);
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          successCallback,
          errorCallback
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    },

    async initMap() {
      mapboxgl.accessToken =
        "pk.eyJ1IjoieW9taS1kaWdpdGFsIiwiYSI6ImNsbWtkanR3ZjAxajUyaXRiZm93c2Vwb3kifQ.Tb-um50l1Y8rNByYuBs9ZA";

      const mapContainer = document.getElementById("map");

      while (mapContainer.firstChild) {
        mapContainer.removeChild(mapContainer.firstChild);
      }

      const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/light-v10",
        center: [14.739502, 36.925935],
        zoom: 8,
        pixelRatio: window.devicePixelRatio || 1,
      });

      map.on("load", () => {
        this.addMarkers(map); 
      });

      const navigationControl = new mapboxgl.NavigationControl();
      map.addControl(navigationControl, "top-right");

      this.map = map; 
    },

    addMarkers(map) {
      const markerData = [
        {
          coordinates: [14.721916, 36.920323], // Marker coordinates [long, lat]
          title: "RAGUSA",
          description: "RAGUSA DESC TEST",
        },
        {
          coordinates: [14.552107, 36.794543],
          title: "MARINA",
          description: "MARINA TEST",
        },
        
      ];

      markerData.forEach((markerInfo) => {
        const popup = new mapboxgl.Popup().setHTML(
          `<h3>${markerInfo.title}</h3><p>${markerInfo.description}</p>`
        );

        new mapboxgl.Marker()
          .setLngLat(markerInfo.coordinates)
          .setPopup(popup)
          .addTo(map);
      });
    },

    async initSearch() {
      const app = this;
      if (app.searcher.length > 3 && !app.searching) {
        app.searching = true;
        try {
          const accessToken =
            "pk.eyJ1IjoieW9taS1kaWdpdGFsIiwiYSI6ImNsbWtkanR3ZjAxajUyaXRiZm93c2Vwb3kifQ.Tb-um50l1Y8rNByYuBs9ZA";
          const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${app.searcher}.json`;
          const response = await axios.get(endpoint, {
            params: {
              access_token: accessToken,
              country: "IT", // country code
            },
          });

          const results = response.data.features.map((feature) => {
            return {
              place_name: feature.place_name,
              center: feature.center,
            };
          });

          app.results = results;
        } catch (error) {
          console.error("Error searching:", error);
        } finally {
          app.searching = false;
        }
      } else {
        app.searchDelay = setTimeout(function () {
          app.initSearch();
        }, 500);
      }
    },

    async searchMarkers(location) {
      const app = this;
      app.results = [];

      try {
        const accessToken =
          "pk.eyJ1IjoieW9taS1kaWdpdGFsIiwiYSI6ImNsbWtkanR3ZjAxajUyaXRiZm93c2Vwb3kifQ.Tb-um50l1Y8rNByYuBs9ZA";
        const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${location[0]},${location[1]}.json`;
        const response = await axios.get(endpoint, {
          params: {
            access_token: accessToken,
          },
        });

        const results = response.data.features.map((feature) => {
          return {
            place_name: feature.place_name,
            center: feature.center,
          };
        });

        app.results = results;
      } catch (error) {
        console.error("Error searching markers:", error);
      }
    },
  },
};
</script>

