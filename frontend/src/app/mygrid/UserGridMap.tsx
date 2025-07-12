"use client";
import React, { useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
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

interface GridLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface UserGridMapProps {
  position: GridLocation;
  isEditing?: boolean;
  onLocationChange?: (location: GridLocation) => void;
  searchLocation?: GridLocation | null;
}

// Component to handle map zoom when search location changes
const MapZoomHandler: React.FC<{ searchLocation: GridLocation | null }> = ({ searchLocation }) => {
  const map = useMap();
  
  React.useEffect(() => {
    if (searchLocation) {
      map.setView([searchLocation.lat, searchLocation.lng], 15);
    }
  }, [searchLocation, map]);
  
  return null;
};

// Draggable marker component
const DraggableMarker: React.FC<{
  position: GridLocation;
  isDraggable: boolean;
  onDragEnd: (lat: number, lng: number) => void;
}> = ({ position, isDraggable, onDragEnd }) => {
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
      position={[position.lat, position.lng] as LatLngExpression}
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

const UserGridMap: React.FC<UserGridMapProps> = ({ 
  position, 
  isEditing = false, 
  onLocationChange,
  searchLocation = null 
}) => {
  const handleDragEnd = (lat: number, lng: number) => {
    if (onLocationChange) {
      onLocationChange({
        lat,
        lng,
        address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
      });
    }
  };

  return (
    <MapContainer
      center={[position.lat, position.lng] as LatLngExpression}
      zoom={13}
      style={{ height: "300px", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Handle zoom when search location changes */}
      <MapZoomHandler searchLocation={searchLocation} />
      
      {/* Draggable marker */}
      <DraggableMarker
        position={position}
        isDraggable={isEditing}
        onDragEnd={handleDragEnd}
      />
    </MapContainer>
  );
};

export default UserGridMap; 