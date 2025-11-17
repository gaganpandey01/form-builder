import type { FieldTemplate } from "../types";
import {
  User,
  Clipboard,
  MapPin,
  Home,
  IdCard,
  Calendar,
  Star,
} from "lucide-react";

export const fieldTemplates: FieldTemplate[] = (() => {
  const rawTemplates = [
    {
      id: "contact-basic",
      name: "Basic Contact Info",
      description: "Name, email, and phone number",
      icon: User,
      category: "contact",
      fields: [
        {
          type: "text",
          label: "Full Name",
          required: true,
          placeholder: "Enter your full name",
          autofill: { autocomplete: "name" },
        },
        {
          type: "email",
          label: "Email Address",
          required: true,
          placeholder: "Enter your email address",
          autofill: { autocomplete: "email", inputMode: "email" },
        },
        {
          type: "phone",
          label: "Phone Number",
          required: false,
          placeholder: "Enter your phone number",
          autofill: { autocomplete: "tel", inputMode: "tel" },
        },
      ],
    },
    {
      id: "contact-detailed",
      name: "Detailed Contact Info",
      description: "Complete contact information with job title",
      icon: Clipboard,
      category: "contact",
      fields: [
        {
          type: "text",
          label: "First Name",
          required: true,
          placeholder: "Enter your first name",
          autofill: { autocomplete: "given-name" },
        },
        {
          type: "text",
          label: "Last Name",
          required: true,
          placeholder: "Enter your last name",
          autofill: { autocomplete: "family-name" },
        },
        {
          type: "email",
          label: "Email Address",
          required: true,
          placeholder: "Enter your email address",
          autofill: { autocomplete: "email", inputMode: "email" },
        },
        {
          type: "phone",
          label: "Phone Number",
          required: true,
          placeholder: "Enter your phone number",
          autofill: { autocomplete: "tel", inputMode: "tel" },
        },
        {
          type: "text",
          label: "Job Title",
          required: false,
          placeholder: "Enter your job title",
          autofill: { autocomplete: "organization-title" },
        },
        {
          type: "text",
          label: "Company",
          required: false,
          placeholder: "Enter your company name",
          autofill: { autocomplete: "organization" },
        },
      ],
    },
    {
      id: "address-basic",
      name: "Basic Address",
      description: "Street address, city, state, and zip code",
      icon: MapPin,
      category: "address",
      fields: [
        {
          type: "text",
          label: "Street Address",
          required: true,
          placeholder: "Enter your street address",
          autofill: { autocomplete: "street-address" },
        },
        {
          type: "text",
          label: "City",
          required: true,
          placeholder: "Enter your city",
          autofill: { autocomplete: "address-level2" },
        },
        {
          type: "text",
          label: "State/Province",
          required: true,
          placeholder: "Enter your state or province",
          autofill: { autocomplete: "address-level1" },
        },
        {
          type: "text",
          label: "ZIP/Postal Code",
          required: true,
          placeholder: "Enter your ZIP or postal code",
          autofill: { autocomplete: "postal-code" },
        },
      ],
    },
    {
      id: "address-detailed",
      name: "Detailed Address",
      description: "Complete address with apartment and country",
      icon: Home,
      category: "address",
      fields: [
        {
          type: "text",
          label: "Street Address",
          required: true,
          placeholder: "Enter your street address",
          autofill: { autocomplete: "address-line1" },
        },
        {
          type: "text",
          label: "Apartment, Suite, etc.",
          required: false,
          placeholder: "Apt, suite, unit, building, floor, etc.",
          autofill: { autocomplete: "address-line2" },
        },
        {
          type: "text",
          label: "City",
          required: true,
          placeholder: "Enter your city",
          autofill: { autocomplete: "address-level2" },
        },
        {
          type: "text",
          label: "State/Province",
          required: true,
          placeholder: "Enter your state or province",
          autofill: { autocomplete: "address-level1" },
        },
        {
          type: "text",
          label: "ZIP/Postal Code",
          required: true,
          placeholder: "Enter your ZIP or postal code",
          autofill: { autocomplete: "postal-code" },
        },
        {
          type: "text",
          label: "Country",
          required: true,
          placeholder: "Enter your country",
          autofill: { autocomplete: "country-name" },
        },
      ],
    },
    {
      id: "personal-basic",
      name: "Personal Information",
      description: "Basic personal details",
      icon: IdCard,
      category: "personal",
      fields: [
        {
          type: "text",
          label: "Full Name",
          required: true,
          placeholder: "Enter your full name",
          autofill: { autocomplete: "name" },
        },
        {
          type: "date",
          label: "Date of Birth",
          required: false,
          autofill: { autocomplete: "bday" },
          metadata: { dateTime: "past" }, // Enforce cannot be in the future
        },
        {
          type: "select",
          label: "Gender",
          required: false,
          options: ["Male", "Female", "Non-binary", "Prefer not to say"],
          autofill: { autocomplete: "sex" },
        },
      ],
    },
    {
      id: "event-registration",
      name: "Event Registration",
      description: "Event attendance and dietary preferences",
      icon: Calendar,
      category: "event",
      fields: [
        {
          type: "text",
          label: "Full Name",
          required: true,
          placeholder: "Enter your full name",
          autofill: { autocomplete: "name" },
        },
        {
          type: "email",
          label: "Email Address",
          required: true,
          placeholder: "Enter your email address",
          autofill: { autocomplete: "email" },
        },
        {
          type: "select",
          label: "Attendance Type",
          required: true,
          options: ["In Person", "Virtual", "Hybrid"],
        },
        {
          type: "checkbox",
          label: "Dietary Restrictions",
          required: false,
          options: [
            "Vegetarian",
            "Vegan",
            "Gluten-free",
            "Dairy-free",
            "Nut allergy",
            "Other",
          ],
        },
        {
          type: "textarea",
          label: "Special Requirements",
          required: false,
          placeholder: "Any special requirements or notes",
        },
      ],
    },
    {
      id: "feedback-service",
      name: "Service Feedback",
      description: "Rating and feedback form",
      icon: Star,
      category: "feedback",
      fields: [
        {
          type: "radio",
          label: "Overall Satisfaction",
          required: true,
          options: [
            "Very Satisfied",
            "Satisfied",
            "Neutral",
            "Dissatisfied",
            "Very Dissatisfied",
          ],
        },
        {
          type: "radio",
          label: "Would you recommend us?",
          required: true,
          options: [
            "Definitely",
            "Probably",
            "Not sure",
            "Probably not",
            "Definitely not",
          ],
        },
        {
          type: "textarea",
          label: "What did you like most?",
          required: false,
          placeholder: "Tell us what you enjoyed...",
        },
        {
          type: "textarea",
          label: "How can we improve?",
          required: false,
          placeholder: "Suggestions for improvement...",
        },
      ],
    },
  ];
  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "")
      .replace(/-+/g, "-");

  return rawTemplates.map((t) => ({
    ...t,
    fields: (t.fields || []).map((f: any, idx: number) => ({
      id: f.id ?? `${t.id}-${slug(String(f.label ?? idx))}`,
      ...f,
    })),
  })) as FieldTemplate[];
})();

export const getTemplatesByCategory = (
  category?: FieldTemplate["category"]
) => {
  if (!category) return fieldTemplates;
  return fieldTemplates.filter((template) => template.category === category);
};

export const getSmartDefaults = (fieldType: string) => {
  const defaults = {
    email: {
      placeholder: "Enter your email address",
      autofill: { autocomplete: "email", inputMode: "email" as const },
    },
    phone: {
      placeholder: "Enter your phone number",
      autofill: { autocomplete: "tel", inputMode: "tel" as const },
    },
    url: {
      placeholder: "https://example.com",
      autofill: { autocomplete: "url", inputMode: "url" as const },
    },
    text: {
      autofill: { autocomplete: "off" },
    },
    number: {
      autofill: { inputMode: "numeric" as const },
    },
    date: {
      autofill: { autocomplete: "bday" },
    },
    time: {
      autofill: { autocomplete: "off" },
    },
  };

  return defaults[fieldType as keyof typeof defaults] || {};
};
