import { useState } from "react";
import emailjs from "@emailjs/browser";

export default function App() {
  const SERVICE_ID = "service_1phz38i";
  const TEMPLATE_ID = "template_n0t4z64";
  const PUBLIC_KEY = "DBYnw2FwUq-byAH0_";

  const bureaux = ["RANC 1", "RANC 2", "RANC 3"];

  const timeSlots = [
    ["10:00", "12:00"],
    ["12:00", "14:00"],
    ["14:00", "16:00"],
    ["16:00", "18:00"],
  ];

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const isDisponible = (bureau, date, start, end) => {
    return !reservations.some(
      (r) =>
        r.bureau === bureau &&
        r.date === date &&
        !(end <= r.start || start >= r.end)
    );
  };

  const generateQR = (data) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;
  };

  const envoyerEmail = (reservation) => {
    const contenu = `${reservation.bureau} - ${reservation.date} - ${reservation.start}-${reservation.end}`;
    const qr = generateQR(contenu);

    emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        bureau: reservation.bureau,
        date: reservation.date,
        heure: reservation.start + " - " + reservation.end,
        email: reservation.email,
        qr: qr,
      },
      PUBLIC_KEY
    );
  };

  const reserver = () => {
    if (!email) {
      setMessage("Entre ton email");
      return;
    }

    const newReservation = {
      bureau: selectedSlot.bureau,
      date: selectedDate,
      start: selectedSlot.start,
      end: selectedSlot.end,
      email: email,
    };

    setReservations([...reservations, newReservation]);
    envoyerEmail(newReservation);

    setMessage("✅ Réservation confirmée !");
    setSelectedSlot(null);
    setEmail("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Elite Bureau</h1>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      {selectedDate && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
            {bureaux.map((bureau) =>
              timeSlots.map(([start, end], i) => {
