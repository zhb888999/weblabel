<template>
<div>
<div class="box">
  <div class="box draw" :style="{width: `${_width}px`, height: `${_height}px`}" >
    <canvas
      @mousemove="mouseMove($event)"
      @mousedown="mouseDown($event)"
      @mouseup="mouseUp($event)"
      ref="draw"
    >
    </canvas>
  </div>
  <div v-show="edit">
  <n-space>
    <n-select 
      v-model:value="selectCls"
      filterable
      placeholder="选择类别"
      :options="options"
    />
    <n-button-group>
      <n-button type="primary" @click="createLabel" round :disabled="selectCls == null || activeLabel != null">创建标签</n-button>
      <n-button type="primary" @click="deleleLabel" :disabled="activeLabel == null">删除标签</n-button>
      <n-button type="primary" @click="changeLabel" round :disabled="activeLabel == null || selectCls == null || selectCls == `${activeLabel.label},${activeLabel.color}`">更改类别</n-button>
    </n-button-group>
    <n-button type="warning" @click="submit">提交</n-button>
  </n-space>
  </div>
</div>
</div>
</template>

<script setup>

import { ref, nextTick, watch, computed, onMounted } from 'vue'

const state = {
  NORMAL: 0,
  CREATE: 1,
  START_CREATE: 2,
  SELECT: 3,
  PRESS_TABLE: 4,
  PRESS_POINT: 5
}

const point = {
  NONE: 0,
  LEFT_TOP: 1,
  LEFT_BOTTOM: 2,
  RIGHT_BOTTOM: 3,
  RIGHT_TOP: 4
}

let ctx
let rate
let currentState = state.NORMAL
let cache
let activePoint = point.NONE
let downPoint = {x: -1,y: -1}
let oldPos = {x1: -1,y1: -1, x2: -1, y2: -1}

let labels = []

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  cls: {
    type: Array,
    required: true
  },
  color: {
    type: Array,
    required: true
  },
  radius: {
    type: Number,
    default: 10
  },
  fontSize: {
    type: Number,
    default: 25
  },
  fontStyle: {
    type: String,
    default: "normal"
  },
  fontType: {
    type: String,
    default: "Arial"
  },
  fontColor: {
    type: String,
    default: "white"
  },
  lineWidth: {
    type: Number,
    default: 4
  },
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 500
  },
  edit: {
    type: Boolean,
    default: true
  },
  label: {
    type: Array,
    default: []
  }
})

const emit = defineEmits(["submit"])

const draw = ref(null)
const image = new Image()
const canvasWidth = ref(800)
const canvasHeight = ref(500)

const activeLabel = ref(null)

const options = ref([])
const selectCls = ref(null)

const initOptions = ()=> {
  if(props.cls.length != props.color.length || props.cls.length <= 0) throw "类别和颜色必须一一对应, 并且必须给定类别"
  options.value = []
  selectCls.value = `${props.cls[0]},${props.color[0]}`
  for(let i=0; i<props.cls.length; i++) {
    options.value.push({
        label: props.cls[i],
        value: `${props.cls[i]},${props.color[i]}`
      })
  }
}

initOptions()

nextTick(()=> {
  ctx = draw.value.getContext("2d")
  image.src=props.src
})

watch([()=>props.width, ()=>props.height], () => {
  if(props.width < 1 || props.height < 1) return
  let oldRate = rate
  rate = Math.min(props.width/image.width, props.height/image.height)
  canvasWidth.value = image.width * rate
  canvasHeight.value = image.height * rate
  draw.value.width = canvasWidth.value
  draw.value.height = canvasHeight.value
  ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvasWidth.value, canvasHeight.value)
  cache = ctx.getImageData(0, 0, canvasWidth.value, canvasHeight.value)
  labels.forEach(label => {
    label.x1 = label.x1 / oldRate * rate
    label.y1 = label.y1 / oldRate * rate
    label.x2 = label.x2 / oldRate * rate
    label.y2 = label.y2 / oldRate * rate
    if(label == activeLabel.value) {
      drawLabelActive(activeLabel.value)
    } else {
      drawLabelNormal(label)
      cache = ctx.getImageData(0, 0, canvasWidth.value, canvasHeight.value)
    }
  })
})

