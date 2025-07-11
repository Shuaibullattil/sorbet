"use client";
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

interface EnergyPool {
  grid_id: string;
  grid_name: string;
  location: { latitude: number; longitude: number };
  units_for_sell: number;
  user: string;
  user_name: string;
}

interface MapWithMarkersProps {
  pools: EnergyPool[];
  selected: string | null;
  setSelected: (id: string) => void;
  userLocation: [number, number] | null;
}

const MapWithMarkers: React.FC<MapWithMarkersProps> = ({ pools, selected, setSelected, userLocation }) => {
  const defaultPosition: [number, number] = userLocation
    ? userLocation
    : pools.length
      ? [pools[0].location.latitude, pools[0].location.longitude]
      : [20, 77]; // fallback to India center

  return (
    <MapContainer center={defaultPosition} zoom={6} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pools.map(pool => (
        <Marker
          key={pool.grid_id}
          position={[pool.location.latitude, pool.location.longitude]}
          eventHandlers={{
            click: () => setSelected(pool.grid_id),
          }}
        >
          <Popup>
            <div>
              <strong>{pool.grid_name}</strong>
              <br />by {pool.user_name}
              <br />Units for Sale: {pool.units_for_sell}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapWithMarkers; 