import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { contactServices } from "@/data/site";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  service: z.string().min(1, "Please select a service"),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const inputClass =
  "w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-sm transition-colors focus:border-ring focus:outline-none";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: "onSubmit" });

  const onSubmit = (_data: FormData) => {
    setSubmitted(true);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-2xl space-y-6 rounded-3xl border border-border bg-card p-6 shadow-lg md:p-10"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="firstName">
            First Name *
          </label>
          <input id="firstName" {...register("firstName")} className={inputClass} aria-invalid={!!errors.firstName} />
          {errors.firstName && (
            <p role="alert" className="mt-1 text-sm text-destructive">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="lastName">
            Last Name *
          </label>
          <input id="lastName" {...register("lastName")} className={inputClass} aria-invalid={!!errors.lastName} />
          {errors.lastName && (
            <p role="alert" className="mt-1 text-sm text-destructive">{errors.lastName.message}</p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="email">
            Email *
          </label>
          <input id="email" type="email" {...register("email")} className={inputClass} aria-invalid={!!errors.email} />
          {errors.email && (
            <p role="alert" className="mt-1 text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="service">
            Service *
          </label>
          <select
            id="service"
            {...register("service")}
            className={inputClass}
            aria-invalid={!!errors.service}
          >
            <option value="">Select a service</option>
            {contactServices.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.service && (
            <p role="alert" className="mt-1 text-sm text-destructive">{errors.service.message}</p>
          )}
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground" htmlFor="message">
          Message (optional)
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder="How can we help you?"
          {...register("message")}
          className={inputClass}
        />
      </div>
      {submitted && (
        <p role="status" className="text-sm font-semibold text-foreground">
          Your inquiry has been validated. This is a frontend-only reconstruction — no backend is
          configured to send messages; our team will follow up via the details provided.
        </p>
      )}
      <button type="submit" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90">
        Send message
      </button>
    </form>
  );
}
