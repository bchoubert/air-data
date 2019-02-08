<template>
  <div id="app">
    <div id="container">
      <!-- Listen for 'selected-airline-changed' event thrown by LeafletMap.
      On this event, store the airline into the selectedAirline variable -->
      <LeafletMap v-on:selected-airline-changed="selectedAirline = $event"/>

      <!-- Pass the selected airline into AirlineInfos.
      We need to bind this so AilineInfos will re-render itself on change of this airline -->
      <AirlineInfos v-bind:airline=this.selectedAirline />
    </div>
  </div>
</template>

<script>
import LeafletMap from './components/LeafletMap';
import AirlineInfos from './components/AirlineInfos';

export default {
  name: 'App',
  components: {
    LeafletMap,
    AirlineInfos,
  },
  data() {
    return {
      // Define selectedAirline variable. Default is null and it is binded into <AirlineInfos>
      selectedAirline: null,
    };
  },
};
</script>

<style>
body, html, #app {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0 auto;
  display: block;
  color: #2c3e50;
  font-family: 'Raleway', sans-serif;
}

#app {
  display: flex;
  flex-direction: column;
}

#app #container {
  flex: 1;
  display: flex;
  flex-direction: row;
}
</style>
