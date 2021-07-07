/** https://react-leaflet.js.org/docs/example-draggable-marker/ */
import { Marker } from 'react-leaflet'
import { useMemo, useRef } from 'react'
import { useMapContext } from '../context/MapProvider';

export default function DraggableMarker() {
    const { draggableMarkerPosition, setDraggableMarkerPosition } = useMapContext();
    const markerRef = useRef(null)
    const eventHandlers = useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current
          if (marker != null) {
            setDraggableMarkerPosition({
              latitude: marker.getLatLng().lat,
              longitude: marker.getLatLng().lng
            })
          }
        },
      }),
      [],
    )
  
    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={[draggableMarkerPosition.latitude, draggableMarkerPosition.longitude]}
        ref={markerRef}>
      </Marker>
    )
  }