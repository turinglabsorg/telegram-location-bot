<template>
  <div id="app">
    <div style="height: 90px; width:100%; display:block; overflow:hidden">
      <img style="float: left; width:auto; height:90px;" src="/logo.png" />
      <a href="https://t.me/munnizzaland_bot" target="_blank" style="float:right; margin:25px"><b-button type="is-link is-light">Vai al bot</b-button><br /></a>
    </div>
    <!--<div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>-->
    <router-view />
  </div>
</template>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav a {
  font-weight: bold;
  color: #fff;
  border-bottom: 0px;
}

#nav a.router-link-exact-active {
  color: #000;
}
</style>
