import React, { useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents
} from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src
});

interface UserData {
  name: string;
  email: string;
  phone: string;
  tokens: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

interface MapSectionProps {
  userData: UserData;
  editedData: UserData | null;
  setEditedData: React.Dispatch<React.SetStateAction<UserData | null>>;
  isEditingLocation: boolean;
  className?: string;
}

const DraggableMarker = ({
  position,
  isDraggable,
  onDragEnd
}: {
  position: [number, number];
  isDraggable: boolean;
  onDragEnd: (lat: number, lng: number) => void;
}) => {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      if (isDraggable && markerRef.current) {
        markerRef.current.setLatLng(e.latlng);
        onDragEnd(e.latlng.lat, e.latlng.lng);
      }
    }
  });

  return (
    <Marker
      draggable={isDraggable}
      position={position}
      eventHandlers={{
        dragend: () => {
          const marker = markerRef.current;
          if (marker != null) {
            const latLng = marker.getLatLng();
            onDragEnd(latLng.lat, latLng.lng);
          }
        }
      }}
      ref={markerRef}
    />
  );
};

const MapSection: React.FC<MapSectionProps> = ({
  userData,
  editedData,
  setEditedData,
  isEditingLocation,
  className
}) => {
  return (
    <MapContainer
      center={[userData.location.lat, userData.location.lng] as LatLngExpression}
      zoom={13}
      scrollWheelZoom={false}
      className={className}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {editedData && (
        <DraggableMarker
          position={[editedData.location.lat, editedData.location.lng]}
          isDraggable={isEditingLocation}
          onDragEnd={(lat, lng) => {
            setEditedData(prev => prev ? ({
              ...prev,
              location: {
                ...prev.location,
                lat,
                lng,
                address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
              }
            }) : prev);
          }}
        />
      )}
    </MapContainer>
  );
};

export default MapSection;