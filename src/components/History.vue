<template>
<div style="width: 1500px; height: 900;">
    <div style="padding: 8px;">
        <n-grid :x-gap="8" :y-gap="8" :cols="cols">
            <n-grid-item v-for="(label, index) in labels" :key="index">
                <Draw class="data"
                    :src="label.src"
                    :width="size"
                    :height="size"
                    :label="label.label"
                    :edit="false"
                    :cls="cls"
                    :color="color"
                    :font-size="fontSize"
                    :line-width="lineWidth"
                    @click="editLabel(index)"
                >
                </Draw>
            </n-grid-item>
        </n-grid>
    </div>
    <div class="pagination">
        <n-pagination
        v-model:page="page"
        v-model:page-size="pageSize"
        :page-count="10"
        show-size-picker
        :page-sizes="[8, 18, 32, 50]"
        show-quick-jumper
        @update:page="updatePage($event)"
        @update:page-size="updatePageSize($event)"
        />
    </div>
    <n-modal
        style="width: 1000px;"
        v-model:show="showEdit"
        preset="card"
        title="修改标签"
        size="huge"
        :bordered="false"
    >
    <Draw
        :src="labels[labelIndex].src"
        :label="labels[labelIndex].label"
        :cls="cls"
        :color="color"
        @submit="changeLabel($event)"
    >
    </Draw>
  </n-modal>
</div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Draw from './Draw.vue'

const page = ref(1)
const pageSize = ref(50)

const fontSize = ref(12)
const lineWidth = ref(1)

const labels = ref([])
const showEdit = ref(false)
const labelIndex = ref(0)
const cols=ref(10)
const size = ref(110)

const cls = ref(["车", "房"])
const color = ref(["red", "blue"])

const initLabels = (number) => {
    labelIndex.value = 0
    labels.value = []
    for(let i=0;i < number; i++) {
        labels.value.push({
            label: [{
                box: [10, 10, 500, 500],
                label: "车"
            }],
            src: "/src/assets/test1.jpg"
        })
    }
}


initLabels(pageSize.value)

const editLabel = index => {
    labelIndex.value = index
    showEdit.value = true
}

const changeLabel = label=> {
    labels.value[labelIndex.value].label = label
    showEdit.value = false
}

const updatePage = number => {
    console.log(number)
}

const updatePageSize = number => {
    initLabels(number)
    if(number == 50) {
        cols.value = 10
        size.value = 110
        pageSize.value = 50
        fontSize.value = 12
        lineWidth.value = 1
    } else if(number == 32) {
        cols.value = 8
        size.value = 150
        pageSize.value = 32
        fontSize.value = 15
        lineWidth.value = 2
    } else if(number == 18) {
        cols.value = 6
        size.value = 217
        fontSize.value = 14
        pageSize.value = 18
        lineWidth.value = 4
    } else {
        cols.value = 4
        size.value = 350
        pageSize.value = 8
        fontSize.value = 20
        lineWidth.value = 4
    }
    console.log(number)
}

</script>

<style>
.data {
    background-color: whitesmoke;
    border: 1px solid;
    border-radius: 5px;
}
.pagination {
    display: flex;
    justify-content: center;
}
</style>