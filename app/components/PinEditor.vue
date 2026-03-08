<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import type { MapMouseEvent } from 'maplibre-gl'
import { AreYouSureModal } from '#components'
import { useMapStore } from '~/stores/MapStore'

const UButton = resolveComponent('UButton')
const gameStore = useGameStore()
const mapStore = useMapStore()
const copyButton = resolveComponent('CopyButton')

const overlay = useOverlay()
const areYouSureModal = overlay.create(AreYouSureModal)

const { customPins } = storeToRefs(gameStore)

const active = computed(() => {
  return gameStore.state === State.ADDING_PINS
})

watch(mapStore, () => {
  if (mapStore.mapLoaded) {
    const map = mapStore.getMap()
    map.on('click', onMapClick)
  }
})

function onMapClick(e: MapMouseEvent) {
  if (!active.value) {
    return
  }
  gameStore.addCustomPin(e.lngLat.toArray())
}

const columns: TableColumn<CustomPin>[] = [
  {
    accessorKey: 'displayNumber',
    header: '#',
  },
  {
    accessorKey: 'colour',
    header: 'Colour',
    cell: ({ row }) => {
      const colour = row.getValue('colour')
      const style = { backgroundColor: colour }
      return h('div', { class: 'w-5 h-5 rounded-sm', style })
    },
  },
  {
    header: 'Position',
    accessorKey: 'lnglat',

    cell: ({ row }) => {
      const lngLat: [number, number] | undefined = row.getValue('lnglat')
      if (!lngLat) {
        return ''
      }
      const precision = 6
      const latlngString = `${lngLat[1].toFixed(precision)}, ${lngLat[0].toFixed(precision)}`
      return latlngString
    },
  },
  {
    accessorKey: 'id',
    header: '',

    cell: ({ row }) => {
      const lngLat: [number, number] | undefined = row.getValue('lnglat')
      if (!lngLat) {
        return ''
      }
      const latlngString = `${lngLat[1]}, ${lngLat[0]}`

      return h('div', {}, [h(copyButton, { textToCopy: latlngString }), h(UButton, {
        'icon': 'material-symbols:delete-outline-rounded',
        'color': 'error',
        'variant': 'ghost',
        'aria-label': 'Actions dropdown',
        'onClick': async () => {
          const instance = areYouSureModal.open({ bodyText: 'Are you sure you want to delete the marker?' })
          const yes = await instance.result
          if (yes) {
            gameStore.removeCustomPin(row.getValue('id'))
          }
        },
      })])
    },
  },
]
</script>

<template>
  <UDrawer
    :open="active"
    :handle="false"
    :overlay="false"
    :modal="false"
    :dismissible="false"
    direction="top"
    :ui="{ container: 'max-w-xl mx-auto' }"
    title="Adding Pins"
  >
    <template #body>
      <div>
        Pins can be dragged
      </div>
      <UTable
        :data="customPins"
        :columns="columns"
        class="flex-1 max-h-50"
        :sticky="true"
      />
    </template>
    <template #footer>
      <UButton
        label="Close"
        color="neutral"
        variant="outline"
        class="justify-center"
        @click="gameStore.state = State.MAIN"
      />
    </template>
  </UDrawer>
</template>

<style></style>
