<template>
  <div class="toolbar">
    <a :class="{active: showMore}" @click="showMore=!showMore" class="more">
      <svg-icon icon-class="more"/>
      <slot/>
    </a>
  </div>
</template>

<script>
export default {
  data () {
    return {
      showMore: false
    }
  },
}
</script>

<style lang="scss" scoped>
$btnSize: 24px;
.toolbar {
  & ::v-deep svg {
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
}

.more {
  width: 40px;
  height: 40px;
  display: block;
  position: fixed;
  top: 15px;
  right: 15px;
  z-index: 9999;
  transition: 0.5s;
  transform: rotate3d(0, 0, 1, 180deg);

  &.active {
    transform: rotate3d(0, 0, 1, 0deg);

    .btn, {
      opacity: 1;
    }
  }
}

.btn {
  width: $btnSize;
  height: $btnSize;
  transition: 0.5s;
  display: block;
  position: absolute;
  opacity: 0;

  &:hover {
    transform: scale3d(1.4, 1.4, 1);
  }

  &:first-of-type {
    bottom: 30%;
    left: -80%;
  }

  &:nth-of-type(2) {
    bottom: -50%;
    left: -50%;
  }

  &:nth-of-type(3) {
    bottom: -85%;
    right: 10%;
  }
}
</style>
