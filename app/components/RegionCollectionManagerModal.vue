<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import type { FeatureCollection } from 'geojson'
import { UploadGeoJsonModal } from '#components'

const overlay = useOverlay()
const uploadGeoJsonModal = overlay.create(UploadGeoJsonModal)

const UButton = resolveComponent('UButton')
const gameStore = useGameStore()
const { regionCollections, questions } = storeToRefs(gameStore)

const isOpen = ref(true)
// table with 4 columns
// name( renamable ) | region number | region names list | bin button (bnuuuuuuuu)
const deletionModalOpen = ref(false)
const deletionName = ref('')

const columns: TableColumn<RegionCollection>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    header: '#',
    accessorKey: 'featureCollection',

    cell: ({ row }) => {
      const fc: FeatureCollection = row.getValue('featureCollection')
      if (!fc) {
        return 'uh oh'
      }
      return fc.features.length
    },
  },
  {
    header: 'Regions',
    accessorKey: 'featureCollection',

    cell: ({ row }) => {
      const fc: FeatureCollection = row.getValue('featureCollection')
      if (!fc) {
        return 'uh oh 2'
      }
      const names: string[] = fc.features.map((feature) => {
        return feature.properties?.name ?? ''
      })

      return h('div', { class: 'text-ellipsis max-w-50 overflow-hidden' }, names.join(', '))
    },
  },
  {
    id: 'actions',

    cell: ({ row }) => {
      return h(UButton, {
        'icon': 'material-symbols:delete-outline-rounded',
        'color': 'error',
        'variant': 'ghost',
        'aria-label': 'Actions dropdown',
        'onClick': () => {
          deletionName.value = row.getValue('name')
          deletionModalOpen.value = true
        },
      })
    },
  },
]

function areAnyQuestionsUsingRegionCollection(regionCollectionName: string) {
  for (let i = 0; i < questions.value.length; i += 1) {
    const q = questions.value[i]
    if (!q || q.type !== 'GeoJsonRegion') {
      continue
    }
    const gj: GeoJsonRegion = q.question as GeoJsonRegion
    if (gj.regionCollectionName === regionCollectionName) {
      return true
    }
  }
  return false
}

function deleteRegionCollection() {
  const idx = regionCollections.value.findIndex((rc) => {
    return rc.name === deletionName.value
  })

  if (idx !== -1) {
    if (!areAnyQuestionsUsingRegionCollection(deletionName.value)) {
      regionCollections.value.splice(idx, 1)
    }
  }
  deletionModalOpen.value = false
  deletionName.value = ''
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Manage Region Collections"
    :dismissible="false"
  >
    <template #body>
      <UTable
        :data="regionCollections"
        :columns="columns"
        class="flex-1"
      />
      <UButton
        label="Add region collection"
        @click="uploadGeoJsonModal.open()"
      />
      <UModal
        v-model:open="deletionModalOpen"
        :title="`Are you sure you want to delete ${deletionName}?`"
        :ui="{ footer: 'justify-end' }"
      >
        <template #footer="{ close }">
          <UButton
            label="Cancel"
            color="neutral"
            variant="outline"
            @click="close"
          />
          <UButton
            label="Delete"
            color="neutral"
            @click="deleteRegionCollection"
          />
        </template>
      </UModal>
    </template>
  </UModal>
</template>

<style></style>
