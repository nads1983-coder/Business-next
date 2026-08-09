import { amazonUkSearchUrl } from "@/config/affiliate";

export type AffiliateRecommendationCategory = {
  slug: string;
  title: string;
  description: string;
  prompts: string[];
  searchLabel: string;
  searchUrl: string;
};

export const recommendedBusinessEssentialsPath = "/recommended-business-essentials";

export const businessEssentialsRecommendations: AffiliateRecommendationCategory[] = [
  {
    slug: "home-office-essentials",
    title: "Home-office essentials",
    description:
      "Basic kit for a calm work area at home, especially if your business admin happens around client work or family life.",
    prompts: ["Desk lamps", "Cable management", "Desk organisers", "Extension leads with surge protection"],
    searchLabel: "Search Amazon UK for home-office essentials",
    searchUrl: amazonUkSearchUrl("small business home office essentials")
  },
  {
    slug: "laptop-stands-keyboards-mice",
    title: "Laptop stands, keyboards and mice",
    description:
      "Helpful if you work from a laptop for long sessions and want a more comfortable screen and typing position.",
    prompts: ["Adjustable laptop stands", "Wireless keyboards", "Ergonomic mice", "USB-C hubs"],
    searchLabel: "Search Amazon UK for laptop stands, keyboards and mice",
    searchUrl: amazonUkSearchUrl("laptop stand keyboard mouse office setup")
  },
  {
    slug: "monitors-webcams",
    title: "Monitors and webcams",
    description:
      "Useful for spreadsheet work, Companies House forms, online banking, bookkeeping software and video calls.",
    prompts: ["24 inch monitors", "USB-C monitors", "Webcams", "Monitor arms"],
    searchLabel: "Search Amazon UK for monitors and webcams",
    searchUrl: amazonUkSearchUrl("business monitor webcam home office")
  },
  {
    slug: "headsets-calls-meetings",
    title: "Headsets for calls and meetings",
    description:
      "A dedicated headset can make calls, webinars and customer meetings easier to manage from a shared or busy space.",
    prompts: ["USB headsets", "Bluetooth headsets", "Noise-reducing microphones", "Teams and Zoom accessories"],
    searchLabel: "Search Amazon UK for business headsets",
    searchUrl: amazonUkSearchUrl("business headset calls meetings")
  },
  {
    slug: "printers-scanners-shredders",
    title: "Printers, scanners and shredders",
    description:
      "Not every business needs a printer, but some owners still prefer paper copies, postal records or scanned documents.",
    prompts: ["All-in-one printers", "Document scanners", "Paper shredders", "Replacement ink and toner"],
    searchLabel: "Search Amazon UK for printers scanners and shredders",
    searchUrl: amazonUkSearchUrl("small business printer scanner shredder")
  },
  {
    slug: "filing-document-storage",
    title: "Filing and document storage",
    description:
      "Simple storage can help keep incorporation documents, insurance details, invoices and supplier paperwork findable.",
    prompts: ["Lever arch files", "Expanding folders", "Document boxes", "Fire-resistant document bags"],
    searchLabel: "Search Amazon UK for filing and document storage",
    searchUrl: amazonUkSearchUrl("business filing document storage")
  },
  {
    slug: "receipt-bookkeeping-organisation",
    title: "Receipt and bookkeeping organisation",
    description:
      "Low-tech tools can support good habits before receipts are uploaded, reconciled or passed to an accountant.",
    prompts: ["Receipt wallets", "Monthly folders", "Expense organisers", "Bookkeeping notebooks"],
    searchLabel: "Search Amazon UK for receipt and bookkeeping organisers",
    searchUrl: amazonUkSearchUrl("receipt organiser bookkeeping small business")
  },
  {
    slug: "label-makers-stationery",
    title: "Label makers and stationery",
    description:
      "Labels, pens and everyday stationery are small things, but they can make stock, paperwork and storage easier to control.",
    prompts: ["Label makers", "Address labels", "Notebooks", "Sticky notes and page markers"],
    searchLabel: "Search Amazon UK for label makers and stationery",
    searchUrl: amazonUkSearchUrl("label maker stationery small business")
  },
  {
    slug: "postage-packaging-supplies",
    title: "Postage and packaging supplies",
    description:
      "For businesses that post products, samples or paperwork, a basic packaging setup can reduce last-minute trips.",
    prompts: ["Mailing bags", "Postal boxes", "Packing tape", "Digital postal scales"],
    searchLabel: "Search Amazon UK for postage and packaging supplies",
    searchUrl: amazonUkSearchUrl("small business postage packaging supplies")
  },
  {
    slug: "ergonomic-chairs-desk-accessories",
    title: "Ergonomic chairs and desk accessories",
    description:
      "Comfort matters if admin work takes time. Compare sizes, adjustability and support carefully before buying.",
    prompts: ["Office chairs", "Foot rests", "Wrist rests", "Standing desk converters"],
    searchLabel: "Search Amazon UK for ergonomic office accessories",
    searchUrl: amazonUkSearchUrl("ergonomic office chair desk accessories")
  },
  {
    slug: "card-reader-accessories",
    title: "Portable card-reader accessories",
    description:
      "Some mobile sellers and market traders need accessories around a card reader rather than the reader itself.",
    prompts: ["Card-reader cases", "Charging cables", "Portable power banks", "Small cash boxes"],
    searchLabel: "Search Amazon UK for card-reader accessories",
    searchUrl: amazonUkSearchUrl("portable card reader accessories small business")
  },
  {
    slug: "business-books-planners",
    title: "Small-business books and planners",
    description:
      "Books and planners can help with habits, goal-setting and admin routines, but they are not a substitute for tailored advice.",
    prompts: ["Business planners", "Tax record books", "Goal planners", "Small-business books"],
    searchLabel: "Search Amazon UK for small-business books and planners",
    searchUrl: amazonUkSearchUrl("small business books planner UK")
  }
];
