import { useState } from "react";
import emailjs from "@emailjs/browser";

export default function App() {
  // ✅ CONFIG EMAILJS
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

  // ✅ Vérifie disponibilité
  const isDisponible = (bureau, date, start, end) => {
    return !reservations.some(
      (r) =>
        r.bureau === bureau &&
        r.date === date &&
        !(end <= r.start || start >= r.end)
    );
  };

  // ✅ Génère QR Code
  const generateQR = (data) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;
  };

  // ✅ Envoie email
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

  // ✅ Réserver
  const reserver = () => {
    if (!email) {
      setMessage("❌ Entre ton email");
      return;
    }

    if (!selectedSlot) {
      setMessage("❌ Choisis un créneau");
      return;
    }

    if (!isDisponible(selectedSlot.bureau, selectedDate, selectedSlot.start, selectedSlot.end)) {
      setMessage("❌ Déjà réservé");
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

      {/* DATE */}
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      {/* DISPONIBILITÉS */}
      {selectedDate && (
        <div style={{ marginTop: 20 }}>
          <h2>Disponibilités</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {bureaux.map((bureau) =>
              timeSlots.map(([start, end], i) => {
                const dispo = isDisponible(bureau, selectedDate, start, end);

                return (
                  <div
                    key={bureau + i}
                    onClick={() => {
                      if (!dispo) return;
                      setSelectedSlot({ bureau, start, end });
                      setMessage("");
                    }}
                    style={{
                      backgroundColor: dispo ? "green" : "red",
                      color: "white",
                      padding: 10,
                      borderRadius: 10,
                      cursor: dispo ? "pointer" : "not-allowed",
                    }}
                  >
                    <b>{bureau}</b>
                    <p>{start} - {end}</p>
                    <p>{dispo ? "Disponible" : "Réservé"}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* FORMULAIRE */}
      {selectedSlot && (
        <div style={{ marginTop: 20 }}>
          <h3>
            {selectedSlot.bureau} ({selectedSlot.start} - {selectedSlot.end})
          </h3>

          <img
            src={generateQR(`${selectedSlot.bureau}-${selectedSlot.start}-${selectedSlot.end}`)}
            alt="QR Code"
            style={{ width: 150 }}
          />

          <br />

          <input
            type="email"
            placeholder="Ton email"
            value={email}
               />

          <br />

          <button onClick={reserver} style={{ marginTop: 10 }}>
            Confirmer
          </button>

          <p>{message}</p>
        </div>
      )}
    </div>
  );
}
