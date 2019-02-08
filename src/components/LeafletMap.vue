<template>
  <div id="map" class="map"></div>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database';

import * as L from 'leaflet';
import 'leaflet.markercluster';

// Firebase configuration
const config = {
  apiKey: 'AIzaSyBHyPQ1gVky13lKgngGmrlkYXQTL9vnznM',
  authDomain: 'air-data-5f826.firebaseapp.com',
  databaseURL: 'https://air-data-5f826.firebaseio.com',
};

// If firebase is not initialized, then initialize it
if (!firebase.apps.length) {
  firebase.initializeApp(config);
}
firebase.database();

export default {
  name: 'leaflet-map',
  components: {},
  data() {
    return {
      // Map object, declared as a Leaflet map
      map: null,
      // background tile layer from CartoDB
      tileLayer: null,
      // Layer list
      layers: {
        // Airports is the layer with generated tile layer with all airports
        airports: null,
        // Logos of airlines
        airlines: null,
        // Routes
        routes: null,
      },
      // Boolean to know if we are waiting for routes from firebase
      routesLoading: false,
    };
  },
  // Once the component is rendered
  mounted() {
    // Initialize the map
    this.initMap();
    // Insert both Leaflet controls for geolocation (WIP) and center view
    this.insertLeafletControl('fas fa-crosshairs', () => {
    });
    this.insertLeafletControl('fas fa-globe', () => {
      this.map.setView([20.0, 0.0], 3);
    });
    // Initialize layers
    this.initLayers();
    // Fetch airlines from firebase
    this.fetchAirlines();
  },
  methods: {
    initMap() {
      // Compute a map from firebase and put the tilelayer from CartoDB onto the map
      this.map = L.map('map').setView([20.0, 0.0], 3);
      this.tileLayer = L.tileLayer(
        'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png',
        {
          maxZoom: 18,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
        },
      );
      this.tileLayer.addTo(this.map);
    },
    initLayers() {
      // Initialize airports tile layer, URL from Github
      this.layers.airports = L.tileLayer('https://github.com/bchoubert/air-data-layer/raw/master/airports/{z}/{x}/{y}.png', {
        minZoom: 1,
        maxNativeZoom: 10,
      });
      this.layers.airports.addTo(this.map);
    },
    fetchAirlines() {
      // Airports are a marker cluster to not overload both the RAM and the view
      this.layers.airlines = L.markerClusterGroup({
        zoomToBoundsOnClick: false,
        showCoverageOnHover: false,
        spiderfyDistanceMultiplier: 2,
        maxClusterRadius: 30,
      });
      // Fetch airlines
      firebase.database().ref('/airlines').on('value', (snapshot) => {
        snapshot.val().forEach((airline) => {
          // For each airline, add a layer that contains one marker
          // with props of this airline, and the logo from Github
          this.layers.airlines.addLayer(
            L.marker(
              [
                airline.ap_latitude,
                airline.ap_longitude,
              ],
              {
                props: {
                  id: airline.al_id,
                  name: airline.al_name,
                  icao: {
                    lowercase: airline.al_icao.toLowerCase(),
                    uppercase: airline.al_icao.toUpperCase(),
                  },
                  country: airline.al_country,
                  airport: {
                    name: airline.ap_name,
                    icao: airline.ap_icao,
                    altitude: airline.ap_altitude,
                  },
                },
                icon: L.icon({
                  iconUrl: `https://bchoubert.github.io/airline-logos/processed/${airline.al_icao.toLowerCase()}.png`,
                  iconSize: [60, 36],
                  iconAnchor: [30, 36],
                }),
              }),
          );
        });
        this.layers.airlines.on('click', (a) => {
          // On click on an airline logo,
          // send a message on the channel 'selected-airline-changed' containing the airline props
          this.$emit('selected-airline-changed', a.layer.options.props);
          // And load the corresponding routes
          this.loadRoutes(a.layer.options.props.id);
        });
      });
      this.layers.airlines.addTo(this.map);
    },
    loadRoutes(airlineId) {
      // If we are already waiting for data from firebase,
      // we do not load the new routes to not overload firebase and
      // to not mix data from 2 different airlines
      if (this.routesLoading) {
        return;
      }
      this.routesLoading = true;
      // We remove the layer just the time to modify it
      if (this.layers.routes) {
        this.map.removeLayer(this.layers.routes);
      }
      this.layers.routes = L.featureGroup();
      firebase.database().ref('/routes').orderByChild('al_id').equalTo(airlineId)
        .on('value', (snapshot) => {
          const routes = snapshot.val();
          if (routes) {
            // On each route, we draw a polyline
            Object.keys(routes).forEach((routeKey) => {
              const latlngs = [
                [routes[routeKey].src_lat, routes[routeKey].src_long],
                [routes[routeKey].dest_lat, routes[routeKey].dest_long],
              ];
              L.polyline(latlngs, { color: 'red' }).addTo(this.layers.routes);
            });
          }
          // Then we add back the layer
          this.map.addLayer(this.layers.routes);
          this.routesLoading = false;
        });
    },
    insertLeafletControl(icon, callback) {
      // Just insert a node with an icon, listen to click event to call the callback function
      const controlNode = document.createElement('a');
      const faControlNode = document.createElement('i');

      controlNode.classList = 'leaflet-custom-control';

      faControlNode.classList = icon;
      controlNode.appendChild(faControlNode);
      controlNode.addEventListener('click', callback);

      document.querySelector('.leaflet-bar').appendChild(controlNode);
    },
  },
};
</script>

<style>
.map {
  height: 100%;
  display: block;
  flex: 3;
}

.leaflet-custom-control {
  cursor: pointer;
}

img.leaflet-marker-icon {
  background-color: rgba(255, 255, 255, 0.3);
  border: 2px solid #FF4500;
  border-radius: 5px;
  transition: 0.5s all;
}

img.leaflet-marker-icon:hover {
  background-color: white;
  margin-left: -60px !important;
  margin-top: -54px !important;
  width: 120px !important;
  height: 72px !important;
}

.leaflet-tile-container img[src^="https://github.com"] {
  opacity: 0.4 !important;
}

.marker-cluster {
  height: 20px !important;
  width: 20px !important;
  margin-top: -10px !important;
  margin-left: -10px !important;
  border: 1px solid white;
  display: flex;
  background-color: #FF4500;
  justify-content: center;
  flex-direction: column;
  color: white;
  border-radius: 10px;
  align-items: center;
}

.marker-cluster > div {
  text-align: center;
}
</style>
