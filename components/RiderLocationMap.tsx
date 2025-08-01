"use client";
import { MapContainer as LeafletMapContainer, TileLayer as LeafletTileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

interface RiderLocationMapProps {
  lat: number;
  lng: number;
}

export default function RiderLocationMap({ lat, lng }: RiderLocationMapProps) {
  const position: LatLngExpression = [lat, lng];
  return (
    <LeafletMapContainer
      center={position}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <LeafletTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      <Marker position={position}>
        <Popup>Rider&apos;s Last Location</Popup>
      </Marker>
    </LeafletMapContainer>
  );
}