watch([()=>props.cls, ()=>props.color], ()=>initOptions())

watch(()=>props.src, ()=>image.src = props.src)

watch(()=>props.label, ()=>updateDraw())

const _width = computed(()=>Math.max(1, props.width))
const _height = computed(()=>Math.max(1, props.height))

const updateDraw = ()=> {
  rate = Math.min(props.width/image.width, props.height/image.height)
  canvasWidth.value = image.width * rate
  canvasHeight.value = image.height * rate
  draw.value.width = canvasWidth.value
  draw.value.height = canvasHeight.value
  labels = []
  props.label.forEach(label=>{
    let index = props.cls.indexOf(label.label)
    if(index >=0 ) {
      let x1 = label.box[0] * rate
      let y1 = label.box[1] * rate
      let x2 = label.box[2] * rate
      let y2 = label.box[3] * rate
      let color = props.color[index] 
      let labelW = 0
      let labelH = 0
      activeLabel.value = {x1, y1, x2, y2, color, labelW, labelH, label: label.label}
      labels.push(activeLabel.value)
    }
  })
  activeLabel.value = null
  currentState = state.NORMAL
  activePoint = point.NONE
  ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvasWidth.value, canvasHeight.value)
  cache = ctx.getImageData(0, 0, canvasWidth.value, canvasHeight.value)
  labels.forEach(label => {
    drawLabelNormal(label)
    cache = ctx.getImageData(0, 0, canvasWidth.value, canvasHeight.value)
  })
}

image.onload = ()=> { 
  updateDraw()
}

const createLabel = ()=> currentState = state.CREATE

const changeLabel = ()=> {
  if(activeLabel.value == null || !selectCls.value) return
  let [cls, color] = selectCls.value.split(',')
  activeLabel.value.label = cls
  activeLabel.value.color = color
  drawLabelActive(activeLabel.value)
}

const deleleLabel = ()=> {
  if(activeLabel.value == null) return
  let index = labels.indexOf(activeLabel.value)
  if (index >=0 ) {
    labels.splice(index, 1)
    activeLabel.value = null
    currentState = state.NORMAL
    ctx.putImageData(cache, 0, 0)
  }
}

const submit = ()=> {
  let _labels = []
  labels.forEach(label => _labels.push({
    box: [label.x1/rate, label.y1/rate, label.x2/rate, label.y2/rate],
    label: label.label
  }))
  emit("submit", _labels)
}

const drawLabelNormal = (label)=> {
  ctx.strokeStyle = label.color
  ctx.lineWidth = props.lineWidth
  ctx.textAlign = "start"
  ctx.textBaseline = "top"
  ctx.strokeRect(label.x1, label.y1, label.x2-label.x1, label.y2-label.y1)
  ctx.font = `${props.fontStyle} ${props.fontSize}px ${props.fontType}`
  const textWidth = ctx.measureText(label.label).width
  ctx.fillStyle = label.color
  ctx.fillRect(label.x1+props.lineWidth, label.y1+props.lineWidth,  textWidth + 2*props.lineWidth, props.fontSize + 2*props.lineWidth);
  ctx.fillStyle = props.fontColor
  ctx.fillText(label.label, label.x1+2*props.lineWidth, label.y1+2.5*props.lineWidth)

  label.labelW = textWidth + 4*props.lineWidth
  label.labelH = props.fontSize + 4*props.lineWidth
}

