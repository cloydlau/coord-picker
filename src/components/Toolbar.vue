<template>
  <div class="toolbar">
    <div class="panel">
      <slot/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$btnSize: 24px;
.toolbar {
  position: fixed;
  top: 15px;
  right: 15px;
  height: 40px;
  background: #ffffff96;
  border-color: #003371;

  & ::v-deep svg {
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .panel {
    position: absolute;
    top: 0;
    right: 20px;
    height: 100%;
    border-radius: 20px;
    -webkit-backdrop-filter: blur(2px);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 15px;
    border: 2px solid #0033714a;

    & > a {
      width: $btnSize;
      height: $btnSize;
      transition: 0.5s;
      display: inline-block;
      padding: 0 10px;

      &:hover {
        transform: scale3d(1.4, 1.4, 1);
      }
    }
  }
}
</style>
