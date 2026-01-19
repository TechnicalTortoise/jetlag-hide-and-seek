import type { Map } from 'maplibre-gl'
import type { MapInstance } from 'vue-maplibre-gl'

export const useGameStore = defineStore('game', () => {
    const map = ref<Map | undefined>(undefined)
    function setMap(mapInstance: MapInstance) {
        map.value = mapInstance.map
    }

    return {
        map,
        setMap,
    }
})