const drawLabelActive = (label)=> {
  ctx.putImageData(cache, 0, 0)
  ctx.strokeStyle = label.color
  ctx.lineWidth = props.lineWidth
  ctx.textAlign = "start"
  ctx.textBaseline = "top"
  ctx.strokeRect(label.x1, label.y1, label.x2-label.x1, label.y2-label.y1);
  ctx.font = `${props.fontStyle} ${props.fontSize}px ${props.fontType}`
  const textWidth = ctx.measureText(label.label).width
  ctx.fillStyle = label.color
  ctx.fillRect(label.x1+props.lineWidth, label.y1+props.lineWidth,  textWidth + 2*props.lineWidth, props.fontSize + 2*props.lineWidth);
  ctx.fillStyle = props.fontColor
  ctx.fillText(label.label, label.x1+2*props.lineWidth, label.y1+2.5*props.lineWidth)

  label.labelW = textWidth + 4*props.lineWidth
  label.labelH = props.fontSize + 4*props.lineWidth

  ctx.fillStyle = label.color

  ctx.beginPath()
  ctx.arc(label.x1, label.y1, props.radius, 0, Math.PI*2, false)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(label.x1, label.y2, props.radius, 0, Math.PI*2, false)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(label.x2, label.y1, props.radius, 0, Math.PI*2, false)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(label.x2, label.y2, props.radius, 0, Math.PI*2, false)
  ctx.fill()
}

const onMoveStartCreate = (x, y) => {
  if(activeLabel.value.x1 < x) {
    activeLabel.value.x2 = x
  } else {
    activeLabel.value.x2 = activeLabel.value.x1
    activeLabel.value.x1 = x
  }

  if(activeLabel.value.y1 < y) {
    activeLabel.value.y2 = y
  } else {
    activeLabel.value.y2 = activeLabel.value.y1
    activeLabel.value.y1 = y
  }
  drawLabelActive(activeLabel.value)
}

const onMovePressTable = (x, y) => {
    let disx = x - downPoint.x
    let disy = y - downPoint.y
    activeLabel.value.x1 = Math.max(0, oldPos.x1 + disx)
    activeLabel.value.x2 = Math.min(canvasWidth.value, oldPos.x2 + disx)
    activeLabel.value.y1 = Math.max(0, oldPos.y1 + disy)
    activeLabel.value.y2 = Math.min(canvasHeight.value, oldPos.y2 + disy)
    drawLabelActive(activeLabel.value)
}

const onMovePressPoint = (x, y) => {
  switch (activePoint) {
    case point.LEFT_TOP:
      activeLabel.value.x1 = Math.min(x, oldPos.x2, canvasWidth.value)
      activeLabel.value.x2 = Math.max(x, oldPos.x2, 0)
      activeLabel.value.y1 = Math.min(y, oldPos.y2, canvasHeight.value)
      activeLabel.value.y2 = Math.max(y, oldPos.y2, 0)
      break
    case point.LEFT_BOTTOM:
      activeLabel.value.x1 = Math.min(x, oldPos.x2, canvasWidth.value)
      activeLabel.value.x2 = Math.max(x, oldPos.x2, 0)
      activeLabel.value.y1 = Math.min(y, oldPos.y1, canvasHeight.value)
      activeLabel.value.y2 = Math.max(y, oldPos.y1, 0)
      break
    case point.RIGHT_BOTTOM:
      activeLabel.value.x1 = Math.min(x, oldPos.x1, canvasWidth.value)
      activeLabel.value.x2 = Math.max(x, oldPos.x1, 0)
      activeLabel.value.y1 = Math.min(y, oldPos.y1, canvasHeight.value)
      activeLabel.value.y2 = Math.max(y, oldPos.y1, 0)
      break
    case point.RIGHT_TOP:
      activeLabel.value.x1 = Math.min(x, oldPos.x1, canvasWidth.value)
      activeLabel.value.x2 = Math.max(x, oldPos.x1, 0)
      activeLabel.value.y1 = Math.min(y, oldPos.y2, canvasHeight.value)
      activeLabel.value.y2 = Math.max(y, oldPos.y2, 0)
    default:
      break
  }
  drawLabelActive(activeLabel.value)
}

const mouseMove = (e)=> {
  if(!activeLabel.value) return
  switch (currentState) {
    case state.NORMAL:
    case state.CREATE:
    case state.SELECT:
      break
    case state.START_CREATE:
      onMoveStartCreate(e.offsetX, e.offsetY)      
      break
    case state.PRESS_TABLE:
      onMovePressTable(e.offsetX, e.offsetY)
      break
    case state.PRESS_POINT:
      onMovePressPoint(e.offsetX, e.offsetY)
    default:
      break
  }
}

