"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function TrackContracts() {
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [events, setEvents] = useState<string[]>([]);

  const handleSubmit = async () => {
    if (!address.startsWith("0x") || address.length !== 42) {
      setMessage("Invalid contract address");
      return;
    }
    setMessage("Submitting...");
    try {
      const res = await fetch("/api/track-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Tracking started");
      } else {
        setMessage(data.error || "Error starting tracking");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error submitting contract");
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/tracked-events");
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Track a Contract</h2>
      <Input
        placeholder="Enter contract address (0x...)"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <Button onClick={handleSubmit}>Submit</Button>
      <p>{message}</p>
      <h3 className="text-md font-semibold mt-4">Recent Events</h3>
      <Textarea
        value={events.join("\n")}
        readOnly
        className="h-64"
      />
    </Card>
  );
}