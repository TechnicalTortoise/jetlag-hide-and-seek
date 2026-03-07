<script lang="ts" setup>
import type { Feature, FeatureCollection } from 'geojson'

const gameStore = useGameStore()
const { regionCollections } = storeToRefs(gameStore)
const isOpen = ref(true)
const fileInput = ref(null)
const possibleNameFields = ref([' '])
const chosenNameField = ref(' ')
const fileCurrentlyUploading = ref(false)
const uploadButtonText = ref('Select file')
let uploadedData: FeatureCollection
const regionNamesText = ref('')
let cleansedData: FeatureCollection
const regionCollectionName = ref('')

async function onFileChanged(event) {
  const file = event.target.files[0]
  if (!file) {
    return
  }
  try {
    fileCurrentlyUploading.value = true
    const text = await file.text()
    uploadedData = JSON.parse(text)
    handleUploadedGeoJson(uploadedData)
  }
  catch {
    console.error('Failed to parse file')
    // todo show an error
  }
  fileCurrentlyUploading.value = false
}

function handleUploadedGeoJson(data: FeatureCollection) {
  const nameFields = getPossibleNameFields(data)
  if (!nameFields) {
    regionNamesText.value = 'No name fields found for uploaded regions'
    return
  }
  possibleNameFields.value = nameFields
  chosenNameField.value = nameFields[0] ?? ''
  if (chosenNameField.value !== '') {
    onSelectNameField()
  }
}

function getPossibleNameFields(data: FeatureCollection): string[] | undefined {
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
  const regionNames: string[] = []
  const selectedNameField = chosenNameField.value
  cleansedData = { type: 'FeatureCollection', features: [] }
  uploadedData.features.forEach((feature) => {
    if (!feature.properties) {
      return
    }
    if (!feature.properties[selectedNameField]) {
      return
    }
    const name: string = feature.properties[selectedNameField]
    if (typeof name !== 'string') {
      return
    }
    regionNames.push(name)
    const cleansedFeature: Feature = {
      type: 'Feature',
      geometry: feature.geometry,
      properties: { name },
    }
    cleansedData.features.push(cleansedFeature)
  })
  regionNamesText.value = `Found ${regionNames.length} regions:\n${regionNames.join(', ')}`
}

function onSaveRegionCollection() {
  const name = regionCollectionName.value.trim()
  if (name === '') {
    console.warn('Name is empty')
    // aaaaaa
    return
  }
  const alreadyExists: boolean = regionCollections.value.find((rc) => {
    return rc.name === name
  })
  if (alreadyExists) {
    console.warn('Name already exists')
    return
  }
  regionCollections.value.push({ name, featureCollection: cleansedData })
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
    title="Load GeoJSON region set"
    :dismissible="false"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <div>
          Upload a GeoJSON file which contains polygon(s) to use later in the game.
        </div>
        <UButton
          :label="uploadButtonText"
          icon="i-lucide-upload"
          :loading="fileCurrentlyUploading"
          @click="fileInput.click()"
        />
        <UFormField label="Name field">
          <USelectMenu
            v-model="chosenNameField"
            :items="possibleNameFields"
            class="w-full"
            placeholder="Select name field"
            :disabled="possibleNameFields.length === 1 && possibleNameFields[0] === ' '"
            @update:model-value="onSelectNameField"
          />
        </UFormField>
        <div class="whitespace-pre-line max-h-30 overflow-y-auto">
          {{ regionNamesText }}
        </div>
        <UFormField label="Region collection name">
          <UInput v-model="regionCollectionName" />
        </UFormField>

        <UButton
          label="Save region collection"
          @click="onSaveRegionCollection"
        />
      </div>
    </template>
  </UModal>
</template>

<style></style>
