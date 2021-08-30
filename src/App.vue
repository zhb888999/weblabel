<template>
  <Draw 
    :src="image" 
    :cls="cls" 
    :color="color"
    :width="width"
    :height="height"
    :label="label"
    :edit="edit"
    @submit="submit($event)"
  ></Draw>
  <br/>
  <n-button @click="addWidth">w+</n-button>
  <n-button @click="addHeight">h+</n-button>
  <n-button @click="subWidth">w-</n-button>
  <n-button @click="subHeight">h-</n-button>
  <n-button @click="add">+</n-button>
  <n-button @click="sub">-</n-button>
  <n-button @click="update">更新类别</n-button>
  <br/>
  <br/>
  <n-button @click="changeImg">Test</n-button>
  <n-button @click="changeLabel">Test2</n-button>
  <n-button @click="changeEdit">Test3</n-button>
</template>

<script setup>
import Draw from "./components/Draw.vue"
import { ref } from 'vue'
const image=ref("/src/assets/test2.jpg")

const changeImg = ()=> {
  label.value = [{
    box: [0, 0, 500, 500],
    label: "冰箱"
  }]
  image.value = "/src/assets/test1.jpg"
}

const changeLabel = ()=> {
  label.value = [{
    box: [0, 0, 500, 500],
    label: "冰箱"
  }]
}

const submit= labels => {
  console.log(labels)
}

const cls=ref(["汽车", "冰箱"])
const color=ref(["blue", "black"])
const edit = ref(false)
const width = ref(800)
const height = ref(500)
const label = ref([{
  box: [0, 0, 500, 500],
  label: "汽车"
}])
const changeEdit = ()=> {
  edit.value = !edit.value
}

const addWidth = ()=> {
  width.value += 1
}

const subWidth = ()=> {
  width.value -= 1
}

const addHeight = ()=> {
  height.value += 1
}

const subHeight = ()=> {
  height.value -= 1
}

const add = ()=> {
  height.value += 1
  width.value += 1
}

const sub = ()=> {
  height.value -= 1
  width.value -= 1
}

const update = ()=> {
  cls.value = ["haha"]
  color.value = ["green"]
}
</script>

<style>
</style>