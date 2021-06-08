<template>
  <div class="toolbar">
    <div class="panel">
      <slot/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$btnSize: 30px;

.toolbar {
  position: fixed;
  top: 15px;
  right: 0;
  height: 35px;
  background: rgba(255, 255, 255, 0.9);
  border-color: #003371;

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

    & > .el-tooltip, & > .el-dropdown {
      width: $btnSize;
      height: $btnSize;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 5px;
      box-sizing: border-box;

      ::v-deep a {
        width: 100%;
        height: 100%;
        display: flex !important;
        justify-content: center;
        align-items: center;
      }

      ::v-deep svg {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }

      &:hover ::v-deep svg {
        transition: 0.5s;
        transform: scale3d(1.05, 1.05, 1);
      }

      &.active {
        border: inset;
        border-width: 1.5px;
        box-shadow: inset 0 0 5px 5px #d3d3d373;
        color: #3297FD;
      }
    }
  }
}
</style>
