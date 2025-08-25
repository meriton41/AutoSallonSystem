"use client";

import { useEffect } from "react";
import * as signalR from "@microsoft/signalr";

export default function RealTimeVehicleNotifier() {
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7234/vehicleHub")
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log("SignalR connected.");
      })
      .catch((err: any) => {
        console.error("SignalR connection error: ", err);
      });

    connection.on(
      "VehicleAdded",
      (vehicle: { title: string; image: string }) => {
        const notification = document.createElement("div");
        notification.style.display = "flex";
        notification.style.alignItems = "center";
        notification.style.padding = "20px";
        notification.style.border = "1px solid #ccc";
        notification.style.borderRadius = "5px";
        notification.style.backgroundColor = "#f0f0f0";
        notification.style.position = "fixed";
        notification.style.top = "10px";
        notification.style.right = "10px";
        notification.style.zIndex = "1000";
        notification.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
        notification.style.fontSize = "22px";
        notification.style.setProperty("color", "black", "important");
        notification.style.fontWeight = "bold";

        const img = document.createElement("img");
        img.src = vehicle.image;
        img.alt = vehicle.title;
        img.style.width = "60px";
        img.style.height = "60px";
        img.style.objectFit = "cover";
        img.style.marginRight = "15px";
        img.style.borderRadius = "4px";

        const text = document.createElement("div");
        text.textContent = `A new car is available: ${vehicle.title}`;

        notification.appendChild(img);
        notification.appendChild(text);

        document.body.appendChild(notification);

        setTimeout(() => {
          document.body.removeChild(notification);
        }, 5000);
      }
    );

    return () => {
      connection.stop();
    };
  }, []);

  return null;
}
