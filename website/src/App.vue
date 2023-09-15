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
          <img src="../src/assets/img/flag_green.svg" draggable="false" />
          <span class="menu-btn"> MAPPA </span>
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
        modo completamente anonimo, tramite WhatsApp o Telegram.<br/> Contribuisci a
        mappare e risolvere il problema!
      </p>
     

      <div class="search-cnt">
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
      </div>
    </div>

    <div class="content-cnt">
      <div id="map" v-if="page === 'map'"></div>
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
          Scegli la tua applicazione di messaggistica preferita e clicca per
          iniziare la chat 💬.
        </p>

        <p>
          Tramite la chat potrai inviare la foto 📸 e la posizione 📍 della
          segnalazione!
        </p>
        <p>
          Entro massimo 24h vedrai aggiunta la posizione sulla mappa!<br /><br /><br />
        </p>
        <a class="btn" href="https://wa.me/393312296579"
          ><i class="fa-brands fa-whatsapp"></i> WHATSAPP</a
        ><br /><br />
        <a class="btn" href="https://t.me/munnizzaland_bot"
          ><i class="fa-brands fa-telegram"></i> TELEGRAM</a
        >
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
import axios from "axios";
import { Loader } from "@googlemaps/js-api-loader";
import Footer from "./components/Footer.vue";

export default {
  name: "Home",

  components: {
    Footer,
  },

  async mounted() {
    // Get URL
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
    };
  },
  methods: {
    async initMap() {
      // Downloading data from API
      // Init map object
      const maps = new Loader({
        apiKey: import.meta.env.VITE_MAPS_KEY,
        version: "weekly",
        mapTypeId: "satellite",
      });

      const customMapStyle = [
        {
          featureType: "all",
          elementType: "all",
          stylers: [{ saturation: -100 }, { lightness: 0 }],
        },
      ];

      const redMarkerIcon = {
        url: "../src/assets/img/pin.svg",
      };

      maps.load().then(async (google) => {
        const map = new google.maps.Map(document.getElementById("map"), {
          center: { lat: 36.925935, lng: 14.739502 },
          zoom: 10,
          styles: customMapStyle,
        });

        const markersDB = await axios.get(
          import.meta.env.VITE_API_URL + "/markers"
        );

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

          markers[marker._id] = new google.maps.Marker({
            position: {
              lat: marker.location.coordinates[1],
              lng: marker.location.coordinates[0],
            },
            map: map,
            icon: redMarkerIcon,
          });

          // Attach info window
          markers[marker._id].addListener("click", () => {
            infowindow.open({
              anchor: markers[marker._id],
              map,
            });
          });
        }
      });
    },
  },
};
</script>
