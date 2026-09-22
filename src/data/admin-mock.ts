export type Enquiry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  location: string;
  date: string;
  status: "New" | "Contacted" | "Closed";
};

export const enquiries: Enquiry[] = [
  { id: "ENQ-1042", name: "Ramesh K", phone: "9845012345", email: "ramesh@gmail.com", service: "AC Servicing", location: "Whitefield", date: "2026-06-24", status: "New" },
  { id: "ENQ-1041", name: "Priya S", phone: "9742098765", email: "priya@gmail.com", service: "Deep Home Cleaning", location: "HSR Layout", date: "2026-06-23", status: "New" },
  { id: "ENQ-1040", name: "Anil M", phone: "9900123456", email: "anil@gmail.com", service: "Plumbing Repairs", location: "Jayanagar", date: "2026-06-22", status: "Contacted" },
  { id: "ENQ-1039", name: "Deepa R", phone: "9886011223", email: "deepa@gmail.com", service: "POP False Ceiling", location: "Indiranagar", date: "2026-06-21", status: "Contacted" },
  { id: "ENQ-1038", name: "Mahesh G", phone: "9740099887", email: "mahesh@gmail.com", service: "CCTV Installation", location: "Koramangala", date: "2026-06-20", status: "Closed" },
];

export type Testimonial = {
  id: string;
  name: string;
  location: string;
  service: string;
  rating: number;
  type: "Text" | "Video";
  quote: string;
};

export const testimonials: Testimonial[] = [
  { id: "T-1", name: "Suresh P", location: "Whitefield", service: "AC Servicing", rating: 5, type: "Text", quote: "Quick response and neat work. Highly recommend." },
  { id: "T-2", name: "Lakshmi N", location: "HSR Layout", service: "Deep Cleaning", rating: 5, type: "Text", quote: "House looks brand new. Professional team." },
  { id: "T-3", name: "Rahul V", location: "Indiranagar", service: "POP Ceiling", rating: 4, type: "Video", quote: "Great finish and fair pricing." },
  { id: "T-4", name: "Anita D", location: "Koramangala", service: "CCTV Setup", rating: 5, type: "Text", quote: "Set up in a day. Very reliable." },
  { id: "T-5", name: "Kiran B", location: "Jayanagar", service: "Plumbing", rating: 5, type: "Video", quote: "Fixed a leak others couldn't. Thank you!" },
  { id: "T-6", name: "Meera J", location: "Marathahalli", service: "Painting", rating: 4, type: "Text", quote: "Tidy, on-time, and well priced." },
];