"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CLINIC_COORDS: Record<string, [number, number]> = {
  "Київ": [50.4501, 30.5234],
  "Львів": [49.8397, 24.0297],
  "Одеса": [46.4825, 30.7233],
  "Дніпро": [48.4647, 35.0462],
  "Харків": [49.9935, 36.2304],
  "Вінниця": [49.2331, 28.4682],
  "Запоріжжя": [47.8388, 35.1396],
  "Полтава": [49.5883, 34.5514],
  "Черкаси": [49.4444, 32.0598],
  "Житомир": [50.2547, 28.6587],
  "Біла Церква": [49.7993, 30.1170],
  "Кременчук": [49.0661, 33.4152],
  "Миколаїв": [46.9750, 31.9946],
  "Херсон": [46.6354, 32.6169],
  "Ужгород": [48.6208, 22.2879],
  "Чернігів": [51.4982, 31.2893],
  "Суми": [50.9077, 34.7981],
  "Луцьк": [50.7472, 25.3254],
  "Івано-Франківськ": [48.9226, 24.7103],
  "Тернопіль": [49.5535, 25.5948],
  "Рівне": [50.6199, 26.2516],
  "Хмельницький": [49.4229, 26.9871],
  "Черновці": [48.2921, 25.9358],
  "Кропивницький": [48.5132, 32.2597],
  "Маріуполь": [47.0968, 37.5420],
  "Кривий Ріг": [47.9078, 33.3817],
  "Мелітополь": [46.8497, 35.3674],
  "Бердянськ": [46.7569, 36.7897],
  "Нікополь": [47.5722, 34.3997],
  "Павлоград": [48.5274, 35.8760],
};

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Props {
  clinics: any[];
  onClinicClick: (clinic: any) => void;
}

export default function MapComponent({ clinics, onClinicClick }: Props) {
  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <MapContainer
      center={[49.0, 31.0]}
      zoom={6}
      style={{ height: "500px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {clinics.map((clinic: any) => {
        const coords = CLINIC_COORDS[clinic.city];
        if (!coords) return null;

        return (
          <Marker key={clinic.id} position={coords} icon={icon}>
            <Popup>
              <div className="p-2 min-w-48">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{clinic.image}</span>
                  <div>
                    <div className="font-bold text-sm">{clinic.name}</div>
                    <div className="text-xs text-gray-500">📍 {clinic.city}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  ★ {clinic.rating} · {clinic.doctors} лікарів
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {clinic.address}
                </div>
                <button
                  onClick={() => onClinicClick(clinic)}
                  className="w-full py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                  Переглянути клініку
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}