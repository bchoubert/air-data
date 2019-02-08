<template>
  <div id="airline-infos">
    <h1 id="title">
      <i class="fas fa-plane-departure"></i>
      Air Data
    </h1>
    <div id="airline-display" v-if="!!airline">
      <img v-bind:src="airlineImageSrc" />
      <span>
        <i class="fas fa-plane"></i> {{ airline.name }}
      </span>
      <span>
        <i class="fas fa-tag"></i> {{ airline.icao.uppercase }}
      </span>
      <span>
        <i class="fas fa-map-marker"></i> {{ airline.country }}
      </span>
      <span>
        <i class="fas fa-road"></i>
        {{ airline.airport.name }} ({{ airline.airport.icao }}) - {{ airline.airport.altitude }} ft
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'airline-infos',
  components: {},
  // Waiting for airline attribute on <AirlineInfos>. Represents the airline to show
  props: ['airline'],
  computed: {
    // Compute the image URL to Github =>
    // Permits Vue to listen for changes of this URL to be binded into the <img>
    airlineImageSrc: () => {
      // If airline, then concatenate parts of URL to get the image. Otherwise, return ''
      if (this.airline) {
        return `https://bchoubert.github.io/airline-logos/processed/${this.airline.icao.lowercase}.png`;
      }
      return '';
    },

  },
  // Mounted is a Vue function called once render of the component is done
  mounted() {},
  methods: {},
};
</script>

<style>
#airline-infos {
  flex: 1 0 10em;
}

#title {
  text-align: center;
  margin: 0;
  flex-grow: 0;
  font-size: 150%;
  padding: 0.5em 0;
}

#airline-display {
  padding: 10px;
}

#airline-display span {
  display: block;
  margin-top: 10px;
}

#airline-display img {
  width: 50%;
  margin-left: 25%;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
  transition: background-color 0.5s;
}

#airline-display img:hover {
  background-color: rgba(0, 0, 0, 0.16);
}
</style>