const getPosition = (x, y, label)=> {
    if(Math.sqrt(Math.pow(x - label.x1, 2) + Math.pow(y - label.y1, 2)) < props.radius*2) return 1
    if(Math.sqrt(Math.pow(x - label.x1, 2) + Math.pow(y - label.y2, 2)) < props.radius*2) return 2
    if(Math.sqrt(Math.pow(x - label.x2, 2) + Math.pow(y - label.y2, 2)) < props.radius*2) return 3
    if(Math.sqrt(Math.pow(x - label.x2, 2) + Math.pow(y - label.y1, 2)) < props.radius*2) return 4
    return 0
}

const pointInLabel = (x, y, label) => label.x1 <= x && label.x1+label.labelW >= x && label.y1 <= y && label.y1 + label.labelH >= y

const onDownCreate = (x, y) => {
  if(!selectCls.value) return
  ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvasWidth.value, canvasHeight.value)
  labels.forEach(label => {
    drawLabelNormal(label)
    cache = ctx.getImageData(0, 0, canvasWidth.value, canvasHeight.value)
  })
  let [cls, color] = selectCls.value.split(',')
  activeLabel.value = {x1: x, y1: y, x2: x, y2: y, label: cls, labelW: 0, labelH: 0, color: color}
  labels.push(activeLabel.value)
  currentState = state.START_CREATE
}

const onDownNormal = (x, y) => {
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvasWidth.value, canvasHeight.value)
    labels.forEach(label => {
      if(pointInLabel(x, y, label) && currentState != state.PRESS_TABLE) {
        activeLabel.value = label
        currentState = state.PRESS_TABLE
        oldPos.x1 = activeLabel.value.x1
        oldPos.x2 = activeLabel.value.x2
        oldPos.y1 = activeLabel.value.y1
        oldPos.y2 = activeLabel.value.y2
        downPoint.x = x
        downPoint.y = y
      } else {
        drawLabelNormal(label)
      }
    })
    cache = ctx.getImageData(0, 0, canvasWidth.value, canvasHeight.value)
    if(currentState == state.PRESS_TABLE) drawLabelActive(activeLabel.value)
}

const onDownSelect = (x, y)=> {
    downPoint.x = x
    downPoint.y = y
    activePoint = getPosition(x, y, activeLabel.value)
    oldPos.x1 = activeLabel.value.x1
    oldPos.x2 = activeLabel.value.x2
    oldPos.y1 = activeLabel.value.y1
    oldPos.y2 = activeLabel.value.y2
    if(activePoint == point.NONE && pointInLabel(x, y, activeLabel.value)) {
      currentState = state.PRESS_TABLE
    } else if(activePoint > 0) {
      currentState = state.PRESS_POINT
    } else {
      ctx.putImageData(cache, 0, 0)
      drawLabelNormal(activeLabel.value)
      activeLabel.value = null
      currentState = state.NORMAL
    } 
}

const mouseDown = (e) => {
  if(!props.edit) return
  switch (currentState) {
    case state.NORMAL:
      onDownNormal(e.offsetX, e.offsetY)
      break
    case state.START_CREATE:
      break
    case state.CREATE:
      onDownCreate(e.offsetX, e.offsetY)
      break
    case state.SELECT:
      onDownSelect(e.offsetX, e.offsetY)
      break
    default:
      break
  }
}

const onUpStartCreate = (x, y)=> {
  if(activeLabel.value.x1 < x) {
    activeLabel.value.x2 = x
  } else {
    activeLabel.value.x2 = activeLabel.value.x1
    activeLabel.value.x1 = x
  }

  if(activeLabel.value.y1 < y) {
    activeLabel.value.y2 = y
  } else {
    activeLabel.value.y2 = activeLabel.value.y1
    activeLabel.value.y1 = y
  }
  currentState = state.SELECT
}

const mouseUp = (e)=> {
  switch (currentState) {
    case state.START_CREATE:
      onUpStartCreate(e.offsetX, e.offsetY)      
      break
    case state.PRESS_TABLE:
    case state.PRESS_POINT:
      currentState = state.SELECT
      break
    default:
      break
  }
}

</script>

<style>
.box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 10px;
}
.draw {
  background-color: #DDFFFF;
}
canvas {
  border-style:solid;
  border-width:1px;
}
</style>