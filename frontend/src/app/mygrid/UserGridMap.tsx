"use client";
import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

type Props = {
  position: { lat: number; lng: number };
};

const UserGridMap: React.FC<Props> = ({ position }) => (
  <MapContainer
    center={position}
    zoom={13}
    style={{ height: "300px", width: "100%" }}
    scrollWheelZoom={false}
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={position} />
  </MapContainer>
);

export default UserGridMap; 