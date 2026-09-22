import { useEffect, useState } from "react";

const TEXT_KEY = "ssg_admin_text_testimonials_v1";
const VIDEO_KEY = "ssg_admin_video_testimonials_v1";
const EVENT = "ssg-testimonials-change";

export type TextTestimonial = {
  id: string;
  type: "text";
  name: string;
  location: string;
  service: string;
  rating: number;
  review: string;
  photo: string;
  date: string;
  order: number;
  active: boolean;
};

export type VideoTestimonial = {
  id: string;
  type: "video";
  name: string;
  service: string;
  title: string;
  videoUrl: string;
  thumbnail: string;
  description: string;
  order: number;
  active: boolean;
};

export type AnyTestimonial = TextTestimonial | VideoTestimonial;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function seed(): { text: TextTestimonial[]; video: VideoTestimonial[] } {
  const text: TextTestimonial[] = [
    { id: uid(), type: "text", name: "Priya R.", location: "Whitefield", service: "Deep Home Cleaning", rating: 5, review: "From deep cleaning to electrical fixes, the team handles everything. Total peace of mind.", photo: "", date: "2026-05-12", order: 1, active: true },
    { id: uid(), type: "text", name: "Rahul S.", location: "HSR Layout", service: "AMC", rating: 5, review: "Our AMC with Smart Solutions has cut downtime dramatically. Quick response every time.", photo: "", date: "2026-05-18", order: 2, active: true },
    { id: uid(), type: "text", name: "Anita K.", location: "HSR", service: "Interior", rating: 5, review: "They redid our interiors and now maintain the property monthly. Professional and honest.", photo: "", date: "2026-05-22", order: 3, active: true },
    { id: uid(), type: "text", name: "Vikram M.", location: "Indiranagar", service: "Plumbing", rating: 4, review: "Single point of contact for plumbing, electrical and AC. Saves us hours every week.", photo: "", date: "2026-06-01", order: 4, active: true },
    { id: uid(), type: "text", name: "Deepa N.", location: "JP Nagar", service: "AC Servicing", rating: 5, review: "Booked through WhatsApp, technician arrived in 2 hours. Fair pricing, clean work.", photo: "", date: "2026-06-08", order: 5, active: true },
    { id: uid(), type: "text", name: "Suresh G.", location: "Marathahalli", service: "Post-construction Cleaning", rating: 5, review: "We trust them for post-construction cleaning and finishing on every project handover.", photo: "", date: "2026-06-12", order: 6, active: true },
  ];
  const video: VideoTestimonial[] = [
    { id: uid(), type: "video", name: "Rahul V.", service: "POP Ceiling", title: "Beautiful POP ceiling makeover", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail: "", description: "Rahul shares his experience with our POP false ceiling work.", order: 1, active: true },
    { id: uid(), type: "video", name: "Kiran B.", service: "Plumbing", title: "Leak fixed in one visit", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", thumbnail: "", description: "Kiran talks about our quick response plumbing service.", order: 2, active: true },
  ];
  return { text, video };
}

function read<T>(key: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fb;
  } catch {
    return fb;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENT));
}

function ensureSeeded() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(TEXT_KEY) || !localStorage.getItem(VIDEO_KEY)) {
    const { text, video } = seed();
    localStorage.setItem(TEXT_KEY, JSON.stringify(text));
    localStorage.setItem(VIDEO_KEY, JSON.stringify(video));
  }
}

export function getTextTestimonials(): TextTestimonial[] {
  ensureSeeded();
  return read<TextTestimonial[]>(TEXT_KEY, []).sort((a, b) => a.order - b.order);
}

export function getVideoTestimonials(): VideoTestimonial[] {
  ensureSeeded();
  return read<VideoTestimonial[]>(VIDEO_KEY, []).sort((a, b) => a.order - b.order);
}

export function saveTextTestimonial(t: TextTestimonial) {
  const all = getTextTestimonials();
  const i = all.findIndex((x) => x.id === t.id);
  if (i >= 0) all[i] = t;
  else all.push(t);
  write(TEXT_KEY, all);
}

export function deleteTextTestimonial(id: string) {
  write(TEXT_KEY, getTextTestimonials().filter((t) => t.id !== id));
}

export function saveVideoTestimonial(t: VideoTestimonial) {
  const all = getVideoTestimonials();
  const i = all.findIndex((x) => x.id === t.id);
  if (i >= 0) all[i] = t;
  else all.push(t);
  write(VIDEO_KEY, all);
}

export function deleteVideoTestimonial(id: string) {
  write(VIDEO_KEY, getVideoTestimonials().filter((t) => t.id !== id));
}

export function newText(): TextTestimonial {
  return {
    id: uid(),
    type: "text",
    name: "",
    location: "",
    service: "",
    rating: 5,
    review: "",
    photo: "",
    date: new Date().toISOString().slice(0, 10),
    order: getTextTestimonials().length + 1,
    active: true,
  };
}

export function newVideo(): VideoTestimonial {
  return {
    id: uid(),
    type: "video",
    name: "",
    service: "",
    title: "",
    videoUrl: "",
    thumbnail: "",
    description: "",
    order: getVideoTestimonials().length + 1,
    active: true,
  };
}

export function useTestimonialsStore() {
  const [snap, setSnap] = useState<{ text: TextTestimonial[]; video: VideoTestimonial[] }>({ text: [], video: [] });
  useEffect(() => {
    const update = () => setSnap({ text: getTextTestimonials(), video: getVideoTestimonials() });
    update();
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return snap;
}