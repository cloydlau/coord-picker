<template>
  <div class="toolbar">
    <div class="panel">
      <slot/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$btnSize: 35px;

.toolbar {
  position: fixed;
  top: 15px;
  right: 0;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-color: #003371;

  & ::v-deep svg {
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .panel {
    position: absolute;
    top: 0;
    right: 15px;
    height: 100%;
    border-radius: 25px;
    -webkit-backdrop-filter: blur(2px);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 10px;
    border: 2px solid #0033714a;

    & > a {
      width: $btnSize;
      height: $btnSize;
      transition: 0.5s;
      display: inline-block;
      margin: 0 10px;

      &:hover {
        transform: scale3d(1.1, 1.1, 1);
      }

      &.active {
        border: inset;
        border-width: 2px;
        box-shadow: inset 0 0 5px 5px #d3d3d373;
      }
    }
  }
}
</style>
