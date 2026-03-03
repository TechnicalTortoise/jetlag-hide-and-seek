<script lang="ts" setup>
import type { GeoJsonProperties } from 'geojson'

const gameStore = useGameStore()
const isOpen = ref(true)
const fileInput = ref(null)
const possibleNameFields = ref([' '])
const chosenNameField = ref(' ')
const fileCurrentlyUploading = ref(false)
const uploadButtonText = ref('Select file')

async function onFileChanged(event) {
  const file = event.target.files[0]
  if (!file) {
    return
  }
  try {
    fileCurrentlyUploading.value = true
    const text = await file.text()
    const data: GeoJsonProperties = JSON.parse(text)
    handleUploadedGeoJson(data)
  }
  catch {
    console.error('Failed to parse file')
    // todo show an error
  }
  fileCurrentlyUploading.value = false
}

function handleUploadedGeoJson(data: GeoJsonProperties) {
  const nameFields = getPossibleNameFields(data)
  if (!nameFields) {
    return
  }
  possibleNameFields.value = nameFields
}

function getPossibleNameFields(data: GeoJsonProperties): string[] | undefined {
  if (!data) {
    return
  }
  let props
  if (data.type === 'Feature') {
    props = data.properties
  }
  else if (data.type === 'FeatureCollection') {
    props = data.features[0].properties
  }
  if (!props) {
    return
  }
  const possibleNameFields: string[] = []
  // try and look for fields have name or nm in them, otherwise just add all the fields which are strings
  // or should we just always show all fields
  for (const key in props) {
    if (/(name|nm)/i.test(key)) {
      possibleNameFields.push(key)
    }
  }
  if (possibleNameFields.length === 0) {
    for (const key in props) {
      if (typeof props[key] === 'string') {
        possibleNameFields.push(key)
      }
    }
  }
  return possibleNameFields
}

function onSelectNameField() {

}
</script>

<template>
  <input
    ref="fileInput"
    type="file"
    accept=".geojson,.json,.txt"
    hidden="true"
    @change="onFileChanged"
  >
  <UModal
    v-model:open="isOpen"
    title="Load GeoJSON regions"
    :dismissible="false"
  >
    <template #body>
      Upload a GeoJSON file which contains polygon(s) to use later in the game.
      <br>
      <UButton
        :label="uploadButtonText"
        icon="i-lucide-upload"
        :loading="fileCurrentlyUploading"
        @click="fileInput.click()"
      />

      <USelectMenu
        v-model="chosenNameField"
        :items="possibleNameFields"
        class="w-full"
        placeholder="Select name field"
        :disabled="possibleNameFields.length === 1 && possibleNameFields[0] === ' '"
        @update:model-value="onSelectNameField"
      />
      <UButton label="Save regions" />
    </template>
  </UModal>
</template>

<style></style>
